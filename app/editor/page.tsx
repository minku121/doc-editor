"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

import { ActiveUser, Document, User } from "@/types";
import { AuthView } from "@/components/auth/auth-view";
import { EditorView } from "@/components/editor/editor-view";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3200";
const WS_URL = API_URL.replace(/^http/, "ws");

export default function EditorPage() {
  const router = useRouter();
  const socketRef = useRef<WebSocket | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [document, setDocument] = useState<Document | null>(null);
  const [role, setRole] = useState("VIEWER");
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
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ allowBase64: true, inline: true }),
    ],
    content: "<p></p>",
    editable: false,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      if (
        socketRef.current?.readyState === WebSocket.OPEN &&
        role !== "VIEWER"
      ) {
        socketRef.current.send(
          JSON.stringify({
            type: "document_update",
            content: currentEditor.getJSON(),
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
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setIsAuthLoading(false));
  }, []);

  const connectToDocument = useCallback(
    (doc: Document) => {
      socketRef.current?.close();
      setDocument(doc);
      setConnected(false);

      const socket = new WebSocket(`${WS_URL}?room=${doc.id}`);
      socketRef.current = socket;

      socket.onopen = () => setConnected(true);
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "init") {
            setRole(data.role);
            if (!editor) return;

            editor.setEditable(data.role !== "VIEWER");
            if (!data.content) {
              editor.commands.setContent("<p></p>", { emitUpdate: false });
              return;
            }

            try {
              let content = JSON.parse(data.content);
              if (content.type === "document_update" && content.content) {
                content = content.content;
              }
              editor.commands.setContent(content, { emitUpdate: false });
            } catch {
              editor.commands.setContent(data.content, { emitUpdate: false });
            }
          } else if (data.type === "document_update" && editor) {
            if (JSON.stringify(editor.getJSON()) !== JSON.stringify(data.content)) {
              editor.commands.setContent(data.content, { emitUpdate: false });
            }
          } else if (data.type === "active_users_update") {
            setActiveUsers(data.activeUsers);
          }
        } catch {
          console.error("Received an invalid editor message");
        }
      };
      socket.onerror = () => setConnected(false);
      socket.onclose = () => setConnected(false);
    },
    [editor]
  );

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    const documentId = new URLSearchParams(window.location.search).get("id");
    if (!documentId) {
      router.replace("/");
      return () => {
        cancelled = true;
      };
    }

    fetch(`${API_URL}/documents`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch documents");
        return res.json() as Promise<Document[]>;
      })
      .then((documents) => {
        if (cancelled) return;
        const selectedDocument = documents.find((doc) => doc.id === documentId);
        if (!selectedDocument) {
          router.replace("/");
          return;
        }
        connectToDocument(selectedDocument);
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) router.replace("/");
      });

    return () => {
      cancelled = true;
      socketRef.current?.close();
    };
  }, [connectToDocument, router, user]);

  useEffect(() => () => socketRef.current?.close(), []);

  const handleBack = () => {
    socketRef.current?.close();
    router.push("/");
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)]">
        <div className="flex flex-col items-center gap-3">
          <FileText className="w-5 h-5 text-[var(--text-primary)] animate-pulse" />
          <span className="text-sm text-[var(--text-muted)]">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return <AuthView onSuccess={setUser} apiUrl={API_URL} />;
  if (!document) return null;

  return (
    <EditorView
      editor={editor}
      document={document}
      currentUser={user}
      role={role}
      connected={connected}
      activeUsers={activeUsers}
      apiUrl={API_URL}
      onBack={handleBack}
    />
  );
}
