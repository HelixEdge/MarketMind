import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    CORS_ORIGINS: list = ["http://localhost:3000", "http://127.0.0.1:3000"]
    DEFAULT_SYMBOL: str = "EURUSD=X"

settings = Settings()
