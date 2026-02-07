"use client";

import { cn } from "@/lib/utils";

const SYMBOLS = [
  { value: "EURUSD=X", label: "EUR/USD" },
  { value: "GBPUSD=X", label: "GBP/USD" },
  { value: "USDJPY=X", label: "USD/JPY" },
  { value: "BTC-USD", label: "BTC/USD" },
  { value: "ETH-USD", label: "ETH/USD" },
];

interface SymbolSelectorProps {
  value: string;
  onChange: (symbol: string) => void;
  disabled?: boolean;
}

export function SymbolSelector({
  value,
  onChange,
  disabled,
}: SymbolSelectorProps) {
  return (
    <div className="flex gap-2">
      {SYMBOLS.map((symbol) => (
        <button
          key={symbol.value}
          onClick={() => onChange(symbol.value)}
          disabled={disabled}
          className={cn(
            "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            value === symbol.value
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {symbol.label}
        </button>
      ))}
    </div>
  );
}
