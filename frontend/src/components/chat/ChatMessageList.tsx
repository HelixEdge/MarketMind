"use client";

import { useEffect, useRef } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import type { ChatMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  emptyStateHint?: string;
  className?: string;
  onSuggestionClick?: (suggestion: string) => void;
}

export function ChatMessageList({
  messages,
  isLoading,
  emptyStateHint = 'Try: "I just had 3 losses in a row, how should I think about this?"',
  className,
  onSuggestionClick,
}: ChatMessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className={cn("flex-1 overflow-y-auto p-4 space-y-4", className)}>
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-gray-500">
          <MessageCircle className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm">Start a conversation with your trading coach.</p>
          <p className="text-xs mt-1">{emptyStateHint}</p>
        </div>
      )}
      {messages.map((msg, i) => (
        <div key={i}>
          <div
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
              }`}
            >
              {msg.content}
            </div>
          </div>
          {msg.suggestions && msg.suggestions.length > 0 && (
            <div className="flex justify-start mt-3 flex-wrap gap-2 px-4">
              {msg.suggestions.map((suggestion, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-1.5 px-3 text-left whitespace-normal max-w-[200px] hover:bg-blue-50 dark:hover:bg-blue-950 dark:border-gray-600"
                  onClick={() => onSuggestionClick?.(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-start">
          <div className="flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-2.5 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking...
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}
