import type {
  MarketResponse,
  BehaviorResponse,
  ContentRequest,
  ContentResponse,
  Persona,
  Platform,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

export async function getMarketData(
  simulateDrop: boolean = false,
  symbol: string = "EURUSD=X"
): Promise<MarketResponse> {
  const params = new URLSearchParams({
    simulate_drop: simulateDrop.toString(),
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
  simulateDrop: boolean = false,
  symbol: string = "EURUSD=X"
): Promise<ChartResponse> {
  const params = new URLSearchParams({
    simulate_drop: simulateDrop.toString(),
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

export async function generateContent(
  marketContext: string,
  persona: Persona,
  platform: Platform,
  behaviorContext?: string
): Promise<ContentResponse> {
  const request: ContentRequest = {
    market_context: marketContext,
    persona,
    platform,
    behavior_context: behaviorContext,
  };

  return fetchApi<ContentResponse>("/content", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function generateAllContent(
  marketContext: string,
  platform: Platform,
  behaviorContext?: string
): Promise<Record<Persona, ContentResponse>> {
  const personas: Persona[] = ["calm_analyst", "data_nerd", "trading_coach"];

  const results = await Promise.all(
    personas.map((persona) =>
      generateContent(marketContext, persona, platform, behaviorContext)
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
