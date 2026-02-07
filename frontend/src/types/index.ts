export type RiskLevel = "low" | "medium" | "high";
export type PatternType = "loss_streak" | "revenge_trade" | "oversizing" | "rapid_reentry";
export type Persona = "calm_analyst" | "data_nerd" | "trading_coach";
export type Platform = "linkedin" | "twitter";

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
