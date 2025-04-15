import google.generativeai as genai
import os
import logging
import re
from typing import List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')  # Using the more reliable model

MEDICATION_KEYWORDS = [
    'mg', 'mcg', 'g', 'ml', 'tablet', 'capsule', 'injection', 
    'tab', 'cap', 'ointment', 'cream', 'gel', 'drops', 'syrup',
    'suspension', 'inhaler', 'patch'
]

def use_simple_extraction(raw_text: str) -> List[str]:
    """Improved fallback extraction"""
    if not raw_text.strip():
        return ["No text could be extracted"]
        
    lines = raw_text.split('\n')
    medications = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Check for medication patterns
        line_lower = line.lower()
        
        # Pattern: at least one number followed by measurement unit
        has_measurement = any(
            re.search(rf'\d+\s*{unit}', line_lower)
            for unit in ['mg', 'mcg', 'g', 'ml']
        )
        
        # Pattern: common medication keywords
        has_keyword = any(
            kw in line_lower for kw in MEDICATION_KEYWORDS
        )
        
        # Pattern: common medication prefixes/suffixes
        has_med_suffix = any(
            line_lower.endswith(suffix) 
            for suffix in ['ine', 'cin', 'micin', 'dine', 'zole', 'pril', 'olol']
        )
        
        if has_measurement or has_keyword or has_med_suffix:
            # Clean up the line
            line = re.sub(r'[^\w\s\-/.]+', '', line)  # Remove special chars
            line = re.sub(r'\s+', ' ', line).strip()   # Normalize spaces
            medications.append(line)
    
    return medications if medications else ["No medications identified"]

def build_medication_prompt(raw_text: str) -> str:
    """More precise prompt for Gemini"""
    return f"""
You are an expert medical prescription analyzer. Extract ONLY medication names and their strengths from the following text.

Rules:
1. Return ONLY the medications with their strengths (e.g., "Paracetamol 500mg")
2. Each medication must be on a new line
3. Remove any dosage instructions, doctor notes, or other irrelevant text
4. If text appears to be corrupted or unreadable, try to extract only plausible medication names
5. If no medications are found, return exactly: "No medications identified"

Prescription Text:
{raw_text}
""".strip()

def extract_medications_gemini(raw_text: str) -> List[str]:
    """Improved medication extraction with better error handling"""
    if not raw_text.strip() or "no readable text extracted" in raw_text.lower():
        return ["No readable text extracted"]
        
    try:
        prompt = build_medication_prompt(raw_text)
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.2,  # More deterministic output
                "max_output_tokens": 1000
            }
        )
        
        if not response.text:
            return use_simple_extraction(raw_text)
            
        # Clean and validate the response
        medications = [
            line.strip() 
            for line in response.text.split("\n") 
            if line.strip() and line.strip().lower() != "no medications identified"
        ]
        
        # Additional validation on the Gemini output
        valid_medications = []
        for med in medications:
            # Basic validation that it looks like a medication
            if (any(c.isalpha() for c in med) and 
                (any(c.isdigit() for c in med) or 
                 any(kw in med.lower() for kw in MEDICATION_KEYWORDS))):
                valid_medications.append(med)
        
        return valid_medications if valid_medications else use_simple_extraction(raw_text)
    
    except Exception as e:
        logging.error(f"Gemini API error: {e}", exc_info=True)
        return use_simple_extraction(raw_text)