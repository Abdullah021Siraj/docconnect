# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import pandas as pd
# from fuzzywuzzy import fuzz, process
# import os
# import requests

# app = Flask(__name__) # Corrected: __name__
# CORS(app)

# # Define the main menu text as a constant
# MAIN_MENU_TEXT = "Please choose an option:\n1. Medication Information\n2. Follow-up Support\n3. Personalized Health Tips"

# # Load medication dataset
# def load_medication_data():
#     try:
       
#         script_dir = os.path.dirname(os.path.abspath(__file__))
#         path_to_csv = "Backend/app1/Data/Medicine_Details.csv"
#         df = pd.read_csv(path_to_csv)
#         df.columns = df.columns.str.strip()
#         df = df.applymap(lambda x: x.strip() if isinstance(x, str) else x)
#         df = df.fillna('Not specified')
#         print(f"Loaded {len(df)} medication records")
#         return df
#     except Exception as e:
#         print(f"Error loading medication data: {str(e)}")
#         print(f"Current working directory: {os.getcwd()}")
#         print(f"Attempted path: {path_to_csv}")
#         return pd.DataFrame(columns=['Medicine Name', 'Composition', 'Uses', 'Side_effects'])

# medication_data = load_medication_data()

# def search_medications(query, threshold=75):
#     results = []
#     query = str(query).lower().strip()
#     if not query or medication_data.empty:
#         return results
#     for _, row in medication_data.iterrows():
#         name_score = fuzz.token_set_ratio(query, str(row['Medicine Name']).lower())
#         comp_score = fuzz.token_set_ratio(query, str(row['Composition']).lower())
#         best_score = max(name_score, comp_score)
#         if best_score >= threshold:
#             results.append({
#                 'Medicine Name': row['Medicine Name'],
#                 'Composition': row['Composition'],
#                 'Uses': row['Uses'],
#                 'Side_effects': row['Side_effects'],
#                 'Match Score': best_score,
#                 'Matched On': 'Name' if best_score == name_score else 'Composition'
#             })
#     results.sort(key=lambda x: x['Match Score'], reverse=True)
#     seen = set()
#     unique_results = []
#     for r in results:
#         key = (r['Medicine Name'], r['Composition'])
#         if key not in seen:
#             seen.add(key)
#             unique_results.append(r)
#     return unique_results[:10]

# # Mixtral AI API configuration
# MIXTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
# MIXTRAL_API_KEY = "uMQCTkExgyxd3E65YbaUovX4dI4VhDpU" # IMPORTANT: Secure your API key
# BASE_PROMPT_FOLLOW_UP = (
#     "You're a certified medical assistant. Based on the user's query, give clear, medically accurate, "
#     "and easy-to-understand advice. Never diagnose or prescribe medication. Recommend seeing a doctor for serious concerns."
# )
# BASE_PROMPT_HEALTH_TIPS = (
#     "You're a certified health advisor. Provide clear, practical, and safe personalized health tips "
#     "based on the user's age, gender, and health goals. Avoid medical diagnoses or prescriptions. "
#     "Suggest consulting a doctor for serious concerns."
# )

# def query_mixtral(user_query, prompt_type="follow_up"):
#     try:
#         headers = {
#             "Authorization": f"Bearer {MIXTRAL_API_KEY}",
#             "Content-Type": "application/json"
#         }
#         base_prompt = BASE_PROMPT_FOLLOW_UP if prompt_type == "follow_up" else BASE_PROMPT_HEALTH_TIPS
#         payload = {
#             "model": "mistral-small",
#             "messages": [
#                 {"role": "system", "content": base_prompt},
#                 {"role": "user", "content": user_query}
#             ],
#             "temperature": 0.3,
#             "max_tokens": 400,
#         }
#         response = requests.post(MIXTRAL_API_URL, headers=headers, json=payload)
#         response.raise_for_status()
#         data = response.json()
#         return data["choices"][0]["message"]["content"]
#     except Exception as e:
#         print(f"Error in querying Mixtral: {str(e)}")
#         return "Sorry, there was an issue connecting to the medical assistant service. Please try again later."

# @app.route('/assistant', methods=['POST', 'OPTIONS'])
# def assistant_handler():
#     if request.method == 'OPTIONS':
#         return jsonify({}), 200

#     data = request.get_json()
#     user_input = data.get('input', '').strip()
#     context = data.get('context', {})

#     print(f"Received input: '{user_input}', Context: {context}")

#     # Initialize context if empty or reset needed
#     if not context or context.get('awaiting_option'):
#         # If context is truly empty, initialize it
#         if not context :
#             context = {'awaiting_option': True, 'current_flow': None}

#         # Handle initial option selection if awaiting_option is True
#         if context.get('awaiting_option'):
#             if user_input.lower() in ['1', 'medication', 'medicine', '1.']:
#                 context = {
#                     'awaiting_option': False,
#                     'current_flow': 'medication',
#                     'awaiting_medication_input': True
#                 }
#                 return jsonify({
#                     'response': "Please enter the medicine name or composition you're looking for:",
#                     'context': context
#                 })
#             elif user_input.lower() in ['2', 'follow up', 'follow-up', '2.']:
#                 context = {
#                     'awaiting_option': False,
#                     'current_flow': 'follow_up',
#                     'awaiting_follow_up_input': True
#                 }
#                 return jsonify({
#                     'response': "Please ask your follow-up question:",
#                     'context': context
#                 })
#             elif user_input.lower() in ['3', 'health tips', '3.']:
#                 context = {
#                     'awaiting_option': False,
#                     'current_flow': 'health_tips',
#                     'health_info': {} # Start with empty health_info
#                 }
#                 return jsonify({
#                     'response': "Please provide your age:",
#                     'context': context
#                 })
#             else:
#                 # If it's the very first interaction or an invalid option after menu display
#                 # Send menu, keep awaiting_option True
#                 return jsonify({
#                     'response': MAIN_MENU_TEXT if not user_input else f"Invalid option. {MAIN_MENU_TEXT}",
#                     'context': {'awaiting_option': True, 'current_flow': None}
#                 })

#     # Medication flow
#     if context.get('current_flow') == 'medication':
#         if context.get('awaiting_medication_continue'): # Asked "yes/no" in the previous turn
#             if user_input.lower() in ['yes', 'y']:
#                 context.pop('awaiting_medication_continue', None)
#                 context['awaiting_medication_input'] = True
#                 return jsonify({
#                     'response': "OK, go ahead and enter the name of the other medicine.",
#                     'context': context
#                 })
#             elif user_input.lower() in ['no', 'n']:
#                 context = {'awaiting_option': True, 'current_flow': None}
#                 return jsonify({
#                     'response': f"Thank you for using the Virtual Health Assistant!\n\n{MAIN_MENU_TEXT}",
#                     'context': context
#                 })
#             else: # Ambiguous response to yes/no
#                 return jsonify({
#                     'response': "Please answer with 'yes' or 'no'.\nWould you like to search for another medication?",
#                     'context': context # Keep awaiting_medication_continue
#                 })

#         if context.get('awaiting_medication_input'):
#             results = search_medications(user_input)
#             if not results:
#                 suggestions = process.extract(
#                     user_input,
#                     medication_data['Medicine Name'].tolist() + medication_data['Composition'].tolist(),
#                     limit=3,
#                     scorer=fuzz.token_set_ratio
#                 )
#                 suggestion_text = "\nDid you mean:\n" + "\n".join([f"- {s[0]}" for s in suggestions]) if suggestions else ""
#                 response_text = f"No medications found matching '{user_input}'.{suggestion_text}"
#             else:
#                 formatted_results = []
#                 for med in results[:3]: # Show top 3
#                     formatted_results.append(
#                         f"💊 {med['Medicine Name']}\n"
#                         f"🔬 Composition: {med['Composition']}\n"
#                         f"💡 Uses: {med['Uses']}\n"
#                         f"⚠️ Side Effects: {med['Side_effects']}\n"
#                         f"---"
#                     )
#                 response_text = "Here's what I found:\n\n" + "\n".join(formatted_results)
            
#             context.pop('awaiting_medication_input', None)
#             context['awaiting_medication_continue'] = True
#             return jsonify({
#                 'response': f"{response_text}\n\nWould you like to search for another medication? (yes/no)",
#                 'context': context
#             })

#     # Follow-up flow
#     if context.get('current_flow') == 'follow_up':
#         if context.get('awaiting_follow_up_continue'):
#             if user_input.lower() in ['yes', 'y']:
#                 context.pop('awaiting_follow_up_continue', None)
#                 context['awaiting_follow_up_input'] = True
#                 return jsonify({
#                     'response': "OK, please ask your next question.",
#                     'context': context
#                 })
#             elif user_input.lower() in ['no', 'n']:
#                 context = {'awaiting_option': True, 'current_flow': None}
#                 return jsonify({
#                     'response': f"Thank you for using the Virtual Health Assistant!\n\n{MAIN_MENU_TEXT}",
#                     'context': context
#                 })
#             else: # Ambiguous response
#                 return jsonify({
#                     'response': "Please answer with 'yes' or 'no'.\nWould you like to ask another question?",
#                     'context': context # Keep awaiting_follow_up_continue
#                 })

#         if context.get('awaiting_follow_up_input'):
#             response_text = query_mixtral(user_input, prompt_type="follow_up")
#             context.pop('awaiting_follow_up_input', None)
#             context['awaiting_follow_up_continue'] = True
#             return jsonify({
#                 'response': f"{response_text}\n\nWould you like to ask another question? (yes/no)",
#                 'context': context
#             })

#     # Health tips flow
#     if context.get('current_flow') == 'health_tips':
#         health_info = context.get('health_info', {})

#         if context.get('awaiting_health_tips_continue'):
#             if user_input.lower() in ['yes', 'y']:
#                 context.pop('awaiting_health_tips_continue', None)
#                 context['health_info'] = {} # Reset for new tips
#                 return jsonify({
#                     'response': "Great! Let's start over for new tips. Please provide your age:",
#                     'context': context
#                 })
#             elif user_input.lower() in ['no', 'n']:
#                 context = {'awaiting_option': True, 'current_flow': None}
#                 return jsonify({
#                     'response': f"Thank you for using the Virtual Health Assistant!\n\n{MAIN_MENU_TEXT}",
#                     'context': context
#                 })
#             else: # Ambiguous response
#                 return jsonify({
#                     'response': "Please answer with 'yes' or 'no'.\nWould you like more health tips?",
#                     'context': context # Keep awaiting_health_tips_continue
#                 })
        
#         if 'age' not in health_info:
#             if not user_input.isdigit() or not (0 < int(user_input) <= 120): # Basic age validation
#                 return jsonify({
#                     'response': "Please provide a valid age (e.g., '30'):",
#                     'context': context
#                 })
#             health_info['age'] = user_input
#             context['health_info'] = health_info
#             return jsonify({
#                 'response': "Please provide your gender (e.g., 'male', 'female', 'other'):",
#                 'context': context
#             })
        
#         if 'gender' not in health_info:
#             # Basic validation for gender - can be expanded
#             if not user_input or len(user_input) > 20:
#                 return jsonify({
#                     'response': "Please provide your gender (e.g., 'male', 'female', 'other'):",
#                     'context': context
#                 })
#             health_info['gender'] = user_input
#             context['health_info'] = health_info
#             return jsonify({
#                 'response': "Please share your health goals (e.g., 'improve sleep', 'reduce stress'):",
#                 'context': context
#             })
        
#         if 'goals' not in health_info: # This means we are expecting goals input
#             if not user_input: # Basic validation for goals
#                 return jsonify({
#                     'response': "Please provide your health goals (e.g., 'improve sleep', 'reduce stress'):",
#                     'context': context
#                 })
#             health_info['goals'] = user_input
#             context['health_info'] = health_info # health_info now complete
            
#             user_query = f"Age: {health_info['age']}, Gender: {health_info['gender']}, Health goals: {health_info['goals']}"
#             response_text = query_mixtral(user_query, prompt_type="health_tips")
            
#             context['awaiting_health_tips_continue'] = True # Set state to ask for continuation
#             return jsonify({
#                 'response': f"{response_text}\n\nWould you like more health tips? (yes/no)",
#                 'context': context
#             })


#     print(f"Fallback triggered for input: '{user_input}' with context: {context}")
#     context = {'awaiting_option': True, 'current_flow': None} # Reset to be safe
#     return jsonify({
#         'response': f"I'm not sure how to handle that. Let's start over.\n\n{MAIN_MENU_TEXT}",
#         'context': context
#     })

# if __name__ == '__main__': 
#     app.run(host='0.0.0.0', port=5000, debug=True)