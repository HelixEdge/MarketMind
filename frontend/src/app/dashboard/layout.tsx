"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { ChatProvider } from "@/components/providers/ChatProvider";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <ChatProvider>
        <div className="flex h-dvh bg-white dark:bg-gray-950">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Navbar onMenuToggle={() => setSidebarOpen(true)} />
            <main className="flex-1 overflow-auto bg-gray-100 p-4 sm:p-6 dark:bg-gray-950">
              {children}
            </main>
          </div>
          <ChatBubble />
        </div>
      </ChatProvider>
    </ProtectedRoute>
  );
}
