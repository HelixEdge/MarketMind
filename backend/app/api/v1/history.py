import json
from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.database import get_db
from app.models.schemas import ChatHistoryItem, ContentHistoryItem, Trade

router = APIRouter()


@router.get("/chat", response_model=list[ChatHistoryItem])
async def get_chat_history(user=Depends(get_current_user)):
    db = get_db()
    cursor = await db.execute(
        "SELECT id, role, content, timestamp FROM chat_history WHERE user_id = ? ORDER BY timestamp ASC",
        (user["id"],),
    )
    rows = await cursor.fetchall()
    return [ChatHistoryItem(id=r["id"], role=r["role"], content=r["content"], timestamp=r["timestamp"]) for r in rows]


@router.delete("/chat")
async def clear_chat_history(user=Depends(get_current_user)):
    db = get_db()
    await db.execute("DELETE FROM chat_history WHERE user_id = ?", (user["id"],))
    await db.commit()
    return {"message": "Chat history cleared"}


@router.get("/content", response_model=list[ContentHistoryItem])
async def get_content_history(user=Depends(get_current_user)):
    db = get_db()
    cursor = await db.execute(
        "SELECT id, persona, platform, content, hashtags, market_context, created_at FROM content_history WHERE user_id = ? ORDER BY created_at DESC",
        (user["id"],),
    )
    rows = await cursor.fetchall()
    items = []
    for r in rows:
        hashtags = json.loads(r["hashtags"]) if r["hashtags"] else None
        items.append(ContentHistoryItem(
            id=r["id"], persona=r["persona"], platform=r["platform"],
            content=r["content"], hashtags=hashtags,
            market_context=r["market_context"], created_at=r["created_at"],
        ))
    return items


@router.get("/trades")
async def get_trades(user=Depends(get_current_user)):
    db = get_db()
    cursor = await db.execute(
        "SELECT * FROM user_trades WHERE user_id = ? ORDER BY timestamp DESC",
        (user["id"],),
    )
    rows = await cursor.fetchall()
    return [dict(r) for r in rows]


@router.post("/trades")
async def save_trades(trades: list[Trade], user=Depends(get_current_user)):
    db = get_db()
    for t in trades:
        await db.execute(
            "INSERT INTO user_trades (user_id, symbol, side, size, entry_price, exit_price, pnl, timestamp, closed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (user["id"], t.symbol, t.side, t.size, t.entry_price, t.exit_price, t.pnl, t.timestamp.isoformat(), t.closed_at.isoformat() if t.closed_at else None),
        )
    await db.commit()
    return {"message": f"Saved {len(trades)} trades"}
