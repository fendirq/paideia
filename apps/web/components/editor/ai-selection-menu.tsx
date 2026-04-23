"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiMagicIcon,
  Alert01Icon,
} from "@hugeicons/core-free-icons";

import { SelectionPayload } from "@/lib/editor/selection";
import { Button } from "@/components/ui/button";

export function AiSelectionMenu({
  selection,
  onRewrite,
}: {
  selection: SelectionPayload | null;
  onRewrite?: () => void;
}) {
  if (!selection || !selection.text) return null;

  const isRewriteWired = typeof onRewrite === "function";

  return (
    <div className="border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        Selection rewrite
      </p>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
        &ldquo;{selection.text.slice(0, 120)}&rdquo;
      </p>
      <Button
        type="button"
        variant="default"
        size="sm"
        className="mt-3 gap-1.5 rounded-none"
        onClick={onRewrite}
        disabled={!isRewriteWired}
      >
        <HugeiconsIcon icon={AiMagicIcon} strokeWidth={1.8} />
        Rewrite selection
      </Button>
      {!isRewriteWired ? (
        <div className="mt-3 flex gap-2 border border-dashed border-border p-3">
          <HugeiconsIcon
            icon={Alert01Icon}
            strokeWidth={1.8}
            className="mt-0.5 size-3 shrink-0 text-muted-foreground"
          />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            TODO(Task 8): thread documentId, snapshotId, and{" "}
            {"{ from, to, selectedText, prompt }"} into createRun(...) so
            rewrite runs target a known snapshot range instead of a generic
            workspace action.
          </p>
        </div>
      ) : null}
    </div>
  );
}
