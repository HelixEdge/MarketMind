from typing import Optional
from openai import OpenAI

from app.config import Settings
from app.models.schemas import MarketData, BehaviorResponse, ChatMessage, ChatRequest, ChatResponse, MarketWithNewsResponse


class AIEngine:
    def __init__(self):
        settings = Settings()
        self.client = None
        if settings.OPENAI_API_KEY:
            if settings.MODEL_BASE_URL:
                self.client = OpenAI(api_key=settings.OPENAI_API_KEY, base_url=settings.MODEL_BASE_URL)
            else:
                self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.MODEL

    def _call_llm(self, prompt: str, max_tokens: int = 200) -> str:
        """Make a call to OpenAI API."""
        if not self.client:
            return self._get_fallback_response(prompt)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                max_tokens=max_tokens,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Error calling OpenAI API: {e}")
            return self._get_fallback_response(prompt)

    def _get_fallback_response(self, prompt: str) -> str:
        """Provide fallback responses when API is unavailable."""
        if "market" in prompt.lower() and "drop" in prompt.lower():
            return "EUR/USD experienced a sharp 3% decline following unexpected economic data. RSI at oversold levels suggests the move may be overextended. Volume surge indicates significant institutional activity."
        elif "coaching" in prompt.lower():
            return "Markets moved sharply—this is when emotions run high. Take a breath before your next decision. Clarity over reactivity."
        return "Market conditions are evolving. Stay focused on your trading plan."

    def explain_market_move(self, market_data: MarketWithNewsResponse) -> str:
        """Generate a 1-2 sentence explanation of the market move."""
        prompt = f"""You are a professional market analyst. Explain this market move in 1-2 concise sentences.

Market Data:
- Symbol: {market_data.market.symbol}
- Price Change: {market_data.market.change_pct}%
- Direction: {"Dropped" if market_data.market.change_pct < 0 else "Rose"}
- RSI: {market_data.market.indicators.rsi} {"(oversold)" if market_data.market.indicators.rsi < 30 else "(overbought)" if market_data.market.indicators.rsi > 70 else ""}
- Volume Ratio: {market_data.market.indicators.volume_ratio}x average
- ATR: {market_data.market.indicators.atr}
Recent News Headlines:
{chr(10).join([f"- {n.title}" for n in market_data.news])}

Write a professional, clear explanation. No predictions. No trading advice. Just explain what happened and why it matters."""

        return self._call_llm(prompt, max_tokens=1000)

    def generate_coaching_message(
        self,
        market_data: MarketWithNewsResponse,
        behavior: Optional[BehaviorResponse] = None
    ) -> str:
        """Generate a coaching message combining market context and behavior patterns."""
        behavior_context = ""
        if behavior and behavior.patterns:
            patterns_desc = ", ".join([p.description for p in behavior.patterns])
            behavior_context = f"\nTrader Patterns: {patterns_desc}"

        prompt = f"""You are a supportive trading coach. Write ONE brief, empathetic coaching sentence.

Market Event: {market_data.market.symbol} {"dropped" if market_data.market.change_pct < 0 else "rose"} {abs(market_data.market.change_pct)}%{behavior_context}
Recent News Headlines: {chr(10).join([f"- {n.title}" for n in market_data.news])}
Guidelines:
- Be supportive, not directive
- No predictions or signals
- Acknowledge the situation
- Encourage mindfulness
- Keep it under 30 words"""

        return self._call_llm(prompt, max_tokens=1000)

    def _get_fallback_chat_response(self, user_prompt: str) -> str:
        """Provide a short fallback assistant response when the LLM is unavailable."""
        if user_prompt and "drop" in user_prompt.lower():
            return "I see you mentioned a market drop. Take a breath—this looks like volatility; review your plan and avoid reacting impulsively."
        return "I can't reach the AI service right now. Quick tip: stay disciplined and review your trading plan before acting."

    def chat(self, messages: list[ChatMessage], model: Optional[str] = None, max_tokens: int = 150) -> ChatResponse:
        """Chat interface: accepts a list of messages (history + current prompt) and returns assistant response."""
        api_messages = [{"role": m.role, "content": m.content} for m in messages]

        if not self.client:
            last_user = None
            for m in reversed(messages):
                if m.role == "user":
                    last_user = m
                    break
            content = self._get_fallback_chat_response(last_user.content if last_user else "")
            return ChatResponse(message=ChatMessage(role="assistant", content=content))

        try:
            response = self.client.chat.completions.create(
                model=model or self.model,
                max_tokens=max_tokens,
                messages=api_messages
            )
            content = response.choices[0].message.content
            usage = getattr(response, "usage", None)
            return ChatResponse(message=ChatMessage(role="assistant", content=content), usage=usage)
        except Exception:
            last_user_content = messages[-1].content if messages else ""
            content = self._get_fallback_chat_response(last_user_content)
            return ChatResponse(message=ChatMessage(role="assistant", content=content))


claude_engine = AIEngine()
