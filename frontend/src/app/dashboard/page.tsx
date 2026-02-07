"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MarketCard } from "@/components/cards/MarketCard";
import { BehaviorCard } from "@/components/cards/BehaviorCard";
import { ContentCard } from "@/components/cards/ContentCard";
import { PriceChart } from "@/components/charts/PriceChart";
import { SimulateButton } from "@/components/features/SimulateButton";
import { SymbolSelector } from "@/components/features/SymbolSelector";
import { ChatBot } from "@/components/features/ChatBot";
import { Modal } from "@/components/ui/Modal";
import { MessageSquare } from "lucide-react";
import {
  getMarketData,
  getBehaviorAnalysis,
  generateAllContent,
  getChartData,
  type ChartDataPoint,
  type TradeData,
} from "@/lib/api";
import type {
  MarketResponse,
  BehaviorResponse,
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
  const [isLoading, setIsLoading] = useState(false);
  const [symbol, setSymbol] = useState("EURUSD=X");
  const [marketData, setMarketData] = useState<MarketResponse | null>(null);
  const [behaviorData, setBehaviorData] = useState<BehaviorResponse | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[] | null>(null);
  const [contentData, setContentData] = useState<Record<Persona, ContentResponse> | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [platform, setPlatform] = useState<Platform>("linkedin");
  const [customTrades, setCustomTrades] = useState<TradeData[] | null>(null);

  const handleSimulate = async () => {
    setIsLoading(true);
    try {
      const [market, behavior, chart] = await Promise.all([
        getMarketData(true, symbol),
        getBehaviorAnalysis(customTrades || undefined),
        getChartData(true, symbol),
      ]);

      setMarketData(market);
      setBehaviorData(behavior);
      setChartData(chart.data);

      const marketContext = `${market.market_data.symbol} ${
        market.market_data.change_pct < 0 ? "dropped" : "rose"
      } ${Math.abs(market.market_data.change_pct).toFixed(1)}%. ${
        market.explanation
      }`;
      const behaviorContext =
        behavior.patterns.length > 0 ? behavior.summary : undefined;

      const content = await generateAllContent(
        marketContext,
        platform,
        behaviorContext
      );
      setContentData(content);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlatformChange = async (newPlatform: Platform) => {
    setPlatform(newPlatform);

    if (marketData) {
      setIsLoading(true);
      try {
        const marketContext = `${marketData.market_data.symbol} ${
          marketData.market_data.change_pct < 0 ? "dropped" : "rose"
        } ${Math.abs(marketData.market_data.change_pct).toFixed(1)}%. ${
          marketData.explanation
        }`;
        const behaviorContext =
          behaviorData && behaviorData.patterns.length > 0
            ? behaviorData.summary
            : undefined;

        const content = await generateAllContent(
          marketContext,
          newPlatform,
          behaviorContext
        );
        setContentData(content);
      } catch (error) {
        console.error("Error regenerating content:", error);
      } finally {
        setIsLoading(false);
      }
    }
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
            disabled={isLoading}
          />
          <SimulateButton onClick={handleSimulate} isLoading={isLoading} />
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
            isLoading={isLoading}
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
            <MarketCard data={marketData} isLoading={isLoading} />
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
              isLoading={isLoading}
              onTradesUpload={handleTradesUpload}
              hasCustomTrades={customTrades !== null}
            />
          </motion.div>
        </AnimatePresence>
      </div>

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
            isLoading={isLoading}
            platform={platform}
            onPlatformChange={handlePlatformChange}
          />
        </motion.div>
      </AnimatePresence>

      {/* Chat modal trigger */}
      <div className="fixed right-6 bottom-6 z-40">
        <button
          onClick={() => setShowChatModal(true)}
          className="h-12 w-12 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 flex items-center justify-center"
          aria-label="Open chat"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
      </div>

      {/* Chat modal */}
      <Modal isOpen={showChatModal} onClose={() => setShowChatModal(false)} title="MarketMind Chat">
        <ChatBot />
      </Modal>
    </div>
  );
}
