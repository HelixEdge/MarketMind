"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageCircle, X, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@/components/providers/ChatProvider";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";

export function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { messages, isLoading, sendMessage } = useChat();

  if (pathname === "/dashboard/chat") return null;

  return (
    <>
      {/* Expandable Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 flex h-[480px] w-[380px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
            role="dialog"
            aria-label="Trading Coach chat"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  Trading Coach
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  href="/dashboard/chat"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  aria-label="Open full chat page"
                >
                  <Maximize2 className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  aria-label="Close chat panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <ChatMessageList
              messages={messages}
              isLoading={isLoading}
              emptyStateHint='Try: "How do I stay disciplined after a loss?"'
              className="text-sm"
              onSuggestionClick={sendMessage}
            />

            {/* Input */}
            <ChatInput onSend={sendMessage} isLoading={isLoading} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700 active:scale-95"
        aria-label="Toggle trading coach chat"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </>
  );
}
