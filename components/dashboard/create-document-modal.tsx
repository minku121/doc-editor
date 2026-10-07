"use client";

import { useState, FormEvent } from "react";
import { X } from "lucide-react";

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string) => Promise<void>;
}

export function CreateDocumentModal({ isOpen, onClose, onCreate }: CreateDocumentModalProps) {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreate(title.trim());
      setTitle("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl w-full max-w-sm p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">New document</h3>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
              Document title
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Project Proposal, Meeting Notes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-app)] text-[var(--text-primary)] placeholder-[var(--text-faint)] outline-none focus:border-[var(--brand-primary)]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-lg bg-[var(--brand-primary)] text-[var(--brand-text)] text-xs font-medium hover:bg-[var(--brand-primary-hover)] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
