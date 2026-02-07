import type {
  MarketResponse,
  BehaviorResponse,
  ContentRequest,
  ContentResponse,

  InsightRequest,
  InsightResponse,
  Persona,
  Platform,
  AuthResponse,
  User,
  ChatHistoryItem,
  ContentHistoryItem,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };

  // Attach auth token if present
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Clear stored auth on 401
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail || `API error: ${response.status}`);
  }

  return response.json();
}

// ── Auth API ──────────────────────────────────────────────

export async function register(email: string, password: string, display_name: string): Promise<AuthResponse> {
  return fetchApi<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, display_name }),
  });
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  return fetchApi<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(): Promise<User> {
  return fetchApi<User>("/auth/me");
}

// ── History API ──────────────────────────────────────────────

export async function getChatHistory(): Promise<ChatHistoryItem[]> {
  return fetchApi<ChatHistoryItem[]>("/history/chat");
}

export async function clearChatHistory(): Promise<void> {
  await fetchApi("/history/chat", { method: "DELETE" });
}

export async function getContentHistory(): Promise<ContentHistoryItem[]> {
  return fetchApi<ContentHistoryItem[]>("/history/content");
}

export async function getMarketData(
  symbol: string = "EURUSD=X",
  simulateDrop: boolean = false,
  simulateRise: boolean = false,
): Promise<MarketResponse> {
  const params = new URLSearchParams({
    simulate_drop: simulateDrop.toString(),
    simulate_rise: simulateRise.toString(),
    include_coaching: "true",
    symbol,
  });
  return fetchApi<MarketResponse>(`/market?${params}`);
}

export interface ChartDataPoint {
  time: string;
  price: number;
  volume: number;
}

export interface ChartResponse {
  symbol: string;
  data: ChartDataPoint[];
}

export async function getChartData(
  symbol: string = "EURUSD=X",
  simulateDrop: boolean = false,
  simulateRise: boolean = false,
): Promise<ChartResponse> {
  const params = new URLSearchParams({
    simulate_drop: simulateDrop.toString(),
    simulate_rise: simulateRise.toString(),
    symbol,
    points: "50",
  });
  return fetchApi<ChartResponse>(`/market/chart?${params}`);
}

export interface TradeData {
  id: string;
  symbol: string;
  side: string;
  size: number;
  entry_price: number;
  exit_price: number | null;
  pnl: number | null;
  timestamp: string;
  closed_at: string | null;
}

export async function getBehaviorAnalysis(trades?: TradeData[]): Promise<BehaviorResponse> {
  return fetchApi<BehaviorResponse>("/behavior", {
    method: "POST",
    body: trades ? JSON.stringify({ trades }) : undefined,
  });
}

export async function getCoachingInsight(
  marketContext: string,
  behaviorContext?: string
): Promise<InsightResponse> {
  const request: InsightRequest = {
    market_context: marketContext,
    behavior_context: behaviorContext,
  };
  return fetchApi<InsightResponse>("/insight", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function generateContent(
  marketContext: string,
  persona: Persona,
  platform: Platform,
  behaviorContext?: string,
  coachingInsight?: string
): Promise<ContentResponse> {
  const request: ContentRequest = {
    market_context: marketContext,
    persona,
    platform,
    behavior_context: behaviorContext,
    coaching_insight: coachingInsight,
  };

  return fetchApi<ContentResponse>("/content", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function generateAllContent(
  marketContext: string,
  platform: Platform,
  behaviorContext?: string,
  coachingInsight?: string
): Promise<Record<Persona, ContentResponse>> {
  const personas: Persona[] = ["calm_analyst", "data_nerd", "trading_coach"];

  const results = await Promise.all(
    personas.map((persona) =>
      generateContent(marketContext, persona, platform, behaviorContext, coachingInsight)
    )
  );

  return {
    calm_analyst: results[0],
    data_nerd: results[1],
    trading_coach: results[2],
  };
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  suggestions?: string[];
}

export interface ChatResponsePayload {
  message: ChatMessage;
  usage?: Record<string, any>;
}

export async function chat(
  messages: ChatMessage[],
  model?: string,
  max_tokens?: number,
  system_prompt_key?: string,
  system_prompt_override?: string
): Promise<ChatResponsePayload> {
  const request: any = { messages, model, max_tokens };
  if (system_prompt_key) request.system_prompt_key = system_prompt_key;
  if (system_prompt_override) request.system_prompt_override = system_prompt_override;

  return fetchApi<ChatResponsePayload>(`/chat`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}
