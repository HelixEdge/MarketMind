from fastapi import APIRouter

from app.models.schemas import InsightRequest, InsightResponse
from app.services.claude_engine import AIEngine

router = APIRouter()


@router.post("", response_model=InsightResponse)
def generate_insight(request: InsightRequest):
    """
    Generate a coaching insight that fuses market context (X) with trader behavior (Y).

    Returns: "Market did X, and based on your history, you tend to Y" style coaching.
    """
    claude_engine = AIEngine()
    coaching_insight = claude_engine.generate_coaching_message(
        market_context=request.market_context,
        behavior_context=request.behavior_context,
    )

    return InsightResponse(
        coaching_insight=coaching_insight,
        market_context=request.market_context,
        behavior_context=request.behavior_context,
    )
