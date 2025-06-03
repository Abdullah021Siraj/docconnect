from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import base64
import requests
import pandas as pd
import io
import json
from PIL import Image
import re

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.DEBUG)  # Set to DEBUG for detailed logs

# Load medicine dataset
try:
    MEDICINE_DB = pd.read_csv('Backend/app1/Data/Medicine_Details.csv')
    logging.info("Successfully loaded medicine dataset")
    logging.debug(f"Dataset columns: {list(MEDICINE_DB.columns)}")
except Exception as e:
    logging.error(f"Failed to load medicine dataset: {e}")
    MEDICINE_DB = pd.DataFrame()

# Gemini API Key
  

def validate_image(img_bytes):
    """Validate that the image is a supported format and readable"""
    try:
        img = Image.open(io.BytesIO(img_bytes))
        img.verify()  # Verify image integrity
        img = Image.open(io.BytesIO(img_bytes))  # Reopen after verify
        return True
    except Exception as e:
        logging.error(f"Image validation failed: {e}")
        return False

def clean_json_response(response_text):
    """Remove markdown code blocks and clean JSON string"""
    try:
        # Remove ```json and ``` markers
        cleaned = re.sub(r'^```json\s*|\s*```$', '', response_text, flags=re.MULTILINE)
        # Remove extra newlines and normalize whitespace
        cleaned = re.sub(r'\n\s*\n', '\n', cleaned.strip())
        cleaned = re.sub(r'\s*,\s*', ', ', cleaned)
        cleaned = re.sub(r'\s*:\s*', ': ', cleaned)
        logging.debug(f"Cleaned JSON response: {cleaned}")
        return cleaned
    except Exception as e:
        logging.error(f"Error cleaning JSON response: {e}")
        return response_text

def ml_model(image_base64=None, text=None, prompt=None, is_image=False):
   
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"
        headers = {"Content-Type": "application/json"}
        body = {"contents": [{"parts": []}]}

        if is_image and image_base64:
            body["contents"][0]["parts"].append({
                "inline_data": {
                    "mime_type": "image/jpeg",
                    "data": image_base64
                }
            })
        if text:
            body["contents"][0]["parts"].append({"text": text})
        if prompt:
            body["contents"][0]["parts"].append({"text": prompt})

        response = requests.post(url, headers=headers, json=body)
        logging.info(f"ML_Model Response Status: {response.status_code}")
        logging.debug(f"ML_Model Response Body: {response.text}")
        response.raise_for_status()
        result = response.json()

        if "candidates" in result and result["candidates"]:
            return result['candidates'][0]['content']['parts'][0]['text']
        else:
            logging.warning(f"ML_Model returned empty candidates: {result}")
            return "No text detected"
    except requests.RequestException as e:
        logging.error(f"ML_Model Request Error: {e}")
        return f"ML_Model Error: {str(e)}"
    except Exception as e:
        logging.error(f"ML_Model Error: {e}", exc_info=True)
        return f"call Error: {str(e)}"
    
GEMINI_API_KEY = "AIzaSyCvv8nxoz2IJWTWz9LxuQRu1HfBnd10aD4"
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
        # Read and validate image
        img_file = request.files['image']
        img_bytes = img_file.read()
        if not validate_image(img_bytes):
            return jsonify({
                "success": False,
                "error": "Invalid or unsupported image",
                "cleaned_output": None,
                "raw_output": None,
                "medicine_info": None
            }), 400

        image_base64 = base64.b64encode(img_bytes).decode('utf-8')

        # Step 1: Perform OCR
        ocr_prompt = "Extract all readable text from this medical prescription image."
        raw_text = ml_model(image_base64=image_base64, prompt=ocr_prompt, is_image=True)
        logging.info(f"Raw OCR Output:\n{raw_text}")

        if "Error" in raw_text or raw_text.strip() in ["No text detected", ""]:
            return jsonify({
                "success": False,
                "error": "OCR failed or no text detected",
                "cleaned_output": None,
                "raw_output": raw_text,
                "medicine_info": None
            }), 400

        # Step 2: Clean OCR text
        clean_prompt = (
            "Clean the following OCR output from a medical prescription. Remove noise, correct common OCR errors "
            "(e.g., 'bd' to 'bid', 'quan' to 'quantity'), and return only readable, relevant lines. "
            "Focus on text likely to contain medication names, dosages, or instructions. Output the cleaned text.\n\n"
            f"Raw OCR Text:\n{raw_text}"
        )
        cleaned_text = ml_model(text=clean_prompt)
        logging.info(f"Cleaned OCR Output:\n{cleaned_text}")

        if "Error" in cleaned_text or not cleaned_text.strip():
            cleaned_text = "No readable text extracted"
            medications = ["No medications identified"]
        else:
            # Step 3: Extract medications
            extract_prompt = (
                "From the following cleaned prescription text, extract a list of medication names. "
                "Look for patterns indicating medications (e.g., followed by 'mg', 'tab', 'bid', 'tid', 'qd', 'prn'). "
                "Return the list of medication names, one per line. If no medications are found, return 'No medications identified'.\n\n"
                f"Cleaned Text:\n{cleaned_text}"
            )
            medications_text = ml_model(text=extract_prompt)
            medications = [line.strip() for line in medications_text.split('\n') if line.strip()]
            if not medications or medications == ["No medications identified"]:
                medications = ["No medications identified"]
            logging.info(f"Extracted Medications:\n{medications}")

        # Step 4: Find medicine information
        medicine_info_list = []
        if not MEDICINE_DB.empty and medications != ["No medications identified"]:
            db_context = MEDICINE_DB[['Medicine Name', 'Composition', 'Uses', 'Side_effects', 'Manufacturer']].to_json(orient='records', lines=True)
            for med in medications:
                match_prompt = (
                    "Given the following medication name and a medicine database, find the best matching medicine. "
                    "Match based on the medication name or its composition (salts). If no exact match, find the closest match "
                    "using semantic similarity. Return the matching medicine's details as a JSON object with the fields: "
                    "'Medicine Name', 'Salt Composition', 'Uses', 'Side_effects', 'Manufacturer', 'Image URL' (set to empty string), "
                    "'Excellent' (set to '80'), 'Average' (set to '15'), 'Poor' (set to '5'). "
                    "If no match is found, return {}.\n\n"
                    f"Medication Name: {med}\n\n"
                    f"Medicine Database (JSON lines):\n{db_context}"
                )
                match_result = ml_model(text=match_prompt)
                logging.debug(f"Raw match result for {med}: {match_result}")
                try:
                    cleaned_json = clean_json_response(match_result)
                    match_info = json.loads(cleaned_json)
                    if match_info:
                        # Map dataset fields to frontend expectations
                        match_info['Salt Composition'] = match_info.get('Salt Composition', match_info.get('Composition', ''))
                        match_info.setdefault('Image URL', '')
                        match_info.setdefault('Excellent', '80')
                        match_info.setdefault('Average', '15')
                        match_info.setdefault('Poor', '5')
                        medicine_info_list.append(match_info)
                except json.JSONDecodeError as e:
                    logging.error(f"Failed to parse Gemini match result for {med}: {cleaned_json}, Error: {e}")
                    continue
                except Exception as e:
                    logging.error(f"Unexpected error processing match result for {med}: {e}")
                    continue

        return jsonify({
            "success": True,
            "error": None,
            "cleaned_output": "\n".join(medications),
            "raw_output": cleaned_text,
            "medicine_info": medicine_info_list
        })

    except Exception as e:
        logging.error(f"Prediction error: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "error": str(e),
            "cleaned_output": None,
            "raw_output": None,
            "medicine_info": None
        }), 500

if __name__ == "__main__":
    app.run(debug=True)