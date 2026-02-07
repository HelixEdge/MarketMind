"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, Loader2, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, displayName);
        toast.success("Account created!");
      } else {
        await login(email, password);
        toast.success("Welcome back!");
      }
      router.push("/dashboard/vision");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <Card className="w-full max-w-md border-gray-800 bg-gray-900/80 backdrop-blur">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow">
            <TrendingUp className="h-6 w-6 text-gray-900" />
          </div>
          <CardTitle className="text-xl text-white">
            {isRegister ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {isRegister
              ? "Sign up to save your analysis and chat history"
              : "Sign in to your trading analyst"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label htmlFor="displayName" className="mb-1 block text-sm font-medium text-gray-300">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Your name"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-white text-gray-900 hover:bg-gray-100">
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isRegister ? "Create Account" : "Sign In"}
            </Button>
          </form>
          {!isRegister && (
            <div className="mt-3">
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-gray-900 px-2 text-gray-500">or</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEmail("demo@trader.com");
                  setPassword("demo1234");
                }}
                className="w-full border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Use Demo Account
              </Button>
            </div>
          )}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              {isRegister
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
