"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiMagicIcon,
  MagicWand01Icon,
  AiContentGenerator01Icon,
} from "@hugeicons/core-free-icons";

import { SelectionPayload } from "@/lib/editor/selection";
import { Button } from "@/components/ui/button";

export function AiSelectionMenu({
  selection,
  onRewrite,
  onTighten,
  onExpand,
}: {
  selection: SelectionPayload | null;
  onRewrite?: () => void;
  onTighten?: () => void;
  onExpand?: () => void;
}) {
  if (!selection || !selection.text) return null;

  const canRewrite = typeof onRewrite === "function";
  const canTighten = typeof onTighten === "function";
  const canExpand = typeof onExpand === "function";

  return (
    <div className="border border-border bg-card p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        AI selection tools
      </p>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
        &ldquo;{selection.text.slice(0, 120)}&rdquo;
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <Button
          type="button"
          variant="default"
          size="sm"
          className="gap-1.5 rounded-none"
          onClick={onRewrite}
          disabled={!canRewrite}
        >
          <HugeiconsIcon icon={AiMagicIcon} strokeWidth={1.8} />
          Rewrite selection
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-none"
          onClick={onTighten}
          disabled={!canTighten}
        >
          <HugeiconsIcon icon={MagicWand01Icon} strokeWidth={1.8} />
          Tighten tone
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 rounded-none"
          onClick={onExpand}
          disabled={!canExpand}
        >
          <HugeiconsIcon icon={AiContentGenerator01Icon} strokeWidth={1.8} />
          Expand
        </Button>
      </div>
      {!(canRewrite && canTighten && canExpand) ? (
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          Selection actions are surfaced here, but the actual AI rewrite flow is
          still reserved for Task 7.
        </p>
      ) : null}
    </div>
  );
}
