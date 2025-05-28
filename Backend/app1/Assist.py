from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from fuzzywuzzy import fuzz, process
import os

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

@app.route('/assistant', methods=['POST', 'OPTIONS'])
def assistant_handler():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
    data = request.get_json()
    user_input = data.get('input', '').strip().lower()
    context = data.get('context', {})
    print(f"Received input: '{user_input}', Context: {context}")
    if not context or not isinstance(context, dict):
        context = {'awaiting_option': True, 'option_selected': None}
        print("Initialized context:", context)
    if context.get('awaiting_option', True):
        print(f"Processing input '{user_input}' for option selection")
        if user_input in ['1', 'medication', 'medicine', '1.']:
            print("Matched option 1")
            return jsonify({
                'response': "Please enter the medicine name or composition you're looking for:",
                'context': {'option_selected': 'medication_info', 'awaiting_option': False}
            })
        elif user_input in ['2', 'follow up', '2.']:
            print("Matched option 2")
            return jsonify({
                'response': "Follow-up support is coming soon! Please select another option.",
                'context': {'awaiting_option': True, 'option_selected': None}
            })
        elif user_input in ['3', 'health tips', '3.']:
            print("Matched option 3")
            return jsonify({
                'response': "Personalized health tips are coming soon! Please select another option.",
                'context': {'awaiting_option': True, 'option_selected': None}
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
    if context.get('awaiting_medication_continue'):
        print("Processing continue response:", user_input)
        if user_input in ['yes', 'y', 'yes.', 'yes']:
            return jsonify({
                'response': "Please enter the next medicine name or composition:",
                'context': {'option_selected': 'medication_info', 'awaiting_option': False, 'awaiting_medication_continue': False}
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