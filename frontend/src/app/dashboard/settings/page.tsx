"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Palette,
  TrendingUp,
  Key,
  Info,
  Moon,
  Sun,
  Monitor,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/providers/ThemeProvider";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const symbols = [
  { value: "EURUSD=X", label: "EUR/USD" },
  { value: "GBPUSD=X", label: "GBP/USD" },
  { value: "USDJPY=X", label: "USD/JPY" },
  { value: "BTC-USD", label: "BTC/USD" },
  { value: "ETH-USD", label: "ETH/USD" },
];

const riskTolerances = [
  { value: "conservative", label: "Conservative", description: "Lower risk, smaller positions" },
  { value: "moderate", label: "Moderate", description: "Balanced risk approach" },
  { value: "aggressive", label: "Aggressive", description: "Higher risk, larger positions" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [defaultSymbol, setDefaultSymbol] = useState("EURUSD=X");
  const [riskTolerance, setRiskTolerance] = useState("moderate");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem("defaultSymbol", defaultSymbol);
    localStorage.setItem("riskTolerance", riskTolerance);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Customize your trading analyst experience
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Choose your preferred color theme
              </p>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
                    theme === "light"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                  }`}
                >
                  <Sun
                    className={`h-6 w-6 ${
                      theme === "light" ? "text-blue-500" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      theme === "light"
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    Light
                  </span>
                  {theme === "light" && (
                    <Check className="h-4 w-4 text-blue-500" />
                  )}
                </button>

                <button
                  onClick={() => setTheme("dark")}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
                    theme === "dark"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                  }`}
                >
                  <Moon
                    className={`h-6 w-6 ${
                      theme === "dark" ? "text-blue-500" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      theme === "dark"
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    Dark
                  </span>
                  {theme === "dark" && (
                    <Check className="h-4 w-4 text-blue-500" />
                  )}
                </button>

                <button
                  onClick={() => setTheme("system")}
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors ${
                    theme === "system"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                  }`}
                >
                  <Monitor
                    className={`h-6 w-6 ${
                      theme === "system" ? "text-blue-500" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      theme === "system"
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    System
                  </span>
                  {theme === "system" && (
                    <Check className="h-4 w-4 text-blue-500" />
                  )}
                </button>
              </div>
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
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trading Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Symbol
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {symbols.map((sym) => (
                    <button
                      key={sym.value}
                      onClick={() => setDefaultSymbol(sym.value)}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                        defaultSymbol === sym.value
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600"
                      }`}
                    >
                      {sym.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Risk Tolerance
                </label>
                <div className="space-y-2">
                  {riskTolerances.map((risk) => (
                    <button
                      key={risk.value}
                      onClick={() => setRiskTolerance(risk.value)}
                      className={`w-full flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                        riskTolerance === risk.value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                          : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                      }`}
                    >
                      <div>
                        <p
                          className={`text-sm font-medium ${
                            riskTolerance === risk.value
                              ? "text-blue-700 dark:text-blue-300"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {risk.label}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {risk.description}
                        </p>
                      </div>
                      {riskTolerance === risk.value && (
                        <Check className="h-4 w-4 text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleSave} className="w-full">
                {saved ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  "Save Preferences"
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium dark:text-white">Backend API</span>
                  <Badge variant="success">Connected</Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                  {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}
                </p>
              </div>

              <div className="rounded-lg border p-4 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium dark:text-white">OpenAI API</span>
                  <Badge variant="secondary">Server-side</Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  API key is securely stored on the backend
                </p>
              </div>

              <div className="rounded-lg bg-amber-50 p-4 border border-amber-100 dark:bg-amber-950 dark:border-amber-900">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  API keys and sensitive configuration are managed through environment
                  variables on the server.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                About
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Application
                  </span>
                  <span className="text-sm font-medium dark:text-white">
                    Intelligent Trading Analyst
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Version
                  </span>
                  <Badge variant="outline">v1.0.0</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    AI Model
                  </span>
                  <span className="text-sm font-medium dark:text-white">
                    GPT-5-mini
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Built with
                  </span>
                  <span className="text-sm font-medium dark:text-white">
                    Next.js + FastAPI
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Market Intelligence + Behavioral Awareness + AI Personas
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
                  Built for Deriv AI Talent Sprint Hackathon
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
