"use client";

import { MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChat } from "@/components/providers/ChatProvider";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatInput } from "@/components/chat/ChatInput";

export default function ChatPage() {
  const { messages, isLoading, sendMessage } = useChat();

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trading Coach</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Chat with your AI trading coach about mindset, discipline, and patterns
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardHeader className="border-b border-gray-200 dark:border-gray-800">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-5 w-5 text-orange-500" />
            Coach Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
          <ChatMessageList messages={messages} isLoading={isLoading} onSuggestionClick={sendMessage} />
          <ChatInput onSend={sendMessage} isLoading={isLoading} autoFocus />
        </CardContent>
      </Card>
    </div>
  );
}
