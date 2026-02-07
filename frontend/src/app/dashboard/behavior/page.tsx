"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  AlertTriangle,
  TrendingDown,
  Repeat,
  Maximize,
  Upload,
  BarChart3,
  History,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TradeUpload } from "@/components/features/TradeUpload";
import { getBehaviorAnalysis, type TradeData } from "@/lib/api";
import type { BehaviorResponse, PatternType, RiskLevel } from "@/types";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const patternIcons: Record<PatternType, React.ReactNode> = {
  loss_streak: <TrendingDown className="h-5 w-5" />,
  revenge_trade: <AlertTriangle className="h-5 w-5" />,
  oversizing: <Maximize className="h-5 w-5" />,
  rapid_reentry: <Repeat className="h-5 w-5" />,
};

const patternLabels: Record<PatternType, string> = {
  loss_streak: "Loss Streak",
  revenge_trade: "Revenge Trading",
  oversizing: "Oversizing",
  rapid_reentry: "Rapid Re-entry",
};

const patternDescriptions: Record<PatternType, string> = {
  loss_streak: "Consecutive losing trades detected",
  revenge_trade: "Emotional trading after losses",
  oversizing: "Position sizes exceeding risk tolerance",
  rapid_reentry: "Quick re-entries without proper analysis",
};

export default function BehaviorPage() {
  const [behaviorData, setBehaviorData] = useState<BehaviorResponse | null>(null);
  const [customTrades, setCustomTrades] = useState<TradeData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const data = await getBehaviorAnalysis(customTrades || undefined);
      setBehaviorData(data);
    } catch (error) {
      console.error("Error analyzing behavior:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTradesUpload = (trades: TradeData[]) => {
    setCustomTrades(trades);
  };

  const clearTrades = () => {
    setCustomTrades(null);
    setBehaviorData(null);
  };

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-amber-500";
      case "low":
        return "text-green-500";
    }
  };

  const getRiskBadgeVariant = (level: RiskLevel) => {
    switch (level) {
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
        return "success";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Behavior Analysis
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Understand your trading patterns and receive coaching
          </p>
        </div>
        <div className="flex gap-3">
          {customTrades && (
            <Button variant="outline" onClick={clearTrades}>
              Clear Trades
            </Button>
          )}
          <Button onClick={handleAnalyze} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Analyze Behavior
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          className="lg:col-span-1"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.3 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Trades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Upload your trading history to get personalized behavior analysis and
                coaching recommendations.
              </p>
              <TradeUpload onUpload={handleTradesUpload} disabled={isLoading} />
              {customTrades && (
                <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {customTrades.length} trades uploaded
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="lg:col-span-2"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Analysis Results
                </span>
                {behaviorData && (
                  <div className="flex items-center gap-2">
                    {customTrades && <Badge variant="secondary">Custom Trades</Badge>}
                    <Badge variant={getRiskBadgeVariant(behaviorData.risk_level)}>
                      {behaviorData.risk_level.toUpperCase()} RISK
                    </Badge>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : behaviorData ? (
                <div className="space-y-6">
                  <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {behaviorData.summary}
                    </p>
                  </div>

                  {behaviorData.patterns.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold dark:text-white">
                        Detected Patterns
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {behaviorData.patterns.map((pattern, index) => (
                          <div
                            key={index}
                            className={`rounded-lg border p-4 ${
                              pattern.severity === "high"
                                ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
                                : pattern.severity === "medium"
                                ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950"
                                : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                            }`}
                          >
                            <div className="flex items-start gap-3">
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
                                <div className="flex items-center justify-between">
                                  <p className="font-medium dark:text-white">
                                    {patternLabels[pattern.pattern_type]}
                                  </p>
                                  <Badge
                                    variant={getRiskBadgeVariant(pattern.severity)}
                                    className="text-xs"
                                  >
                                    {pattern.severity}
                                  </Badge>
                                </div>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                  {pattern.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg bg-purple-50 p-4 border border-purple-100 dark:bg-purple-950 dark:border-purple-900">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-200">
                        Coaching Recommendation
                      </p>
                    </div>
                    <p className="text-sm text-purple-800 dark:text-purple-300">
                      {behaviorData.coaching_message}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Brain className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Upload your trades and click &quot;Analyze Behavior&quot; to see your
                    trading patterns
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Pattern Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(Object.keys(patternLabels) as PatternType[]).map((pattern) => (
                <div
                  key={pattern}
                  className="rounded-lg border p-4 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-gray-500 dark:text-gray-400">
                      {patternIcons[pattern]}
                    </div>
                    <h4 className="font-medium dark:text-white">
                      {patternLabels[pattern]}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {patternDescriptions[pattern]}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {customTrades && customTrades.length > 0 && (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Trade History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="pb-2 text-left font-medium text-gray-500 dark:text-gray-400">
                        ID
                      </th>
                      <th className="pb-2 text-left font-medium text-gray-500 dark:text-gray-400">
                        Symbol
                      </th>
                      <th className="pb-2 text-left font-medium text-gray-500 dark:text-gray-400">
                        Side
                      </th>
                      <th className="pb-2 text-right font-medium text-gray-500 dark:text-gray-400">
                        Size
                      </th>
                      <th className="pb-2 text-right font-medium text-gray-500 dark:text-gray-400">
                        Entry
                      </th>
                      <th className="pb-2 text-right font-medium text-gray-500 dark:text-gray-400">
                        Exit
                      </th>
                      <th className="pb-2 text-right font-medium text-gray-500 dark:text-gray-400">
                        P&L
                      </th>
                      <th className="pb-2 text-left font-medium text-gray-500 dark:text-gray-400">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {customTrades.slice(0, 20).map((trade) => (
                      <tr
                        key={trade.id}
                        className="border-b dark:border-gray-700 last:border-0"
                      >
                        <td className="py-2 text-gray-900 dark:text-white">
                          {trade.id}
                        </td>
                        <td className="py-2 text-gray-900 dark:text-white">
                          {trade.symbol}
                        </td>
                        <td className="py-2">
                          <Badge
                            variant={trade.side === "buy" ? "success" : "destructive"}
                            className="text-xs"
                          >
                            {trade.side.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-2 text-right text-gray-900 dark:text-white">
                          {trade.size.toFixed(2)}
                        </td>
                        <td className="py-2 text-right text-gray-900 dark:text-white">
                          {trade.entry_price.toFixed(5)}
                        </td>
                        <td className="py-2 text-right text-gray-900 dark:text-white">
                          {trade.exit_price?.toFixed(5) || "-"}
                        </td>
                        <td
                          className={`py-2 text-right font-medium ${
                            (trade.pnl || 0) >= 0 ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {trade.pnl !== null
                            ? `${trade.pnl >= 0 ? "+" : ""}${trade.pnl.toFixed(2)}`
                            : "-"}
                        </td>
                        <td className="py-2 text-gray-500 dark:text-gray-400">
                          {new Date(trade.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {customTrades.length > 20 && (
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                    Showing 20 of {customTrades.length} trades
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
