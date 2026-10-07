"use client";

import { useState, useRef, FormEvent, ChangeEvent } from "react";
import { X, Upload } from "lucide-react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (src: string) => void;
}

export function ImageModal({ isOpen, onClose, onInsertImage }: ImageModalProps) {
  const [imageTab, setImageTab] = useState<"url" | "upload">("url");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleUrlSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (imageUrlInput.trim()) {
      onInsertImage(imageUrlInput.trim());
      setImageUrlInput("");
      onClose();
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onInsertImage(reader.result);
          setImageUrlInput("");
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl w-full max-w-sm p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Insert image</h3>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex border-b border-[var(--border-color)] mb-4">
          <button
            type="button"
            onClick={() => setImageTab("url")}
            className={`flex-1 pb-2 text-xs font-medium border-b-2 transition-colors ${
              imageTab === "url"
                ? "border-[var(--text-primary)] text-[var(--text-primary)]"
                : "border-transparent text-[var(--text-muted)]"
            }`}
          >
            From URL
          </button>
          <button
            type="button"
            onClick={() => setImageTab("upload")}
            className={`flex-1 pb-2 text-xs font-medium border-b-2 transition-colors ${
              imageTab === "upload"
                ? "border-[var(--text-primary)] text-[var(--text-primary)]"
                : "border-transparent text-[var(--text-muted)]"
            }`}
          >
            Upload file
          </button>
        </div>

        {imageTab === "url" ? (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                Image web URL
              </label>
              <input
                type="url"
                required
                autoFocus
                placeholder="https://example.com/image.png"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
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
                className="px-3 py-1.5 rounded-lg bg-[var(--brand-primary)] text-[var(--brand-text)] text-xs font-medium hover:bg-[var(--brand-primary-hover)] transition-colors"
              >
                Insert
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-[var(--border-color)] hover:border-[var(--text-muted)] rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer bg-[var(--bg-app)] transition-colors"
            >
              <Upload className="w-6 h-6 text-[var(--text-muted)] mb-2" />
              <span className="text-xs font-medium text-[var(--text-primary)]">
                Click to select an image
              </span>
              <span className="text-[11px] text-[var(--text-muted)] mt-1">PNG, JPG, GIF, WebP</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
