from typing import Optional
from openai import OpenAI

from app.config import Settings
from app.models.schemas import Persona, Platform, ContentResponse


PERSONA_PROMPTS = {
    Persona.CALM_ANALYST: {
        "voice": "Measured, thoughtful, reassuring. Uses phrases like 'In times like this...', 'What the data shows us...', 'Clarity over reactivity.'",
        "style": "Professional yet approachable. Focuses on perspective and long-term thinking."
    },
    Persona.DATA_NERD: {
        "voice": "Analytical, precise, slightly enthusiastic about numbers. Uses phrases like 'The numbers don't lie...', 'Here's what the data shows...', 'Statistically speaking...'",
        "style": "Data-driven with interesting statistics. Makes complex info accessible."
    },
    Persona.TRADING_COACH: {
        "voice": "Supportive, experienced, mentoring. Uses phrases like 'I've seen this before...', 'This is where discipline matters...', 'The best traders...'",
        "style": "Shares wisdom from experience. Focuses on mindset and discipline."
    }
}

PLATFORM_LIMITS = {
    Platform.LINKEDIN: 1300,
    Platform.X: 280
}


class ContentGenerator:
    def __init__(self):
        self.client = None
        settings = Settings()
        if settings.OPENAI_API_KEY:
            if settings.MODEL_BASE_URL:
                self.client = OpenAI(api_key=settings.OPENAI_API_KEY, base_url=settings.MODEL_BASE_URL)
            else:
                self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.MODEL

    def _call_llm(self, prompt: str, platform: Platform, max_tokens: int = 400) -> str:
        """Make a call to OpenAI API."""
        if not self.client:
            return self._get_fallback_content(prompt, platform)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                max_completion_tokens=max_tokens,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            content = response.choices[0].message.content
            if not content or not content.strip():
                return self._get_fallback_content(prompt, platform)
            return content
        except Exception as e:
            print(f"Error calling OpenAI API for content generation: {e}")
            return self._get_fallback_content(prompt, platform)

    def _get_fallback_content(self, prompt: str, platform: Platform) -> str:
        """Provide fallback content when API is unavailable."""
        if platform == Platform.X:
            if "calm_analyst" in prompt.lower() or "calm analyst" in prompt.lower():
                return "Markets moved sharply today. In times like this, remember: clarity over reactivity. The traders who thrive think clearest, not fastest. #Trading #StayClear"
            elif "data_nerd" in prompt.lower() or "data nerd" in prompt.lower():
                return "3% move. 2.5x avg volume. RSI at 28. The numbers tell the story—moves like this hit 2-3 times per quarter. Context > panic. #TradingData #Markets"
            elif "trading_coach" in prompt.lower() or "trading coach" in prompt.lower():
                return "Sharp drop, high volume, everyone panicking. I've seen this before. The best traders? They're observing, not reacting. Discipline wins. #TradingMindset"
            return "Markets are moving. Stay focused on your process, not the noise. #Trading"
        else:
            if "calm_analyst" in prompt.lower() or "calm analyst" in prompt.lower():
                return "Markets moved sharply today. In times like this, remember: clarity over reactivity. The traders who thrive aren't the ones who react fastest—they're the ones who think clearest.\n\nWhat we're seeing is volatility, not the end of the world. Step back. Breathe. Then decide."
            elif "data_nerd" in prompt.lower() or "data nerd" in prompt.lower():
                return "The numbers don't lie: we just saw a 3% move with 2.5x average volume. RSI hit oversold territory at 28.\n\nStatistically speaking, moves of this magnitude occur roughly 2-3 times per quarter. Context matters more than panic."
            elif "trading_coach" in prompt.lower() or "trading coach" in prompt.lower():
                return "I've seen this pattern hundreds of times. Sharp drop, high volume, everyone panicking.\n\nThis is exactly where discipline separates the professionals from the amateurs. The best traders I know? They're not trading right now. They're observing."
            return "Markets are moving. Stay focused on your process, not the noise."

    def generate_content(
        self,
        market_context: str,
        persona: Persona,
        platform: Platform,
        behavior_context: Optional[str] = None,
        coaching_insight: Optional[str] = None,
    ) -> ContentResponse:
        """Generate social media content for a specific persona and platform."""
        persona_config = PERSONA_PROMPTS[persona]
        char_limit = PLATFORM_LIMITS[platform]

        # Build the context section — prefer coaching insight (from Step 3) over raw contexts
        if coaching_insight:
            context_section = f"""COACHING INSIGHT (personal):
{coaching_insight}

ORIGINAL MARKET CONTEXT:
{market_context}"""
        else:
            context_section = f"MARKET CONTEXT:\n{market_context}"
            if behavior_context:
                context_section += f"\nTrader Insight: {behavior_context}"

        if platform == Platform.X:
            platform_guidance = "CRITICAL PLATFORM CONSTRAINT — X (Twitter): Write ONE single punchy tweet. MUST be under 280 characters total including hashtags. NO multi-paragraph content. NO line breaks. One concise, bold, conversation-starting statement with 2-3 hashtags."
        else:
            platform_guidance = "CRITICAL PLATFORM CONSTRAINT — LinkedIn: Write 2-3 short paragraphs, minimum 400 characters. Professional, authoritative tone. Include a call-to-action or reflection question at the end. Establish credibility."

        prompt = f"""You are a social media content creator with the following persona:

PERSONA: {persona.value.replace("_", " ").title()}
VOICE: {persona_config["voice"]}
STYLE: {persona_config["style"]}

{platform_guidance}

{context_section}

CHARACTER LIMIT: {char_limit}

Write engaging content that:
1. Feels authentic (not AI-generated)
2. Provides value to traders
3. Stays brand-safe (no predictions, no financial advice)
4. Matches the persona voice exactly
5. Strictly respects the platform format and character limit
6. Includes 2-3 relevant hashtags at the end

Output ONLY the post content with hashtags. No explanations."""

        content = self._call_llm(prompt, platform, max_tokens=400)

        # Extract hashtags from content
        hashtags = self._extract_hashtags(content)

        # Ensure we're within character limit
        if len(content) > char_limit:
            content = self._truncate_content(content, char_limit)

        return ContentResponse(
            persona=persona,
            platform=platform,
            content=content.strip(),
            hashtags=hashtags,
            char_count=len(content.strip())
        )

    def _extract_hashtags(self, content: str) -> list[str]:
        """Extract hashtags from content."""
        words = content.split()
        hashtags = [word.strip(".,!?") for word in words if word.startswith("#")]
        return hashtags

    def _truncate_content(self, content: str, limit: int) -> str:
        """Truncate content to fit within character limit."""
        if len(content) <= limit:
            return content

        # Try to cut at a sentence boundary
        truncated = content[:limit - 3]
        last_period = truncated.rfind(".")
        last_newline = truncated.rfind("\n")
        cut_point = max(last_period, last_newline)

        if cut_point > limit // 2:
            return content[:cut_point + 1]

        return truncated + "..."


content_generator = ContentGenerator()
