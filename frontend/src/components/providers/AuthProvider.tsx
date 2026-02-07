"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/types";
import { login as apiLogin, register as apiRegister, getMe } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On mount: check for existing token
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    getMe()
      .then((u) => {
        setUser(u);
        localStorage.setItem("auth_user", JSON.stringify(u));
      })
      .catch(() => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    localStorage.setItem("auth_token", res.access_token);
    localStorage.setItem("auth_user", JSON.stringify(res.user));
    setUser(res.user);
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    const res = await apiRegister(email, password, displayName);
    localStorage.setItem("auth_token", res.access_token);
    localStorage.setItem("auth_user", JSON.stringify(res.user));
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
