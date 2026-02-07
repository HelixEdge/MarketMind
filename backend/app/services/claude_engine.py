from typing import Optional
from openai import OpenAI
import json

from app.config import Settings
from app.models.schemas import MarketData, BehaviorResponse, ChatMessage, ChatRequest, ChatResponse, MarketWithNewsResponse
from app.services.market_intelligence import MarketIntelligenceService


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

    def _normalize_usage(self, usage: any) -> dict | None:
        """Normalize various usage objects into a plain dict for Pydantic validation."""
        if usage is None:
            return None
        # Already a dict
        if isinstance(usage, dict):
            return usage
        # Try SDK helper
        if hasattr(usage, "to_dict"):
            try:
                return usage.to_dict()
            except Exception:
                pass
        # Try __dict__
        try:
            data = getattr(usage, "__dict__", None)
            if isinstance(data, dict) and data:
                return {k: v for k, v in data.items() if not k.startswith("_")}
        except Exception:
            pass
        # Fallback: attempt JSON round-trip
        try:
            return json.loads(json.dumps(usage, default=lambda o: getattr(o, "__dict__", str(o))))
        except Exception:
            return None
        
    def chat(self, messages: list[ChatMessage], model: Optional[str] = None) -> ChatResponse:
        """Chat interface with basic tool support.

        The assistant can request the `get_market_with_news` tool by returning a message that
        starts with the header `CALL_TOOL:get_market_with_news` followed by an optional JSON
        payload on the next line. Example assistant message:

        CALL_TOOL:get_market_with_news
        {"symbol": "BTC/USD", "news_limit": 3, "simulate_drop": false}

        When such a request is detected, the engine will invoke the MarketIntelligenceService,
        append a `tool` message with the result, and re-query the model so it can incorporate
        the tool output into its final reply. We allow one tool-call cycle per chat invocation.
        """
        api_messages = [{"role": m.role, "content": m.content} for m in messages]

        if not self.client:
            last_user = None
            for m in reversed(messages):
                if m.role == "user":
                    last_user = m
                    break
            content = self._get_fallback_chat_response(last_user.content if last_user else "")
            print("OpenAI client not configured. Returning fallback response. 1")
            return ChatResponse(message=ChatMessage(role="assistant", content=content))

        # Support at most one tool call cycle to avoid long loops
        tool_cycle = 0
        max_tool_cycles = 1

        # Limit overall loop iterations to avoid getting stuck in repeated model/tool interactions
        loop_count = 0
        max_loops = 2

        last_response_content = ""
        last_usage = None

        while True:
            loop_count += 1
            if loop_count > max_loops:
                # If we've looped more times than allowed, return the last assistant message if
                # available; otherwise provide a brief fallback response based on user's last prompt.
                last_user_content = messages[-1].content if messages else ""
                content = last_response_content or self._get_fallback_chat_response(last_user_content)
                return ChatResponse(message=ChatMessage(role="assistant", content=content), usage=self._normalize_usage(last_usage))

            try:
                # Provide a formal function/tool description to the model so it can call it via the
                # function-calling / tools interface if supported. We keep our legacy header-based
                # "CALL_TOOL:get_market_with_news" parsing as a fallback for models that don't use
                # function_call objects.
                tools = [
                    {
                        "type": "function",
                        "name": "get_market_with_news",
                        "description": "Return latest market data and recent news for a symbol.",
                        "function": {
                            "name": "get_market_with_news",
                            "description": "Return latest market data and recent news for a symbol.",
                            "parameters": {
                                "type": "object",
                                "properties": {
                                    "symbol": {
                                        "type": "string",
                                        "description": "Symbol or ticker, e.g. BTC/USD or AAPL",
                                    },
                                    "news_limit": {
                                        "type": "integer",
                                        "description": "Number of news items to return",
                                    },
                                    "simulate_drop": {
                                        "type": "boolean",
                                        "description": "If true, simulate a market drop in the returned data",
                                    },
                                },
                                "required": [],
                                "additionalProperties": False,
                            }
                        },
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "symbol": {
                                    "type": "string",
                                    "description": "Symbol or ticker, e.g. BTC/USD or AAPL",
                                },
                                "news_limit": {
                                    "type": "integer",
                                    "description": "Number of news items to return",
                                },
                                "simulate_drop": {
                                    "type": "boolean",
                                    "description": "If true, simulate a market drop in the returned data",
                                },
                            },
                            "required": [],
                            "additionalProperties": False,
                        },
                        "strict": True,
                    }
                ]

                response = self.client.chat.completions.create(
                    model=model or self.model,
                    messages=api_messages,
                    tools=tools,
                    tool_choice=None
                )
            except Exception as e:
                last_user_content = messages[-1].content if messages else ""
                content = self._get_fallback_chat_response(last_user_content)
                print(f"Error calling OpenAI API: {e}. Returning fallback response.")
                return ChatResponse(message=ChatMessage(role="assistant", content=content))

            # message may include either content or a function_call (or both depending on model)
            message_obj = response.choices[0].message
            assistant_text = getattr(message_obj, "content", "") or ""
            last_usage = getattr(response, "usage", None)

            # New style: function_call object from model
            function_call = getattr(message_obj, "function_call", None)
            if not function_call:
                # Some clients return dict-like objects
                try:
                    function_call = message_obj.get("function_call") if hasattr(message_obj, "get") else None
                except Exception:
                    function_call = None

            if function_call and tool_cycle < max_tool_cycles:
                # Extract name and arguments (arguments may be a JSON string)
                if isinstance(function_call, dict):
                    func_name = function_call.get("name")
                    func_args = function_call.get("arguments")
                else:
                    func_name = getattr(function_call, "name", None)
                    func_args = getattr(function_call, "arguments", None)

                try:
                    payload = json.loads(func_args) if isinstance(func_args, str) and func_args.strip() else {}
                except Exception:
                    payload = {}

                if func_name == "get_market_with_news":
                    symbol = payload.get("symbol") or None
                    news_limit = int(payload.get("news_limit", 3))
                    simulate_drop = bool(payload.get("simulate_drop", False))

                    try:
                        market_service = MarketIntelligenceService(symbol=symbol or None)
                        tool_result = market_service.get_market_with_news(simulate_drop=simulate_drop, news_limit=news_limit)
                        tool_content = json.dumps(tool_result, default=str)
                    except Exception as e:
                        tool_content = json.dumps({"error": str(e)})

                    # Append the model's original assistant message (which requested the function)
                    api_messages.append({"role": "assistant", "content": assistant_text})
                    # Add a function role message with the function result so the model can consume it
                    api_messages.append({"role": "function", "name": "get_market_with_news", "content": tool_content})

                    tool_cycle += 1
                    last_response_content = assistant_text
                    # Loop again so the model can produce a final response that incorporates the function output
                    continue

            # Some SDKs/models return a `tool_calls` list on the message object (e.g., multi-tool responses)
            tool_calls = getattr(message_obj, "tool_calls", None)
            if not tool_calls:
                try:
                    tool_calls = message_obj.get("tool_calls") if hasattr(message_obj, "get") else None
                except Exception:
                    tool_calls = None

            if tool_calls and tool_cycle < max_tool_cycles:
                for tool_call in tool_calls:
                    # Extract function name and arguments from different possible shapes
                    func_name = None
                    func_args = None

                    if isinstance(tool_call, dict):
                        fn = tool_call.get("function") or {}
                        func_name = fn.get("name")
                        func_args = tool_call.get("arguments")
                    else:
                        fn = getattr(tool_call, "function", None)
                        func_name = getattr(fn, "name", None) if fn else None
                        func_args = getattr(tool_call, "arguments", None)

                    try:
                        payload = json.loads(func_args) if isinstance(func_args, str) and func_args.strip() else {}
                    except Exception:
                        payload = {}

                    if func_name == "get_market_with_news":
                        symbol = payload.get("symbol") or None
                        news_limit = int(payload.get("news_limit", 3))
                        simulate_drop = bool(payload.get("simulate_drop", False))

                        try:
                            market_service = MarketIntelligenceService(symbol=symbol or None)
                            tool_result = market_service.get_market_with_news(simulate_drop=simulate_drop, news_limit=news_limit)
                            tool_content = json.dumps(tool_result, default=str)
                        except Exception as e:
                            tool_content = json.dumps({"error": str(e)})

                        # Append the model's original assistant message and a function message with the result
                        api_messages.append({"role": "assistant", "content": assistant_text})
                        api_messages.append({"role": "function", "name": "get_market_with_news", "content": tool_content})

                        tool_cycle += 1
                        last_response_content = assistant_text
                        # Only process one tool call per cycle
                        break

                # Continue so the model can consume the function output and produce final reply
                continue

            # Legacy fallback: assistant returned a header-based tool request in plain text
            header = "CALL_TOOL:get_market_with_news"
            if assistant_text.strip().startswith(header) and tool_cycle < max_tool_cycles:
                # Parse optional JSON payload following the header
                payload = {}
                parts = assistant_text.split("\n", 1)
                if len(parts) > 1 and parts[1].strip():
                    try:
                        payload = json.loads(parts[1].strip())
                    except Exception:
                        # ignore parse errors and use defaults
                        payload = {}

                symbol = payload.get("symbol") or None
                news_limit = int(payload.get("news_limit", 3))
                simulate_drop = bool(payload.get("simulate_drop", False))

                # Invoke tool
                try:
                    market_service = MarketIntelligenceService(symbol=symbol or None)
                    tool_result = market_service.get_market_with_news(simulate_drop=simulate_drop, news_limit=news_limit)
                    # Convert result to json string
                    tool_content = json.dumps(tool_result, default=str)
                except Exception as e:
                    tool_content = json.dumps({"error": str(e)})

                # Append assistant's tool request message and the tool response message
                api_messages.append({"role": "assistant", "content": assistant_text})
                api_messages.append({"role": "tool", "content": f"RESULT:get_market_with_news\n{tool_content}"})

                tool_cycle += 1
                last_response_content = assistant_text
                # Continue loop so model can consume tool output and produce final reply
                continue

            # No tool requested — return assistant reply
            last_response_content = assistant_text
            return ChatResponse(message=ChatMessage(role="assistant", content=last_response_content), usage=self._normalize_usage(last_usage))

