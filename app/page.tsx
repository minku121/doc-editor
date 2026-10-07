"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import FontFamily from "@tiptap/extension-font-family";
import { TextStyle } from "@tiptap/extension-text-style";
import Image from "@tiptap/extension-image";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { FileText } from "lucide-react";

import { User, Document, ActiveUser } from "@/types";
import { AuthView } from "@/components/auth/auth-view";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { EditorView } from "@/components/editor/editor-view";

const API_URL = "http://localhost:3200";

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDoc, setCurrentDoc] = useState<Document | null>(null);
  const [role, setRole] = useState<string>("VIEWER");

  const socketRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image.configure({
        allowBase64: true,
        inline: true,
      }),
    ],
    content: "<p></p>",
    editable: false,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (
        socketRef.current &&
        socketRef.current.readyState === WebSocket.OPEN &&
        role !== "VIEWER"
      ) {
        const json = editor.getJSON();
        socketRef.current.send(
          JSON.stringify({
            type: "document_update",
            content: json,
          })
        );
      }
    },
    editorProps: {
      attributes: {
        class: "w-full min-h-[550px] outline-none max-w-none focus:outline-none",
      },
    },
  });

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
      setCurrentDoc(null);
      if (socketRef.current) socketRef.current.close();
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
      connectToDocument(doc);
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
      if (currentDoc?.id === id) {
        if (socketRef.current) socketRef.current.close();
        setCurrentDoc(null);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting document");
    }
  };

  const connectToDocument = useCallback(
    (doc: Document) => {
      if (socketRef.current) {
        socketRef.current.close();
      }

      setCurrentDoc(doc);
      setConnected(false);

      const ws = new WebSocket(`ws://localhost:3200?room=${doc.id}`);
      socketRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "init") {
            setRole(data.role);
            if (editor) {
              editor.setEditable(data.role !== "VIEWER");
              if (data.content && data.content !== "") {
                try {
                  let parsed = JSON.parse(data.content);
                  if (parsed.type === "document_update" && parsed.content) {
                    parsed = parsed.content;
                  }
                  editor.commands.setContent(parsed, { emitUpdate: false });
                } catch {
                  editor.commands.setContent(data.content, { emitUpdate: false });
                }
              } else {
                editor.commands.setContent("<p></p>", { emitUpdate: false });
              }
            }
          } else if (data.type === "document_update") {
            if (editor) {
              const currentJSON = editor.getJSON();
              if (JSON.stringify(currentJSON) !== JSON.stringify(data.content)) {
                editor.commands.setContent(data.content, { emitUpdate: false });
              }
            }
          } else if (data.type === "active_users_update") {
            setActiveUsers(data.activeUsers);
          }
        } catch {
          // Ignore parse errors
        }
      };

      ws.onerror = () => {
        setConnected(false);
      };

      ws.onclose = () => {
        setConnected(false);
      };
    },
    [editor]
  );

  const handleBackToDocuments = () => {
    if (socketRef.current) socketRef.current.close();
    setCurrentDoc(null);
    setConnected(false);
    fetchDocuments();
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

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

  if (!currentDoc) {
    return (
      <DashboardView
        user={user}
        documents={documents}
        onSelectDocument={connectToDocument}
        onCreateDocument={handleCreateDocument}
        onDeleteDocument={handleDeleteDocument}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <EditorView
      editor={editor}
      document={currentDoc}
      currentUser={user}
      role={role}
      connected={connected}
      activeUsers={activeUsers}
      apiUrl={API_URL}
      onBack={handleBackToDocuments}
    />
  );
}