# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import numpy as np
# import cv2
# from PIL import Image
# import pytesseract
# import logging
# from external import extract_medications_gemini
# import io
# import re
# import pandas as pd
# from fuzzywuzzy import fuzz

# # Set the Tesseract path
# pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'

# app = Flask(__name__)
# CORS(app)

# # Load medicine dataset
# try:
#     MEDICINE_DB = pd.read_csv('Backend/app1/Data/Medicine_Details.csv')
#     logging.info("Successfully loaded medicine dataset")
# except Exception as e:
#     logging.error(f"Failed to load medicine dataset: {e}")
#     MEDICINE_DB = pd.DataFrame()

# def preprocess_image(img_np):
#     """Enhance image quality for better OCR results with Tesseract"""
#     if len(img_np.shape) == 3:
#         gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
#     else:
#         gray = img_np
    
#     # Step 1: Increase contrast using CLAHE with adjusted parameters
#     clahe = cv2.createCLAHE(clipLimit=4.0, tileGridSize=(16, 16))  # Higher clipLimit and larger tileGridSize
#     gray = clahe.apply(gray)

#     # Step 2: Denoise with a stronger Gaussian blur
#     gray = cv2.GaussianBlur(gray, (5, 5), 0)

#     # Step 3: Apply binary thresholding with Otsu's method
#     _, gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

#     # Step 4: Apply dilation and erosion to remove noise
#     kernel = np.ones((3, 3), np.uint8)
#     gray = cv2.dilate(gray, kernel, iterations=1)
#     gray = cv2.erode(gray, kernel, iterations=1)
    
#     # Save the preprocessed image for debugging
#     cv2.imwrite("processed_img.jpg", gray)
    
#     return gray

# def clean_ocr_text(text):
#     """Clean up OCR results to remove gibberish and correct errors"""
#     lines = text.split('\n')
#     cleaned_lines = []
    
#     corrections = {
#         'bateles': 'betaloc',
#         '1o0ag': '100 mg',
#         'bd': 'bid',
#         'dertolanden': 'dorzolamide',
#         '10 ng': '10 mg',
#         'dub': '1 tab',
#         'comatdiee': 'cimetidine',
#         '50 ag': '50 mg',
#         'bml ol': 'oxprelol',
#         'is': 'qd',
#         '4s rn wears': 'dr steve johnson',
#         'quan': 'quantity',
#         'rn': 'prn',
#     }
    
#     for line in lines:
#         alpha_chars = sum(c.isalpha() for c in line)
#         total_chars = len(line.strip())
        
#         if total_chars > 0 and (alpha_chars / total_chars) > 0.4 and total_chars >= 3:
#             cleaned_line = re.sub(r'^[^a-zA-Z0-9]+', '', line)
#             cleaned_line = re.sub(r'[^a-zA-Z0-9]+$', '', cleaned_line)
            
#             cleaned_line = cleaned_line.lower()
#             for wrong, correct in corrections.items():
#                 cleaned_line = cleaned_line.replace(wrong, correct)
            
#             cleaned_lines.append(cleaned_line.strip())
    
#     return '\n'.join(cleaned_lines) if cleaned_lines else "No readable text extracted"

# def find_medicine_info(extracted_text):
#     """Match extracted text with medicine database"""
#     if MEDICINE_DB.empty:
#         return None
        
#     best_match = None
#     highest_score = 0
    
#     for _, row in MEDICINE_DB.iterrows():
#         if extracted_text.lower() in row['Medicine Name'].lower():
#             return row.to_dict()
        
#         score = fuzz.token_set_ratio(extracted_text, row['Medicine Name'])
#         if score > highest_score and score > 70:
#             highest_score = score
#             best_match = row.to_dict()
    
#     if best_match is None:
#         highest_score = 0
#         for _, row in MEDICINE_DB.iterrows():
#             salts = row['Composition'].split('+')
#             for salt in salts:
#                 salt = salt.strip()
#                 if extracted_text.lower() in salt.lower():
#                     return row.to_dict()
                
#                 score = fuzz.token_set_ratio(extracted_text, salt)
#                 if score > highest_score and score > 70:
#                     highest_score = score
#                     best_match = row.to_dict()
    
#     return best_match

# @app.route("/predict", methods=["POST"])
# def predict():
#     if 'image' not in request.files:
#         return jsonify({
#             "success": False,
#             "error": "No image uploaded",
#             "cleaned_output": None,
#             "raw_output": None,
#             "medicine_info": None
#         }), 400
    
#     try:
#         img_file = request.files['image']
#         img_bytes = img_file.read()
#         img = Image.open(io.BytesIO(img_bytes))
#         img_np = np.array(img)
        
#         processed_img = preprocess_image(img_np)
        
#         # Try different Tesseract configurations
#         configs = [
#             r'--oem 3 --psm 3',  # Fully automatic segmentation
#             r'--oem 3 --psm 6',  # Single block of text
#             r'--oem 3 --psm 11', # Sparse text with OSD
#         ]
        
#         raw_text = ""
#         for config in configs:
#             temp_text = pytesseract.image_to_string(processed_img, config=config, lang='eng')
#             logging.info(f"OCR with config {config}:\n{temp_text}")
#             alpha_ratio = sum(c.isalpha() for c in temp_text) / max(len(temp_text), 1)
#             if alpha_ratio > (sum(c.isalpha() for c in raw_text) / max(len(raw_text), 1)):
#                 raw_text = temp_text
        
#         logging.info(f"Selected Raw OCR Output:\n{raw_text}")
#         cleaned_raw_text = clean_ocr_text(raw_text)
        
#         if cleaned_raw_text.lower() != "no readable text extracted":
#             medications = extract_medications_gemini(cleaned_raw_text)
#             cleaned_text = "\n".join(medications) if medications else "No medications identified"
            
#             medicine_info_list = []
#             if isinstance(medications, list):
#                 for med in medications:
#                     info = find_medicine_info(med)
#                     if info:
#                         medicine_info_list.append(info)
#         else:
#             cleaned_text = "No readable text extracted"
#             medicine_info_list = []
        
#         return jsonify({
#             "success": True,
#             "error": None,
#             "cleaned_output": cleaned_text,
#             "raw_output": cleaned_raw_text,
#             "medicine_info": medicine_info_list
#         })
    
#     except Exception as e:
#         logging.error(f"Error: {e}", exc_info=True)
#         return jsonify({
#             "success": False,
#             "error": str(e),
#             "cleaned_output": None,
#             "raw_output": None,
#             "medicine_info": None
#         }), 500

# @app.route("/health", methods=["GET"])
# def health_check():
#     return jsonify({
#         "status": "healthy",
#         "database_loaded": not MEDICINE_DB.empty,
#         "ocr_ready": True
#     })

# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5000, debug=True)# import os
    
# # from google.cloud import vision
# # from google.oauth2 import service_account

# # def test_vision_api():
# #     print("GOOGLE_APPLICATION_CREDENTIALS:", os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
# #     # Explicitly load credentials
# #     credentials_path = "/home/muizz/Downloads/extras/prescriptionocr-456909-a46fd284b046.json"
# #     if not os.path.exists(credentials_path):
# #         print(f"Credentials file not found at {credentials_path}")
# #         return
# #     credentials = service_account.Credentials.from_service_account_file(credentials_path)
# #     client = vision.ImageAnnotatorClient(credentials=credentials)
# #     print("Successfully created Vision API client!")

# # if __name__ == "__main__":
# #     test_vision_api()