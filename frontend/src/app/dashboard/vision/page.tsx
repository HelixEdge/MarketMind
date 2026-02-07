"use client";

import { TrendingUp, Brain, Sparkles, Target, ShieldCheck, HeartHandshake, Ban } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const constraints = [
  { label: "No predictions", icon: Ban },
  { label: "No signals", icon: Ban },
  { label: "Supportive only", icon: HeartHandshake },
  { label: "Brand-safe", icon: ShieldCheck },
];

const pillars = [
  {
    title: "Market Intelligence",
    icon: TrendingUp,
    color: "blue",
    description:
      "Real-time market analysis with RSI, ATR, and volume indicators. AI-powered explanations of market moves — not predictions.",
  },
  {
    title: "Behavior Engine",
    icon: Brain,
    color: "purple",
    description:
      "Detect loss streaks, revenge trading, and oversizing patterns. Personalized coaching messages that help you stay disciplined.",
  },
  {
    title: "Content Generator",
    icon: Sparkles,
    color: "amber",
    description:
      "Three distinct personas for social posts. LinkedIn and X optimised. One-click copy to share trusted market insights.",
  },
];

const problems = [
  {
    title: "Market Understanding",
    quotes: [
      "Price dropped 5% — I don't know why.",
      "Too much info, I don't know what matters.",
      "No Bloomberg terminal, just Twitter.",
    ],
  },
  {
    title: "Behaviour Awareness",
    quotes: [
      "Didn't realise I was on a losing streak.",
      "I revenge trade but never notice until too late.",
      "In the moment, I don't know I'm being emotional.",
    ],
  },
  {
    title: "Content Creation",
    quotes: [
      "No time to write quality insights.",
      "Don't trust most market voices online.",
    ],
  },
];

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-500/20", text: "text-blue-400" },
  purple: { bg: "bg-purple-500/20", text: "text-purple-400" },
  amber: { bg: "bg-amber-500/20", text: "text-amber-400" },
};

export default function VisionPage() {
  return (
    <div className="space-y-10 pb-8">
      {/* ── Mission ────────────────────────────────────────── */}
      <section className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg dark:bg-gray-800">
          <Target className="h-7 w-7 text-gray-900 dark:text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Our Vision</h1>
        <p className="mx-auto mt-3 max-w-2xl text-lg text-gray-500 dark:text-gray-400">
          Use GenAI to help traders <strong className="text-gray-700 dark:text-gray-200">understand market moves</strong>,{" "}
          <strong className="text-gray-700 dark:text-gray-200">analyse their own behaviour</strong>, and{" "}
          <strong className="text-gray-700 dark:text-gray-200">share trusted content</strong> that builds community.
        </p>
        <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
          Inspired by how pros have analyst teams and trading coaches. Retail traders have Google — we fix that.
        </p>
      </section>

      {/* ── The Problem ────────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">The Problem</h2>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Retail traders face three gaps that platforms ignore:
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {problems.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900/50"
            >
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">{p.title}</h3>
              <ul className="space-y-2">
                {p.quotes.map((q, i) => (
                  <li key={i} className="text-sm italic text-gray-500 dark:text-gray-400">
                    &ldquo;{q}&rdquo;
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
          Platforms help you click buttons — not think. We change that.
        </p>
      </section>

      {/* ── Our Approach ───────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Our Approach</h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          We are explain-only. No predictions, no trading signals. Just supportive, brand-safe insights
          powered by AI that help you make better decisions on your own.
        </p>
        <div className="flex flex-wrap gap-2">
          {constraints.map((c) => (
            <Badge
              key={c.label}
              variant="success"
              className="gap-1 bg-green-500/20 text-green-400 border-green-500/30"
            >
              <c.icon className="h-3 w-3" />
              {c.label}
            </Badge>
          ))}
        </div>
      </section>

      {/* ── The Three Pillars ──────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">The Three Pillars</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map((p) => {
            const colors = colorMap[p.color];
            return (
              <div
                key={p.title}
                className="rounded-2xl bg-white/5 p-8 backdrop-blur border border-gray-200 dark:border-gray-800"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg}`}
                >
                  <p.icon className={`h-6 w-6 ${colors.text}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {p.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{p.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── One-Liner ──────────────────────────────────────── */}
      <section className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Bloomberg Terminal + Trading Coach + Ghostwriter &rarr; one AI analyst.
        </p>
      </section>
    </div>
  );
}
