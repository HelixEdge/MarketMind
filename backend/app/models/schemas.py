from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class PatternType(str, Enum):
    LOSS_STREAK = "loss_streak"
    REVENGE_TRADE = "revenge_trade"
    OVERSIZING = "oversizing"
    RAPID_REENTRY = "rapid_reentry"


class Persona(str, Enum):
    CALM_ANALYST = "calm_analyst"
    DATA_NERD = "data_nerd"
    TRADING_COACH = "trading_coach"


class Platform(str, Enum):
    LINKEDIN = "linkedin"
    TWITTER = "twitter"


class Trade(BaseModel):
    id: str
    symbol: str
    side: str  # "buy" or "sell"
    size: float
    entry_price: float
    exit_price: Optional[float] = None
    pnl: Optional[float] = None
    timestamp: datetime
    closed_at: Optional[datetime] = None


class MarketIndicators(BaseModel):
    rsi: float
    atr: float
    volume_ratio: float
    price_change_pct: float


class MarketData(BaseModel):
    symbol: str
    current_price: float
    previous_price: float
    change_pct: float
    indicators: MarketIndicators
    is_spike: bool
    spike_direction: Optional[str] = None  # "up" or "down"
    timestamp: datetime

class MarketResponse(BaseModel):
    market_data: MarketData
    explanation: str
    coaching_message: Optional[str] = None


class NewsItem(BaseModel):
    title: str
    link: Optional[str] = None
    publisher: Optional[str] = None
    time: Optional[str] = None
    summary: Optional[str] = None


class MarketWithNewsResponse(BaseModel):
    market: MarketData
    news: list[NewsItem]


class BehaviorPattern(BaseModel):
    pattern_type: PatternType
    description: str
    severity: RiskLevel
    details: dict


class BehaviorRequest(BaseModel):
    trades: list[Trade]


class BehaviorResponse(BaseModel):
    patterns: list[BehaviorPattern]
    risk_level: RiskLevel
    coaching_message: str
    summary: str


class ContentRequest(BaseModel):
    market_context: str
    behavior_context: Optional[str] = None
    persona: Persona
    platform: Platform


class ContentResponse(BaseModel):
    persona: Persona
    platform: Platform
    content: str
    hashtags: list[str]
    char_count: int


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    model: Optional[str] = None
    max_tokens: Optional[int] = 1000
    # Use a named prompt file from backend/app/prompts/{key}.md
    system_prompt_key: Optional[str] = None
    # Or pass raw system prompt text to use for this chat
    system_prompt_override: Optional[str] = None


class ChatResponse(BaseModel):
    message: ChatMessage
    usage: Optional[dict] = None
