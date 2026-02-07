"use client";

import { TrendingDown, TrendingUp, Activity, BarChart3, Gauge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { MarketResponse } from "@/types";

interface MarketCardProps {
  data: MarketResponse | null;
  isLoading: boolean;
}

export function MarketCard({ data, isLoading }: MarketCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Market Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Market Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Click &quot;Simulate 3% Drop&quot; to see market analysis
          </p>
        </CardContent>
      </Card>
    );
  }

  const { market_data, explanation, coaching_message } = data;
  const isNegative = market_data.change_pct < 0;
  const TrendIcon = isNegative ? TrendingDown : TrendingUp;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Market Intelligence
          </span>
          {market_data.is_spike && (
            <Badge variant={isNegative ? "destructive" : "success"}>
              {isNegative ? "Sharp Drop" : "Sharp Rise"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm text-gray-500">{market_data.symbol}</p>
            <p className="text-2xl font-bold">
              {market_data.current_price.toFixed(5)}
            </p>
          </div>
          <div
            className={`flex items-center gap-1 ${
              isNegative ? "text-red-500" : "text-green-500"
            }`}
          >
            <TrendIcon className="h-5 w-5" />
            <span className="text-lg font-semibold">
              {isNegative ? "" : "+"}
              {market_data.change_pct.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{explanation}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Gauge className="h-3 w-3" />
              RSI
            </div>
            <p
              className={`text-lg font-semibold ${
                market_data.indicators.rsi < 30
                  ? "text-green-600"
                  : market_data.indicators.rsi > 70
                  ? "text-red-600"
                  : ""
              }`}
            >
              {market_data.indicators.rsi.toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">
              {market_data.indicators.rsi < 30
                ? "Oversold"
                : market_data.indicators.rsi > 70
                ? "Overbought"
                : "Neutral"}
            </p>
          </div>

          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <BarChart3 className="h-3 w-3" />
              Volume
            </div>
            <p
              className={`text-lg font-semibold ${
                market_data.indicators.volume_ratio > 2
                  ? "text-amber-600"
                  : ""
              }`}
            >
              {market_data.indicators.volume_ratio.toFixed(1)}x
            </p>
            <p className="text-xs text-gray-500">vs Average</p>
          </div>

          <div className="rounded-lg border p-3">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Activity className="h-3 w-3" />
              ATR
            </div>
            <p className="text-lg font-semibold">
              {(market_data.indicators.atr * 10000).toFixed(1)}
            </p>
            <p className="text-xs text-gray-500">pips</p>
          </div>
        </div>

        {coaching_message && (
          <div className="rounded-lg bg-blue-50 p-4 border border-blue-100 dark:bg-blue-950 dark:border-blue-900">
            <p className="text-sm text-blue-900 dark:text-blue-200">{coaching_message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
