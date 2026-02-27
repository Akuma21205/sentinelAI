import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
SHODAN_API_KEY: str = os.getenv("SHODAN_API_KEY", "")
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
