from fastapi import APIRouter, Query
from typing import Optional

from app.models.schemas import MarketResponse, Trade, BehaviorRequest, MarketWithNewsResponse
from app.services.market_intelligence import MarketIntelligenceService
from app.services.claude_engine import AIEngine

router = APIRouter()


@router.get("", response_model=MarketResponse)
def get_market_data(
    symbol: str = Query(default="EURUSD=X", description="Trading symbol"),
    simulate_drop: bool = Query(default=False, description="Simulate a 3% market drop"),
    simulate_rise: bool = Query(default=False, description="Simulate an 8% market rise"),
    include_coaching: bool = Query(default=True, description="Include coaching message")
):
    """
    Get current market data with AI-generated explanation.

    - Fetches real-time market data via yfinance
    - Calculates technical indicators (RSI, ATR, Volume Ratio)
    - Generates Claude-powered market explanation
    - Optionally simulates a 3% drop or 8% rise for demo purposes
    """
    market_service = MarketIntelligenceService(symbol=symbol)

    claude_engine = AIEngine()
    # Update symbol if different
    if symbol != market_service.symbol:
        market_service.symbol = symbol

    # Get market data
    market_data = market_service.get_market_data(simulate_drop=simulate_drop, simulate_rise=simulate_rise)
    market_data_with_news = market_service.get_market_with_news(simulate_drop=simulate_drop, simulate_rise=simulate_rise, news_limit=3)

    # Generate explanation
    explanation = claude_engine.explain_market_move(market_data_with_news)

    # Generate coaching message if requested
    coaching_message = None
    if include_coaching:
        coaching_message = claude_engine.generate_coaching_message(market_data_with_news)

    return MarketResponse(
        market_data=market_data,
        explanation=explanation,
        coaching_message=coaching_message
    )


@router.get("/indicators")
def get_indicators(symbol: str = Query(default="EURUSD=X")):
    """Get raw technical indicators without explanation."""
    market_service = MarketIntelligenceService(symbol=symbol)
    if symbol != market_service.symbol:
        market_service.symbol = symbol

    market_data = market_service.get_market_data()

    return {
        "symbol": market_data.symbol,
        "price": market_data.current_price,
        "change_pct": market_data.change_pct,
        "indicators": {
            "rsi": market_data.indicators.rsi,
            "atr": market_data.indicators.atr,
            "volume_ratio": market_data.indicators.volume_ratio
        },
        "is_spike": market_data.is_spike,
        "timestamp": market_data.timestamp.isoformat()
    }


@router.get("/chart")
def get_chart_data(
    symbol: str = Query(default="EURUSD=X"),
    simulate_drop: bool = Query(default=False),
    simulate_rise: bool = Query(default=False),
    points: int = Query(default=50, ge=10, le=100)
):
    """Get historical price data for charting."""
    market_service = MarketIntelligenceService(symbol=symbol)
    if symbol != market_service.symbol:
        market_service.symbol = symbol
        market_service._cached_data = None

    df = market_service.fetch_market_data()

    if simulate_drop:
        df = market_service._simulate_drop(df)
    elif simulate_rise:
        df = market_service._simulate_rise(df)

    # Get last N points
    df_subset = df.tail(points)

    chart_data = []
    for idx, row in df_subset.iterrows():
        chart_data.append({
            "time": idx.strftime("%H:%M") if hasattr(idx, 'strftime') else str(idx),
            "price": round(float(row["Close"]), 5),
            "volume": int(row["Volume"]) if row["Volume"] > 0 else 0
        })

    return {
        "symbol": symbol.replace("=X", ""),
        "data": chart_data
    }


@router.get("/with-news", response_model=MarketWithNewsResponse)
def get_market_with_news(
    symbol: str = Query(default="EURUSD=X", description="Trading symbol"),
    simulate_drop: bool = Query(default=False, description="Simulate a 3% market drop"),
    simulate_rise: bool = Query(default=False, description="Simulate an 8% market rise"),
    news_limit: int = Query(default=3, ge=1, le=10)
):
    """Get current market data along with recent news headlines."""
    market_service = MarketIntelligenceService(symbol=symbol)

    result = market_service.get_market_with_news(simulate_drop=simulate_drop, simulate_rise=simulate_rise, news_limit=news_limit)

    return {
        "market": result.market,
        "news": result.news
    }
