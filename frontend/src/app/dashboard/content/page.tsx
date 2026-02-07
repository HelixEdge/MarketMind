"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Copy,
  Check,
  Linkedin,
  Twitter,
  MessageSquare,
  PenTool,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { generateContent, generateAllContent } from "@/lib/api";
import type { ContentResponse, Persona, Platform } from "@/types";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const personaConfig: Record<
  Persona,
  { label: string; description: string; icon: React.ReactNode }
> = {
  calm_analyst: {
    label: "Calm Analyst",
    description: "Professional, measured tone with focus on clarity and objectivity",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  data_nerd: {
    label: "Data Nerd",
    description: "Technical focus with charts, statistics, and data-driven insights",
    icon: <PenTool className="h-5 w-5" />,
  },
  trading_coach: {
    label: "Trading Coach",
    description: "Supportive, educational tone with actionable advice",
    icon: <Sparkles className="h-5 w-5" />,
  },
};

const defaultMarketContext =
  "EUR/USD dropped 2.5% following unexpected Fed rate decision. RSI indicates oversold conditions at 28. Volume spike of 3x average suggests significant institutional activity.";

export default function ContentPage() {
  const [platform, setPlatform] = useState<Platform>("linkedin");
  const [marketContext, setMarketContext] = useState(defaultMarketContext);
  const [behaviorContext, setBehaviorContext] = useState("");
  const [contentData, setContentData] = useState<Record<Persona, ContentResponse> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPersona, setLoadingPersona] = useState<Persona | null>(null);
  const [copiedPersona, setCopiedPersona] = useState<Persona | null>(null);

  const handleGenerateAll = async () => {
    setIsLoading(true);
    try {
      const content = await generateAllContent(
        marketContext,
        platform,
        behaviorContext || undefined
      );
      setContentData(content);
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateOne = async (persona: Persona) => {
    setLoadingPersona(persona);
    try {
      const content = await generateContent(
        marketContext,
        persona,
        platform,
        behaviorContext || undefined
      );
      setContentData((prev) => (prev ? { ...prev, [persona]: content } : null));
    } catch (error) {
      console.error("Error regenerating content:", error);
    } finally {
      setLoadingPersona(null);
    }
  };

  const handleCopy = async (content: string, persona: Persona) => {
    await navigator.clipboard.writeText(content);
    setCopiedPersona(persona);
    setTimeout(() => setCopiedPersona(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Content Generator
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Create engaging social posts across multiple personas
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex rounded-lg border dark:border-gray-700 overflow-hidden">
            <Button
              variant={platform === "linkedin" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setPlatform("linkedin")}
            >
              <Linkedin className="h-4 w-4 mr-1" />
              LinkedIn
            </Button>
            <Button
              variant={platform === "twitter" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setPlatform("twitter")}
            >
              <Twitter className="h-4 w-4 mr-1" />
              Twitter
            </Button>
          </div>
          <Button onClick={handleGenerateAll} disabled={isLoading || !marketContext}>
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate All
              </>
            )}
          </Button>
        </div>
      </div>

      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Context Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Market Context
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                rows={3}
                placeholder="Describe the market situation..."
                value={marketContext}
                onChange={(e) => setMarketContext(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Behavior Context (Optional)
              </label>
              <textarea
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                rows={2}
                placeholder="Add trader behavior insights for more personalized content..."
                value={behaviorContext}
                onChange={(e) => setBehaviorContext(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {(Object.keys(personaConfig) as Persona[]).map((persona, index) => (
          <motion.div
            key={persona}
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
          >
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {personaConfig[persona].icon}
                    {personaConfig[persona].label}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {platform === "linkedin" ? "LinkedIn" : "Twitter"}
                  </Badge>
                </CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {personaConfig[persona].description}
                </p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {isLoading || loadingPersona === persona ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ) : contentData?.[persona] ? (
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 rounded-lg bg-gray-50 p-4 dark:bg-gray-800 mb-4">
                      <p className="text-sm whitespace-pre-wrap dark:text-white">
                        {contentData[persona].content}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {contentData[persona].hashtags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {contentData[persona].char_count} chars
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRegenerateOne(persona)}
                          disabled={loadingPersona !== null}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleCopy(contentData[persona].content, persona)
                          }
                        >
                          {copiedPersona === persona ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center py-8">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click &quot;Generate All&quot; to create content
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Platform Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Linkedin className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium dark:text-white">LinkedIn</h4>
                </div>
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <li>Max 3,000 characters</li>
                  <li>Professional, insightful tone</li>
                  <li>Industry hashtags</li>
                  <li>Thought leadership focus</li>
                </ul>
              </div>
              <div className="rounded-lg border p-4 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Twitter className="h-5 w-5 text-sky-500" />
                  <h4 className="font-medium dark:text-white">Twitter/X</h4>
                </div>
                <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                  <li>Max 280 characters</li>
                  <li>Concise, punchy style</li>
                  <li>Trending hashtags</li>
                  <li>Engagement focus</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
