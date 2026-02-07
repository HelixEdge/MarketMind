from fastapi import APIRouter

from app.api.v1 import market, behavior, content

api_router = APIRouter()

api_router.include_router(market.router, prefix="/market", tags=["market"])
api_router.include_router(behavior.router, prefix="/behavior", tags=["behavior"])
api_router.include_router(content.router, prefix="/content", tags=["content"])
