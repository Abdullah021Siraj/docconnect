# import logging
# from flask import Flask,request, jsonify
# from PIL import Image
# import pytesseract
# import pdf2image
# import numpy as np
# import pandas as pd
# import requests
# import os
# from werkzeug.utils import secure_filename
# from flask_cors import CORS
# import json
# # Configure logging
# logging.basicConfig(level=logging.DEBUG)
# logger = logging.getLogger(__name__)

# app = Flask(__name__)
# CORS(app)

# # Load doctor dataset
# DOCTOR_DATASET = 'Backend/app1/Data/doctors2.csv'
# try:
#     doctors_df = pd.read_csv(DOCTOR_DATASET)
#     logger.info(f"Loaded doctor dataset with {len(doctors_df)} records")
# except FileNotFoundError:
#     doctors_df = pd.DataFrame(columns=['Name', 'Speciality', 'Email'])
#     logger.warning("doctors2.csv not found, using empty DataFrame")

# # Allowed file extensions
# ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}
# MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

# def allowed_file(filename):
#     return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# def extract_text_from_image(image):
#     """Extract text from a PIL Image using Tesseract OCR."""
#     try:
#         logger.debug("Converting image to grayscale")
#         image = image.convert('L')  # Grayscale
#         image = image.point(lambda x: 0 if x < 128 else 255, '1')  # Binarize
#         logger.debug("Extracting text with Tesseract")
#         text = pytesseract.image_to_string(image, lang='eng')
#         return text.strip()
#     except Exception as e:
#         logger.error(f"Error extracting text from image: {str(e)}")
#         raise

# def convert_pdf_to_images(pdf_file):
#     """Convert PDF pages to PIL Images."""
#     try:
#         logger.debug("Converting PDF to images")
#         images = pdf2image.convert_from_bytes(pdf_file.read())
#         logger.debug(f"Extracted {len(images)} images from PDF")
#         return images
#     except Exception as e:
#         logger.error(f"Error converting PDF to images: {str(e)}")
#         raise

# def call_ai_model(text):
#     """Call Mixtral AI model for predictions, guidance, summary, and terminology simplification."""
#     headers = {
#         'Authorization': f'Bearer {MIXTRAL_API_KEY1}',
#         'Content-Type': 'application/json'
#     }
#     prompt = f"""
#     Analyze the following medical report text and provide a JSON response with the following fields:
#     - predictions: Array of objects with label (condition name), confidence (0-1), and explanation (short string).
#     - guidance: Array of strings with patient recommendations.
#     - primary_condition: String with the primary condition.
#     - summary: A concise summary of the medical report (2-3 sentences, layman's terms).
#     - simplified_terms: Array of objects with term (medical jargon) and explanation (simplified description).

#     Report Text: {text}

#     Return only the JSON object, without any additional text, markdown, or code fences.
#     """
#     payload = {
#         'model': 'mistral-small',
#         'messages': [
#             {
#                 'role': 'user',
#                 'content': prompt
#             }
#         ],
#         'max_tokens': 1000,  # Increased to accommodate additional fields
#         'temperature': 0.9
#     }

#     try:
#         logger.debug("Sending request to Mixtral API")
#         response = requests.post(MIXTRAL_API_URL, json=payload, headers=headers, timeout=30)
#         response.raise_for_status()
#         data = response.json()
#         logger.debug(f"Raw API response: {data}")

#         if 'choices' in data and len(data['choices']) > 0:
#             result_text = data['choices'][0].get('message', {}).get('content', '')
#             if not result_text:
#                 logger.error("No content in API response")
#                 return {'error': 'No content in API response'}
#             try:
#                 result_text = result_text.strip()
#                 if result_text.startswith('```json'):
#                     result_text = result_text.replace('```json', '').replace('```', '').strip()
#                 result = json.loads(result_text)
#                 logger.debug(f"Parsed AI response: {result}")
#                 return {
#                     'predictions': result.get('predictions', []),
#                     'guidance': result.get('guidance', []),
#                     'primary_condition': result.get('primary_condition', ''),
#                     'summary': result.get('summary', ''),
#                     'simplified_terms': result.get('simplified_terms', [])
#                 }
#             except json.JSONDecodeError as e:
#                 logger.error(f"JSON decode error: {str(e)}, response text: {result_text}")
#                 return {'error': f'Invalid JSON response from AI API: {str(e)}'}
#         else:
#             logger.error(f"Unexpected API response format: {data}")
#             return {'error': 'No valid response from AI API'}

#     except requests.RequestException as e:
#         logger.error(f"AI API request failed: {str(e)}")
#         return {'error': f'AI API request failed: {str(e)}'}

# def get_doctor_recommendations(condition):
#     """Retrieve doctor recommendations based on condition."""
#     if not condition or doctors_df.empty:
#         logger.debug("No condition provided or empty doctor DataFrame")
#         return []

#     condition = condition.lower()
#     matched_doctors = doctors_df[doctors_df['Speciality'].str.lower().str.contains(condition, na=False)]
#     doctors = matched_doctors[['Name', 'Speciality', 'Email']].to_dict('records')
#     logger.debug(f"Found {len(doctors)} doctors for condition: {condition}")
#     return doctors

# @app.route('/upload', methods=['POST'])
# def upload_file():
#     if 'file' not in request.files:
#         logger.error("No file provided in request")
#         return jsonify({'error': 'No file provided'}), 400
    
#     file = request.files['file']
    
#     if file.filename == '':
#         logger.error("No file selected")
#         return jsonify({'error': 'No file selected'}), 400
#     if not allowed_file(file.filename):
#         logger.error(f"Unsupported file format: {file.filename}")
#         return jsonify({'error': 'Unsupported file format'}), 400

#     # Check file size
#     file.seek(0, os.SEEK_END)
#     file_size = file.tell()
#     if file_size > MAX_FILE_SIZE:
#         logger.error(f"File too large: {file_size} bytes")
#         return jsonify({'error': 'File too large, max 10MB'}), 400
#     file.seek(0)  # Reset file pointer

#     try:
#         logger.debug(f"Processing file: {file.filename}")
#         extracted_text = ''
#         if file.filename.lower().endswith('.pdf'):
#             images = convert_pdf_to_images(file)
#             extracted_text = ' '.join(extract_text_from_image(img) for img in images)
#         else:
#             image = Image.open(file)
#             extracted_text = extract_text_from_image(image)

#         if not extracted_text.strip():
#             logger.error("No text extracted from the file")
#             return jsonify({'error': 'No text extracted from the file'}), 400

#         logger.debug("Calling AI model")
#         ai_response = call_ai_model(extracted_text)
#         if 'error' in ai_response:
#             logger.error(f"AI model error: {ai_response['error']}")
#             return jsonify({'error': ai_response['error']}), 500

#         predictions = ai_response.get('predictions', [])
#         guidance = ai_response.get('guidance', [])
#         primary_condition = ai_response.get('primary_condition', '')
#         summary = ai_response.get('summary', '')
#         simplified_terms = ai_response.get('simplified_terms', [])

#         logger.debug(f"Primary condition: {primary_condition}")
#         doctors = get_doctor_recommendations(primary_condition)

#         response = {
#             'extracted_text': extracted_text,
#             'predictions': predictions,
#             'guidance': guidance,
#             'primary_condition': primary_condition,
#             'doctors': doctors,
#             'summary': summary,
#             'simplified_terms': simplified_terms
#         }

#         logger.debug("Returning successful response")
#         return jsonify(response), 200

#     except Exception as e:
#         logger.exception(f"Error processing file {file.filename}: {str(e)}")
#         return jsonify({'error': f'Failed to process file: {str(e)}'}), 500

# # Mixtral API configuration
# MIXTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
# MIXTRAL_API_KEY1 = "2V6h6NCi5u4AKFIdpjjAnLOULzBDLrU8"

# if __name__ == '__main__':
#     app.run(debug=True, host='0.0.0.0', port=5000)