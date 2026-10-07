"use client";

import { Editor } from "@tiptap/react";
import {
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  ImageIcon,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor | null;
  role: string;
  onOpenImageModal: () => void;
}

export function EditorToolbar({ editor, role, onOpenImageModal }: EditorToolbarProps) {
  const isViewer = role === "VIEWER";

  return (
    <div className="border-b border-[var(--border-color)] bg-[var(--bg-surface)] px-4 py-1.5 flex items-center gap-1 flex-wrap shrink-0">
      <button
        onClick={() => editor?.chain().focus().undo().run()}
        disabled={!editor?.can().undo() || isViewer}
        className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] disabled:opacity-30"
        title="Undo"
      >
        <Undo className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => editor?.chain().focus().redo().run()}
        disabled={!editor?.can().redo() || isViewer}
        className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] disabled:opacity-30"
        title="Redo"
      >
        <Redo className="w-3.5 h-3.5" />
      </button>

      <div className="h-4 w-px bg-[var(--border-color)] mx-1" />

      <select
        disabled={isViewer}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "default") {
            editor?.chain().focus().unsetFontFamily().run();
          } else {
            editor?.chain().focus().setFontFamily(val).run();
          }
        }}
        value={editor?.getAttributes("textStyle").fontFamily || "default"}
        className="text-xs bg-[var(--bg-app)] border border-[var(--border-color)] text-[var(--text-primary)] rounded px-2 py-1 outline-none"
      >
        <option value="default">Default font</option>
        <option value="Inter, sans-serif">Inter</option>
        <option value="Georgia, serif">Georgia</option>
        <option value="JetBrains Mono, monospace">Mono</option>
        <option value="Arial, sans-serif">Arial</option>
      </select>

      <div className="h-4 w-px bg-[var(--border-color)] mx-1" />

      <button
        disabled={isViewer}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded text-xs font-semibold ${
          editor?.isActive("heading", { level: 1 })
            ? "bg-[var(--bg-muted)] text-[var(--text-primary)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
        }`}
        title="Heading 1"
      >
        <Heading1 className="w-3.5 h-3.5" />
      </button>
      <button
        disabled={isViewer}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded text-xs font-semibold ${
          editor?.isActive("heading", { level: 2 })
            ? "bg-[var(--bg-muted)] text-[var(--text-primary)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
        }`}
        title="Heading 2"
      >
        <Heading2 className="w-3.5 h-3.5" />
      </button>
      <button
        disabled={isViewer}
        onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-1.5 rounded text-xs font-semibold ${
          editor?.isActive("heading", { level: 3 })
            ? "bg-[var(--bg-muted)] text-[var(--text-primary)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
        }`}
        title="Heading 3"
      >
        <Heading3 className="w-3.5 h-3.5" />
      </button>

      <div className="h-4 w-px bg-[var(--border-color)] mx-1" />

      <button
        disabled={isViewer}
        onClick={() => editor?.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded ${
          editor?.isActive("bold")
            ? "bg-[var(--bg-muted)] text-[var(--text-primary)] font-bold"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
        }`}
        title="Bold"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>
      <button
        disabled={isViewer}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded ${
          editor?.isActive("italic")
            ? "bg-[var(--bg-muted)] text-[var(--text-primary)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
        }`}
        title="Italic"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>
      <button
        disabled={isViewer}
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
        className={`p-1.5 rounded ${
          editor?.isActive("underline")
            ? "bg-[var(--bg-muted)] text-[var(--text-primary)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
        }`}
        title="Underline"
      >
        <UnderlineIcon className="w-3.5 h-3.5" />
      </button>
      <button
        disabled={isViewer}
        onClick={() => editor?.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded ${
          editor?.isActive("strike")
            ? "bg-[var(--bg-muted)] text-[var(--text-primary)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
        }`}
        title="Strikethrough"
      >
        <Strikethrough className="w-3.5 h-3.5" />
      </button>

      <label
        className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer flex items-center gap-1"
        title="Text Color"
      >
        <span className="text-xs font-semibold">A</span>
        <input
          type="color"
          disabled={isViewer}
          onChange={(e) => editor?.chain().focus().setColor(e.target.value).run()}
          value={editor?.getAttributes("textStyle").color || "#111827"}
          className="w-3 h-3 rounded border-0 cursor-pointer bg-transparent"
        />
      </label>

      <button
        disabled={isViewer}
        onClick={() => {
          if (editor?.isActive("highlight")) {
            editor.chain().focus().unsetHighlight().run();
          } else {
            editor?.chain().focus().toggleHighlight({ color: "#fef08a" }).run();
          }
        }}
        className={`p-1.5 rounded ${
          editor?.isActive("highlight")
            ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
        }`}
        title="Highlight"
      >
        <Highlighter className="w-3.5 h-3.5" />
      </button>

      <div className="h-4 w-px bg-[var(--border-color)] mx-1" />

      <button
        disabled={isViewer}
        onClick={() => editor?.chain().focus().setTextAlign("left").run()}
        className={`p-1.5 rounded ${
          editor?.isActive({ textAlign: "left" })
            ? "bg-[var(--bg-muted)] text-[var(--text-primary)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
        }`}
        title="Align Left"
      >
        <AlignLeft className="w-3.5 h-3.5" />
      </button>
      <button
        disabled={isViewer}
        onClick={() => editor?.chain().focus().setTextAlign("center").run()}
        className={`p-1.5 rounded ${
          editor?.isActive({ textAlign: "center" })
            ? "bg-[var(--bg-muted)] text-[var(--text-primary)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
        }`}
        title="Align Center"
      >
        <AlignCenter className="w-3.5 h-3.5" />
      </button>
      <button
        disabled={isViewer}
        onClick={() => editor?.chain().focus().setTextAlign("right").run()}
        className={`p-1.5 rounded ${
          editor?.isActive({ textAlign: "right" })
            ? "bg-[var(--bg-muted)] text-[var(--text-primary)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
        }`}
        title="Align Right"
      >
        <AlignRight className="w-3.5 h-3.5" />
      </button>

      <div className="h-4 w-px bg-[var(--border-color)] mx-1" />

      <button
        disabled={isViewer}
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded ${
          editor?.isActive("bulletList")
            ? "bg-[var(--bg-muted)] text-[var(--text-primary)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
        }`}
        title="Bullet List"
      >
        <List className="w-3.5 h-3.5" />
      </button>
      <button
        disabled={isViewer}
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded ${
          editor?.isActive("orderedList")
            ? "bg-[var(--bg-muted)] text-[var(--text-primary)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
        }`}
        title="Numbered List"
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </button>
      <button
        disabled={isViewer}
        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        className={`p-1.5 rounded ${
          editor?.isActive("blockquote")
            ? "bg-[var(--bg-muted)] text-[var(--text-primary)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
        }`}
        title="Quote"
      >
        <Quote className="w-3.5 h-3.5" />
      </button>
      <button
        disabled={isViewer}
        onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        className={`p-1.5 rounded ${
          editor?.isActive("codeBlock")
            ? "bg-[var(--bg-muted)] text-[var(--text-primary)]"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
        }`}
        title="Code Block"
      >
        <Code className="w-3.5 h-3.5" />
      </button>
      <button
        disabled={isViewer}
        onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
        title="Divider Line"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <div className="h-4 w-px bg-[var(--border-color)] mx-1" />

      <button
        disabled={isViewer}
        onClick={onOpenImageModal}
        className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
        title="Insert Image"
      >
        <ImageIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
