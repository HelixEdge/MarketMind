"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { chat, type ChatMessage } from "@/lib/api";
import { Send, Trash2, User, Bot, Loader2 } from "lucide-react";

// IndexedDB helpers (small lightweight wrappers to persist chat history)
const DB_NAME = "marketmind-chat";
const DB_VERSION = 1;
const STORE_NAME = "messages";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not available in this environment"));
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function addMessageToDB(message: ChatMessage): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const entry = { ...message, timestamp: Date.now() } as any;
      store.add(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    // Fail silently to avoid breaking chat if IDB is unavailable
    console.warn("addMessageToDB failed", e);
  }
}

async function getAllMessagesFromDB(): Promise<ChatMessage[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = req.result || [];
        const mapped: ChatMessage[] = results.map((r: any) => ({
          role: r.role,
          content: r.content,
          timestamp: new Date(r.timestamp).toISOString(),
        }));
        resolve(mapped);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn("getAllMessagesFromDB failed", e);
    return [];
  }
}

async function clearMessagesDB(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn("clearMessagesDB failed", e);
  }
}

async function pruneMessagesInDB(limit = 30): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const items = req.result || [];
      if (items.length <= limit) return;
      // sort by timestamp ascending and delete oldest
      const sorted = items.sort((a: any, b: any) => a.timestamp - b.timestamp);
      const toDelete = sorted.slice(0, items.length - limit);
      toDelete.forEach((t: any) => store.delete(t.id));
    };
    req.onerror = () => {
      /* noop */
    };
  } catch (e) {
    console.warn("pruneMessagesInDB failed", e);
  }
}

export function ChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stored = await getAllMessagesFromDB();
        const last = stored.length > 30 ? stored.slice(-30) : stored;
        if (mounted) setMessages(last);
      } catch (e) {
        console.warn("Failed to load chat history", e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      try {
        await addMessageToDB(userMessage);
        await pruneMessagesInDB(30);
      } catch (e) {
        /* ignore */
      }

      const payload = await chat(newMessages);

      if (payload && payload.message) {
        const assistantMessage = payload.message;
        setMessages((m) => [...m, assistantMessage]);
        try {
          await addMessageToDB(assistantMessage);
          await pruneMessagesInDB(30);
        } catch (e) {
          /* ignore */
        }
      }
    } catch (err: any) {
      console.error("Chat error", err);
      setError(err?.message || "Unknown error");
      const fallback = {
        role: "assistant",
        content: "Sorry, I couldn't reach the chat service right now.",
      };
      setMessages((m) => [...m, fallback] as any);
      setIsLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const clearHistory = async () => {
    try {
      await clearMessagesDB();
      setMessages([]);
    } catch (e) {
      console.warn("clearHistory failed", e);
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-lg border border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">MarketMind AI</CardTitle>
              <div className="text-sm text-foreground">
                Ask about market moves, news, or get personalized coaching
              </div>
            </div>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void clearHistory()}
              disabled={isLoading}
              className="text-gray-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Chat
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div
          ref={messagesRef}
          className="h-96 p-4 space-y-4 overflow-y-auto bg-linear-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-900"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="h-16 w-16 rounded-full bg-linear-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Welcome to MarketMind AI
              </h3>
              <p className="text-foreground max-w-sm">
                Start a conversation by asking about market trends, news analysis, or investment strategies.
              </p>
              <div className="mt-6 text-sm text-foreground">
                Try asking: "What are today's market movers?" or "Explain the latest Fed decision"
              </div>
            </div>
          ) : (
            messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    m.role === "user"
                      ? "bg-linear-to-br from-indigo-500 to-blue-600"
                      : "bg-linear-to-br from-gray-700 to-gray-800"
                  }`}
                >
                  {m.role === "user" ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className={`max-w-[80%] ${m.role === "user" ? "text-right" : ""}`}>
                  <div className="text-xs font-medium text-foregroundmb-1 px-1">
                    {m.role === "user" ? "You" : "MarketMind AI"}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      m.role === "user"
                        ? "bg-linear-to-r from-indigo-500 to-blue-600 text-white rounded-br-none"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-none"
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3">
              <div className="shrink-0 h-8 w-8 rounded-full bg-linear-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 px-1">
                  MarketMind AI
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-none px-4 py-3 inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-foreground" />
                  <span className="text-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 border-t border-gray-100 dark:border-gray-800 bg-background">
        <div className="w-full space-y-3">
          {error && (
            <div className="text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg px-4 py-2 flex items-center">
              <svg
                className="h-4 w-4 mr-2 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type your message here... (Shift+Enter for new line)"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-background px-4 py-3 pr-12 text-sm resize-none min-h-[56px] max-h-32 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent placeholder:text-gray-400"
                disabled={isLoading}
                rows={2}
              />
              <div className="absolute right-3 bottom-3">
                <button
                  onClick={() => void sendMessage()}
                  disabled={isLoading || !input.trim()}
                  className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${
                    input.trim()
                      ? "bg-linear-to-r from-indigo-500 to-blue-600 text-white hover:shadow-lg"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="text-xs text-foreground text-center">
            MarketMind AI can make mistakes. Consider verifying important information.
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}