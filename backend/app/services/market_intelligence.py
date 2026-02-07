import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Optional
from newsapi import NewsApiClient
from app.models.schemas import MarketData, MarketIndicators, MarketWithNewsResponse
from app.config import Settings


class MarketIntelligenceService:
    def __init__(self, symbol: str = "EURUSD=X"):
        self.symbol = symbol
        self._cached_data: Optional[pd.DataFrame] = None
        self._cache_time: Optional[datetime] = None
        self._cache_duration = timedelta(minutes=1)

    def fetch_market_data(self, period: str = "5d", interval: str = "5m") -> pd.DataFrame:
        """Fetch historical market data using yfinance."""
        now = datetime.now()
        if (self._cached_data is not None and
            self._cache_time is not None and
            now - self._cache_time < self._cache_duration):
            return self._cached_data

        try:
            ticker = yf.Ticker(self.symbol)
            df = ticker.history(period=period, interval=interval)
            if df.empty:
                return self._get_fallback_data()
            self._cached_data = df
            self._cache_time = now
            return df
        except Exception:
            return self._get_fallback_data()

    def _get_fallback_data(self) -> pd.DataFrame:
        """Return fallback data when yfinance fails."""
        dates = pd.date_range(end=datetime.now(), periods=100, freq="5min")
        base_price = 1.0850
        prices = [base_price + (i % 20 - 10) * 0.0001 for i in range(100)]
        return pd.DataFrame({
            "Open": prices,
            "High": [p + 0.0005 for p in prices],
            "Low": [p - 0.0005 for p in prices],
            "Close": prices,
            "Volume": [1000000 + i * 10000 for i in range(100)]
        }, index=dates)

    def _calculate_rsi(self, prices: pd.Series, period: int = 14) -> float:
        """Calculate RSI (Relative Strength Index)."""
        if len(prices) < period + 1:
            return 50.0

        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()

        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))

        current_rsi = rsi.iloc[-1]
        if pd.isna(current_rsi):
            return 50.0
        return float(current_rsi)

    def _calculate_atr(self, high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14) -> float:
        """Calculate ATR (Average True Range)."""
        if len(close) < period + 1:
            return 0.001

        prev_close = close.shift(1)
        tr1 = high - low
        tr2 = abs(high - prev_close)
        tr3 = abs(low - prev_close)

        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        atr = tr.rolling(window=period).mean()

        current_atr = atr.iloc[-1]
        if pd.isna(current_atr):
            return 0.001
        return float(current_atr)

    def calculate_indicators(self, df: pd.DataFrame) -> MarketIndicators:
        """Calculate RSI, ATR, and Volume Ratio."""
        if len(df) < 20:
            return MarketIndicators(
                rsi=50.0,
                atr=0.001,
                volume_ratio=1.0,
                price_change_pct=0.0
            )

        # RSI (14 periods)
        current_rsi = self._calculate_rsi(df["Close"], period=14)

        # ATR (14 periods)
        current_atr = self._calculate_atr(df["High"], df["Low"], df["Close"], period=14)

        # Volume Ratio (current vs 20-period average)
        current_volume = float(df["Volume"].iloc[-1])
        avg_volume = float(df["Volume"].tail(20).mean())
        volume_ratio = current_volume / avg_volume if avg_volume > 0 else 1.0

        # Price change percentage
        current_price = float(df["Close"].iloc[-1])
        prev_price = float(df["Close"].iloc[-2]) if len(df) > 1 else current_price
        price_change_pct = ((current_price - prev_price) / prev_price) * 100 if prev_price > 0 else 0.0

        return MarketIndicators(
            rsi=round(current_rsi, 2),
            atr=round(current_atr, 5),
            volume_ratio=round(volume_ratio, 2),
            price_change_pct=round(price_change_pct, 2)
        )

    def detect_spike(self, df: pd.DataFrame, threshold_pct: float = 1.5) -> tuple[bool, Optional[str]]:
        """Detect if there's a significant price spike (>threshold% in recent candle)."""
        if len(df) < 2:
            return False, None

        current_price = float(df["Close"].iloc[-1])
        prev_price = float(df["Close"].iloc[-2])
        change_pct = abs((current_price - prev_price) / prev_price) * 100

        if change_pct >= threshold_pct:
            direction = "up" if current_price > prev_price else "down"
            return True, direction

        return False, None

    def get_market_data(self, simulate_drop: bool = False) -> MarketData:
        """Get current market data with indicators."""
        df = self.fetch_market_data()

        if simulate_drop:
            df = self._simulate_drop(df)

        indicators = self.calculate_indicators(df)
        is_spike, spike_direction = self.detect_spike(df)

        current_price = float(df["Close"].iloc[-1])
        previous_price = float(df["Close"].iloc[-2]) if len(df) > 1 else current_price
        change_pct = ((current_price - previous_price) / previous_price) * 100 if previous_price > 0 else 0.0

        return MarketData(
            symbol=self.symbol.replace("=X", ""),
            current_price=round(current_price, 5),
            previous_price=round(previous_price, 5),
            change_pct=round(change_pct, 2),
            indicators=indicators,
            is_spike=is_spike or simulate_drop,
            spike_direction=spike_direction or ("down" if simulate_drop else None),
            timestamp=datetime.now()
        )

    def get_market_with_news(self, simulate_drop: bool = False, news_limit: int = 3) -> MarketWithNewsResponse:
        """Return a MarketWithNewsResponse combining current market data and recent news headlines.

        - `simulate_drop`: whether to apply the 3% demo drop to the most recent candle
        - `news_limit`: maximum number of news items to return
        """
        # Fetch market model (already includes indicators)
        market_model = self.get_market_data(simulate_drop=simulate_drop)

        # Fetch news: prefer NewsAPI (if key present), otherwise fall back to yfinance
        news_items = []

        # Try NewsAPI first when configured
        try:
            settings = Settings()
            if settings.NEWSAPI_KEY:
                try:
                    client = NewsApiClient(api_key=settings.NEWSAPI_KEY)
                    # Use a simple query based on symbol (strip =X and replace slashes)
                    q = self.symbol.replace("=X", "").replace("/", " ")
                    resp = client.get_everything(q=q, language="en", page_size=news_limit, sort_by="publishedAt")
                    articles = resp.get("articles", []) if isinstance(resp, dict) else []

                    for art in articles:
                        news_items.append({
                            "title": art.get("title", ""),
                            "link": art.get("url", ""),
                            "publisher": (art.get("source") or {}).get("name", "") if isinstance(art.get("source"), dict) else art.get("source", ""),
                            "time": art.get("publishedAt"),
                            "summary": art.get("description") or art.get("content") or "",
                        })
                except Exception:
                    # If NewsAPI fails, fall back to yfinance below
                    news_items = []
        except Exception:
            pass

        # Fall back to yfinance news when NewsAPI not available or returned nothing
        if not news_items:
            try:
                ticker = yf.Ticker(self.symbol)
                raw_news = getattr(ticker, "news", None)
                if raw_news:
                    for item in raw_news[:news_limit]:
                        # yfinance news items vary by provider; be defensive
                        provider_time = item.get("providerPublishTime") or item.get("time") or None
                        published_at = None
                        try:
                            if provider_time:
                                # provider_time is usually epoch seconds
                                published_at = datetime.fromtimestamp(int(provider_time)).isoformat()
                        except Exception:
                            published_at = None

                        news_items.append({
                            "title": item.get("title") or item.get("headline") or "",
                            "link": item.get("link") or item.get("url") or "",
                            "publisher": item.get("publisher") or item.get("source") or "",
                            "time": published_at,
                            "summary": item.get("summary") or item.get("snippet") or "",
                        })
            except Exception:
                # On any failure, return empty list for news
                news_items = []

        # Convert market model to primitive dict (pydantic v2 model_dump fallback to dict)
        try:
            market_dict = market_model.model_dump()
        except Exception:
            try:
                market_dict = market_model.dict()
            except Exception:
                market_dict = {
                    "symbol": market_model.symbol,
                    "current_price": market_model.current_price,
                    "change_pct": market_model.change_pct,
                }

        return MarketWithNewsResponse(market=market_dict, news=news_items)
    
    def _simulate_drop(self, df: pd.DataFrame) -> pd.DataFrame:
        """Simulate a 3% market drop for demo purposes."""
        df = df.copy()
        if len(df) < 2:
            return df

        # Simulate 3% drop
        drop_factor = 0.97
        df.iloc[-1, df.columns.get_loc("Close")] *= drop_factor
        df.iloc[-1, df.columns.get_loc("Low")] *= drop_factor

        # Simulate volume spike
        df.iloc[-1, df.columns.get_loc("Volume")] *= 2.5

        return df

