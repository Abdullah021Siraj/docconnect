import os
from google.cloud import vision
from google.oauth2 import service_account

def test_vision_api():
    print("GOOGLE_APPLICATION_CREDENTIALS:", os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
    # Explicitly load credentials
    credentials_path = "/home/muizz/Downloads/extras/prescriptionocr-456909-a46fd284b046.json"
    if not os.path.exists(credentials_path):
        print(f"Credentials file not found at {credentials_path}")
        return
    credentials = service_account.Credentials.from_service_account_file(credentials_path)
    client = vision.ImageAnnotatorClient(credentials=credentials)
    print("Successfully created Vision API client!")

if __name__ == "__main__":
    test_vision_api()