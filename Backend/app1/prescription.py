from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
from PIL import Image
from google.cloud import vision
from google.oauth2 import service_account
import logging
import io
import re
import pandas as pd
from fuzzywuzzy import fuzz
import os

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)

# Load medicine dataset
try:
    MEDICINE_DB = pd.read_csv('Backend/app1/Data/Medicine_Details.csv')
    logging.info("Successfully loaded medicine dataset")
except Exception as e:
    logging.error(f"Failed to load medicine dataset: {e}")
    MEDICINE_DB = pd.DataFrame()

def preprocess_image(img_np):
    """Light preprocessing for Google Cloud Vision API"""
    if len(img_np.shape) == 3:
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
    else:
        gray = img_np
    
    # Apply a light Gaussian blur to reduce noise
    gray = cv2.GaussianBlur(gray, (3, 3), 0)
    
    # Save the preprocessed image for debugging
    cv2.imwrite("processed_img.jpg", gray)
    
    return gray

def perform_ocr(img_np):
    """Perform OCR using Google Cloud Vision API"""
    try:
        # Explicitly load credentials
        credentials_path = "/home/muizz/Downloads/extras/prescriptionocr-456909-a46fd284b046.json"
        if not os.path.exists(credentials_path):
            logging.error(f"Credentials file not found at {credentials_path}")
            raise FileNotFoundError(f"Credentials file not found at {credentials_path}")
        logging.info(f"Loading credentials from {credentials_path}")
        credentials = service_account.Credentials.from_service_account_file(credentials_path)
        client = vision.ImageAnnotatorClient(credentials=credentials)
        
        success, encoded_image = cv2.imencode('.jpg', img_np)
        if not success:
            logging.error("Failed to encode image")
            raise ValueError("Failed to encode image")
        
        content = encoded_image.tobytes()
        image = vision.Image(content=content)
        response = client.document_text_detection(image=image)
        
        if response.text_annotations:
            return response.text_annotations[0].description
        else:
            logging.info("No text detected in image")
            return "No text detected"
    except Exception as e:
        logging.error(f"Error in OCR: {e}", exc_info=True)
        raise

def clean_ocr_text(text):
    """Clean up OCR results with minimal corrections"""
    lines = text.split('\n')
    cleaned_lines = []
    
    # Minimal corrections for common medical abbreviations
    corrections = {
        'bd': 'bid',
        'qd': 'qd',
        'tid': 'tid',
        'quan': 'quantity',
        'rn': 'prn',
        'rx': 'rx',
        'tab': 'tab',
        'mg': 'mg',
    }
    
    for line in lines:
        alpha_chars = sum(c.isalpha() for c in line)
        total_chars = len(line.strip())
        
        # Filter out lines with low alphabetic content or too short
        if total_chars > 0 and (alpha_chars / total_chars) > 0.4 and total_chars >= 3:
            cleaned_line = re.sub(r'^[^a-zA-Z0-9]+', '', line)
            cleaned_line = re.sub(r'[^a-zA-Z0-9]+$', '', cleaned_line)
            
            cleaned_line = cleaned_line.lower()
            for wrong, correct in corrections.items():
                cleaned_line = cleaned_line.replace(wrong, correct)
            
            cleaned_lines.append(cleaned_line.strip())
    
    return '\n'.join(cleaned_lines) if cleaned_lines else "No readable text extracted"

def extract_medications(text):
    """Extract medications from the cleaned OCR text"""
    medications = []
    lines = text.split('\n')
    
    # Simple regex to identify medication lines (e.g., "betaloc 100 mg - 1 tab bid")
    medication_pattern = re.compile(r'^(?=.*\d)(?=.*(mg|tab|bid|tid|qd|prn)).*$', re.IGNORECASE)
    
    for line in lines:
        if medication_pattern.match(line):
            # Remove dosage instructions to isolate the medication name
            med_name = re.split(r'\d+\s*mg|\d+\s*tab|bid|tid|qd|prn', line, flags=re.IGNORECASE)[0].strip()
            if med_name:
                medications.append(med_name)
    
    return medications if medications else ["No medications identified"]

def find_medicine_info(extracted_text):
    """Match extracted text with medicine database"""
    if MEDICINE_DB.empty:
        return None
        
    best_match = None
    highest_score = 0
    
    # Match with medicine name
    for _, row in MEDICINE_DB.iterrows():
        if extracted_text.lower() in row['Medicine Name'].lower():
            return row.to_dict()
        
        score = fuzz.token_set_ratio(extracted_text, row['Medicine Name'])
        if score > highest_score and score > 70:
            highest_score = score
            best_match = row.to_dict()
    
    # If no match, try with salt composition
    if best_match is None:
        highest_score = 0
        for _, row in MEDICINE_DB.iterrows():
            salts = row['Composition'].split('+')
            for salt in salts:
                salt = salt.strip()
                if extracted_text.lower() in salt.lower():
                    return row.to_dict()
                
                score = fuzz.token_set_ratio(extracted_text, salt)
                if score > highest_score and score > 70:
                    highest_score = score
                    best_match = row.to_dict()
    
    return best_match

@app.route("/predict", methods=["POST"])
def predict():
    if 'image' not in request.files:
        return jsonify({
            "success": False,
            "error": "No image uploaded",
            "cleaned_output": None,
            "raw_output": None,
            "medicine_info": None
        }), 400
    
    try:
        img_file = request.files['image']
        img_bytes = img_file.read()
        img = Image.open(io.BytesIO(img_bytes))
        img_np = np.array(img)
        
        processed_img = preprocess_image(img_np)
        
        # Perform OCR with Google Cloud Vision API
        raw_text = perform_ocr(processed_img)
        logging.info(f"Raw OCR Output:\n{raw_text}")
        
        cleaned_raw_text = clean_ocr_text(raw_text)
        logging.info(f"Cleaned OCR Output:\n{cleaned_raw_text}")
        
        if cleaned_raw_text.lower() != "no readable text extracted":
            medications = extract_medications(cleaned_raw_text)
            cleaned_text = "\n".join(medications)
            
            medicine_info_list = []
            for med in medications:
                if med != "No medications identified":
                    info = find_medicine_info(med)
                    if info:
                        medicine_info_list.append(info)
        else:
            cleaned_text = "No readable text extracted"
            medicine_info_list = []
        
        return jsonify({
            "success": True,
            "error": None,
            "cleaned_output": cleaned_text,
            "raw_output": cleaned_raw_text,
            "medicine_info": medicine_info_list
        })
    
    except Exception as e:
        logging.error(f"Error: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "error": str(e),
            "cleaned_output": None,
            "raw_output": None,
            "medicine_info": None
        }), 500

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "database_loaded": not MEDICINE_DB.empty,
        "ocr_ready": True
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)