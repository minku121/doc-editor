"use client";

import { useState } from "react";
import { Plus, Search, FileText, Trash2 } from "lucide-react";
import { User, Document } from "@/types";
import { Sidebar } from "./sidebar";
import { CreateDocumentModal } from "./create-document-modal";

interface DashboardViewProps {
  user: User;
  documents: Document[];
  onSelectDocument: (doc: Document) => void;
  onCreateDocument: (title: string) => Promise<void>;
  onDeleteDocument: (id: string, e: React.MouseEvent) => void;
  onLogout: () => void;
}

export function DashboardView({
  user,
  documents,
  onSelectDocument,
  onCreateDocument,
  onDeleteDocument,
  onLogout,
}: DashboardViewProps) {
  const [docSearchQuery, setDocSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(docSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-[var(--bg-app)]">
      <Sidebar
        user={user}
        documentCount={documents.length}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-[var(--border-color)] bg-[var(--bg-surface)] px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Documents</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search documents..."
                value={docSearchQuery}
                onChange={(e) => setDocSearchQuery(e.target.value)}
                className="w-48 sm:w-64 pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--bg-app)] text-[var(--text-primary)] placeholder-[var(--text-faint)] outline-none focus:border-[var(--brand-primary)] transition-all"
              />
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-[var(--brand-text)] text-xs font-medium transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New document</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {documents.length === 0 ? (
            <div className="h-80 flex flex-col items-center justify-center border border-dashed border-[var(--border-color)] rounded-xl bg-[var(--bg-surface)] p-8 text-center">
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">
                No documents yet
              </h3>
              <p className="text-xs text-[var(--text-muted)] mb-4 max-w-sm">
                Create a new document to start writing and collaborating with your team.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--brand-primary)] text-[var(--brand-text)] text-xs font-medium hover:bg-[var(--brand-primary-hover)] transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create document</span>
              </button>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--text-muted)]">
              No documents matching &quot;{docSearchQuery}&quot;
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredDocuments.map((doc) => {
                const isOwner = doc.ownerId === user.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => onSelectDocument(doc)}
                    className="group relative bg-[var(--bg-surface)] border border-[var(--border-color)] hover:border-[var(--text-muted)] rounded-xl p-4 cursor-pointer transition-all flex flex-col justify-between h-40 shadow-xs"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="w-7 h-7 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>

                        {isOwner && (
                          <button
                            onClick={(e) => onDeleteDocument(doc.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-subtle)] transition-all"
                            title="Delete document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <h3 className="text-xs font-medium text-[var(--text-primary)] line-clamp-2 leading-relaxed">
                        {doc.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
                      <span>{isOwner ? "Owner" : "Shared"}</span>
                      <span className="text-[var(--accent-blue)] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Open →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <CreateDocumentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={onCreateDocument}
      />
    </div>
  );
}
