"use client";

import { useTheme } from "next-themes";
import { FileText, Sun, Moon, LogOut } from "lucide-react";
import { User } from "@/types";
import { getInitials } from "@/lib/utils";

interface SidebarProps {
  user: User;
  documentCount: number;
  onLogout: () => void;
}

export function Sidebar({ user, documentCount, onLogout }: SidebarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <aside className="w-64 bg-[var(--bg-surface)] border-r border-[var(--border-color)] flex flex-col shrink-0">
      <div className="h-14 flex items-center px-4 gap-2.5 border-b border-[var(--border-color)]">
        <div className="w-7 h-7 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)]">
          <FileText className="w-4 h-4" />
        </div>
        <span className="text-sm font-semibold text-[var(--text-primary)]">NexusDocs</span>
      </div>

      <div className="flex-1 p-3 space-y-1">
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-subtle)] text-[var(--text-primary)] text-xs font-medium">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
            <span>Documents</span>
          </div>
          <span className="text-[11px] font-mono text-[var(--text-muted)] bg-[var(--bg-muted)] px-1.5 py-0.5 rounded">
            {documentCount}
          </span>
        </div>
      </div>

      <div className="p-3 border-t border-[var(--border-color)]">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-subtle)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[var(--brand-primary)] text-[var(--brand-text)] flex items-center justify-center text-[10px] font-medium shrink-0">
              {getInitials(user.name, user.email)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-[var(--text-primary)] truncate">
                {user.name || user.email}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] truncate">{user.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onLogout}
              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--bg-muted)] transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
