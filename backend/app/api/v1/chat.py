from fastapi import APIRouter, HTTPException
from pathlib import Path
from datetime import datetime

from app.models.schemas import ChatRequest, ChatResponse, ChatMessage
from app.services.claude_engine import AIEngine

router = APIRouter()


@router.post("", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    """Chat with the AI: accepts message history + current prompt and optional system prompt key/override."""
    claude_engine = AIEngine()

    # Prepare messages list (copy to avoid mutating request)
    messages = list(request.messages)

    # Resolve system prompt:
    # 1) override takes precedence
    # 2) if a key is provided, try that file (error if missing)
    # 3) otherwise try default `system_prompt.md` (silently skip if missing)
    system_prompt_content = None
    prompts_dir = Path(__file__).parent.parent.parent / "prompts"

    if request.system_prompt_override:
        system_prompt_content = request.system_prompt_override
    elif request.system_prompt_key:
        prompt_file = prompts_dir / f"{request.system_prompt_key}.md"
        try:
            system_prompt_content = prompt_file.read_text(encoding="utf-8")
        except FileNotFoundError:
            raise HTTPException(status_code=400, detail=f"System prompt file not found: {request.system_prompt_key}")
    else:
        # Load default prompt if present, but don't error if missing
        default_file = prompts_dir / "system_prompt.md"
        try:
            system_prompt_content = default_file.read_text(encoding="utf-8")
        except FileNotFoundError:
            system_prompt_content = None

    # Prepend system message when available
    if system_prompt_content:
        system_message = ChatMessage(role="system", content=system_prompt_content, timestamp=datetime.now())
        messages = [system_message] + messages

    response = claude_engine.chat(messages, model=request.model, max_tokens=request.max_tokens)
    return response
