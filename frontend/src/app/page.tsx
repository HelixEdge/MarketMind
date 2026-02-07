import Link from "next/link";
import { TrendingUp, Brain, Sparkles, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <div className="mb-8 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">
              <TrendingUp className="h-9 w-9 text-gray-900" />
            </div>
          </div>

          <h1 className="mb-4 text-5xl font-bold tracking-tight text-white">
            Intelligent Trading Analyst
          </h1>
          <p className="mb-8 text-xl text-gray-300">
            Bloomberg terminal + trading coach + ghostwriter — one AI analyst in
            your browser
          </p>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-gray-900 shadow-lg transition-transform hover:scale-105"
          >
            Open Dashboard
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="mt-24 grid gap-8 md:grid-cols-3">
          <div className="rounded-2xl bg-white/5 p-8 backdrop-blur">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              Market Intelligence
            </h3>
            <p className="text-gray-400">
              Real-time market analysis with RSI, ATR, and volume indicators.
              AI-powered explanations of market moves.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 p-8 backdrop-blur">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
              <Brain className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              Behavior Engine
            </h3>
            <p className="text-gray-400">
              Detect loss streaks, revenge trading, and oversizing patterns.
              Personalized coaching messages.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 p-8 backdrop-blur">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
              <Sparkles className="h-6 w-6 text-amber-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              Content Generator
            </h3>
            <p className="text-gray-400">
              Three distinct personas for social posts. LinkedIn and Twitter
              optimized. One-click copy to clipboard.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            Powered by Claude AI — No predictions, no signals, just insights
          </p>
        </div>
      </div>
    </div>
  );
}
