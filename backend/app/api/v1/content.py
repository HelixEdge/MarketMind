from fastapi import APIRouter
from typing import Optional

from app.models.schemas import (
    ContentRequest, ContentResponse,
    Persona, Platform
)
from app.services.content_generator import content_generator

router = APIRouter()


@router.post("", response_model=ContentResponse)
async def generate_content(request: ContentRequest):
    """
    Generate social media content with a specific persona voice.

    Personas:
    - calm_analyst: Measured, thoughtful, reassuring
    - data_nerd: Analytical, precise, data-driven
    - trading_coach: Supportive, experienced, mentoring

    Platforms:
    - linkedin: Up to 1300 characters, professional tone
    - twitter: Up to 280 characters, punchy and engaging
    """
    response = content_generator.generate_content(
        market_context=request.market_context,
        persona=request.persona,
        platform=request.platform,
        behavior_context=request.behavior_context
    )

    return response


@router.post("/all")
async def generate_all_personas(
    market_context: str,
    behavior_context: Optional[str] = None,
    platform: Platform = Platform.LINKEDIN
):
    """
    Generate content for all three personas at once.
    Useful for comparing different voice options.
    """
    results = {}

    for persona in Persona:
        content = content_generator.generate_content(
            market_context=market_context,
            persona=persona,
            platform=platform,
            behavior_context=behavior_context
        )
        results[persona.value] = content

    return results


@router.get("/personas")
async def list_personas():
    """List available personas with their descriptions."""
    return {
        "personas": [
            {
                "id": "calm_analyst",
                "name": "Calm Analyst",
                "description": "Measured, thoughtful, reassuring. Focuses on perspective and clarity."
            },
            {
                "id": "data_nerd",
                "name": "Data Nerd",
                "description": "Analytical, precise, data-driven. Makes complex info accessible."
            },
            {
                "id": "trading_coach",
                "name": "Trading Coach",
                "description": "Supportive, experienced, mentoring. Focuses on mindset and discipline."
            }
        ]
    }
