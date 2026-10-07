"use client";

import { useState, FormEvent } from "react";
import { useTheme } from "next-themes";
import { FileText, Sun, Moon, Eye, EyeOff } from "lucide-react";
import { User } from "@/types";

interface AuthViewProps {
  onSuccess: (user: User) => void;
  apiUrl: string;
}

export function AuthView({ onSuccess, apiUrl }: AuthViewProps) {
  const { theme, setTheme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmitting(true);
    const endpoint = isLogin ? "/login" : "/register";

    try {
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed");
      onSuccess(data.user);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAuthError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[var(--bg-app)]">
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-4 right-4 p-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
        title="Toggle theme"
      >
        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <div className="w-full max-w-[360px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] mb-3 shadow-xs">
            <FileText className="w-5 h-5 text-[var(--text-primary)]" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
            NexusDocs
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Collaborative document editor
          </p>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl p-6 shadow-xs">
          <div className="flex border-b border-[var(--border-color)] mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setAuthError("");
              }}
              className={`flex-1 pb-2.5 text-xs font-medium border-b-2 transition-colors ${
                isLogin
                  ? "border-[var(--text-primary)] text-[var(--text-primary)] font-semibold"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setAuthError("");
              }}
              className={`flex-1 pb-2.5 text-xs font-medium border-b-2 transition-colors ${
                !isLogin
                  ? "border-[var(--text-primary)] text-[var(--text-primary)] font-semibold"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              Create account
            </button>
          </div>

          {authError && (
            <div className="mb-4 p-2.5 rounded-lg bg-[var(--danger-subtle)] border border-[var(--danger-border)] text-[var(--danger)] text-xs">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  required={!isLogin}
                  placeholder="Alex Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-faint)] outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-faint)] outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-9 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder-[var(--text-faint)] outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-[var(--brand-text)] text-xs font-medium transition-colors shadow-xs disabled:opacity-50"
            >
              {isSubmitting
                ? "Processing..."
                : isLogin
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
