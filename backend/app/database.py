import bcrypt
import aiosqlite
from pathlib import Path

DB_PATH = Path(__file__).parent / "data" / "app.db"

_db: aiosqlite.Connection | None = None


async def init_db():
    global _db
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    _db = await aiosqlite.connect(str(DB_PATH))
    _db.row_factory = aiosqlite.Row

    await _db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            display_name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS user_trades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            symbol TEXT NOT NULL,
            side TEXT NOT NULL,
            size REAL NOT NULL,
            entry_price REAL NOT NULL,
            exit_price REAL,
            pnl REAL,
            timestamp TIMESTAMP NOT NULL,
            closed_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS content_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            persona TEXT NOT NULL,
            platform TEXT NOT NULL,
            content TEXT NOT NULL,
            hashtags TEXT,
            market_context TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    """)
    await _db.commit()

    # Seed demo user if not exists
    cursor = await _db.execute("SELECT id FROM users WHERE email = ?", ("demo@trader.com",))
    if await cursor.fetchone() is None:
        hashed = bcrypt.hashpw("demo1234".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        await _db.execute(
            "INSERT INTO users (email, hashed_password, display_name) VALUES (?, ?, ?)",
            ("demo@trader.com", hashed, "Demo Trader"),
        )
        await _db.commit()


async def close_db():
    global _db
    if _db:
        await _db.close()
        _db = None


def get_db() -> aiosqlite.Connection:
    if _db is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    return _db
