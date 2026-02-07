from typing import Optional
from openai import OpenAI

from app.config import Settings
from app.models.schemas import MarketData, BehaviorResponse, ChatMessage, ChatRequest, ChatResponse, MarketWithNewsResponse


class AIEngine:
    def __init__(self):
        settings = Settings()
        self.client = None
        self.api_key = settings.OPENAI_API_KEY
        self.model = settings.MODEL
        
        # Only initialize client if API key is provided
        if self.api_key and self.api_key.strip():
            try:
                if settings.MODEL_BASE_URL:
                    self.client = OpenAI(api_key=self.api_key, base_url=settings.MODEL_BASE_URL)
                else:
                    self.client = OpenAI(api_key=self.api_key)
                print(f"✓ AI Engine initialized with model: {self.model}")
            except Exception as e:
                print(f"✗ Failed to initialize OpenAI client: {e}")
                self.client = None
        else:
            print("⚠ Warning: OPENAI_API_KEY not set. Using fallback responses.")

    def _call_llm(self, prompt: str, max_tokens: int = 200) -> str:
        """Make a call to OpenAI API."""
        if not self.client:
            if not self.api_key or not self.api_key.strip():
                print("No API key configured. Using fallback response.")
            else:
                print("Client not initialized. Using fallback response.")
            return self._get_fallback_response(prompt)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                max_completion_tokens=max_tokens,
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

    def generate_coaching_insight(self, market_context: str, behavior_context: Optional[str] = None) -> str:
        """Generate a fused coaching insight: 'Market did X, you tend to Y'."""
        behavior_text = behavior_context or "No concerning patterns — trader is disciplined."

        prompt = f"""You are a positive, experienced trading coach.

Market Event (X): {market_context}
Trader Pattern (Y): {behavior_text}

Write 2-3 sentences connecting X and Y as a supportive coach.
- Always positive and empowering
- Frame risks as growth opportunities
- Celebrate healthy habits when present
- Use the style: "Market did X, and based on your history, you tend to Y"
- No predictions, no signals, no financial advice"""

        return self._call_llm(prompt, max_tokens=300)

    def _get_fallback_chat_response(self, user_prompt: str) -> str:
        """Provide a short fallback assistant response when the LLM is unavailable."""
        if not user_prompt:
            return "I'm here to help with your trading mindset and discipline. What's on your mind?"
        
        prompt_lower = user_prompt.lower()
        
        if "loss" in prompt_lower or "down" in prompt_lower:
            return "Markets move sharply sometimes. When they do, it's your mindset that matters most. Take a breath, review your plan, and remember: losses are part of the journey. What matters is how you respond."
        elif "revenge" in prompt_lower:
            return "Revenge trading is one of the biggest traps. Here's the key: after a loss, your job isn't to win it back immediately—it's to stay calm and follow your plan. Trust the process over emotions."
        elif "discipline" in prompt_lower or "mindset" in prompt_lower:
            return "Discipline beats intelligence in trading. It's the ability to follow your plan when emotions are high. Start with one thing: write down your trading rules, and commit to them before each trade."
        elif "pattern" in prompt_lower or "behavior" in prompt_lower:
            return "Great question. Your trading patterns reveal a lot about your emotional triggers. Review them, identify where you deviate from your plan, and that's where you grow."
        elif "streak" in prompt_lower or "winning" in prompt_lower:
            return "Winning streaks can be dangerous—overconfidence often follows. Stay grounded. Keep your position sizing consistent, stick to your rules, and remember that staying disciplined is harder during wins than losses."
        else:
            return "I appreciate the question. While I'm having connection issues right now, here's what I know: the best traders aren't the ones who predict markets—they're the ones who manage emotions. Your discipline matters most."

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
                max_completion_tokens=max_tokens,
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
