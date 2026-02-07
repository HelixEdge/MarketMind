from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pathlib import Path
from datetime import datetime

from app.models.schemas import ChatRequest, ChatResponse, ChatMessage
from app.services.claude_engine import AIEngine
from app.auth import get_optional_user
from app.database import get_db

router = APIRouter()


async def _save_chat_messages(user_id: int, user_content: str, assistant_content: str):
    try:
        db = get_db()
        await db.execute(
            "INSERT INTO chat_history (user_id, role, content) VALUES (?, ?, ?)",
            (user_id, "user", user_content),
        )
        await db.execute(
            "INSERT INTO chat_history (user_id, role, content) VALUES (?, ?, ?)",
            (user_id, "assistant", assistant_content),
        )
        await db.commit()
    except Exception:
        pass


@router.post("", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, background_tasks: BackgroundTasks, user=Depends(get_optional_user)):
    """Chat with the AI: accepts message history + current prompt and optional system prompt key/override."""
    claude_engine = AIEngine()

    messages = list(request.messages)

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
        default_file = prompts_dir / "system_prompt.md"
        try:
            system_prompt_content = default_file.read_text(encoding="utf-8")
        except FileNotFoundError:
            system_prompt_content = None

    if system_prompt_content:
        system_message = ChatMessage(role="system", content=system_prompt_content, timestamp=datetime.now())
        messages = [system_message] + messages

    response = claude_engine.chat(messages, model=request.model)

    # Save to DB if user is authenticated
    if user and response.message:
        user_messages = [m for m in request.messages if m.role == "user"]
        if user_messages:
            background_tasks.add_task(
                _save_chat_messages, user["id"], user_messages[-1].content, response.message.content
            )

    return response
