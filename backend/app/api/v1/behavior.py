from fastapi import APIRouter
from typing import Optional
import csv
from pathlib import Path
from datetime import datetime

from app.models.schemas import BehaviorRequest, BehaviorResponse, Trade
from app.services.behavior_engine import behavior_engine

router = APIRouter()


def load_sample_trades() -> list[Trade]:
    """Load sample trades from CSV file."""
    csv_path = Path(__file__).parent.parent.parent / "data" / "trades.csv"

    trades = []
    try:
        with open(csv_path, "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                trade = Trade(
                    id=row["id"],
                    symbol=row["symbol"],
                    side=row["side"],
                    size=float(row["size"]),
                    entry_price=float(row["entry_price"]),
                    exit_price=float(row["exit_price"]) if row["exit_price"] else None,
                    pnl=float(row["pnl"]) if row["pnl"] else None,
                    timestamp=datetime.fromisoformat(row["timestamp"]),
                    closed_at=datetime.fromisoformat(row["closed_at"]) if row["closed_at"] else None
                )
                trades.append(trade)
    except FileNotFoundError:
        pass

    return trades


@router.post("", response_model=BehaviorResponse)
async def analyze_behavior(request: Optional[BehaviorRequest] = None):
    """
    Analyze trading behavior and detect patterns.

    - Detects loss streaks (3+ consecutive losses)
    - Identifies revenge trading (quick re-entry with larger size after loss)
    - Flags oversizing (positions 75%+ larger than average)
    - Spots rapid re-entry patterns (multiple trades within 2 minutes)

    If no trades are provided, uses sample trade data for demo.
    """
    if request and request.trades:
        trades = request.trades
    else:
        trades = load_sample_trades()

    response = behavior_engine.analyze_trades(trades)
    return response


@router.get("/sample")
async def get_sample_analysis():
    """
    Get behavior analysis using sample trade data.
    Useful for demo purposes.
    """
    trades = load_sample_trades()
    response = behavior_engine.analyze_trades(trades)

    return {
        "trade_count": len(trades),
        "analysis": response
    }
