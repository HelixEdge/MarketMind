"use client";

import { Bell, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/features/ThemeToggle";

interface NavbarProps {
  onMenuToggle?: () => void;
}

export function Navbar({ onMenuToggle }: NavbarProps) {
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
          Intelligent Trading Analyst
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="User profile">
          <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </Button>
      </div>
    </header>
  );
}
