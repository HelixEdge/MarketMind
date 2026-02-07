export type RiskLevel = "low" | "medium" | "high";
export type PatternType =
  | "loss_streak"
  | "revenge_trade"
  | "oversizing"
  | "rapid_reentry"
  | "consistent_sizing"
  | "no_revenge_trades"
  | "improving_streak";
export type Persona = "calm_analyst" | "data_nerd" | "trading_coach";
export type Platform = "linkedin" | "x";

export interface MarketIndicators {
  rsi: number;
  atr: number;
  volume_ratio: number;
  price_change_pct: number;
}

export interface MarketData {
  symbol: string;
  current_price: number;
  previous_price: number;
  change_pct: number;
  indicators: MarketIndicators;
  is_spike: boolean;
  spike_direction: "up" | "down" | null;
  timestamp: string;
}

export interface MarketResponse {
  market_data: MarketData;
  explanation: string;
  coaching_message: string | null;
}

export interface BehaviorPattern {
  pattern_type: PatternType;
  description: string;
  severity: RiskLevel;
  details: Record<string, number>;
  is_positive: boolean;
}

export interface BehaviorResponse {
  patterns: BehaviorPattern[];
  risk_level: RiskLevel;
  coaching_message: string;
  summary: string;
}

export interface ContentRequest {
  market_context: string;
  behavior_context?: string;
  coaching_insight?: string;
  content_type?: string;
  persona: Persona;
  platform: Platform;
}

export interface ContentResponse {
  persona: Persona;
  platform: Platform;
  content: string;
  hashtags: string[];
  char_count: number;
}

export interface InsightRequest {
  market_context: string;
  behavior_context?: string;
}

export interface InsightResponse {
  coaching_insight: string;
  market_context: string;
  behavior_context?: string;
}

// ── Auth types ──────────────────────────────────────────────

export interface User {
  id: number;
  email: string;
  display_name: string;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ChatHistoryItem {
  id: number;
  role: string;
  content: string;
  timestamp?: string;
}

export interface ContentHistoryItem {
  id: number;
  persona: string;
  platform: string;
  content: string;
  hashtags?: string[];
  market_context?: string;
  created_at?: string;
}
