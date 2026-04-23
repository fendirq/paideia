"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { useMutation } from "convex/react";
import StarterKit from "@tiptap/starter-kit";
import type { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import {
  createEmptyDocument,
  parseDocument,
  serializeDocument,
} from "@/lib/editor/serialize";
import {
  hasSelectedText,
  type SelectionPayload,
} from "@/lib/editor/selection";
import { EditorToolbar } from "./editor-toolbar";
import { AiSelectionMenu } from "./ai-selection-menu";
import { cn } from "@/lib/utils";

export function WritingEditor({
  documentId,
  initialJson,
  onChangeJson,
  className,
}: {
  documentId?: Id<"documents">;
  initialJson?: string;
  onChangeJson?: (json: string) => void;
  className?: string;
}) {
  const initial = useMemo(
    () => (initialJson ? parseDocument(initialJson) : createEmptyDocument()),
    [initialJson],
  );
  const [selection, setSelection] = useState<SelectionPayload | null>(null);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const saveSnapshot = useMutation(api.snapshots.saveSnapshot);
  const isHydratingRef = useRef(false);
  const hydratedJsonRef = useRef<string | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] } })],
    content: initial,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[480px] max-w-none px-8 py-10 text-sm leading-7 text-foreground focus:outline-none [&_p]:my-3 [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-tight [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_blockquote]:my-4 [&_blockquote]:border-l [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_pre]:overflow-x-auto [&_pre]:bg-muted [&_pre]:p-4 [&_code]:rounded-none [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5",
      },
    },
    onUpdate: ({ editor: e }) => {
      if (isHydratingRef.current) {
        return;
      }

      const json = JSON.stringify(e.getJSON());
      onChangeJson?.(json);

      if (!documentId) {
        return;
      }

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setSaveState("saving");
      saveTimeoutRef.current = setTimeout(() => {
        void (async () => {
          try {
            if (json !== hydratedJsonRef.current) {
              await saveSnapshot({
                documentId,
                editorJson: json,
                source: "autosave",
              });
              hydratedJsonRef.current = json;
            }
            setSaveState("saved");
          } catch {
            setSaveState("error");
          }
        })();
      }, 700);
    },
    onSelectionUpdate: ({ editor: e }) => {
      const { from, to, empty } = e.state.selection;
      if (empty) {
        setSelection(null);
        return;
      }
      const text = e.state.doc.textBetween(from, to, "\n");
      const nextSelection = { from, to, text };
      setSelection(hasSelectedText(nextSelection) ? nextSelection : null);
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextJson = serializeDocument(initial);
    if (nextJson === hydratedJsonRef.current) {
      return;
    }

    isHydratingRef.current = true;
    editor.commands.setContent(initial);
    setSelection(null);
    setSaveState("idle");
    hydratedJsonRef.current = nextJson;

    queueMicrotask(() => {
      isHydratingRef.current = false;
    });
  }, [editor, initial]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const saveLabel =
    saveState === "saving"
      ? "Saving snapshot…"
      : saveState === "saved"
        ? "Snapshot saved"
        : saveState === "error"
          ? "Autosave failed"
          : "Local draft";

  return (
    <div className={cn("flex flex-col border border-border bg-card", className)}>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="bg-background" />
      {selection ? (
        <div className="border-t border-border p-4">
          <AiSelectionMenu selection={selection} />
        </div>
      ) : null}
      <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>{saveLabel}</span>
        <span>
          {selection
            ? "Selection tools ready"
            : "Select text to surface AI entry points"}
        </span>
      </div>
    </div>
  );
}
