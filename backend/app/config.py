import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    NEWSAPI_KEY: str = os.getenv("NEWSAPI_KEY", "")
    MODEL = os.getenv("MODEL", "gpt-5-mini-2025-08-07")
    MODEL_BASE_URL = os.getenv("MODEL_BASE_URL", "")
    CORS_ORIGINS: list = ["http://localhost:3000", "http://127.0.0.1:3000", "*", "https://market-mind-frontend.vercel.app"]
    DEFAULT_SYMBOL: str = "EURUSD=X"
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev-secret-change-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_HOURS: int = 24

# settings = Settings()
