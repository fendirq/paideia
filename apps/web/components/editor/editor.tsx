"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useMemo, useState } from "react";
import { createEmptyDocument, parseDocument } from "@/lib/editor/serialize";
import type { SelectionPayload } from "@/lib/editor/selection";
import { EditorToolbar } from "./editor-toolbar";
import { AiSelectionMenu } from "./ai-selection-menu";
import { cn } from "@/lib/utils";

export function WritingEditor({
  initialJson,
  onChangeJson,
  className,
}: {
  initialJson?: string;
  onChangeJson?: (json: string) => void;
  className?: string;
}) {
  const initial = useMemo(
    () => (initialJson ? parseDocument(initialJson) : createEmptyDocument()),
    [initialJson],
  );
  const [selection, setSelection] = useState<SelectionPayload | null>(null);

  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] } })],
    content: initial,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[480px] px-8 py-10 focus:outline-none [&_p]:my-3 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_ul]:my-3 [&_ol]:my-3",
      },
    },
    onUpdate: ({ editor: e }) => {
      onChangeJson?.(JSON.stringify(e.getJSON()));
    },
    onSelectionUpdate: ({ editor: e }) => {
      const { from, to, empty } = e.state.selection;
      if (empty) {
        setSelection(null);
        return;
      }
      const text = e.state.doc.textBetween(from, to, "\n");
      setSelection({ from, to, text });
    },
  });

  return (
    <div className={cn("flex flex-col border border-border bg-card", className)}>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="bg-background" />
      {selection ? (
        <div className="border-t border-border p-4">
          <AiSelectionMenu selection={selection} />
        </div>
      ) : null}
    </div>
  );
}
