# Numpy and pandas for mathematical operations
import numpy as np
import pandas as pd

# To read csv dataset files
import csv

# Regular expression, for pattern matching
import re

# The preprocessing module provides functions for data preprocessing tasks such as scaling and handling missing data.
from sklearn import preprocessing

# For Visualization
import seaborn as sns
import matplotlib.pyplot as plt

# train-test split
from sklearn.model_selection import train_test_split

# For building decision tree models, and _tree to access low-level decision of tree structure
from sklearn.tree import DecisionTreeClassifier, _tree

# For evaluating model performance using cross_validation
from sklearn.model_selection import cross_val_score

# Import Support Vector Classification from sklearn library for model deployment
from sklearn.svm import SVC

from sklearn.model_selection import GridSearchCV
# Remove unecessary warnings
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
import re

"""## Exploratory Data Analysis (EDA)

"""

import os

# Get the directory of the current script
base_dir = os.path.dirname(os.path.abspath(__file__))

# Load Datasets for training and testing
training = pd.read_csv(os.path.join(base_dir, 'Data/Training.csv'))
testing = pd.read_csv(os.path.join(base_dir, 'Data/Testing.csv'))

# # Number of rows and columns
# shape = training.shape


# # Description about dataset
# description = training.describe()
# description

# # Information about Dataset
# info_df = training.info()
# info_df

# # To find total number of null values in dataset
# null_values_count = training.isnull().sum()
# null_values_count

# Print First eight rows of the Dataset
# training.head(8)

cols= training.columns
cols= cols[:-1]

# x stores every column data except the last one
x = training[cols]

# y stores the target variable for disease prediction
y = training['prognosis']

# # Figsize used to define size of the figure
# plt.figure(figsize=(10, 20))
# # Countplot from seaborn on the target varable and data accesed from Training dataset
# sns.countplot(y='prognosis', data=training)
# # Tile for title of the figur
# plt.title('Distribution of Target (Prognosis)')
# # Show used to display the figure on screen
# plt.show()

# Grouping Data by Prognosis and Finding Maximum Values
reduced_data = training.groupby(training['prognosis']).max()

# Display the first five rows of the reduced data
reduced_data.head()

"""## Data Pre-processing"""

# Mapping categorical strings to numerical labels using LabelEncoder
le = preprocessing.LabelEncoder()

# Fit the label encoder to the target variable 'y' and transform it
le.fit(y)
y = le.transform(y)

# Splitting the dataset into training and testing
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.33, random_state=42)

# Features for testing except the last variable
testx    = testing[cols]

# Target variable for Testing
testy    = testing['prognosis']

# Transforming categorical value into numerical labels
testy    = le.transform(testy)

"""## Model building and evaluation"""

# Decision Tree Model Implementation
clf1  = DecisionTreeClassifier()

# Fitting the Training Data
clf = clf1.fit(x_train,y_train)

# Cross-Validation for Model Evaluation
scores = cross_val_score(clf, x_test, y_test, cv=3)

# Print the Mean Score
# print("Mean Score: ",scores.mean())

# Creating Support Vector Machine Model
model=SVC()

# Train the model on Training Data
model.fit(x_train,y_train)

# Print accuracy for SVM Model on the training set
# print("Accuracy score for svm: ", model.score(x_test,y_test))

# Calculate feature importance using the trained Decision tree classifier
importances = clf.feature_importances_

# Sort indices in descending order based on feature importance
indices = np.argsort(importances)[::-1]

# Get feature names corresponding to their importance score
features = cols

# Initialize dictionaries to store symptom severity, description, and precautions

severityDictionary=dict()
description_list = dict()
precautionDictionary=dict()

# Dictionary to map symptoms to their indices
symptoms_dict = {}

# Populate symptoms dictionary with indices
for index, symptom in enumerate(x):
       symptoms_dict[symptom] = index

# Function to calculate the overall severity of the symptom
def calc_condition(exp,days):
    sum=0
    for item in exp:
         sum=sum+severityDictionary[item]
    if((sum*days)/(len(exp)+1)>13):
        print("You should take the consultation from doctor. ")
    else:
        print("It might not be that bad but you should take precautions.")

# param_grid_dt = {
#     'criterion': ['gini', 'entropy'],
#     'max_depth': [None, 10, 20, 30, 40, 50],
#     'min_samples_split': [2, 5, 10],
#     'min_samples_leaf': [1, 2, 4]
# }

# grid_search_dt = GridSearchCV(estimator=DecisionTreeClassifier(), param_grid=param_grid_dt, cv=5, n_jobs=-1, verbose=2)
# grid_search_dt.fit(x_train, y_train)
# best_dt = grid_search_dt.best_estimator_

# # Hyperparameter tuning for SVM
# param_grid_svm = {
#     'C': [0.1, 1, 10, 100],
#     'gamma': [1, 0.1, 0.01, 0.001],
#     'kernel': ['rbf', 'linear']
# }

# grid_search_svm = GridSearchCV(estimator=SVC(), param_grid=param_grid_svm, cv=5, n_jobs=-1, verbose=2)
# grid_search_svm.fit(x_train, y_train)
# best_svm = grid_search_svm.best_estimator_

# # Evaluate the best models
# dt_scores = cross_val_score(best_dt, x_test, y_test, cv=5)
# svm_scores = cross_val_score(best_svm, x_test, y_test, cv=5)

# print("Best Decision Tree Mean Score: ", dt_scores.mean())
# print("Best SVM Mean Score: ", svm_scores.mean())

# # Use the best models for predictions
# clf = best_dt
# model = best_svm

# # Calculate feature importance using the best Decision tree classifier
# importances = clf.feature_importances_

# # Sort indices in descending order based on feature importance
# indices = np.argsort(importances)[::-1]

# # Get feature names corresponding to their importance score
# features = cols
# Function to read and store symptom descriptions from a CSV file
def getDescription():
    global description_list
    try:
        with open(os.path.join(base_dir, 'Data/symptom_Description.csv')) as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',')
            for row in csv_reader:
                description_list[row[0].strip()] = row[1].strip()  # Ensure keys and values are stripped
    except Exception as e:
        print(f"Error loading descriptions: {e}")
        description_list = {}

# Function to read and store symptom severity information from a CSV file
def getSeverityDict():
    global severityDictionary
    try:
        with open(os.path.join(base_dir, 'Data/Symptom_severity.csv')) as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',')
            for row in csv_reader:
                _diction = {row[0]: int(row[1])}
                severityDictionary.update(_diction)
    except Exception as e:
        print(f"Error loading severity dictionary: {e}")

# Function to read and store symptom precaution information from a CSV file
def getprecautionDict():
    global precautionDictionary
    try:
        with open(os.path.join(base_dir, 'Data/symptom_precaution.csv')) as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',')
            for row in csv_reader:
                _prec = {row[0]: [row[1], row[2], row[3], row[4]]}
                precautionDictionary.update(_prec)
    except Exception as e:
        print(f"Error loading precaution dictionary: {e}")

def getInfo():
    print("-----------------------------------HealthCare ChatBot-----------------------------------")
    print("\nYour Name? \t\t\t\t",end="->")
    name=input("")
    print("Hello", name)

def check_pattern(dis_list, inp):
    pred_list = []
    inp = inp.replace(' ', '_')  # Replace spaces with underscores for matching
    patt = f"{inp}"
    regexp = re.compile(patt, re.IGNORECASE)  # Make the matching case-insensitive
    pred_list = [item for item in dis_list if regexp.search(item)]
    
    # Debugging: Log the input and matched symptoms
    print(f"Input: {inp}")
    print(f"Matched Symptoms: {pred_list}")
    
    if len(pred_list) > 0:
        return 1, pred_list
    else:
        return 0, []

# def predict_response(user_input):
#     # Example pattern matching for diseases
#     patt = '|'.join(dis_list)
#     regexp = re.compile(patt)
#     pred_list = [item for item in dis_list if regexp.search(user_input)]
#     if len(pred_list) > 0:
#         return 1, pred_list
#     else:
#         return 0, []

def sec_predict(symptoms_exp):
    df = pd.read_csv(os.path.join(base_dir, 'Data/Training.csv'))  # Use base_dir
    X = df.iloc[:, :-1]
    y = df['prognosis']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=20)
    rf_clf = DecisionTreeClassifier()
    rf_clf.fit(X_train, y_train)

    symptoms_dict = {symptom: index for index, symptom in enumerate(X)}
    input_vector = np.zeros(len(symptoms_dict))
    for item in symptoms_exp:
        input_vector[symptoms_dict[item]] = 1

    return rf_clf.predict([input_vector])

def print_disease(node):
    node = node[0]
    val = node.nonzero()
    disease = le.inverse_transform(val[0])
    return list(map(lambda x: x.strip(), list(disease)))


dis_list = [
    "itching", "skin_rash", "nodal_skin_eruptions", "continuous_sneezing", "shivering", "chills", "joint_pain", 
    "stomach_pain", "acidity", "ulcers_on_tongue", "muscle_wasting", "vomiting", "burning_micturition", 
    "spotting_urination", "fatigue", "weight_gain", "anxiety", "cold_hands_and_feets", "mood_swings", 
    "weight_loss", "restlessness", "lethargy", "patches_in_throat", "irregular_sugar_level", "cough", 
    "high_fever", "sunken_eyes", "breathlessness", "sweating", "dehydration", "indigestion", "headache", 
    "yellowish_skin", "dark_urine", "nausea", "loss_of_appetite", "pain_behind_the_eyes", "back_pain", 
    "constipation", "abdominal_pain", "diarrhoea", "mild_fever", "yellow_urine", "yellowing_of_eyes", 
    "acute_liver_failure", "fluid_overload", "swelling_of_stomach", "swelled_lymph_nodes", "malaise", 
    "blurred_and_distorted_vision", "phlegm", "throat_irritation", "redness_of_eyes", "sinus_pressure", 
    "runny_nose", "congestion", "chest_pain", "weakness_in_limbs", "fast_heart_rate", 
    "pain_during_bowel_movements", "pain_in_anal_region", "bloody_stool", "irritation_in_anus", "neck_pain", 
    "dizziness", "cramps", "bruising", "obesity", "swollen_legs", "swollen_blood_vessels", 
    "puffy_face_and_eyes", "enlarged_thyroid", "brittle_nails", "swollen_extremeties", "excessive_hunger", 
    "extra_marital_contacts", "drying_and_tingling_lips", "slurred_speech", "knee_pain", "hip_joint_pain", 
    "muscle_weakness", "stiff_neck", "swelling_joints", "movement_stiffness", "spinning_movements", 
    "loss_of_balance", "unsteadiness", "weakness_of_one_body_side", "loss_of_smell", "bladder_discomfort", 
    "foul_smell_ofurine", "continuous_feel_of_urine", "passage_of_gases", "internal_itching", 
    "toxic_look_(typhos)", "depression", "irritability", "muscle_pain", "altered_sensorium", 
    "red_spots_over_body", "belly_pain", "abnormal_menstruation", "dischromic_patches", "watering_from_eyes", 
    "increased_appetite", "polyuria", "family_history", "mucoid_sputum", "rusty_sputum", 
    "lack_of_concentration", "visual_disturbances", "receiving_blood_transfusion", 
    "receiving_unsterile_injections", "coma", "stomach_bleeding", "distention_of_abdomen", 
    "history_of_alcohol_consumption", "fluid_overload", "blood_in_sputum", "prominent_veins_on_calf", 
    "palpitations", "painful_walking", "pus_filled_pimples", "blackheads", "scurring", "skin_peeling", 
    "silver_like_dusting", "small_dents_in_nails", "inflammatory_nails", "blister", "red_sore_around_nose", 
    "yellow_crust_ooze"
]
import csv

def get_doctor_recommendations(disease):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    doctors_file = os.path.join(base_dir, 'Data/Doctor.csv')
    recommendations = []

    try:
        with open(doctors_file, mode='r') as csv_file:
            csv_reader = csv.DictReader(csv_file)
            for row in csv_reader:
                if row['Disease'].strip().lower() == disease.strip().lower():
                    recommendations.append({
                        "doctor_name": row['doctor_name'],
                        "hospital": row['hospital'],
                    })
    except Exception as e:
        print(f"Error reading doctors file: {e}")

    return recommendations

def tree_to_code(tree, feature_names):
    tree_ = tree.tree_
    feature_name = [
        feature_names[i] if i != _tree.TREE_UNDEFINED else "undefined!"
        for i in tree_.feature
    ]

    chk_dis = ",".join(feature_names).split(",")
    symptoms_present = []

    while True:
        print("\nEnter the symptom you are experiencing  \t\t", end="->")
        disease_input = input("")

        conf, cnf_dis = check_pattern(chk_dis, disease_input)
        if conf == 1:
            print("searches related to input: ")
            for num, it in enumerate(cnf_dis):
                print(num, ")", it)
            if num != 0:
                print(f"Select the one you meant (0 - {num}):  ", end="")
                conf_inp = int(input(""))
            else:
                conf_inp = 0

            disease_input = cnf_dis[conf_inp]
            break
        else:
            print("Enter valid symptom.")

    while True:
        try:
            num_days = int(input("Okay. From how many days ? : "))
            break
        except:
            print("Enter valid input.")

    def recurse(node, depth):
        indent = "  " * depth
        if tree_.feature[node] != _tree.TREE_UNDEFINED:
            name = feature_name[node]
            threshold = tree_.threshold[node]

            if name == disease_input:
                val = 1
            else:
                val = 0
            if val <= threshold:
                recurse(tree_.children_left[node], depth + 1)
            else:
                symptoms_present.append(name)
                recurse(tree_.children_right[node], depth + 1)
        else:
            present_disease = print_disease(tree_.value[node])

            red_cols = reduced_data.columns
            try:
                symptoms_given = red_cols[reduced_data.loc[present_disease].values[0].nonzero()]
            except KeyError as e:
                print(f"KeyError: {e}")
                symptoms_given = None  # or handle it appropriately

            print("")

            
            print("Are you experiencing any ")
            symptoms_exp = []
            for syms in list(symptoms_given):
                inp = ""
                print("")
                print(syms, "? : ", end='')
                while True:
                    inp = input("")
                    if inp == "yes" or inp == "no":
                        break
                    else:
                        print("provide proper answers i.e. (yes/no) : ", end="")
                if inp == "yes":
                    symptoms_exp.append(syms)

            second_prediction = sec_predict(symptoms_exp)
            calc_condition(symptoms_exp, num_days)
            if present_disease[0] == second_prediction[0]:
                print("")
                print("You may have ", present_disease[0])
                print(description_list[present_disease[0].strip()])  # Strip key when accessing

                # Get doctor recommendations for the predicted disease
                doctor_recommendations = get_doctor_recommendations(present_disease[0])
                if doctor_recommendations:
                    print("\nRecommended Doctors:")
                    for doc in doctor_recommendations:
                        print(f"Doctor Name: {doc['doctor_name']}, Hospital: {doc['hospital']}")
                else:
                    print("\nNo specific doctor recommendations found for this disease.")

            else:
                print("")
                print("You may have ", present_disease[0], "or ", second_prediction[0])
                print(description_list[present_disease[0].strip()])  # Strip key when accessing
                print(description_list[second_prediction[0].strip()])  # Strip key when accessing

                # Get doctor recommendations for the predicted diseases
                doctor_recommendations_1 = get_doctor_recommendations(present_disease[0])
                doctor_recommendations_2 = get_doctor_recommendations(second_prediction[0])

                if doctor_recommendations_1:
                    print("\nRecommended Doctors for", present_disease[0], ":")
                    for doc in doctor_recommendations_1:
                        print(f"Doctor Name: {doc['doctor_name']}, Hospital: {doc['hospital']}")
                else:
                    print("\nNo specific doctor recommendations found for", present_disease[0])

                if doctor_recommendations_2:
                    print("\nRecommended Doctors for", second_prediction[0], ":")
                    for doc in doctor_recommendations_2:
                        print(f"Doctor Name: {doc['doctor_name']}, Hospital: {doc['hospital']}")
                else:
                    print("\nNo specific doctor recommendations found for", second_prediction[0])

            precution_list = precautionDictionary[present_disease[0].strip()]  # Strip key when accessing
            print("Take following measures : ")
            for i, j in enumerate(precution_list):
                print(i + 1, ")", j)

    recurse(0, 1)

# Initialize dictionaries by calling these functions (these are safe to run on import)
getSeverityDict()
getDescription()
getprecautionDict()

# Ensure description_list keys are stripped (this is fine to run on import)
description_list = {key.strip(): value for key, value in description_list.items()}

# Move CLI interaction code into a main block
if __name__ == "__main__":
    getInfo()
    tree_to_code(clf, cols)
    print("----------------------------------------------------------------------------------------------------------------------------------")