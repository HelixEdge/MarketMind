"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimulateButtonProps {
  onSimulateDrop: () => void;
  onSimulateRise: () => void;
  isLoading: boolean;
}

export function SimulateButton({ onSimulateDrop, onSimulateRise, isLoading }: SimulateButtonProps) {
  return (
    <div className="flex gap-2">
      <Button
        onClick={onSimulateDrop}
        disabled={isLoading}
        aria-busy={isLoading}
        size="lg"
        className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
      >
        {isLoading ? (
          <>
            <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" role="status" aria-label="Loading" />
            Analyzing...
          </>
        ) : (
          <>
            <TrendingDown className="h-5 w-5 mr-2" />
            Simulate 3% Drop
          </>
        )}
      </Button>
      <Button
        onClick={onSimulateRise}
        disabled={isLoading}
        aria-busy={isLoading}
        size="lg"
        className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
      >
        {isLoading ? (
          <>
            <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" role="status" aria-label="Loading" />
            Analyzing...
          </>
        ) : (
          <>
            <TrendingUp className="h-5 w-5 mr-2" />
            Simulate 8% Rise
          </>
        )}
      </Button>
    </div>
  );
}
