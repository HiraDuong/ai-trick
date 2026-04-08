"use client";

import { useEffect } from "react";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";

interface ArticleEditorProps {
  value: string;
  onChange: (value: string) => void;
}

function ToolbarButton(props: {
  label: string;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  const { label, active = false, onClick, disabled = false } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
        active
          ? "bg-[var(--color-accent)] text-[var(--color-accent-contrast)]"
          : "border border-[var(--color-line)] bg-white text-[var(--color-foreground)] hover:border-[var(--color-accent)]"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {label}
    </button>
  );
}

export function ArticleEditor({ value, onChange }: ArticleEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      Placeholder.configure({
        placeholder: "Bắt đầu viết kiến thức tại đây...",
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate({ editor: currentEditor }) {
      onChange(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[16rem] rounded-[1.25rem] border border-[var(--color-line)] bg-white px-4 py-4 text-[var(--color-foreground)] outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    const currentHtml = editor.getHTML();
    if (value !== currentHtml) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="rounded-[1.25rem] border border-[var(--color-line)] bg-white px-4 py-4 text-sm text-[var(--color-muted)]">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="H1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        />
        <ToolbarButton
          label="H2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="Code Block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />
        <ToolbarButton
          label="Bullet List"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
