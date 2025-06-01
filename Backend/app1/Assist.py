from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from fuzzywuzzy import fuzz, process
import os
import requests

app = Flask(__name__)
CORS(app)

# Load medication dataset
def load_medication_data():
    try:
        df = pd.read_csv("Backend/app1/Data/Medicine_Details.csv")
        df.columns = df.columns.str.strip()
        df = df.applymap(lambda x: x.strip() if isinstance(x, str) else x)
        df = df.fillna('Not specified')
        print(f"Loaded {len(df)} medication records")
        return df
    except Exception as e:
        print(f"Error loading medication data: {str(e)}")
        return pd.DataFrame(columns=['Medicine Name', 'Composition', 'Uses', 'Side_effects'])

medication_data = load_medication_data()

def search_medications(query, threshold=75):
    results = []
    query = str(query).lower().strip()
    if not query or medication_data.empty:
        return results
    for _, row in medication_data.iterrows():
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

# Mixtral AI API configuration
MIXTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"  # Mistral AI endpoint
MIXTRAL_API_KEY = "uMQCTkExgyxd3E65YbaUovX4dI4VhDpU"  # Your API key
BASE_PROMPT_FOLLOW_UP = (
    "You’re a certified medical assistant. Based on the user's query, give clear, medically accurate, "
    "and easy-to-understand advice. Never diagnose or prescribe medication. Recommend seeing a doctor for serious concerns."
)
BASE_PROMPT_HEALTH_TIPS = (
    "You’re a certified health advisor. Provide clear, practical, and safe personalized health tips "
    "based on the user’s age, gender, and health goals. Avoid medical diagnoses or prescriptions. "
    "Suggest consulting a doctor for serious concerns."
)

def query_mixtral(user_query, prompt_type="follow_up"):
    try:
        headers = {
            "Authorization": f"Bearer {MIXTRAL_API_KEY}",
            "Content-Type": "application/json"
        }
        base_prompt = BASE_PROMPT_FOLLOW_UP if prompt_type == "follow_up" else BASE_PROMPT_HEALTH_TIPS
        payload = {
            "model": "mistral-small",  # medium-tier model
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
        print(f"Error in querying: {str(e)}")
        return "Sorry, there was an issue connecting to the medical assistant service. Please try again later."

@app.route('/assistant', methods=['POST', 'OPTIONS'])
def assistant_handler():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    data = request.get_json()
    user_input = data.get('input', '').strip()
    context = data.get('context', {})
    print(f"Received input: '{user_input}', Context: {context}")
    if not context or not isinstance(context, dict):
        context = {'awaiting_option': True, 'option_selected': None}
        print("Initialized context:", context)
    if context.get('awaiting_option', True):
        print(f"Processing input '{user_input.lower()}' for option selection")
        if user_input.lower() in ['1', 'medication', 'medicine', '1.']:
            print("Matched option 1")
            return jsonify({
                'response': "Please enter the medicine name or composition you're looking for:",
                'context': {'option_selected': 'medication_info', 'awaiting_option': False}
            })
        elif user_input.lower() in ['2', 'follow up', 'follow-up', '2.']:
            print("Matched option 2")
            return jsonify({
                'response': "Please ask your follow-up question (e.g., 'Can I take Ibuprofen with my blood pressure medicine?'):",
                'context': {'option_selected': 'follow_up_support', 'awaiting_option': False}
            })
        elif user_input.lower() in ['3', 'health tips', '3.']:
            print("Matched option 3")
            return jsonify({
                'response': "Please provide your age:",
                'context': {'option_selected': 'health_tips', 'awaiting_option': False, 'awaiting_age': True}
            })
        else:
            print("Input did not match any option")
            return jsonify({
                'response': "Invalid option. Please choose 1, 2, or 3:",
                'context': {'awaiting_option': True, 'option_selected': None}
            })
    if context.get('option_selected') == 'medication_info':
        print("Searching for medication with query:", user_input)
        results = search_medications(user_input)
        if not results:
            suggestions = process.extract(
                user_input,
                medication_data['Medicine Name'].tolist() + medication_data['Composition'].tolist(),
                limit=3,
                scorer=fuzz.token_set_ratio
            )
            suggestion_text = "\nDid you mean:\n" + "\n".join([f"- {s[0]}" for s in suggestions]) if suggestions else ""
            return jsonify({
                'response': f"No medications found matching '{user_input}'.{suggestion_text}\n\nPlease try again or select another option.",
                'context': {'awaiting_option': True, 'option_selected': None}
            })
        formatted_results = []
        for med in results[:3]:
            formatted_results.append(
                f"💊 {med['Medicine Name']}\n"
                f"🔬 Composition: {med['Composition']}\n"
                f"💡 Uses: {med['Uses']}\n"
                f"⚠️ Side Effects: {med['Side_effects']}\n"
                f"---"
            )
        return jsonify({
            'response': "Here's what I found:\n\n" + "\n".join(formatted_results) +
                       "\n\nWould you like to search for another medication? (yes/no)",
            'context': {'option_selected': 'medication_info', 'awaiting_medication_continue': True}
        })
    if context.get('option_selected') == 'follow_up_support':
        print("Processing follow-up question:", user_input)
        if not user_input:
            return jsonify({
                'response': "Please provide a question for follow-up support.",
                'context': {'option_selected': 'follow_up_support', 'awaiting_option': False}
            })
        response_text = query_mixtral(user_input, prompt_type="follow_up")
        return jsonify({
            'response': f"{response_text}\n\nWould you like to ask another question? (yes/no)",
            'context': {'option_selected': 'follow_up_support', 'awaiting_follow_up_continue': True}
        })
    if context.get('option_selected') == 'health_tips':
        if context.get('awaiting_age'):
            print("Processing age input:", user_input)
            if not user_input or not user_input.strip().isdigit():
                return jsonify({
                    'response': "Please provide a valid age (e.g., '30'):",
                    'context': {**context, 'awaiting_age': True}
                })
            return jsonify({
                'response': "Please provide your gender (e.g., 'male', 'female', 'other'):",
                'context': {**context, 'age': user_input.strip(), 'awaiting_age': False, 'awaiting_gender': True}
            })
        if context.get('awaiting_gender'):
            print("Processing gender input:", user_input)
            if not user_input:
                return jsonify({
                    'response': "Please provide your gender (e.g., 'male', 'female', 'other'):",
                    'context': {**context, 'awaiting_gender': True}
                })
            return jsonify({
                'response': "Please share your health goals (e.g., 'improve sleep', 'reduce stress'):",
                'context': {**context, 'gender': user_input.strip(), 'awaiting_gender': False, 'awaiting_health_goals': True}
            })
        if context.get('awaiting_health_goals'):
            print("Processing health goals input:", user_input)
            if not user_input:
                return jsonify({
                    'response': "Please provide your health goals (e.g., 'improve sleep', 'reduce stress'):",
                    'context': {**context, 'awaiting_health_goals': True}
                })
            user_query = f"Age: {context.get('age')}, Gender: {context.get('gender')}, Health goals: {user_input.strip()}"
            response_text = query_mixtral(user_query, prompt_type="health_tips")
            return jsonify({
                'response': f"{response_text}\n\nWould you like more health tips? (yes/no)",
                'context': {
                    'option_selected': 'health_tips',
                    'awaiting_health_tips_continue': True,
                    'age': context.get('age'),
                    'gender': context.get('gender')
                }
            })
    if context.get('awaiting_medication_continue'):
        print("Processing continue response for medication:", user_input)
        if user_input.lower() in ['yes', 'y', 'yes.', 'yes']:
            return jsonify({
                'response': "Please enter the next medicine name or composition:",
                'context': {'option_selected': 'medication_info', 'awaiting_option': False, 'awaiting_medication_continue': False}
            })
        else:
            return jsonify({
                'response': "Please choose an option:\n1. Medication Information\n2. Follow-up Support\n3. Personalized Health Tips",
                'context': {'awaiting_option': True, 'option_selected': None}
            })
    if context.get('awaiting_follow_up_continue'):
        print("Processing continue response for follow-up:", user_input)
        if user_input.lower() in ['yes', 'y', 'yes.', 'yes']:
            return jsonify({
                'response': "Please ask your next follow-up question:",
                'context': {'option_selected': 'follow_up_support', 'awaiting_option': False, 'awaiting_follow_up_continue': False}
            })
        else:
            return jsonify({
                'response': "Please choose an option:\n1. Medication Information\n2. Follow-up Support\n3. Personalized Health Tips",
                'context': {'awaiting_option': True, 'option_selected': None}
            })
    if context.get('awaiting_health_tips_continue'):
        print("Processing continue response for health tips:", user_input)
        if user_input.lower() in ['yes', 'y', 'yes.', 'yes']:
            return jsonify({
                'response': "Please provide your age for the next health tips request:",
                'context': {
                    'option_selected': 'health_tips',
                    'awaiting_option': False,
                    'awaiting_health_tips_continue': False,
                    'awaiting_age': True
                }
            })
        else:
            return jsonify({
                'response': "Please choose an option:\n1. Medication Information\n2. Follow-up Support\n3. Personalized Health Tips",
                'context': {'awaiting_option': True, 'option_selected': None}
            })
    print("Fallback: input not understood")
    return jsonify({
        'response': "I didn't understand that. Please choose an option:\n1. Medication Information\n2. Follow-up Support\n3. Personalized Health Tips",
        'context': {'awaiting_option': True, 'option_selected': None}
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)