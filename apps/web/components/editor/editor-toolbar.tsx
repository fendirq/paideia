"use client";

import type { Editor } from "@tiptap/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  TextBoldIcon,
  TextItalicIcon,
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  QuoteUpIcon,
  CodeIcon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToolbarButton = {
  label: string;
  icon: typeof TextBoldIcon;
  isActive: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
};

const BUTTONS: ToolbarButton[] = [
  {
    label: "Bold",
    icon: TextBoldIcon,
    isActive: (e) => e.isActive("bold"),
    run: (e) => e.chain().focus().toggleBold().run(),
  },
  {
    label: "Italic",
    icon: TextItalicIcon,
    isActive: (e) => e.isActive("italic"),
    run: (e) => e.chain().focus().toggleItalic().run(),
  },
  {
    label: "Heading 1",
    icon: Heading01Icon,
    isActive: (e) => e.isActive("heading", { level: 1 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    label: "Heading 2",
    icon: Heading02Icon,
    isActive: (e) => e.isActive("heading", { level: 2 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: "Heading 3",
    icon: Heading03Icon,
    isActive: (e) => e.isActive("heading", { level: 3 }),
    run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: "Bullet list",
    icon: LeftToRightListBulletIcon,
    isActive: (e) => e.isActive("bulletList"),
    run: (e) => e.chain().focus().toggleBulletList().run(),
  },
  {
    label: "Numbered list",
    icon: LeftToRightListNumberIcon,
    isActive: (e) => e.isActive("orderedList"),
    run: (e) => e.chain().focus().toggleOrderedList().run(),
  },
  {
    label: "Blockquote",
    icon: QuoteUpIcon,
    isActive: (e) => e.isActive("blockquote"),
    run: (e) => e.chain().focus().toggleBlockquote().run(),
  },
  {
    label: "Code block",
    icon: CodeIcon,
    isActive: (e) => e.isActive("codeBlock"),
    run: (e) => e.chain().focus().toggleCodeBlock().run(),
  },
];

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  return (
    <div className="flex items-center gap-1 border-b border-border px-4 py-2">
      {BUTTONS.map((button) => {
        const active = editor ? button.isActive(editor) : false;
        return (
          <Button
            key={button.label}
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={button.label}
            aria-pressed={active}
            data-active={active ? "true" : undefined}
            disabled={!editor}
            className={cn(
              "rounded-none",
              active && "bg-muted text-foreground",
            )}
            onClick={() => editor && button.run(editor)}
          >
            <HugeiconsIcon icon={button.icon} strokeWidth={1.8} />
          </Button>
        );
      })}
    </div>
  );
}
