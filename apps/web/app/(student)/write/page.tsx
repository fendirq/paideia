import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, BookOpen01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function WriteHomePage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10 font-sans">
      <header className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Workspace
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              My Drive
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Everything you&rsquo;re writing lives here. Create a new document
              to start drafting, or open a folder to keep work organized.
            </p>
          </div>
          <Button size="lg" className="rounded-none gap-2">
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
            New document
          </Button>
        </div>
      </header>

      <Card className="border-dashed bg-card/60 ring-foreground/5">
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <span className="flex size-14 items-center justify-center border border-border bg-background text-muted-foreground">
            <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.6} size={28} />
          </span>
          <div className="flex max-w-sm flex-col gap-1.5">
            <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">
              Your drive is quiet for now
            </h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Drafts, outlines, and rewrites you start will collect here. Pick a
              folder in the sidebar or start a fresh document to begin.
            </p>
          </div>
          <Button variant="outline" className="rounded-none gap-2">
            <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
            New document
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
