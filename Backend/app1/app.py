from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from fuzzywuzzy import fuzz, process
import os
import requests
import logging
from PIL import Image
import pytesseract
import pdf2image
import numpy as np
from werkzeug.utils import secure_filename
import json
import base64
import io
import re
from model import check_pattern, sec_predict, calc_condition, getDescription, getSeverityDict, getprecautionDict, description_list, precautionDictionary, severityDictionary, cols, clf, le, get_doctor_recommendations

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# API configurations


# Constants
MAIN_MENU_TEXT = "Please choose an option:\n1. Medication Information\n2. Follow-up Support\n3. Personalized Health Tips"
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
BASE_PROMPT_FOLLOW_UP = (
    "You're a certified medical assistant. Based on the user's query, give clear, medically accurate, "
    "and easy-to-understand advice. Never diagnose or prescribe medication. Recommend seeing a doctor for serious concerns."
)
BASE_PROMPT_HEALTH_TIPS = (
    "You're a certified health advisor. Provide clear, practical, and safe personalized health tips "
    "based on the user's age, gender, and health goals. Avoid medical diagnoses or prescriptions. "
    "Suggest consulting a doctor for serious concerns."
)

# Load datasets
def load_medication_data():
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        path_to_csv = os.path.join(script_dir, 'Data', 'Medicine_Details.csv')
        df = pd.read_csv(path_to_csv)
        df.columns = df.columns.str.strip()
        df = df.map(lambda x: x.strip() if isinstance(x, str) else x)
        df = df.fillna('Not specified')
        logger.info(f"Loaded {len(df)} medication records")
        return df
    except Exception as e:
        logger.error(f"Error loading medication data: {str(e)}")
        logger.debug(f"Current working directory: {os.getcwd()}")
        logger.debug(f"Attempted path: {path_to_csv}")
        return pd.DataFrame(columns=['Medicine Name', 'Composition', 'Uses', 'Side_effects', 'Manufacturer'])

def load_doctor_data():
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        path_to_csv = os.path.join(script_dir, 'Data', 'doctors2.csv')
        df = pd.read_csv(path_to_csv)
        logger.info(f"Loaded doctor dataset with {len(df)} records")
        return df
    except FileNotFoundError:
        logger.warning("doctors2.csv not found, using empty DataFrame")
        return pd.DataFrame(columns=['Name', 'Speciality', 'Email'])

MEDICINE_DB = load_medication_data()
DOCTOR_DB = load_doctor_data()

# Load symptom dictionaries for pred_bot
getSeverityDict()
getDescription()
getprecautionDict()

# Helper functions from Assist.py
def search_medications(query, threshold=75):
    results = []
    query = str(query).lower().strip()
    if not query or MEDICINE_DB.empty:
        return results
    for _, row in MEDICINE_DB.iterrows():
        name_score = fuzz.token_set_ratio(query, str(row['Medicine Name']).lower())
        comp_score = fuzz.token_set_ratio(query, str(row['Composition']).lower())
        best_score = max(name_score, comp_score)
        if best_score >= threshold:
            results.append({
                'Medicine Name': row['Medicine Name'],
                'Composition': row['Composition'],
                'Uses': row['Uses'],
                'Side_effects': row['Side_effects'],
                'Match Score': best_score,
                'Matched On': 'Name' if best_score == name_score else 'Composition'
            })
    results.sort(key=lambda x: x['Match Score'], reverse=True)
    seen = set()
    unique_results = []
    for r in results:
        key = (r['Medicine Name'], r['Composition'])
        if key not in seen:
            seen.add(key)
            unique_results.append(r)
    return unique_results[:10]


def query_mixtral(user_query, prompt_type="follow_up"):
    try:
        headers = {
            "Authorization": f"Bearer {MIXTRAL_API_KEY}",
            "Content-Type": "application/json"
        }
        base_prompt = BASE_PROMPT_FOLLOW_UP if prompt_type == "follow_up" else BASE_PROMPT_HEALTH_TIPS
        payload = {
            "model": "mistral-small",
            "messages": [
                {"role": "system", "content": base_prompt},
                {"role": "user", "content": user_query}
            ],
            "temperature": 0.3,
            "max_tokens": 400,
        }
        response = requests.post(MIXTRAL_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        logger.error(f"Error in querying Mixtral: {str(e)}")
        return "Sorry, there was an issue connecting to the medical assistant service. Please try again later."

# Helper functions from medic_report.py
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# API configurations
MIXTRAL_API_URL = ""
MIXTRAL_API_KEY = ""
MIXTRAL_API_KEY1 = ""
GEMINI_API_KEY = ""
def extract_text_from_image(image):
    try:
        logger.debug("Converting image to grayscale")
        image = image.convert('L')
        image = image.point(lambda x: 0 if x < 128 else 255, '1')
        logger.debug("Extracting text with Tesseract")
        text = pytesseract.image_to_string(image, lang='eng')
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from image: {str(e)}")
        raise

def convert_pdf_to_images(pdf_file):
    try:
        logger.debug("Converting PDF to images")
        images = pdf2image.convert_from_bytes(pdf_file.read())
        logger.debug(f"Extracted {len(images)} images from PDF")
        return images
    except Exception as e:
        logger.error(f"Error converting PDF to images: {str(e)}")
        raise

def call_ai_model(text):
    headers = {
        'Authorization': f'Bearer {MIXTRAL_API_KEY1}',
        'Content-Type': 'application/json'
    }
    prompt = f"""
    Analyze the following medical report text and provide a JSON response with the following fields:
    - predictions: Array of objects with label (condition name), confidence (0-1), and explanation (short string).
    - guidance: Array of strings with patient recommendations.
    - primary_condition: String with the primary condition.
    - summary: A concise summary of the medical report (2-3 sentences, layman's terms).
    - simplified_terms: Array of objects with term (medical jargon) and explanation (simplified description).

    Report Text: {text}

    Return only the JSON object, without any additional text, markdown, or code fences.
    """
    payload = {
        'model': 'mistral-small',
        'messages': [
            {
                'role': 'user',
                'content': prompt
            }
        ],
        'max_tokens': 1000,
        'temperature': 0.9
    }
    try:
        logger.debug("Sending request to Mixtral API")
        response = requests.post(MIXTRAL_API_URL, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        logger.debug(f"Raw API response: {data}")
        if 'choices' in data and len(data['choices']) > 0:
            result_text = data['choices'][0].get('message', {}).get('content', '')
            if not result_text:
                logger.error("No content in API response")
                return {'error': 'No content in API response'}
            try:
                result_text = result_text.strip()
                if result_text.startswith('```json'):
                    result_text = result_text.replace('```json', '').replace('```', '').strip()
                result = json.loads(result_text)
                logger.debug(f"Parsed AI response: {result}")
                return {
                    'predictions': result.get('predictions', []),
                    'guidance': result.get('guidance', []),
                    'primary_condition': result.get('primary_condition', ''),
                    'summary': result.get('summary', ''),
                    'simplified_terms': result.get('simplified_terms', [])
                }
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error: {str(e)}, response text: {result_text}")
                return {'error': f'Invalid JSON response from AI API: {str(e)}'}
        else:
            logger.error(f"Unexpected API response format: {data}")
            return {'error': 'No valid response from AI API'}
    except requests.RequestException as e:
        logger.error(f"AI API request failed: {str(e)}")
        return {'error': f'AI API request failed: {str(e)}'}

def get_doctor_recommendations_medic_report(condition):
    if not condition or DOCTOR_DB.empty:
        logger.debug("No condition provided or empty doctor DataFrame")
        return []
    condition = condition.lower()
    matched_doctors = DOCTOR_DB[DOCTOR_DB['Speciality'].str.lower().str.contains(condition, na=False)]
    doctors = matched_doctors[['Name', 'Speciality', 'Email']].to_dict('records')
    logger.debug(f"Found {len(doctors)} doctors for condition: {condition}")
    return doctors

# Helper functions from prescription.py
def validate_image(img_bytes):
    try:
        img = Image.open(io.BytesIO(img_bytes))
        img.verify()
        img = Image.open(io.BytesIO(img_bytes))
        return True
    except Exception as e:
        logger.error(f"Image validation failed: {e}")
        return False

def clean_json_response(response_text):
    try:
        cleaned = re.sub(r'^```json\s*|\s*```$', '', response_text, flags=re.MULTILINE)
        cleaned = re.sub(r'\n\s*\n', '\n', cleaned.strip())
        cleaned = re.sub(r'\s*,\s*', ', ', cleaned)
        cleaned = re.sub(r'\s*:\s*', ': ', cleaned)
        logger.debug(f"Cleaned JSON response: {cleaned}")
        return cleaned
    except Exception as e:
        logger.error(f"Error cleaning JSON response: {e}")
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
        logger.info(f"ML_Model Response Status: {response.status_code}")
        logger.debug(f"ML_Model Response Body: {response.text}")
        response.raise_for_status()
        result = response.json()
        if "candidates" in result and result["candidates"]:
            return result['candidates'][0]['content']['parts'][0]['text']
        else:
            logger.warning(f"ML_Model returned empty candidates: {result}")
            return "No text detected"
    except requests.RequestException as e:
        logger.error(f"ML_Model Request Error: {e}")
        return f"ML_Model Error: {str(e)}"
    except Exception as e:
        logger.error(f"ML_Model Error: {e}", exc_info=True)
        return f"call Error: {str(e)}"

# Routes from Assist.py
@app.route('/assistant', methods=['POST', 'OPTIONS'])
def assistant_handler():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    data = request.get_json()
    user_input = data.get('input', '').strip()
    context = data.get('context', {})
    logger.debug(f"Received input: '{user_input}', Context: {context}")
    if not context or context.get('awaiting_option'):
        if not context:
            context = {'awaiting_option': True, 'current_flow': None}
        if context.get('awaiting_option'):
            if user_input.lower() in ['1', 'medication', 'medicine', '1.']:
                context = {
                    'awaiting_option': False,
                    'current_flow': 'medication',
                    'awaiting_medication_input': True
                }
                return jsonify({
                    'response': "Please enter the medicine name or composition you're looking for:",
                    'context': context
                })
            elif user_input.lower() in ['2', 'follow up', 'follow-up', '2.']:
                context = {
                    'awaiting_option': False,
                    'current_flow': 'follow_up',
                    'awaiting_follow_up_input': True
                }
                return jsonify({
                    'response': "Please ask your follow-up question:",
                    'context': context
                })
            elif user_input.lower() in ['3', 'health tips', '3.']:
                context = {
                    'awaiting_option': False,
                    'current_flow': 'health_tips',
                    'health_info': {}
                }
                return jsonify({
                    'response': "Please provide your age:",
                    'context': context
                })
            else:
                return jsonify({
                    'response': MAIN_MENU_TEXT if not user_input else f"Invalid option. {MAIN_MENU_TEXT}",
                    'context': {'awaiting_option': True, 'current_flow': None}
                })
    if context.get('current_flow') == 'medication':
        if context.get('awaiting_medication_continue'):
            if user_input.lower() in ['yes', 'y']:
                context.pop('awaiting_medication_continue', None)
                context['awaiting_medication_input'] = True
                return jsonify({
                    'response': "OK, go ahead and enter the name of the other medicine.",
                    'context': context
                })
            elif user_input.lower() in ['no', 'n']:
                context = {'awaiting_option': True, 'current_flow': None}
                return jsonify({
                    'response': f"Thank you for using the Virtual Health Assistant!\n\n{MAIN_MENU_TEXT}",
                    'context': context
                })
            else:
                return jsonify({
                    'response': "Please answer with 'yes' or 'no'.\nWould you like to search for another medication?",
                    'context': context
                })
        if context.get('awaiting_medication_input'):
            results = search_medications(user_input)
            if not results:
                suggestions = process.extract(
                    user_input,
                    MEDICINE_DB['Medicine Name'].tolist() + MEDICINE_DB['Composition'].tolist(),
                    limit=3,
                    scorer=fuzz.token_set_ratio
                )
                suggestion_text = "\nDid you mean:\n" + "\n".join([f"- {s[0]}" for s in suggestions]) if suggestions else ""
                response_text = f"No medications found matching '{user_input}'.{suggestion_text}"
            else:
                formatted_results = []
                for med in results[:3]:
                    formatted_results.append(
                        f"💊 {med['Medicine Name']}\n"
                        f"🔬 Composition: {med['Composition']}\n"
                        f"💡 Uses: {med['Uses']}\n"
                        f"⚠️ Side Effects: {med['Side_effects']}\n"
                        f"---"
                    )
                response_text = "Here's what I found:\n\n" + "\n".join(formatted_results)
            context.pop('awaiting_medication_input', None)
            context['awaiting_medication_continue'] = True
            return jsonify({
                'response': f"{response_text}\n\nWould you like to search for another medication? (yes/no)",
                'context': context
            })
    if context.get('current_flow') == 'follow_up':
        if context.get('awaiting_follow_up_continue'):
            if user_input.lower() in ['yes', 'y']:
                context.pop('awaiting_follow_up_continue', None)
                context['awaiting_follow_up_input'] = True
                return jsonify({
                    'response': "OK, please ask your next question.",
                    'context': context
                })
            elif user_input.lower() in ['no', 'n']:
                context = {'awaiting_option': True, 'current_flow': None}
                return jsonify({
                    'response': f"Thank you for using the Virtual Health Assistant!\n\n{MAIN_MENU_TEXT}",
                    'context': context
                })
            else:
                return jsonify({
                    'response': "Please answer with 'yes' or 'no'.\nWould you like to ask another question?",
                    'context': context
                })
        if context.get('awaiting_follow_up_input'):
            response_text = query_mixtral(user_input, prompt_type="follow_up")
            context.pop('awaiting_follow_up_input', None)
            context['awaiting_follow_up_continue'] = True
            return jsonify({
                'response': f"{response_text}\n\nWould you like to ask another question? (yes/no)",
                'context': context
            })
    if context.get('current_flow') == 'health_tips':
        health_info = context.get('health_info', {})
        if context.get('awaiting_health_tips_continue'):
            if user_input.lower() in ['yes', 'y']:
                context.pop('awaiting_health_tips_continue', None)
                context['health_info'] = {}
                return jsonify({
                    'response': "Great! Let's start over for new tips. Please provide your age:",
                    'context': context
                })
            elif user_input.lower() in ['no', 'n']:
                context = {'awaiting_option': True, 'current_flow': None}
                return jsonify({
                    'response': f"Thank you for using the Virtual Health Assistant!\n\n{MAIN_MENU_TEXT}",
                    'context': context
                })
            else:
                return jsonify({
                    'response': "Please answer with 'yes' or 'no'.\nWould you like more health tips?",
                    'context': context
                })
        if 'age' not in health_info:
            if not user_input.isdigit() or not (0 < int(user_input) <= 120):
                return jsonify({
                    'response': "Please provide a valid age (e.g., '30'):",
                    'context': context
                })
            health_info['age'] = user_input
            context['health_info'] = health_info
            return jsonify({
                'response': "Please provide your gender (e.g., 'male', 'female', 'other'):",
                'context': context
            })
        if 'gender' not in health_info:
            if not user_input or len(user_input) > 20:
                return jsonify({
                    'response': "Please provide your gender (e.g., 'male', 'female', 'other'):",
                    'context': context
                })
            health_info['gender'] = user_input
            context['health_info'] = health_info
            return jsonify({
                'response': "Please share your health goals (e.g., 'improve sleep', 'reduce stress'):",
                'context': context
            })
        if 'goals' not in health_info:
            if not user_input:
                return jsonify({
                    'response': "Please provide your health goals (e.g., 'improve sleep', 'reduce stress'):",
                    'context': context
                })
            health_info['goals'] = user_input
            context['health_info'] = health_info
            user_query = f"Age: {health_info['age']}, Gender: {health_info['gender']}, Health goals: {health_info['goals']}"
            response_text = query_mixtral(user_query, prompt_type="health_tips")
            context['awaiting_health_tips_continue'] = True
            return jsonify({
                'response': f"{response_text}\n\nWould you like more health tips? (yes/no)",
                'context': context
            })
    logger.debug(f"Fallback triggered for input: '{user_input}' with context: {context}")
    context = {'awaiting_option': True, 'current_flow': None}
    return jsonify({
        'response': f"I'm not sure how to handle that. Let's start over.\n\n{MAIN_MENU_TEXT}",
        'context': context
    })

# Routes from medic_report.py
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        logger.error("No file provided in request")
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    if file.filename == '':
        logger.error("No file selected")
        return jsonify({'error': 'No file selected'}), 400
    if not allowed_file(file.filename):
        logger.error(f"Unsupported file format: {file.filename}")
        return jsonify({'error': 'Unsupported file format'}), 400
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    if file_size > MAX_FILE_SIZE:
        logger.error(f"File too large: {file_size} bytes")
        return jsonify({'error': 'File too large, max 10MB'}), 400
    file.seek(0)
    try:
        logger.debug(f"Processing file: {file.filename}")
        extracted_text = ''
        if file.filename.lower().endswith('.pdf'):
            images = convert_pdf_to_images(file)
            extracted_text = ' '.join(extract_text_from_image(img) for img in images)
        else:
            image = Image.open(file)
            extracted_text = extract_text_from_image(image)
        if not extracted_text.strip():
            logger.error("No text extracted from the file")
            return jsonify({'error': 'No text extracted from the file'}), 400
        logger.debug("Calling AI model")
        ai_response = call_ai_model(extracted_text)
        if 'error' in ai_response:
            logger.error(f"AI model error: {ai_response['error']}")
            return jsonify({'error': ai_response['error']}), 500
        predictions = ai_response.get('predictions', [])
        guidance = ai_response.get('guidance', [])
        primary_condition = ai_response.get('primary_condition', '')
        summary = ai_response.get('summary', '')
        simplified_terms = ai_response.get('simplified_terms', [])
        logger.debug(f"Primary condition: {primary_condition}")
        doctors = get_doctor_recommendations_medic_report(primary_condition)
        response = {
            'extracted_text': extracted_text,
            'predictions': predictions,
            'guidance': guidance,
            'primary_condition': primary_condition,
            'doctors': doctors,
            'summary': summary,
            'simplified_terms': simplified_terms
        }
        logger.debug("Returning successful response")
        return jsonify(response), 200
    except Exception as e:
        logger.exception(f"Error processing file {file.filename}: {str(e)}")
        return jsonify({'error': f'Failed to process file: {str(e)}'}), 500

# Routes from pred_bot.py
@app.route('/match-symptoms', methods=['POST'])
def match_symptoms():
    try:
        data = request.json
        user_input = data.get('symptom', '')
        dis_list = cols.tolist()
        conf, matched_symptoms = check_pattern(dis_list, user_input)
        return jsonify({
            "confidence": conf,
            "matched_symptoms": matched_symptoms
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict-disease', methods=['POST'])
def predict_disease():
    try:
        data = request.json
        symptoms = data.get('symptoms', [])
        days = data.get('days', 0)
        predicted_disease = sec_predict(symptoms)
        description = description_list.get(predicted_disease[0], "No description available.")
        precautions = precautionDictionary.get(predicted_disease[0], ["No precautions available."])
        severity_message = calc_condition(symptoms, days)
        doctor_recommendations = get_doctor_recommendations(predicted_disease[0])
        return jsonify({
            "disease": predicted_disease[0],
            "description": description,
            "precautions": precautions,
            "severity_message": severity_message,
            "doctor_recommendations": doctor_recommendations
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Routes from prescription.py
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
        if not validate_image(img_bytes):
            return jsonify({
                "success": False,
                "error": "Invalid or unsupported image",
                "cleaned_output": None,
                "raw_output": None,
                "medicine_info": None
            }), 400
        image_base64 = base64.b64encode(img_bytes).decode('utf-8')
        ocr_prompt = "Extract all readable text from this medical prescription image."
        raw_text = ml_model(image_base64=image_base64, prompt=ocr_prompt, is_image=True)
        logger.info(f"Raw OCR Output:\n{raw_text}")
        if "Error" in raw_text or raw_text.strip() in ["No text detected", ""]:
            return jsonify({
                "success": False,
                "error": "OCR failed or no text detected",
                "cleaned_output": None,
                "raw_output": raw_text,
                "medicine_info": None
            }), 400
        clean_prompt = (
            "Clean the following OCR output from a medical prescription. Remove noise, correct common OCR errors "
            "(e.g., 'bd' to 'bid', 'quan' to 'quantity'), and return only readable, relevant lines. "
            "Focus on text likely to contain medication names, dosages, or instructions. Output the cleaned text.\n\n"
            f"Raw OCR Text:\n{raw_text}"
        )
        cleaned_text = ml_model(text=clean_prompt)
        logger.info(f"Cleaned OCR Output:\n{cleaned_text}")
        if "Error" in cleaned_text or not cleaned_text.strip():
            cleaned_text = "No readable text extracted"
            medications = ["No medications identified"]
        else:
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
            logger.info(f"Extracted Medications:\n{medications}")
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
                logger.debug(f"Raw match result for {med}: {match_result}")
                try:
                    cleaned_json = clean_json_response(match_result)
                    match_info = json.loads(cleaned_json)
                    if match_info:
                        match_info['Salt Composition'] = match_info.get('Salt Composition', match_info.get('Composition', ''))
                        match_info.setdefault('Image URL', '')
                        match_info.setdefault('Excellent', '80')
                        match_info.setdefault('Average', '15')
                        match_info.setdefault('Poor', '5')
                        medicine_info_list.append(match_info)
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse Gemini match result for {med}: {cleaned_json}, Error: {e}")
                    continue
                except Exception as e:
                    logger.error(f"Unexpected error processing match result for {med}: {e}")
                    continue
        return jsonify({
            "success": True,
            "error": None,
            "cleaned_output": "\n".join(medications),
            "raw_output": cleaned_text,
            "medicine_info": medicine_info_list
        })
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "error": str(e),
            "cleaned_output": None,
            "raw_output": None,
            "medicine_info": None
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from fuzzywuzzy import fuzz, process
import os
import requests
import logging
from PIL import Image
import pytesseract
import pdf2image
import numpy as np
from werkzeug.utils import secure_filename
import json
import base64
import io
import re
from model import check_pattern, sec_predict, calc_condition, getDescription, getSeverityDict, getprecautionDict, description_list, precautionDictionary, severityDictionary, cols, clf, le, get_doctor_recommendations

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# API configurations


# Constants
MAIN_MENU_TEXT = "Please choose an option:\n1. Medication Information\n2. Follow-up Support\n3. Personalized Health Tips"
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
BASE_PROMPT_FOLLOW_UP = (
    "You're a certified medical assistant. Based on the user's query, give clear, medically accurate, "
    "and easy-to-understand advice. Never diagnose or prescribe medication. Recommend seeing a doctor for serious concerns."
)
BASE_PROMPT_HEALTH_TIPS = (
    "You're a certified health advisor. Provide clear, practical, and safe personalized health tips "
    "based on the user's age, gender, and health goals. Avoid medical diagnoses or prescriptions. "
    "Suggest consulting a doctor for serious concerns."
)

# Load datasets
def load_medication_data():
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        path_to_csv = os.path.join(script_dir, "/home/muizz/Documents/GitHub/docconnect/Backend/app1/Data/Medicine_Details.csv")
        df = pd.read_csv(path_to_csv)
        df.columns = df.columns.str.strip()
        df = df.map(lambda x: x.strip() if isinstance(x, str) else x)
        df = df.fillna('Not specified')
        logger.info(f"Loaded {len(df)} medication records")
        return df
    except Exception as e:
        logger.error(f"Error loading medication data: {str(e)}")
        logger.debug(f"Current working directory: {os.getcwd()}")
        logger.debug(f"Attempted path: {path_to_csv}")
        return pd.DataFrame(columns=['Medicine Name', 'Composition', 'Uses', 'Side_effects', 'Manufacturer'])

def load_doctor_data():
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        path_to_csv = os.path.join(script_dir, "/home/muizz/Documents/GitHub/docconnect/Backend/app1/Data/doctors2.csv")
        df = pd.read_csv(path_to_csv)
        logger.info(f"Loaded doctor dataset with {len(df)} records")
        return df
    except FileNotFoundError:
        logger.warning("doctors2.csv not found, using empty DataFrame")
        return pd.DataFrame(columns=['Name', 'Speciality', 'Email'])

MEDICINE_DB = load_medication_data()
DOCTOR_DB = load_doctor_data()

# Load symptom dictionaries for pred_bot
getSeverityDict()
getDescription()
getprecautionDict()

# Helper functions from Assist.py
def search_medications(query, threshold=75):
    results = []
    query = str(query).lower().strip()
    if not query or MEDICINE_DB.empty:
        return results
    for _, row in MEDICINE_DB.iterrows():
        name_score = fuzz.token_set_ratio(query, str(row['Medicine Name']).lower())
        comp_score = fuzz.token_set_ratio(query, str(row['Composition']).lower())
        best_score = max(name_score, comp_score)
        if best_score >= threshold:
            results.append({
                'Medicine Name': row['Medicine Name'],
                'Composition': row['Composition'],
                'Uses': row['Uses'],
                'Side_effects': row['Side_effects'],
                'Match Score': best_score,
                'Matched On': 'Name' if best_score == name_score else 'Composition'
            })
    results.sort(key=lambda x: x['Match Score'], reverse=True)
    seen = set()
    unique_results = []
    for r in results:
        key = (r['Medicine Name'], r['Composition'])
        if key not in seen:
            seen.add(key)
            unique_results.append(r)
    return unique_results[:10]


def query_mixtral(user_query, prompt_type="follow_up"):
    try:
        headers = {
            "Authorization": f"Bearer {MIXTRAL_API_KEY}",
            "Content-Type": "application/json"
        }
        base_prompt = BASE_PROMPT_FOLLOW_UP if prompt_type == "follow_up" else BASE_PROMPT_HEALTH_TIPS
        payload = {
            "model": "mistral-small",
            "messages": [
                {"role": "system", "content": base_prompt},
                {"role": "user", "content": user_query}
            ],
            "temperature": 0.3,
            "max_tokens": 400,
        }
        response = requests.post(MIXTRAL_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        logger.error(f"Error in querying Mixtral: {str(e)}")
        return "Sorry, there was an issue connecting to the medical assistant service. Please try again later."

# Helper functions from medic_report.py
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# API configurations
MIXTRAL_API_URL = ""
MIXTRAL_API_KEY = ""
MIXTRAL_API_KEY1 = ""
GEMINI_API_KEY = ""
def extract_text_from_image(image):
    try:
        logger.debug("Converting image to grayscale")
        image = image.convert('L')
        image = image.point(lambda x: 0 if x < 128 else 255, '1')
        logger.debug("Extracting text with Tesseract")
        text = pytesseract.image_to_string(image, lang='eng')
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting text from image: {str(e)}")
        raise

def convert_pdf_to_images(pdf_file):
    try:
        logger.debug("Converting PDF to images")
        images = pdf2image.convert_from_bytes(pdf_file.read())
        logger.debug(f"Extracted {len(images)} images from PDF")
        return images
    except Exception as e:
        logger.error(f"Error converting PDF to images: {str(e)}")
        raise

def call_ai_model(text):
    headers = {
        'Authorization': f'Bearer {MIXTRAL_API_KEY1}',
        'Content-Type': 'application/json'
    }
    prompt = f"""
    Analyze the following medical report text and provide a JSON response with the following fields:
    - predictions: Array of objects with label (condition name), confidence (0-1), and explanation (short string).
    - guidance: Array of strings with patient recommendations.
    - primary_condition: String with the primary condition.
    - summary: A concise summary of the medical report (2-3 sentences, layman's terms).
    - simplified_terms: Array of objects with term (medical jargon) and explanation (simplified description).

    Report Text: {text}

    Return only the JSON object, without any additional text, markdown, or code fences.
    """
    payload = {
        'model': 'mistral-small',
        'messages': [
            {
                'role': 'user',
                'content': prompt
            }
        ],
        'max_tokens': 1000,
        'temperature': 0.9
    }
    try:
        logger.debug("Sending request to Mixtral API")
        response = requests.post(MIXTRAL_API_URL, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json()
        logger.debug(f"Raw API response: {data}")
        if 'choices' in data and len(data['choices']) > 0:
            result_text = data['choices'][0].get('message', {}).get('content', '')
            if not result_text:
                logger.error("No content in API response")
                return {'error': 'No content in API response'}
            try:
                result_text = result_text.strip()
                if result_text.startswith('```json'):
                    result_text = result_text.replace('```json', '').replace('```', '').strip()
                result = json.loads(result_text)
                logger.debug(f"Parsed AI response: {result}")
                return {
                    'predictions': result.get('predictions', []),
                    'guidance': result.get('guidance', []),
                    'primary_condition': result.get('primary_condition', ''),
                    'summary': result.get('summary', ''),
                    'simplified_terms': result.get('simplified_terms', [])
                }
            except json.JSONDecodeError as e:
                logger.error(f"JSON decode error: {str(e)}, response text: {result_text}")
                return {'error': f'Invalid JSON response from AI API: {str(e)}'}
        else:
            logger.error(f"Unexpected API response format: {data}")
            return {'error': 'No valid response from AI API'}
    except requests.RequestException as e:
        logger.error(f"AI API request failed: {str(e)}")
        return {'error': f'AI API request failed: {str(e)}'}

def get_doctor_recommendations_medic_report(condition):
    if not condition or DOCTOR_DB.empty:
        logger.debug("No condition provided or empty doctor DataFrame")
        return []
    condition = condition.lower()
    matched_doctors = DOCTOR_DB[DOCTOR_DB['Speciality'].str.lower().str.contains(condition, na=False)]
    doctors = matched_doctors[['Name', 'Speciality', 'Email']].to_dict('records')
    logger.debug(f"Found {len(doctors)} doctors for condition: {condition}")
    return doctors

# Helper functions from prescription.py
def validate_image(img_bytes):
    try:
        img = Image.open(io.BytesIO(img_bytes))
        img.verify()
        img = Image.open(io.BytesIO(img_bytes))
        return True
    except Exception as e:
        logger.error(f"Image validation failed: {e}")
        return False

def clean_json_response(response_text):
    try:
        cleaned = re.sub(r'^```json\s*|\s*```$', '', response_text, flags=re.MULTILINE)
        cleaned = re.sub(r'\n\s*\n', '\n', cleaned.strip())
        cleaned = re.sub(r'\s*,\s*', ', ', cleaned)
        cleaned = re.sub(r'\s*:\s*', ': ', cleaned)
        logger.debug(f"Cleaned JSON response: {cleaned}")
        return cleaned
    except Exception as e:
        logger.error(f"Error cleaning JSON response: {e}")
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
        logger.info(f"ML_Model Response Status: {response.status_code}")
        logger.debug(f"ML_Model Response Body: {response.text}")
        response.raise_for_status()
        result = response.json()
        if "candidates" in result and result["candidates"]:
            return result['candidates'][0]['content']['parts'][0]['text']
        else:
            logger.warning(f"ML_Model returned empty candidates: {result}")
            return "No text detected"
    except requests.RequestException as e:
        logger.error(f"ML_Model Request Error: {e}")
        return f"ML_Model Error: {str(e)}"
    except Exception as e:
        logger.error(f"ML_Model Error: {e}", exc_info=True)
        return f"call Error: {str(e)}"

# Routes from Assist.py
@app.route('/assistant', methods=['POST', 'OPTIONS'])
def assistant_handler():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    data = request.get_json()
    user_input = data.get('input', '').strip()
    context = data.get('context', {})
    logger.debug(f"Received input: '{user_input}', Context: {context}")
    if not context or context.get('awaiting_option'):
        if not context:
            context = {'awaiting_option': True, 'current_flow': None}
        if context.get('awaiting_option'):
            if user_input.lower() in ['1', 'medication', 'medicine', '1.']:
                context = {
                    'awaiting_option': False,
                    'current_flow': 'medication',
                    'awaiting_medication_input': True
                }
                return jsonify({
                    'response': "Please enter the medicine name or composition you're looking for:",
                    'context': context
                })
            elif user_input.lower() in ['2', 'follow up', 'follow-up', '2.']:
                context = {
                    'awaiting_option': False,
                    'current_flow': 'follow_up',
                    'awaiting_follow_up_input': True
                }
                return jsonify({
                    'response': "Please ask your follow-up question:",
                    'context': context
                })
            elif user_input.lower() in ['3', 'health tips', '3.']:
                context = {
                    'awaiting_option': False,
                    'current_flow': 'health_tips',
                    'health_info': {}
                }
                return jsonify({
                    'response': "Please provide your age:",
                    'context': context
                })
            else:
                return jsonify({
                    'response': MAIN_MENU_TEXT if not user_input else f"Invalid option. {MAIN_MENU_TEXT}",
                    'context': {'awaiting_option': True, 'current_flow': None}
                })
    if context.get('current_flow') == 'medication':
        if context.get('awaiting_medication_continue'):
            if user_input.lower() in ['yes', 'y']:
                context.pop('awaiting_medication_continue', None)
                context['awaiting_medication_input'] = True
                return jsonify({
                    'response': "OK, go ahead and enter the name of the other medicine.",
                    'context': context
                })
            elif user_input.lower() in ['no', 'n']:
                context = {'awaiting_option': True, 'current_flow': None}
                return jsonify({
                    'response': f"Thank you for using the Virtual Health Assistant!\n\n{MAIN_MENU_TEXT}",
                    'context': context
                })
            else:
                return jsonify({
                    'response': "Please answer with 'yes' or 'no'.\nWould you like to search for another medication?",
                    'context': context
                })
        if context.get('awaiting_medication_input'):
            results = search_medications(user_input)
            if not results:
                suggestions = process.extract(
                    user_input,
                    MEDICINE_DB['Medicine Name'].tolist() + MEDICINE_DB['Composition'].tolist(),
                    limit=3,
                    scorer=fuzz.token_set_ratio
                )
                suggestion_text = "\nDid you mean:\n" + "\n".join([f"- {s[0]}" for s in suggestions]) if suggestions else ""
                response_text = f"No medications found matching '{user_input}'.{suggestion_text}"
            else:
                formatted_results = []
                for med in results[:3]:
                    formatted_results.append(
                        f"💊 {med['Medicine Name']}\n"
                        f"🔬 Composition: {med['Composition']}\n"
                        f"💡 Uses: {med['Uses']}\n"
                        f"⚠️ Side Effects: {med['Side_effects']}\n"
                        f"---"
                    )
                response_text = "Here's what I found:\n\n" + "\n".join(formatted_results)
            context.pop('awaiting_medication_input', None)
            context['awaiting_medication_continue'] = True
            return jsonify({
                'response': f"{response_text}\n\nWould you like to search for another medication? (yes/no)",
                'context': context
            })
    if context.get('current_flow') == 'follow_up':
        if context.get('awaiting_follow_up_continue'):
            if user_input.lower() in ['yes', 'y']:
                context.pop('awaiting_follow_up_continue', None)
                context['awaiting_follow_up_input'] = True
                return jsonify({
                    'response': "OK, please ask your next question.",
                    'context': context
                })
            elif user_input.lower() in ['no', 'n']:
                context = {'awaiting_option': True, 'current_flow': None}
                return jsonify({
                    'response': f"Thank you for using the Virtual Health Assistant!\n\n{MAIN_MENU_TEXT}",
                    'context': context
                })
            else:
                return jsonify({
                    'response': "Please answer with 'yes' or 'no'.\nWould you like to ask another question?",
                    'context': context
                })
        if context.get('awaiting_follow_up_input'):
            response_text = query_mixtral(user_input, prompt_type="follow_up")
            context.pop('awaiting_follow_up_input', None)
            context['awaiting_follow_up_continue'] = True
            return jsonify({
                'response': f"{response_text}\n\nWould you like to ask another question? (yes/no)",
                'context': context
            })
    if context.get('current_flow') == 'health_tips':
        health_info = context.get('health_info', {})
        if context.get('awaiting_health_tips_continue'):
            if user_input.lower() in ['yes', 'y']:
                context.pop('awaiting_health_tips_continue', None)
                context['health_info'] = {}
                return jsonify({
                    'response': "Great! Let's start over for new tips. Please provide your age:",
                    'context': context
                })
            elif user_input.lower() in ['no', 'n']:
                context = {'awaiting_option': True, 'current_flow': None}
                return jsonify({
                    'response': f"Thank you for using the Virtual Health Assistant!\n\n{MAIN_MENU_TEXT}",
                    'context': context
                })
            else:
                return jsonify({
                    'response': "Please answer with 'yes' or 'no'.\nWould you like more health tips?",
                    'context': context
                })
        if 'age' not in health_info:
            if not user_input.isdigit() or not (0 < int(user_input) <= 120):
                return jsonify({
                    'response': "Please provide a valid age (e.g., '30'):",
                    'context': context
                })
            health_info['age'] = user_input
            context['health_info'] = health_info
            return jsonify({
                'response': "Please provide your gender (e.g., 'male', 'female', 'other'):",
                'context': context
            })
        if 'gender' not in health_info:
            if not user_input or len(user_input) > 20:
                return jsonify({
                    'response': "Please provide your gender (e.g., 'male', 'female', 'other'):",
                    'context': context
                })
            health_info['gender'] = user_input
            context['health_info'] = health_info
            return jsonify({
                'response': "Please share your health goals (e.g., 'improve sleep', 'reduce stress'):",
                'context': context
            })
        if 'goals' not in health_info:
            if not user_input:
                return jsonify({
                    'response': "Please provide your health goals (e.g., 'improve sleep', 'reduce stress'):",
                    'context': context
                })
            health_info['goals'] = user_input
            context['health_info'] = health_info
            user_query = f"Age: {health_info['age']}, Gender: {health_info['gender']}, Health goals: {health_info['goals']}"
            response_text = query_mixtral(user_query, prompt_type="health_tips")
            context['awaiting_health_tips_continue'] = True
            return jsonify({
                'response': f"{response_text}\n\nWould you like more health tips? (yes/no)",
                'context': context
            })
    logger.debug(f"Fallback triggered for input: '{user_input}' with context: {context}")
    context = {'awaiting_option': True, 'current_flow': None}
    return jsonify({
        'response': f"I'm not sure how to handle that. Let's start over.\n\n{MAIN_MENU_TEXT}",
        'context': context
    })

# Routes from medic_report.py
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        logger.error("No file provided in request")
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    if file.filename == '':
        logger.error("No file selected")
        return jsonify({'error': 'No file selected'}), 400
    if not allowed_file(file.filename):
        logger.error(f"Unsupported file format: {file.filename}")
        return jsonify({'error': 'Unsupported file format'}), 400
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    if file_size > MAX_FILE_SIZE:
        logger.error(f"File too large: {file_size} bytes")
        return jsonify({'error': 'File too large, max 10MB'}), 400
    file.seek(0)
    try:
        logger.debug(f"Processing file: {file.filename}")
        extracted_text = ''
        if file.filename.lower().endswith('.pdf'):
            images = convert_pdf_to_images(file)
            extracted_text = ' '.join(extract_text_from_image(img) for img in images)
        else:
            image = Image.open(file)
            extracted_text = extract_text_from_image(image)
        if not extracted_text.strip():
            logger.error("No text extracted from the file")
            return jsonify({'error': 'No text extracted from the file'}), 400
        logger.debug("Calling AI model")
        ai_response = call_ai_model(extracted_text)
        if 'error' in ai_response:
            logger.error(f"AI model error: {ai_response['error']}")
            return jsonify({'error': ai_response['error']}), 500
        predictions = ai_response.get('predictions', [])
        guidance = ai_response.get('guidance', [])
        primary_condition = ai_response.get('primary_condition', '')
        summary = ai_response.get('summary', '')
        simplified_terms = ai_response.get('simplified_terms', [])
        logger.debug(f"Primary condition: {primary_condition}")
        doctors = get_doctor_recommendations_medic_report(primary_condition)
        response = {
            'extracted_text': extracted_text,
            'predictions': predictions,
            'guidance': guidance,
            'primary_condition': primary_condition,
            'doctors': doctors,
            'summary': summary,
            'simplified_terms': simplified_terms
        }
        logger.debug("Returning successful response")
        return jsonify(response), 200
    except Exception as e:
        logger.exception(f"Error processing file {file.filename}: {str(e)}")
        return jsonify({'error': f'Failed to process file: {str(e)}'}), 500

# Routes from pred_bot.py
@app.route('/match-symptoms', methods=['POST'])
def match_symptoms():
    try:
        data = request.json
        user_input = data.get('symptom', '')
        dis_list = cols.tolist()
        conf, matched_symptoms = check_pattern(dis_list, user_input)
        return jsonify({
            "confidence": conf,
            "matched_symptoms": matched_symptoms
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/predict-disease', methods=['POST'])
def predict_disease():
    try:
        data = request.json
        symptoms = data.get('symptoms', [])
        days = data.get('days', 0)
        predicted_disease = sec_predict(symptoms)
        description = description_list.get(predicted_disease[0], "No description available.")
        precautions = precautionDictionary.get(predicted_disease[0], ["No precautions available."])
        severity_message = calc_condition(symptoms, days)
        doctor_recommendations = get_doctor_recommendations(predicted_disease[0])
        return jsonify({
            "disease": predicted_disease[0],
            "description": description,
            "precautions": precautions,
            "severity_message": severity_message,
            "doctor_recommendations": doctor_recommendations
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Routes from prescription.py
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
        if not validate_image(img_bytes):
            return jsonify({
                "success": False,
                "error": "Invalid or unsupported image",
                "cleaned_output": None,
                "raw_output": None,
                "medicine_info": None
            }), 400
        image_base64 = base64.b64encode(img_bytes).decode('utf-8')
        ocr_prompt = "Extract all readable text from this medical prescription image."
        raw_text = ml_model(image_base64=image_base64, prompt=ocr_prompt, is_image=True)
        logger.info(f"Raw OCR Output:\n{raw_text}")
        if "Error" in raw_text or raw_text.strip() in ["No text detected", ""]:
            return jsonify({
                "success": False,
                "error": "OCR failed or no text detected",
                "cleaned_output": None,
                "raw_output": raw_text,
                "medicine_info": None
            }), 400
        clean_prompt = (
            "Clean the following OCR output from a medical prescription. Remove noise, correct common OCR errors "
            "(e.g., 'bd' to 'bid', 'quan' to 'quantity'), and return only readable, relevant lines. "
            "Focus on text likely to contain medication names, dosages, or instructions. Output the cleaned text.\n\n"
            f"Raw OCR Text:\n{raw_text}"
        )
        cleaned_text = ml_model(text=clean_prompt)
        logger.info(f"Cleaned OCR Output:\n{cleaned_text}")
        if "Error" in cleaned_text or not cleaned_text.strip():
            cleaned_text = "No readable text extracted"
            medications = ["No medications identified"]
        else:
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
            logger.info(f"Extracted Medications:\n{medications}")
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
                logger.debug(f"Raw match result for {med}: {match_result}")
                try:
                    cleaned_json = clean_json_response(match_result)
                    match_info = json.loads(cleaned_json)
                    if match_info:
                        match_info['Salt Composition'] = match_info.get('Salt Composition', match_info.get('Composition', ''))
                        match_info.setdefault('Image URL', '')
                        match_info.setdefault('Excellent', '80')
                        match_info.setdefault('Average', '15')
                        match_info.setdefault('Poor', '5')
                        medicine_info_list.append(match_info)
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse Gemini match result for {med}: {cleaned_json}, Error: {e}")
                    continue
                except Exception as e:
                    logger.error(f"Unexpected error processing match result for {med}: {e}")
                    continue
        return jsonify({
            "success": True,
            "error": None,
            "cleaned_output": "\n".join(medications),
            "raw_output": cleaned_text,
            "medicine_info": medicine_info_list
        })
    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        return jsonify({
            "success": False,
            "error": str(e),
            "cleaned_output": None,
            "raw_output": None,
            "medicine_info": None
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
