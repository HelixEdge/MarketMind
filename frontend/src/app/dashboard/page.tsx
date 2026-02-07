"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useChat } from "@/components/providers/ChatProvider";
import { useSessionState } from "@/hooks/useSessionState";
import { MarketCard } from "@/components/cards/MarketCard";
import { BehaviorCard } from "@/components/cards/BehaviorCard";
import { InsightCard } from "@/components/cards/InsightCard";
import { ContentCard } from "@/components/cards/ContentCard";
import { PriceChart } from "@/components/charts/PriceChart";
import { SimulateButton } from "@/components/features/SimulateButton";
import { SymbolSelector } from "@/components/features/SymbolSelector";
import {
  getMarketData,
  getBehaviorAnalysis,
  getCoachingInsight,
  generateAllContent,
  getChartData,
  type ChartDataPoint,
  type TradeData,
} from "@/lib/api";
import type {
  MarketResponse,
  BehaviorResponse,
  InsightResponse,
  ContentResponse,
  Persona,
  Platform,
} from "@/types";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function DashboardPage() {
  // Per-stage loading flags (transient — not persisted)
  const [isSimulating, setIsSimulating] = useState(false);
  const [marketLoading, setMarketLoading] = useState(false);
  const [insightLoading, setInsightLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);

  // Persisted data state (survives navigation)
  const [symbol, setSymbol] = useSessionState("dash_symbol", "EURUSD=X");
  const [marketData, setMarketData] = useSessionState<MarketResponse | null>("dash_market", null);
  const [behaviorData, setBehaviorData] = useSessionState<BehaviorResponse | null>("dash_behavior", null);
  const [insightData, setInsightData] = useSessionState<InsightResponse | null>("dash_insight", null);
  const [chartData, setChartData] = useSessionState<ChartDataPoint[] | null>("dash_chart", null);
  const [allContentData, setAllContentData] = useSessionState<Record<Platform, Record<Persona, ContentResponse>> | null>("dash_content", null);
  const [platform, setPlatform] = useSessionState<Platform>("dash_platform", "linkedin");

  // Not persisted (potentially large file data)
  const [customTrades, setCustomTrades] = useState<TradeData[] | null>(null);
  const { addSuggestions } = useChat();

  // Get current content data based on selected platform
  const contentData = allContentData && platform ? allContentData[platform] : null;

  const handleSimulate = async (mode: "drop" | "rise" = "drop") => {
    setIsSimulating(true);
    setMarketLoading(true);
    setInsightLoading(true);
    setContentLoading(true);

    // Clear stale insight/content so old data doesn't linger
    setInsightData(null);
    setAllContentData(null);

    const simulateDrop = mode === "drop";
    const simulateRise = mode === "rise";
    try {
      // Step 1 + 2: Get market data, behavior analysis, and chart in parallel
      const [market, behavior, chart] = await Promise.all([
        getMarketData(symbol, simulateDrop, simulateRise),
        getBehaviorAnalysis(customTrades || undefined),
        getChartData(symbol, simulateDrop, simulateRise),
      ]);

      setMarketData(market);
      setBehaviorData(behavior);
      setChartData(chart.data);
      setMarketLoading(false); // Chart, market, behavior cards reveal

      // Construct contexts for Step 3
      const marketContext = `${market.market_data.symbol} ${
        market.market_data.change_pct < 0 ? "dropped" : "rose"
      } ${Math.abs(market.market_data.change_pct).toFixed(1)}%. ${
        market.explanation
      }`;
      const behaviorContext =
        behavior.patterns.length > 0 ? behavior.summary : undefined;

      // Step 3: Get coaching insight (fuses X + Y)
      const insight = await getCoachingInsight(marketContext, behaviorContext);
      setInsightData(insight);
      setInsightLoading(false); // Insight card reveals

      // Steps 4+5: Generate content for both platforms in parallel
      const platforms: Platform[] = ["linkedin", "x"];

      // Generate content for each platform
      const allPlatformContent = await Promise.all(
        platforms.map((pl) =>
          generateAllContent(
            marketContext,
            pl,
            behaviorContext,
            insight.coaching_insight,
          )
        )
      );

      // Store all content organized by platform
      const contentByPlatform: Record<Platform, Record<Persona, ContentResponse>> = {
        linkedin: allPlatformContent[0],
        x: allPlatformContent[1],
      };
      setAllContentData(contentByPlatform);
      setContentLoading(false); // Content card reveals

      // Add suggestions to chat based on market and behavior context
      await addSuggestions(marketContext, behaviorContext);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Analysis failed", {
        description: error instanceof Error ? error.message : "Could not reach the server. Please try again.",
      });
    } finally {
      setIsSimulating(false);
      setMarketLoading(false);
      setInsightLoading(false);
      setContentLoading(false);
    }
  };

  const handlePlatformChange = (newPlatform: Platform) => {
    // Platform change only affects display - content is pre-generated for both platforms
    // Auto-switches to the platform-specific content with its tone (Pro for LinkedIn, Punchy for X)
    setPlatform(newPlatform);
  };



  const handleTradesUpload = (trades: TradeData[]) => {
    setCustomTrades(trades);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Trading Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            AI-powered market intelligence and behavior analysis
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SymbolSelector
            value={symbol}
            onChange={setSymbol}
            disabled={isSimulating}
          />
          <SimulateButton
            onSimulateDrop={() => handleSimulate("drop")}
            onSimulateRise={() => handleSimulate("rise")}
            isLoading={isSimulating}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="chart"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.3 }}
        >
          <PriceChart
            data={chartData}
            symbol={symbol.replace("=X", "").replace("-", "/")}
            isLoading={marketLoading}
          />
        </motion.div>
      </AnimatePresence>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnimatePresence mode="wait">
          <motion.div
            key="market"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <MarketCard data={marketData} isLoading={marketLoading} />
          </motion.div>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.div
            key="behavior"
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <BehaviorCard
              data={behaviorData}
              isLoading={marketLoading}
              onTradesUpload={handleTradesUpload}
              hasCustomTrades={customTrades !== null}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step 3: Coaching insight — "Market did X, you tend to Y" */}
      <AnimatePresence mode="wait">
        <motion.div
          key="insight"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <InsightCard data={insightData} isLoading={insightLoading} />
        </motion.div>
      </AnimatePresence>

      {/* Steps 4+5+6: Content generation with reframing + share */}
      <AnimatePresence mode="wait">
        <motion.div
          key="content"
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <ContentCard
            data={contentData}
            isLoading={contentLoading}
            platform={platform}
            onPlatformChange={handlePlatformChange}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
