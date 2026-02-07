import json
from fastapi import APIRouter, Depends, BackgroundTasks
from typing import Optional

from app.models.schemas import (
    ContentRequest, ContentResponse,
    Persona, Platform
)
from app.services.content_generator import content_generator
from app.auth import get_optional_user
from app.database import get_db

router = APIRouter()


async def _save_content(user_id: int, response: ContentResponse, market_context: str):
    try:
        db = get_db()
        await db.execute(
            "INSERT INTO content_history (user_id, persona, platform, content, hashtags, market_context) VALUES (?, ?, ?, ?, ?, ?)",
            (user_id, response.persona.value, response.platform.value, response.content, json.dumps(response.hashtags), market_context),
        )
        await db.commit()
    except Exception:
        pass


@router.post("", response_model=ContentResponse)
async def generate_content(request: ContentRequest, background_tasks: BackgroundTasks, user=Depends(get_optional_user)):
    """
    Generate social media content with a specific persona voice.

    Personas:
    - calm_analyst: Measured, thoughtful, reassuring
    - data_nerd: Analytical, precise, data-driven
    - trading_coach: Supportive, experienced, mentoring

    Platforms:
    - linkedin: Up to 1300 characters, professional tone
    - x: Up to 280 characters, punchy threads

    Content Types (optional):
    - event_explainer: What happened and why it matters
    - educational_thread: Teaching moment from market event
    - weekly_brief: Broader market themes
    - chart_post: You-trade-like-this style
    """
    response = content_generator.generate_content(
        market_context=request.market_context,
        persona=request.persona,
        platform=request.platform,
        behavior_context=request.behavior_context,
        coaching_insight=request.coaching_insight,
    )

    if user and response:
        background_tasks.add_task(_save_content, user["id"], response, request.market_context)

    return response


@router.post("/all")
def generate_all_personas(
    market_context: str,
    behavior_context: Optional[str] = None,
    coaching_insight: Optional[str] = None,
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
            behavior_context=behavior_context,
            coaching_insight=coaching_insight,
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
