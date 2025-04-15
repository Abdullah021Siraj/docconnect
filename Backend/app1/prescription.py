from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import easyocr
import cv2
from PIL import Image
import logging
from external import extract_medications_gemini
import io
import re

app = Flask(__name__)
CORS(app)

# Initialize EasyOCR with more languages and better configuration
reader = easyocr.Reader(
    ['en'],
    gpu=False,  # Set to True if you have GPU
    model_storage_directory='./model',
    download_enabled=True
)

def preprocess_image(img_np):
    """Enhance image quality for better OCR results"""
    # Convert to grayscale if not already
    if len(img_np.shape) == 3:
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
    else:
        gray = img_np
    
    # Apply adaptive thresholding
    gray = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 11, 2
    )
    
    # Apply dilation and erosion to remove noise
    kernel = np.ones((1, 1), np.uint8)
    gray = cv2.dilate(gray, kernel, iterations=1)
    gray = cv2.erode(gray, kernel, iterations=1)
    
    return gray

def clean_ocr_text(text):
    """Clean up OCR results to remove obvious gibberish"""
    # Remove lines with too many special characters
    lines = text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        # Count alphabetic characters vs total characters
        alpha_chars = sum(c.isalpha() for c in line)
        total_chars = len(line.strip())
        
        # Keep line if it has at least 40% alphabetic characters and minimum 3 chars
        if total_chars > 0 and (alpha_chars / total_chars) > 0.4 and total_chars >= 3:
            # Remove excessive spaces and special chars at start/end
            cleaned_line = re.sub(r'^[^a-zA-Z0-9]+', '', line)
            cleaned_line = re.sub(r'[^a-zA-Z0-9]+$', '', cleaned_line)
            cleaned_lines.append(cleaned_line.strip())
    
    return '\n'.join(cleaned_lines) if cleaned_lines else "No readable text extracted"

@app.route("/predict", methods=["POST"])
def predict():
    if 'image' not in request.files:
        return jsonify({
            "success": False,
            "error": "No image uploaded",
            "cleaned_output": None,
            "raw_output": None
        }), 400
    
    try:
        # Process image with better handling
        img_file = request.files['image']
        img_bytes = img_file.read()
        img = Image.open(io.BytesIO(img_bytes))
        img_np = np.array(img)
        
        # Preprocess image
        processed_img = preprocess_image(img_np)
        
        # OCR with better configuration
        results = reader.readtext(
            processed_img,
            detail=0,
            paragraph=True,
            width_ths=0.7,  # More tolerant of wider spaces
            text_threshold=0.5,
            link_threshold=0.4,
            decoder='beamsearch',
            batch_size=4
        )
        
        raw_text = '\n'.join(results)
        cleaned_raw_text = clean_ocr_text(raw_text)
        
        # Extract medications only if we got reasonable text
        if cleaned_raw_text.lower() != "no readable text extracted":
            medications = extract_medications_gemini(cleaned_raw_text)
            cleaned_text = "\n".join(medications) if medications else "No medications identified"
        else:
            cleaned_text = "No readable text extracted"
        
        return jsonify({
            "success": True,
            "error": None,
            "cleaned_output": cleaned_text,
            "raw_output": cleaned_raw_text
        })
    
    except Exception as e:
        logging.error(f"Error: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "error": str(e),
            "cleaned_output": None,
            "raw_output": None
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)