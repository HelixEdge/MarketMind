"use client";

import { Bell, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/features/ThemeToggle";
import { useAuth } from "@/components/providers/AuthProvider";

interface NavbarProps {
  onMenuToggle?: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuToggle}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </Button>
        <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
          MarketMind
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </Button>
        {user && (
          <>
            <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-300 sm:inline">
              {user.display_name}
            </span>
            <Button variant="ghost" size="icon" aria-label="Logout" onClick={logout}>
              <LogOut className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
