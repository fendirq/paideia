"use client";

import { SelectionPayload } from "@/lib/editor/selection";
import { Button } from "@/components/ui/button";

export function AiSelectionMenu({
  selection,
  onRewrite,
  onTighten,
}: {
  selection: SelectionPayload | null;
  onRewrite?: () => void;
  onTighten?: () => void;
}) {
  if (!selection || !selection.text) return null;
  return (
    <div className="border border-border bg-card p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">AI selection tools</p>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
        &ldquo;{selection.text.slice(0, 120)}&rdquo;
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <Button variant="outline" size="sm" className="rounded-none" onClick={onRewrite}>
          Rewrite selection
        </Button>
        <Button variant="ghost" size="sm" className="rounded-none" onClick={onTighten}>
          Tighten tone
        </Button>
      </div>
    </div>
  );
}
