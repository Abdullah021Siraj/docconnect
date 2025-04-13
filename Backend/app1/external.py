# utils1.py
import os
import logging
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get API key from environment variables
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "ssk-proj-vq6UcX-pDmralvzszACK2suNLlW5EKh5ta5Wl4saAqesZCWlnXmI62iTCyFYJM8ty7CpVmEmeqT3BlbkFJZ-A3H4SaBWezZn8IGzEvHw6WRVa7pCEUjZDrlNySF3B-kXgKashAurTD-DIw-GBCpCNFIo-G8A")

# Use appropriate OpenAI client based on API key format
if OPENAI_API_KEY and OPENAI_API_KEY.startswith("sk-proj-"):
    # This is using the newer client format
    from openai import OpenAI
    client = OpenAI(api_key=OPENAI_API_KEY)
    
    def gpt_cleanup(raw_text, prompt=None):
        """
        Use OpenAI's GPT to clean up and structure OCR text from prescriptions
        """
        if not raw_text.strip():
            return "No text provided for GPT processing."
        
        # Default prompt if none provided
        if not prompt:
            prompt = (
                "You are a medical OCR specialist. Extract and format prescription information from this text, including:\n"
                "- Patient name\n"
                "- Doctor/prescriber\n"
                "- Medications with dosages\n"
                "- Instructions/SIG\n"
                "- Date\n"
                "- Refills\n"
                "- Diagnosis (if present)\n\n"
                "Format as a clean, structured prescription. Return only the extracted information in a clear, readable format."
            )
        
        try:
            # Add retry logic
            max_retries = 3
            retry_delay = 2  # seconds
            
            for attempt in range(max_retries):
                try:
                    # Call the OpenAI API with newer client format
                    response = client.chat.completions.create(
                        model="gpt-3.5-turbo",
                        messages=[
                            {"role": "system", "content": "You're a medical OCR specialist skilled in cleaning up scanned prescription text."},
                            {"role": "user", "content": f"{prompt}\n\nScanned text:\n{raw_text}"}
                        ],
                        temperature=0.3,  # Lower temperature for more consistent outputs
                        max_tokens=500,
                    )
                    
                    # Extract content from the response
                    cleaned_text = response.choices[0].message.content.strip()
                    return cleaned_text
                    
                except Exception as e:
                    logger.warning(f"GPT API attempt {attempt+1} failed: {str(e)}")
                    if attempt < max_retries - 1:
                        time.sleep(retry_delay)
                        retry_delay *= 2  # Exponential backoff
                    else:
                        raise
            
        except Exception as e:
            logger.error(f"GPT cleanup failed: {str(e)}")
            return f"GPT processing error: {str(e)}"
            
else:
    # This is using the legacy format
    import openai
    openai.api_key = OPENAI_API_KEY
    
    def gpt_cleanup(raw_text, prompt=None):
        """
        Use OpenAI's GPT to clean up and structure OCR text from prescriptions
        """
        if not raw_text.strip():
            return "No text provided for GPT processing."
        
        # Default prompt if none provided
        if not prompt:
            prompt = (
                "You are a medical OCR specialist. Extract and format prescription information from this text, including:\n"
                "- Patient name\n"
                "- Doctor/prescriber\n"
                "- Medications with dosages\n"
                "- Instructions/SIG\n"
                "- Date\n"
                "- Refills\n"
                "- Diagnosis (if present)\n\n"
                "Format as a clean, structured prescription. Return only the extracted information in a clear, readable format."
            )
        
        try:
            # Add retry logic
            max_retries = 3
            retry_delay = 2  # seconds
            
            for attempt in range(max_retries):
                try:
                    # Call the OpenAI API with legacy format
                    response = openai.ChatCompletion.create(
                        model="gpt-3.5-turbo",
                        messages=[
                            {"role": "system", "content": "You're a medical OCR specialist skilled in cleaning up scanned prescription text."},
                            {"role": "user", "content": f"{prompt}\n\nScanned text:\n{raw_text}"}
                        ],
                        temperature=0.3,
                        max_tokens=500,
                    )
                    
                    cleaned_text = response.choices[0].message['content'].strip()
                    return cleaned_text
                    
                except Exception as e:
                    logger.warning(f"GPT API attempt {attempt+1} failed: {str(e)}")
                    if attempt < max_retries - 1:
                        time.sleep(retry_delay)
                        retry_delay *= 2  # Exponential backoff
                    else:
                        raise
            
        except Exception as e:
            logger.error(f"GPT cleanup failed: {str(e)}")
            return f"GPT processing error: {str(e)}"