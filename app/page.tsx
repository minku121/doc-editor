"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";

import { User, Document } from "@/types";
import { AuthView } from "@/components/auth/auth-view";
import { DashboardView } from "@/components/dashboard/dashboard-view";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3200";

export default function Page() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  useEffect(() => {
    fetch(`${API_URL}/me`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setIsAuthLoading(false);
      });
  }, []);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/documents`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/logout`, { method: "POST", credentials: "include" });
      setUser(null);
      setDocuments([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDocument = async (title: string) => {
    const res = await fetch(`${API_URL}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      const doc = await res.json();
      setDocuments((prev) => [doc, ...prev]);
      router.push(`/editor?id=${encodeURIComponent(doc.id)}`);
    }
  };

  const handleDeleteDocument = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    try {
      const res = await fetch(`${API_URL}/documents/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");

      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting document");
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] animate-pulse">
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-sm text-[var(--text-muted)]">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthView onSuccess={setUser} apiUrl={API_URL} />;
  }

  return (
    <DashboardView
      user={user}
      documents={documents}
      onSelectDocument={(doc) =>
        router.push(`/editor?id=${encodeURIComponent(doc.id)}`)
      }
      onCreateDocument={handleCreateDocument}
      onDeleteDocument={handleDeleteDocument}
      onLogout={handleLogout}
    />
  );
}