from fastapi import APIRouter

from app.api.v1 import market, behavior, content, chat, insight

api_router = APIRouter()

api_router.include_router(market.router, prefix="/market", tags=["market"])
api_router.include_router(behavior.router, prefix="/behavior", tags=["behavior"])
api_router.include_router(content.router, prefix="/content", tags=["content"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(insight.router, prefix="/insight", tags=["insight"])
