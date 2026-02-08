"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  MessageCircle,
  History,
  Eye,
  Settings,
  X,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Chat", href: "/dashboard/chat", icon: MessageCircle },
  { name: "History", href: "/dashboard/history", icon: History },
  { name: "Vision", href: "/dashboard/vision", icon: Eye },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Main navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-gray-200 bg-gray-50 transition-all duration-200 dark:border-gray-800 dark:bg-gray-900 md:static md:translate-x-0",
          collapsed ? "w-16" : "w-64",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className={cn(
          "flex h-16 items-center border-b border-gray-200 dark:border-gray-800",
          collapsed ? "justify-center px-2" : "justify-between px-6"
        )}>
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900">
              <TrendingUp className="h-5 w-5" />
            </div>
            {!collapsed && (
              <span className="font-semibold text-gray-900 dark:text-white">Trading Analyst</span>
            )}
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-200 md:hidden dark:hover:bg-gray-700"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className={cn("flex-1 space-y-1", collapsed ? "p-2" : "p-4")}>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                title={collapsed ? item.name : undefined}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center rounded-lg text-sm font-medium transition-colors",
                  collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
                  isActive
                    ? "bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && item.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop collapse toggle */}
        <div className={cn(
          "hidden border-t border-gray-200 dark:border-gray-800 md:flex",
          collapsed ? "justify-center p-2" : "px-4 py-2"
        )}>
          <button
            onClick={onToggleCollapse}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className={cn(
          "border-t border-gray-200 dark:border-gray-800",
          collapsed ? "p-2" : "p-4"
        )}>
          {user ? (
            <div className={cn(
              "flex items-center",
              collapsed ? "justify-center" : "justify-between"
            )}>
              {!collapsed && (
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              )}
              <button
                onClick={logout}
                title={collapsed ? "Logout" : undefined}
                className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            !collapsed && (
              <p className="text-xs text-gray-500 text-center dark:text-gray-400">
                Powered by Claude AI
              </p>
            )
          )}
        </div>
      </aside>
    </>
  );
}
