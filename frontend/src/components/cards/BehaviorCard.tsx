"use client";

import { Brain, AlertTriangle, TrendingDown, Repeat, Maximize, CheckCircle, Shield, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TradeUpload } from "@/components/features/TradeUpload";
import type { BehaviorResponse, PatternType } from "@/types";
import type { TradeData } from "@/lib/api";

interface BehaviorCardProps {
  data: BehaviorResponse | null;
  isLoading: boolean;
  onTradesUpload?: (trades: TradeData[]) => void;
  hasCustomTrades?: boolean;
}

const patternIcons: Record<PatternType, React.ReactNode> = {
  loss_streak: <TrendingDown className="h-4 w-4" />,
  revenge_trade: <AlertTriangle className="h-4 w-4" />,
  oversizing: <Maximize className="h-4 w-4" />,
  rapid_reentry: <Repeat className="h-4 w-4" />,
  consistent_sizing: <CheckCircle className="h-4 w-4" />,
  no_revenge_trades: <Shield className="h-4 w-4" />,
  improving_streak: <TrendingUp className="h-4 w-4" />,
};

const patternLabels: Record<PatternType, string> = {
  loss_streak: "Loss Streak",
  revenge_trade: "Revenge Trading",
  oversizing: "Oversizing",
  rapid_reentry: "Rapid Re-entry",
  consistent_sizing: "Consistent Sizing",
  no_revenge_trades: "No Revenge Trades",
  improving_streak: "Improving Streak",
};

export function BehaviorCard({ data, isLoading, onTradesUpload, hasCustomTrades }: BehaviorCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Behavior Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Behavior Analysis
            </span>
            {hasCustomTrades && (
              <Badge variant="secondary">Custom Trades</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-500 dark:text-gray-400">
            Click &quot;Simulate 3% Drop&quot; to analyze your trading patterns
          </p>
          {onTradesUpload && (
            <TradeUpload onUpload={onTradesUpload} disabled={isLoading} />
          )}
        </CardContent>
      </Card>
    );
  }

  const riskVariant =
    data.risk_level === "high"
      ? "destructive"
      : data.risk_level === "medium"
      ? "warning"
      : "success";

  const negativePatterns = data.patterns.filter((p) => !p.is_positive);
  const positivePatterns = data.patterns.filter((p) => p.is_positive);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Behavior Analysis
          </span>
          <div className="flex items-center gap-2">
            {hasCustomTrades && (
              <Badge variant="secondary">Custom</Badge>
            )}
            <Badge variant={riskVariant}>
              {data.risk_level.toUpperCase()} RISK
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">{data.summary}</p>

        {negativePatterns.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium dark:text-white">Detected Patterns:</p>
            {negativePatterns.map((pattern, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 rounded-lg border p-3 ${
                  pattern.severity === "high"
                    ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
                    : pattern.severity === "medium"
                    ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950"
                    : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                }`}
              >
                <div
                  className={`mt-0.5 ${
                    pattern.severity === "high"
                      ? "text-red-500"
                      : pattern.severity === "medium"
                      ? "text-amber-500"
                      : "text-gray-500"
                  }`}
                >
                  {patternIcons[pattern.pattern_type]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium dark:text-white">
                    {patternLabels[pattern.pattern_type]}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{pattern.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {positivePatterns.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-green-700 dark:text-green-400">Healthy Habits:</p>
            {positivePatterns.map((pattern, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950"
              >
                <div className="mt-0.5 text-green-600 dark:text-green-400">
                  {patternIcons[pattern.pattern_type]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    {patternLabels[pattern.pattern_type]}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400">{pattern.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-lg bg-purple-50 p-4 border border-purple-100 dark:bg-purple-950 dark:border-purple-900">
          <p className="text-sm font-medium text-purple-900 dark:text-purple-200">Coaching</p>
          <p className="mt-1 text-sm text-purple-800 dark:text-purple-300">
            {data.coaching_message}
          </p>
        </div>

        {onTradesUpload && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Upload your own trades:</p>
            <TradeUpload onUpload={onTradesUpload} disabled={isLoading} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
