from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import easyocr
import cv2
from PIL import Image
import logging
import re
from dotenv import load_dotenv
import base64
import io
import tempfile

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from external import gpt_cleanup

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/predict": {
        "origins": "*",
        "methods": ["POST"],
        "allow_headers": ["Content-Type"]
    }
})
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize EasyOCR with optimal parameters for prescription text
reader = easyocr.Reader(
    ['en'],
    gpu=os.environ.get('USE_GPU', 'False').lower() == 'true',
    model_storage_directory='./model_storage',
    download_enabled=True,
    detector=True,  # Better detection for irregular layouts
    recognizer=True
)

def preprocess_image(image_np):
    """Advanced preprocessing pipeline for prescription images"""
    try:
        # Convert to grayscale if not already
        if len(image_np.shape) == 3:
            gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
        else:
            gray = image_np
        
        # Resize with aspect ratio preservation for very large images
        height, width = gray.shape
        if max(height, width) > 2000:
            scale = 2000 / max(height, width)
            gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_LANCZOS4)
        
        # Gaussian blur to reduce noise (slight blur helps with handwriting)
        blurred = cv2.GaussianBlur(gray, (3, 3), 0)
        
        # Contrast enhancement with CLAHE
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(blurred)
        
        # Binarization - try both regular and adaptive thresholding
        _, binary1 = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        binary2 = cv2.adaptiveThreshold(enhanced, 255, 
                                     cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                     cv2.THRESH_BINARY, 11, 2)
        
        # Create a temporary file for each processed image to inspect results if needed
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as f:
            cv2.imwrite(f.name, binary1)
            logger.info(f"Saved preprocessed image (binary1) to {f.name}")
        
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as f:
            cv2.imwrite(f.name, binary2)
            logger.info(f"Saved preprocessed image (binary2) to {f.name}")
        
        # Return both processed versions for OCR to try
        return [enhanced, binary1, binary2]
        
    except Exception as e:
        logger.error(f"Image preprocessing failed: {str(e)}")
        # Return original grayscale as fallback
        if len(image_np.shape) == 3:
            return [cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)]
        return [image_np]

def extract_medical_info(text):
    """Extract meaningful medical information from OCR output"""
    patterns = {
        'patient_name': r'(?i)(?:name|patient|pt)[:\s._-]*([A-Z][a-z]+(?:[\s._-]+[A-Z][a-z]+){1,3})',
        'doctor_name': r'(?i)(?:dr\.?|doctor|physician)[:\s._-]*([A-Z][a-z]+(?:[\s._-]+[A-Z][a-z]+){1,3})',
        'medications': [
            # Common medication pattern with dosage
            r'(?i)(?:^|\n|\s)([A-Z][a-zA-Z]+(?:[\s-][A-Za-z]+)?\s+\d+(?:\.\d+)?\s*(?:mg|mcg|ml|g|tab|cap)s?)',
            # Separate medication names pattern
            r'(?i)(?:^|\n)(?:rx|med|medication|prescription)[:\s._-]*([A-Z][a-zA-Z]+(?:[\s-][A-Za-z]+)?)'
        ],
        'dosage': [
            r'(?i)(?:dosage|dose|sig)[:\s._-]*((?:take|use|apply|inhale)\s+\d+(?:\s*to\s*\d+)?\s*(?:tablet|capsule|pill|drop|puff|ml)s?(?:\s+(?:by|orally|topically|once|twice|daily|every|q\d+h|morning|night|with|before|after|as).*?(?:$|\n)))',
            r'(?i)((?:take|use|apply|inhale)\s+\d+(?:\s*-\s*\d+)?\s*(?:tablet|capsule|pill|drop|puff|ml)s?(?:\s+(?:by|orally|topically|once|twice|daily|every|q\d+h|morning|night|with|before|after|as).*?(?:$|\n)))'
        ],
        'date': [
            r'(?i)(?:date)[:\s._-]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})', 
            r'(?i)(?:date)[:\s._-]*([A-Z][a-z]{2,8}\.?\s+\d{1,2},?\s+\d{4})'
        ],
        'refills': r'(?i)(?:refills?)[:\s._-]*(\d+|zero|one|two|three|four|five|no\s+refills?)',
        'diagnosis': r'(?i)(?:diagnosis|dx)[:\s._-]*([A-Z][a-zA-Z\s]{5,50})'
    }
    
    extracted = {}
    for key, pattern in patterns.items():
        if isinstance(pattern, list):
            for p in pattern:
                matches = re.findall(p, text)
                if matches:
                    if key not in extracted:
                        extracted[key] = []
                    extracted[key].extend([m.strip() for m in matches if m.strip()])
        else:
            matches = re.findall(pattern, text)
            if matches:
                extracted[key] = [m.strip() for m in matches if m.strip()]
    
    # Clean up: remove duplicates and empty strings
    for key in extracted:
        if isinstance(extracted[key], list):
            extracted[key] = list(set(extracted[key]))  # Remove duplicates
            
    return extracted

def perform_ocr(image_versions):
    """Try OCR on multiple preprocessed versions of the image"""
    combined_results = []
    confidence_threshold = 0.2  # Lower threshold for handwritten text
    
    for idx, img in enumerate(image_versions):
        try:
            # Adjust parameters for each image type
            if idx == 0:  # Enhanced original
                results = reader.readtext(
                    img,
                    detail=1,
                    paragraph=True,  # Group text into paragraphs
                    text_threshold=confidence_threshold,
                    link_threshold=0.5,
                    min_size=10,
                    slope_ths=0.2,  # Allow for tilted text common in prescriptions
                    ycenter_ths=0.5,
                    height_ths=0.5,
                    width_ths=0.5,
                    decoder='beamsearch',  # More accurate but slower
                    beamWidth=5
                )
            else:  # Binary versions
                results = reader.readtext(
                    img,
                    detail=1,
                    paragraph=False,  # Process line by line for binarized images
                    text_threshold=confidence_threshold,
                    link_threshold=0.5,
                    min_size=10,
                    slope_ths=0.2,
                    ycenter_ths=0.5,
                    height_ths=0.5,
                    width_ths=0.5
                )
            
            # Filter and add valid results
            valid_results = [res[1] for res in results if res[2] > confidence_threshold]
            combined_results.extend(valid_results)
            
        except Exception as e:
            logger.error(f"OCR failed for image version {idx}: {str(e)}")
            continue
    
    # Deduplicate results while preserving order
    seen = set()
    unique_results = []
    for item in combined_results:
        normalized = ' '.join(item.lower().split())  # Normalize whitespace
        if normalized not in seen and len(normalized) > 1:  # Skip very short segments
            seen.add(normalized)
            unique_results.append(item)
    
    return unique_results

def clean_ocr_output(raw_text, use_gpt=True):
    """Clean and structure OCR output, with option to use GPT for enhancement"""
    if not raw_text.strip():
        return "No text could be extracted."
    
    # First try GPT cleanup if enabled
    enhanced_text = raw_text
    if use_gpt:
        try:
            prompt = ("Extract and clearly format the following prescription information: "
                     "patient name, doctor name, medications with dosages, instructions, "
                     "dates, and any other relevant medical information. "
                     "Please format as a structured, readable prescription.")
            gpt_result = gpt_cleanup(raw_text, prompt)
            if gpt_result and not gpt_result.startswith("GPT Error:"):
                return gpt_result
            else:
                logger.warning(f"GPT cleanup failed, falling back to rule-based extraction: {gpt_result}")
        except Exception as e:
            logger.error(f"Error using GPT cleanup: {str(e)}")
    
    # Fallback to rule-based extraction
    medical_info = extract_medical_info(raw_text)
    if not medical_info:
        return "Could not identify standard prescription information.\nRaw text:\n" + raw_text
    
    formatted = ["PRESCRIPTION DETAILS"]
    
    if 'patient_name' in medical_info:
        formatted.append(f"\nPatient: {', '.join(medical_info['patient_name'])}")
    
    if 'doctor_name' in medical_info:
        formatted.append(f"Prescriber: {', '.join(medical_info['doctor_name'])}")
    
    if 'date' in medical_info:
        formatted.append(f"Date: {', '.join(medical_info['date'])}")
    
    if 'diagnosis' in medical_info:
        formatted.append(f"\nDiagnosis: {', '.join(medical_info['diagnosis'])}")
    
    if 'medications' in medical_info:
        formatted.append("\nMedications:")
        for med in medical_info['medications']:
            formatted.append(f"- {med}")
    
    if 'dosage' in medical_info:
        formatted.append("\nInstructions:")
        for dose in medical_info['dosage']:
            formatted.append(f"- {dose}")
    
    if 'refills' in medical_info:
        formatted.append(f"\nRefills: {', '.join(medical_info['refills'])}")
    
    # Add raw text at the end for reference
    formatted.append("\n--- Raw Extracted Text ---")
    formatted.append(raw_text)
    
    return "\n".join(formatted)

@app.route("/predict", methods=["POST"])
def predict():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "Image not provided", "success": False}), 400

        image_file = request.files['image']
        custom_prompt = request.form.get('prompt', '')  # Get optional custom prompt
        
        # Get image from request
        image = Image.open(image_file.stream).convert("RGB")
        image_np = np.array(image)
        
        # Process image with enhanced pipeline
        processed_images = preprocess_image(image_np)
        
        # Perform OCR on all processed versions
        ocr_results = perform_ocr(processed_images)
        
        # Combine results into raw text
        raw_text = "\n".join(ocr_results) if ocr_results else ""
        
        # Check if we have any text
        if not raw_text.strip():
            return jsonify({
                "raw_output": "",
                "cleaned_output": "No text could be extracted from the image. Please try a clearer image.",
                "success": False
            }), 200
        
        # Use GPT for cleanup with custom prompt if provided
        use_gpt = True  # Set to False to disable GPT cleanup
        prompt = custom_prompt if custom_prompt else None
        cleaned_text = clean_ocr_output(raw_text, use_gpt=use_gpt)
        
        return jsonify({
            "raw_output": raw_text,
            "cleaned_output": cleaned_text,
            "success": True
        }), 200

    except Exception as e:
        logger.error(f"Error in /predict: {str(e)}", exc_info=True)
        return jsonify({
            "error": f"Internal Server Error - {str(e)}",
            "success": False
        }), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)