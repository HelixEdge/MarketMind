from datetime import timedelta
from typing import Optional

from app.models.schemas import (
    Trade, BehaviorPattern, BehaviorResponse,
    PatternType, RiskLevel
)


class BehaviorEngine:
    def __init__(self):
        self.loss_streak_threshold = 3
        self.revenge_time_window = timedelta(minutes=5)
        self.revenge_size_increase = 0.5  # 50% larger
        self.oversize_threshold = 0.75  # 75% larger than average
        self.rapid_reentry_window = timedelta(minutes=2)

    def analyze_trades(self, trades: list[Trade]) -> BehaviorResponse:
        """Analyze trade history and detect behavioral patterns."""
        if not trades:
            return BehaviorResponse(
                patterns=[],
                risk_level=RiskLevel.LOW,
                coaching_message="No trading history to analyze. Trade mindfully.",
                summary="No patterns detected."
            )

        patterns: list[BehaviorPattern] = []

        # Sort trades by timestamp
        sorted_trades = sorted(trades, key=lambda t: t.timestamp)

        # Detect patterns
        loss_streak = self._detect_loss_streak(sorted_trades)
        if loss_streak:
            patterns.append(loss_streak)

        revenge_trade = self._detect_revenge_trade(sorted_trades)
        if revenge_trade:
            patterns.append(revenge_trade)

        oversizing = self._detect_oversizing(sorted_trades)
        if oversizing:
            patterns.append(oversizing)

        rapid_reentry = self._detect_rapid_reentry(sorted_trades)
        if rapid_reentry:
            patterns.append(rapid_reentry)

        # Calculate overall risk level
        risk_level = self._calculate_risk_level(patterns)

        # Generate summary and coaching
        summary = self._generate_summary(patterns)
        coaching = self._generate_coaching_message(patterns, risk_level)

        return BehaviorResponse(
            patterns=patterns,
            risk_level=risk_level,
            coaching_message=coaching,
            summary=summary
        )

    def _detect_loss_streak(self, trades: list[Trade]) -> Optional[BehaviorPattern]:
        """Detect 3+ consecutive losing trades."""
        if len(trades) < self.loss_streak_threshold:
            return None

        # Check recent trades
        recent_trades = trades[-5:]  # Look at last 5 trades
        consecutive_losses = 0
        max_streak = 0

        for trade in recent_trades:
            if trade.pnl is not None and trade.pnl < 0:
                consecutive_losses += 1
                max_streak = max(max_streak, consecutive_losses)
            else:
                consecutive_losses = 0

        if max_streak >= self.loss_streak_threshold:
            return BehaviorPattern(
                pattern_type=PatternType.LOSS_STREAK,
                description=f"You have {max_streak} consecutive losing trades",
                severity=RiskLevel.HIGH if max_streak >= 4 else RiskLevel.MEDIUM,
                details={"consecutive_losses": max_streak}
            )

        return None

    def _detect_revenge_trade(self, trades: list[Trade]) -> Optional[BehaviorPattern]:
        """Detect re-entry within 5 min of loss with 50%+ larger size."""
        if len(trades) < 2:
            return None

        for i in range(1, len(trades)):
            prev_trade = trades[i - 1]
            curr_trade = trades[i]

            # Check if previous trade was a loss
            if prev_trade.pnl is None or prev_trade.pnl >= 0:
                continue

            # Check if current trade happened within the window
            if prev_trade.closed_at is None:
                continue

            time_diff = curr_trade.timestamp - prev_trade.closed_at
            if time_diff > self.revenge_time_window:
                continue

            # Check if size increased significantly
            size_increase = (curr_trade.size - prev_trade.size) / prev_trade.size
            if size_increase >= self.revenge_size_increase:
                return BehaviorPattern(
                    pattern_type=PatternType.REVENGE_TRADE,
                    description="Detected revenge trading: quick re-entry with larger size after loss",
                    severity=RiskLevel.HIGH,
                    details={
                        "time_between_trades_minutes": round(time_diff.total_seconds() / 60, 1),
                        "size_increase_pct": round(size_increase * 100, 1)
                    }
                )

        return None

    def _detect_oversizing(self, trades: list[Trade]) -> Optional[BehaviorPattern]:
        """Detect recent positions 75%+ larger than average."""
        if len(trades) < 3:
            return None

        sizes = [t.size for t in trades]
        avg_size = sum(sizes[:-1]) / len(sizes[:-1]) if len(sizes) > 1 else sizes[0]
        recent_size = sizes[-1]

        if avg_size > 0:
            increase_ratio = (recent_size - avg_size) / avg_size
            if increase_ratio >= self.oversize_threshold:
                return BehaviorPattern(
                    pattern_type=PatternType.OVERSIZING,
                    description=f"Recent position is {round(increase_ratio * 100)}% larger than your average",
                    severity=RiskLevel.MEDIUM,
                    details={
                        "average_size": round(avg_size, 2),
                        "recent_size": round(recent_size, 2),
                        "increase_pct": round(increase_ratio * 100, 1)
                    }
                )

        return None

    def _detect_rapid_reentry(self, trades: list[Trade]) -> Optional[BehaviorPattern]:
        """Detect multiple trades within 2 minutes."""
        if len(trades) < 2:
            return None

        rapid_count = 0
        for i in range(1, len(trades)):
            prev_trade = trades[i - 1]
            curr_trade = trades[i]

            if prev_trade.closed_at is None:
                continue

            time_diff = curr_trade.timestamp - prev_trade.closed_at
            if time_diff <= self.rapid_reentry_window:
                rapid_count += 1

        if rapid_count >= 2:
            return BehaviorPattern(
                pattern_type=PatternType.RAPID_REENTRY,
                description=f"You're entering trades very quickly ({rapid_count} rapid re-entries)",
                severity=RiskLevel.MEDIUM,
                details={"rapid_entries": rapid_count}
            )

        return None

    def _calculate_risk_level(self, patterns: list[BehaviorPattern]) -> RiskLevel:
        """Calculate overall risk level based on detected patterns."""
        if not patterns:
            return RiskLevel.LOW

        # If any pattern is HIGH, overall is HIGH
        if any(p.severity == RiskLevel.HIGH for p in patterns):
            return RiskLevel.HIGH

        # If multiple MEDIUM patterns, escalate to HIGH
        medium_count = sum(1 for p in patterns if p.severity == RiskLevel.MEDIUM)
        if medium_count >= 2:
            return RiskLevel.HIGH

        # If any MEDIUM pattern, overall is MEDIUM
        if medium_count >= 1:
            return RiskLevel.MEDIUM

        return RiskLevel.LOW

    def _generate_summary(self, patterns: list[BehaviorPattern]) -> str:
        """Generate a brief summary of detected patterns."""
        if not patterns:
            return "No concerning patterns detected in your recent trading."

        pattern_names = [p.pattern_type.value.replace("_", " ") for p in patterns]
        return f"Detected patterns: {', '.join(pattern_names)}"

    def _generate_coaching_message(self, patterns: list[BehaviorPattern], risk_level: RiskLevel) -> str:
        """Generate a supportive coaching message based on patterns."""
        if not patterns:
            return "Your trading patterns look balanced. Keep up the mindful approach."

        messages = {
            PatternType.LOSS_STREAK: "After consecutive losses, taking a short break can help reset your mindset.",
            PatternType.REVENGE_TRADE: "Quick re-entries after losses often lead to emotional decisions. Consider stepping away briefly.",
            PatternType.OVERSIZING: "Increasing position size during volatility increases risk. Stick to your normal sizing.",
            PatternType.RAPID_REENTRY: "Fast-paced trading can cloud judgment. Slow down and review each setup carefully."
        }

        coaching_parts = [messages.get(p.pattern_type, "") for p in patterns if p.pattern_type in messages]

        if risk_level == RiskLevel.HIGH:
            prefix = "⚠️ Multiple risk signals detected. "
        else:
            prefix = ""

        return prefix + " ".join(coaching_parts[:2])  # Limit to 2 messages



