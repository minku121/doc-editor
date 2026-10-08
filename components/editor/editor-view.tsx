"use client";

import { useState } from "react";
import { Editor, EditorContent } from "@tiptap/react";
import { useTheme } from "next-themes";
import { ArrowLeft, Share2, Sun, Moon } from "lucide-react";
import { User, Document, ActiveUser } from "@/types";
import { getAvatarColor, getInitials } from "@/lib/utils";
import { EditorToolbar } from "./editor-toolbar";
import { ShareModal } from "./share-modal";
import { ImageModal } from "./image-modal";

interface EditorViewProps {
  editor: Editor | null;
  document: Document;
  currentUser: User;
  role: string;
  connected: boolean;
  activeUsers: ActiveUser[];
  apiUrl: string;
  onBack: () => void;
}

export function EditorView({
  editor,
  document,
  currentUser,
  role,
  connected,
  activeUsers,
  apiUrl,
  onBack,
}: EditorViewProps) {
  const { theme, setTheme } = useTheme();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const uniqueActiveUsers = activeUsers.filter(
    (activeUser, index, users) =>
      users.findIndex((user) => user.id === activeUser.id) === index
  );

  const handleInsertImage = (src: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src }).run();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)]">
      <header className="h-14 border-b border-[var(--border-color)] bg-[var(--bg-surface)] px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] py-1.5 px-2 rounded-md hover:bg-[var(--bg-subtle)] transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Documents</span>
          </button>

          <div className="h-4 w-px bg-[var(--border-color)] shrink-0" />

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
              {document.title}
            </span>

            {connected && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] bg-[var(--bg-subtle)] border border-[var(--border-color)] px-1.5 py-0.5 rounded shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Saved
              </span>
            )}

            <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-[var(--bg-muted)] text-[var(--text-muted)] shrink-0">
              {role}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {uniqueActiveUsers.length > 0 && (
            <div className="flex items-center -space-x-1.5 mr-1">
              {uniqueActiveUsers.slice(0, 4).map((au, i) => (
                <div
                  key={au.id}
                  className={`w-6 h-6 rounded-full ${getAvatarColor(i)} flex items-center justify-center text-[10px] font-medium ring-2 ring-[var(--bg-surface)]`}
                  title={`${au.name || au.email} (${au.role})`}
                >
                  {getInitials(au.name, au.email)}
                </div>
              ))}
              {uniqueActiveUsers.length > 4 && (
                <div className="w-6 h-6 rounded-full bg-[var(--bg-muted)] text-[var(--text-secondary)] flex items-center justify-center text-[10px] font-medium ring-2 ring-[var(--bg-surface)]">
                  +{uniqueActiveUsers.length - 4}
                </div>
              )}
            </div>
          )}

          {role === "OWNER" && (
            <button
              onClick={() => setIsShareModalOpen(true)}
              disabled={!connected}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-xs font-medium text-[var(--text-primary)] transition-colors disabled:opacity-50"
            >
              <Share2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span>Share</span>
            </button>
          )}

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-1.5 rounded-md border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
            title="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      <EditorToolbar
        editor={editor}
        role={role}
        onOpenImageModal={() => setIsImageModalOpen(true)}
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center">
        <div className="w-full max-w-3xl">
          {role === "VIEWER" && (
            <div className="mb-4 px-4 py-2 rounded-lg bg-[var(--bg-muted)] text-xs text-[var(--text-muted)] flex items-center justify-between">
              <span>You have view-only access to this document.</span>
            </div>
          )}

          <div className="bg-[var(--editor-paper)] border border-[var(--editor-border)] rounded-xl shadow-xs min-h-[650px]">
            <EditorContent editor={editor} />
          </div>
        </div>
      </main>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        currentUser={currentUser}
        apiUrl={apiUrl}
        docId={document.id}
      />

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsertImage={handleInsertImage}
      />
    </div>
  );
}
