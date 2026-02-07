"use client";

import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimulateButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export function SimulateButton({ onClick, isLoading }: SimulateButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      size="lg"
      className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
    >
      {isLoading ? (
        <>
          <div className="h-5 w-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Analyzing...
        </>
      ) : (
        <>
          <Zap className="h-5 w-5 mr-2" />
          Simulate 3% Drop
        </>
      )}
    </Button>
  );
}
