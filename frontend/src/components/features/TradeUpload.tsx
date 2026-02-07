"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Trade {
  id: string;
  symbol: string;
  side: string;
  size: number;
  entry_price: number;
  exit_price: number | null;
  pnl: number | null;
  timestamp: string;
  closed_at: string | null;
}

interface TradeUploadProps {
  onUpload: (trades: Trade[]) => void;
  disabled?: boolean;
}

export function TradeUpload({ onUpload, disabled }: TradeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): Trade[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) throw new Error("CSV must have header and data rows");

    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const requiredFields = ["id", "symbol", "side", "size", "entry_price", "timestamp"];

    for (const field of requiredFields) {
      if (!header.includes(field)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    const trades: Trade[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      if (values.length !== header.length) continue;

      const row: Record<string, string> = {};
      header.forEach((h, idx) => {
        row[h] = values[idx];
      });

      trades.push({
        id: row.id || `t${i}`,
        symbol: row.symbol,
        side: row.side,
        size: parseFloat(row.size) || 0,
        entry_price: parseFloat(row.entry_price) || 0,
        exit_price: row.exit_price ? parseFloat(row.exit_price) : null,
        pnl: row.pnl ? parseFloat(row.pnl) : null,
        timestamp: row.timestamp,
        closed_at: row.closed_at || null,
      });
    }

    return trades;
  };

  const handleFile = (file: File) => {
    setError(null);

    if (!file.name.endsWith(".csv")) {
      setError("Please upload a CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const trades = parseCSV(text);
        setFileName(file.name);
        onUpload(trades);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse CSV");
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearFile = () => {
    setFileName(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleInputChange}
        className="hidden"
      />

      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors",
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
            : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {fileName ? (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium dark:text-white">{fileName}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <Upload className="mb-2 h-8 w-8 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drop your trades.csv or click to upload
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <FileText className="h-3 w-3" />
        <span>Required: id, symbol, side, size, entry_price, timestamp</span>
      </div>
    </div>
  );
}
