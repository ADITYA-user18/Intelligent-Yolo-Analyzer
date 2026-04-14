import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

try:
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content("Neural connectivity test. Respond with 'READY'.")
    print(f"STATUS: {response.text.strip()}")
except Exception as e:
    print(f"ERROR: {str(e)}")
