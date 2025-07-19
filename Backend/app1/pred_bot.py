from flask import Flask, request, jsonify
from flask_cors import CORS
from model import check_pattern, sec_predict, calc_condition, getDescription, getSeverityDict, getprecautionDict, description_list, precautionDictionary, severityDictionary, cols, clf, le, get_doctor_recommendations
import numpy as np

app = Flask(__name__)
CORS(app)

# Load symptom descriptions and precautions
getSeverityDict()
getDescription()
getprecautionDict()

# Route to handle symptom matching
@app.route('/match-symptoms', methods=['POST'])
def match_symptoms():
    try:
        data = request.json
        user_input = data.get('symptom', '')
        dis_list = cols.tolist()  # Use the columns from model.py
        conf, matched_symptoms = check_pattern(dis_list, user_input)
        return jsonify({
            "confidence": conf,
            "matched_symptoms": matched_symptoms
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to handle disease prediction
@app.route('/predict-disease', methods=['POST'])
def predict():
    try:
        data = request.json
        symptoms = data.get('symptoms', [])
        days = data.get('days', 0)

        # Predict disease using sec_predict from model.py
        predicted_disease = sec_predict(symptoms)

        # Get description and precautions
        description = description_list.get(predicted_disease[0], "No description available.")
        precautions = precautionDictionary.get(predicted_disease[0], ["No precautions available."])

        # Calculate severity using calc_condition from model.py
        severity_message = calc_condition(symptoms, days)

        # Get doctor recommendations (only called here, with the predicted disease)
        doctor_recommendations = get_doctor_recommendations(predicted_disease[0])

        # Return response
        return jsonify({
            "disease": predicted_disease[0],
            "description": description,
            "precautions": precautions,
            "severity_message": severity_message,
            "doctor_recommendations": doctor_recommendations
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True, port=5000)  # Ensure the app runs on port 5000