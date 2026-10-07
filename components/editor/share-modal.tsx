"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { User, ShareItem } from "@/types";
import { getAvatarColor, getInitials } from "@/lib/utils";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  apiUrl: string;
  docId: string;
}

export function ShareModal({ isOpen, onClose, currentUser, apiUrl, docId }: ShareModalProps) {
  const [shareSearch, setShareSearch] = useState("");
  const [userSuggestions, setUserSuggestions] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [shareRoleSelect, setShareRoleSelect] = useState("VIEWER");
  const [currentShares, setCurrentShares] = useState<ShareItem[]>([]);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (!isOpen || !docId) return;

    fetch(`${apiUrl}/documents/${docId}/shares`, { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch shares");
      })
      .then((data) => {
        setCurrentShares(data.shares || []);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [isOpen, docId, apiUrl]);

  useEffect(() => {
    if (shareSearch.length < 2) {
      setUserSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(
          `${apiUrl}/users?email=${encodeURIComponent(shareSearch)}`,
          { credentials: "include" }
        );
        if (res.ok) {
          const users = await res.json();
          setUserSuggestions(users);
        }
      } catch (e) {
        console.error(e);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [shareSearch, apiUrl]);

  if (!isOpen) return null;

  const handleShareSubmit = async () => {
    if (!selectedUser) return;
    setIsSharing(true);
    try {
      const res = await fetch(`${apiUrl}/documents/${docId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: selectedUser.email, role: shareRoleSelect }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShareSearch("");
      setSelectedUser(null);

      const sharesRes = await fetch(`${apiUrl}/documents/${docId}/shares`, {
        credentials: "include",
      });
      if (sharesRes.ok) {
        const sharesData = await sharesRes.json();
        setCurrentShares(sharesData.shares || []);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const updateShareRole = async (email: string, newRole: string) => {
    try {
      const res = await fetch(`${apiUrl}/documents/${docId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update role");

      setCurrentShares((prev) =>
        prev.map((s) => (s.user.email === email ? { ...s, role: newRole } : s))
      );
    } catch (err) {
      console.error(err);
      alert("Error updating role");
    }
  };

  const removeShare = async (email: string) => {
    if (!window.confirm(`Remove access for ${email}?`)) return;
    try {
      const res = await fetch(
        `${apiUrl}/documents/${docId}/share?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error("Failed to remove share");

      setCurrentShares((prev) => prev.filter((s) => s.user.email !== email));
    } catch (err) {
      console.error(err);
      alert("Error removing access");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl w-full max-w-md p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Share document</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Invite collaborators to edit or view this document
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 mb-5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter collaborator email..."
                value={selectedUser ? selectedUser.email : shareSearch}
                onChange={(e) => {
                  setShareSearch(e.target.value);
                  if (selectedUser) setSelectedUser(null);
                }}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-app)] text-[var(--text-primary)] placeholder-[var(--text-faint)] outline-none focus:border-[var(--brand-primary)]"
              />

              {!selectedUser && userSuggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-[var(--bg-surface)] border border-[var(--border-color)] mt-1 rounded-lg shadow-md max-h-40 overflow-y-auto z-10 p-1">
                  {userSuggestions.map((u) => (
                    <div
                      key={u.id}
                      className="px-3 py-2 hover:bg-[var(--bg-subtle)] rounded text-xs cursor-pointer flex items-center justify-between"
                      onClick={() => {
                        setSelectedUser(u);
                        setUserSuggestions([]);
                        setShareSearch("");
                      }}
                    >
                      <span className="font-medium text-[var(--text-primary)]">
                        {u.name || u.email}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">{u.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <select
              value={shareRoleSelect}
              onChange={(e) => setShareRoleSelect(e.target.value)}
              className="bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-primary)] outline-none"
            >
              <option value="EDITOR">Can edit</option>
              <option value="VIEWER">Can view</option>
            </select>

            <button
              onClick={handleShareSubmit}
              disabled={!selectedUser || isSharing}
              className="px-3 py-1.5 rounded-lg bg-[var(--brand-primary)] text-[var(--brand-text)] text-xs font-medium hover:bg-[var(--brand-primary-hover)] transition-colors disabled:opacity-40 shrink-0"
            >
              {isSharing ? "Adding..." : "Invite"}
            </button>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
            People with access
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-subtle)] text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-[var(--brand-primary)] text-[var(--brand-text)] flex items-center justify-center text-[10px] font-medium shrink-0">
                  {getInitials(currentUser.name, currentUser.email)}
                </div>
                <div className="min-w-0">
                  <span className="font-medium text-[var(--text-primary)] truncate block">
                    {currentUser.name || currentUser.email}{" "}
                    <span className="text-[10px] text-[var(--text-muted)]">(You)</span>
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-[var(--text-muted)] font-medium">Owner</span>
            </div>

            {currentShares.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-subtle)] text-xs transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full ${getAvatarColor(i + 1)} flex items-center justify-center text-[10px] font-medium shrink-0`}
                  >
                    {getInitials(s.user.name, s.user.email)}
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-[var(--text-primary)] truncate block">
                      {s.user.name || s.user.email}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] truncate block">
                      {s.user.email}
                    </span>
                  </div>
                </div>

                <select
                  value={s.role}
                  onChange={(e) => {
                    if (e.target.value === "REMOVE") {
                      removeShare(s.user.email);
                    } else {
                      updateShareRole(s.user.email, e.target.value);
                    }
                  }}
                  className="bg-[var(--bg-app)] border border-[var(--border-color)] rounded px-2 py-1 text-xs text-[var(--text-primary)] outline-none"
                >
                  <option value="EDITOR">Editor</option>
                  <option value="VIEWER">Viewer</option>
                  <option value="REMOVE">Remove</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4 mt-4 border-t border-[var(--border-color)]">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
