"use client";

import { createContext, useContext, useState, useRef, useCallback } from "react";
import { chat, type ChatMessage } from "@/lib/api";

const SYSTEM_PROMPT = `You are a supportive, experienced trading coach. You help traders understand their emotions, patterns, and decisions. You never give financial advice, predictions, or signals. You focus on:
- Emotional awareness and mindset
- Pattern recognition in trading behavior
- Discipline and risk management principles
- Celebrating healthy habits and growth
Keep responses concise (2-4 sentences). Be warm, direct, and empowering.`;

interface ChatContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  addSuggestions: (marketContext: string, behaviorContext?: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef<ChatMessage[]>([]);
  const isLoadingRef = useRef(false);

  messagesRef.current = messages;
  isLoadingRef.current = isLoading;

  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoadingRef.current) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const updatedMessages = [...messagesRef.current, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const apiMessages: ChatMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...updatedMessages,
      ];
      const response = await chat(apiMessages, undefined, 300);
      setMessages((prev) => [...prev, response.message]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant" as const,
          content: "Sorry, I couldn't connect to the coaching service. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const addSuggestions = useCallback(async (marketContext: string, behaviorContext?: string) => {
    // Generate 2-3 contextual suggestions based on market and behavior
    const suggestions: string[] = [];

    // Market-based suggestion
    if (marketContext.toLowerCase().includes("drop")) {
      suggestions.push("How do I handle losses emotionally?");
    } else if (marketContext.toLowerCase().includes("rise")) {
      suggestions.push("How do I manage greed when markets are rising?");
    } else {
      suggestions.push("What should I focus on now?");
    }

    // Behavior-based suggestions
    if (behaviorContext) {
      if (behaviorContext.toLowerCase().includes("revenge")) {
        suggestions.push("How can I avoid revenge trading?");
      } else if (behaviorContext.toLowerCase().includes("streak")) {
        suggestions.push("How do I stay disciplined after a winning streak?");
      } else {
        suggestions.push("What patterns should I be aware of?");
      }
    } else {
      suggestions.push("Can you analyze my trading patterns?");
    }

    // Add a third generic suggestion
    suggestions.push("What's the best way to improve my trading mindset?");

    // Add assistant message with suggestions
    const suggestionMessage: ChatMessage = {
      role: "assistant",
      content: "Here are some topics we can discuss based on your current market and trading analysis:",
      suggestions: suggestions.slice(0, 3),
    };

    setMessages((prev) => [...prev, suggestionMessage]);
  }, []);

  return (
    <ChatContext.Provider value={{ messages, isLoading, sendMessage, clearMessages, addSuggestions }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
