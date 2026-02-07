"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Gauge,
  RefreshCw,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriceChart } from "@/components/charts/PriceChart";
import { SymbolSelector } from "@/components/features/SymbolSelector";
import { SimulateButton } from "@/components/features/SimulateButton";
import {
  getMarketData,
  getChartData,
  type ChartDataPoint,
} from "@/lib/api";
import type { MarketResponse } from "@/types";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export default function MarketPage() {
  const [symbol, setSymbol] = useState("EURUSD=X");
  const [marketData, setMarketData] = useState<MarketResponse | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchData = useCallback(async (simulate: boolean = false) => {
    setIsLoading(true);
    try {
      const [market, chart] = await Promise.all([
        getMarketData(simulate, symbol),
        getChartData(simulate, symbol),
      ]);
      setMarketData(market);
      setChartData(chart.data);
    } catch (error) {
      console.error("Error fetching market data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const handleExport = () => {
    if (!chartData) return;

    const csv = [
      ["Time", "Price", "Volume"],
      ...chartData.map((d) => [d.time, d.price.toString(), d.volume.toString()]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${symbol.replace("=X", "")}_chart_data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const displaySymbol = symbol.replace("=X", "").replace("-", "/");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Market Analysis
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Real-time market data and technical indicators
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <SymbolSelector value={symbol} onChange={setSymbol} disabled={isLoading} />
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? "animate-spin" : ""}`} />
            {autoRefresh ? "Auto" : "Manual"}
          </Button>
          <SimulateButton onClick={() => fetchData(true)} isLoading={isLoading} />
        </div>
      </div>

      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                {displaySymbol} Price Chart
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                disabled={!chartData}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[350px] w-full" />
            ) : chartData && chartData.length > 0 ? (
              <div className="h-[350px]">
                <PriceChart
                  data={chartData}
                  symbol={displaySymbol}
                  isLoading={false}
                />
              </div>
            ) : (
              <div className="flex h-[350px] items-center justify-center text-gray-500 dark:text-gray-400">
                Click &quot;Simulate 3% Drop&quot; to see price action
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Market Intelligence
              </span>
              {marketData?.market_data.is_spike && (
                <Badge
                  variant={
                    marketData.market_data.change_pct < 0 ? "destructive" : "success"
                  }
                >
                  {marketData.market_data.change_pct < 0 ? "Sharp Drop" : "Sharp Rise"}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="grid grid-cols-4 gap-4">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              </div>
            ) : marketData ? (
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {marketData.market_data.symbol}
                    </p>
                    <p className="text-3xl font-bold dark:text-white">
                      {marketData.market_data.current_price.toFixed(5)}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-1 ${
                      marketData.market_data.change_pct < 0
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {marketData.market_data.change_pct < 0 ? (
                      <TrendingDown className="h-6 w-6" />
                    ) : (
                      <TrendingUp className="h-6 w-6" />
                    )}
                    <span className="text-2xl font-semibold">
                      {marketData.market_data.change_pct < 0 ? "" : "+"}
                      {marketData.market_data.change_pct.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {marketData.explanation}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-lg border p-4 dark:border-gray-700">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Gauge className="h-3 w-3" />
                      RSI
                    </div>
                    <p
                      className={`text-xl font-semibold ${
                        marketData.market_data.indicators.rsi < 30
                          ? "text-green-600"
                          : marketData.market_data.indicators.rsi > 70
                          ? "text-red-600"
                          : "dark:text-white"
                      }`}
                    >
                      {marketData.market_data.indicators.rsi.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {marketData.market_data.indicators.rsi < 30
                        ? "Oversold"
                        : marketData.market_data.indicators.rsi > 70
                        ? "Overbought"
                        : "Neutral"}
                    </p>
                  </div>

                  <div className="rounded-lg border p-4 dark:border-gray-700">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <BarChart3 className="h-3 w-3" />
                      Volume
                    </div>
                    <p
                      className={`text-xl font-semibold ${
                        marketData.market_data.indicators.volume_ratio > 2
                          ? "text-amber-600"
                          : "dark:text-white"
                      }`}
                    >
                      {marketData.market_data.indicators.volume_ratio.toFixed(1)}x
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">vs Average</p>
                  </div>

                  <div className="rounded-lg border p-4 dark:border-gray-700">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Activity className="h-3 w-3" />
                      ATR
                    </div>
                    <p className="text-xl font-semibold dark:text-white">
                      {(marketData.market_data.indicators.atr * 10000).toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">pips</p>
                  </div>

                  <div className="rounded-lg border p-4 dark:border-gray-700">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <TrendingDown className="h-3 w-3" />
                      Change
                    </div>
                    <p
                      className={`text-xl font-semibold ${
                        marketData.market_data.indicators.price_change_pct < 0
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {marketData.market_data.indicators.price_change_pct.toFixed(2)}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">5min</p>
                  </div>
                </div>

                {marketData.coaching_message && (
                  <div className="rounded-lg bg-blue-50 p-4 border border-blue-100 dark:bg-blue-950 dark:border-blue-900">
                    <p className="text-sm text-blue-900 dark:text-blue-200">
                      {marketData.coaching_message}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                Click &quot;Simulate 3% Drop&quot; to see market analysis
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {chartData && chartData.length > 0 && (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Historical Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-gray-700">
                      <th className="pb-2 text-left font-medium text-gray-500 dark:text-gray-400">
                        Time
                      </th>
                      <th className="pb-2 text-right font-medium text-gray-500 dark:text-gray-400">
                        Price
                      </th>
                      <th className="pb-2 text-right font-medium text-gray-500 dark:text-gray-400">
                        Volume
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.slice(-10).reverse().map((point, index) => (
                      <tr
                        key={index}
                        className="border-b dark:border-gray-700 last:border-0"
                      >
                        <td className="py-2 text-gray-900 dark:text-white">
                          {point.time}
                        </td>
                        <td className="py-2 text-right text-gray-900 dark:text-white">
                          {point.price.toFixed(5)}
                        </td>
                        <td className="py-2 text-right text-gray-900 dark:text-white">
                          {point.volume.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
