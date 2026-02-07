"use client";

import { useEffect, useState } from "react";
import { MessageCircle, FileText, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getChatHistory, clearChatHistory, getContentHistory } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ChatHistoryItem, ContentHistoryItem } from "@/types";

export default function HistoryPage() {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [contentHistory, setContentHistory] = useState<ContentHistoryItem[]>([]);
  const [loadingChat, setLoadingChat] = useState(true);
  const [loadingContent, setLoadingContent] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    getChatHistory()
      .then(setChatHistory)
      .catch(() => toast.error("Failed to load chat history"))
      .finally(() => setLoadingChat(false));

    getContentHistory()
      .then(setContentHistory)
      .catch(() => toast.error("Failed to load content history"))
      .finally(() => setLoadingContent(false));
  }, []);

  const handleClearChat = async () => {
    setClearing(true);
    try {
      await clearChatHistory();
      setChatHistory([]);
      toast.success("Chat history cleared");
    } catch {
      toast.error("Failed to clear chat history");
    } finally {
      setClearing(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const personaLabel = (p: string) =>
    p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">History</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          View your past conversations and generated content
        </p>
      </div>

      <Tabs defaultValue="chat">
        <TabsList>
          <TabsTrigger value="chat">
            <MessageCircle className="mr-1.5 h-4 w-4" />
            Chat History
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileText className="mr-1.5 h-4 w-4" />
            Content History
          </TabsTrigger>
        </TabsList>

        {/* ── Chat History Tab ──────────────────────────────── */}
        <TabsContent value="chat">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {chatHistory.length} message{chatHistory.length !== 1 && "s"}
            </p>
            {chatHistory.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearChat}
                disabled={clearing}
                className="border-red-800 text-red-400 hover:bg-red-900/30 hover:text-red-300"
              >
                {clearing ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                )}
                Clear Chat History
              </Button>
            )}
          </div>

          {loadingChat ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : chatHistory.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-800 dark:bg-gray-900/50">
              <MessageCircle className="mx-auto mb-3 h-10 w-10 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">No chat history yet</p>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                Start a conversation in the Chat tab to see messages here
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
              {chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 rounded-lg p-3 ${
                    msg.role === "user"
                      ? "bg-blue-500/10"
                      : msg.role === "assistant"
                      ? "bg-gray-100 dark:bg-gray-800/50"
                      : "bg-amber-500/10"
                  }`}
                >
                  <Badge
                    variant={
                      msg.role === "user"
                        ? "default"
                        : msg.role === "assistant"
                        ? "secondary"
                        : "warning"
                    }
                    className="h-fit shrink-0 text-[10px]"
                  >
                    {msg.role}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
                      {msg.content}
                    </p>
                    {msg.timestamp && (
                      <p className="mt-1 text-[10px] text-gray-400">
                        {formatDate(msg.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Content History Tab ──────────────────────────── */}
        <TabsContent value="content">
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            {contentHistory.length} post{contentHistory.length !== 1 && "s"} generated
          </p>

          {loadingContent ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : contentHistory.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-800 dark:bg-gray-900/50">
              <FileText className="mx-auto mb-3 h-10 w-10 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">No content generated yet</p>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                Use the Content Generator on the Dashboard to create posts
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {contentHistory.map((item) => (
                <Card
                  key={item.id}
                  className="border-gray-200 dark:border-gray-800 dark:bg-gray-900/50"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">
                        {personaLabel(item.persona)}
                      </CardTitle>
                      <Badge variant="secondary" className="text-[10px]">
                        {item.platform}
                      </Badge>
                    </div>
                    {item.created_at && (
                      <p className="text-[10px] text-gray-400">
                        {formatDate(item.created_at)}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                      {item.content}
                    </p>
                    {item.hashtags && item.hashtags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.hashtags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] text-blue-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
