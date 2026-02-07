from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import Settings
from app.api.v1.router import api_router
from app.services.claude_engine import AIEngine

settings = Settings()

app = FastAPI(
    title="Intelligent Trading Analyst",
    description="AI-powered market intelligence, behavior detection, and social content generation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Log API configuration on startup."""
    print("\n" + "="*60)
    print("🚀 Intelligent Trading Analyst API Startup")
    print("="*60)
    claude_engine = AIEngine()
    if claude_engine.client:
        print(f"✓ AI Service: READY (Model: {claude_engine.model})")
    else:
        print(f"⚠ AI Service: OFFLINE - Using fallback responses")
        print(f"  → Set OPENAI_API_KEY environment variable to enable AI")
    print("="*60 + "\n")

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "intelligent-trading-analyst"}


@app.get("/")
async def root():
    return {
        "message": "Intelligent Trading Analyst API",
        "docs": "/docs",
        "health": "/health"
    }
