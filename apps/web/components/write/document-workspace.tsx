"use client";

import { useEffect, useMemo, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiMagicIcon,
  ArrowReloadHorizontalIcon,
  Alert01Icon,
  CheckmarkCircle02Icon,
  FileEditIcon,
  Idea01Icon,
  Loading03Icon,
  SparklesIcon,
  TransactionHistoryIcon,
} from "@hugeicons/core-free-icons";

import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { WritingEditor } from "@/components/editor/editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createEmptyDocument, parseDocument } from "@/lib/editor/serialize";
import type { SerializedDoc } from "@/lib/editor/schema";

type RunKind = Doc<"writingRuns">["kind"];
type RunStatus = Doc<"writingRuns">["status"];
type RunInstruction = {
  prompt?: string;
  sources?: string;
  rubric?: string;
  snapshotId?: string;
  from?: number;
  to?: number;
  selectedText?: string;
};

function formatDateTime(ms: number) {
  return new Date(ms).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function kindLabel(kind: RunKind) {
  switch (kind) {
    case "outline":
      return "Outline";
    case "draft":
      return "Draft";
    case "rewrite":
      return "Rewrite";
  }
}

function mockOutputForKind(
  kind: RunKind,
  inputs: { prompt: string; sources: string; rubric: string },
) {
  if (kind === "outline") {
    const topic = inputs.prompt.trim() || "your piece";
    const sourceLine = inputs.sources.trim()
      ? "- Evidence lane: pull the strongest source details forward before analysis."
      : "- Evidence lane: note the facts, scenes, or quotes you still need to gather.";
    const rubricLine = inputs.rubric.trim()
      ? "- Rubric check: echo the assignment criteria in the transitions and closing move."
      : "- Rubric check: keep the thesis, evidence, and conclusion easy to evaluate.";
    return [
      `Outline for ${topic}`,
      "",
      "- Opening move: frame the stakes and why this topic matters now.",
      "- Context: establish the source material or lived example the piece builds from.",
      "- Core argument: walk the reader through the main claim one beat at a time.",
      sourceLine,
      "- Counterpoint: name the strongest objection and answer it directly.",
      rubricLine,
      "- Close: leave the reader with the takeaway they should carry forward.",
    ].join("\n");
  }
  if (kind === "draft") {
    const topic = inputs.prompt.trim() || "the assigned piece";
    const evidenceLine = inputs.sources.trim()
      ? "It pulls in the source material you pasted so the evidence shows up earlier in the piece."
      : "It leaves obvious openings where you can add evidence once you know the shape of the argument.";
    const rubricLine = inputs.rubric.trim()
      ? "It also keeps the rubric language in view so the draft aims toward the assignment target."
      : "It keeps the structure readable so revision stays easy.";
    return [
      `Working draft for ${topic}`,
      "",
      "This first pass opens with a clear claim, gives the reader context quickly, and leaves enough room for your own voice to sharpen the turns of phrase.",
      "",
      evidenceLine,
      rubricLine,
      "",
      "Use it as scaffolding, not a finish line. Keep the sentences that feel true, rewrite the ones that flatten your voice, and let the editor be where the real writing happens.",
    ].join("\n");
  }
  return "Rewritten passage.";
}

function appendTextToDocument(
  json: string | undefined,
  text: string,
): SerializedDoc {
  const base: SerializedDoc = json ? parseDocument(json) : createEmptyDocument();
  const lines = text.split("\n");
  const paragraphs = lines.map((line) => {
    if (!line.trim()) return { type: "paragraph" };
    return {
      type: "paragraph",
      content: [{ type: "text", text: line }],
    };
  });
  return {
    type: "doc",
    content: [...(base.content ?? []), ...paragraphs],
  };
}

function parseRunInstruction(instruction: string): RunInstruction | null {
  try {
    return JSON.parse(instruction) as RunInstruction;
  } catch {
    return null;
  }
}

function instructionSummary(instruction: string) {
  const parsed = parseRunInstruction(instruction);
  if (!parsed) {
    return "Structured inputs recorded for this run.";
  }

  const selectedText = parsed.selectedText?.trim();
  if (selectedText) {
    return `Selection: "${selectedText.slice(0, 96)}"`;
  }

  const prompt = parsed.prompt?.trim();
  if (prompt) {
    return `Prompt: ${prompt.slice(0, 96)}`;
  }

  if (parsed.snapshotId && typeof parsed.from === "number" && typeof parsed.to === "number") {
    return `Snapshot range: ${parsed.from}-${parsed.to}`;
  }

  return "Structured inputs recorded for this run.";
}

function StatusBadge({ status }: { status: RunStatus }) {
  const map: Record<
    RunStatus,
    {
      label: string;
      variant: "secondary" | "outline" | "default" | "destructive";
      icon: typeof CheckmarkCircle02Icon;
      spin?: boolean;
    }
  > = {
    queued: {
      label: "Queued",
      variant: "outline",
      icon: TransactionHistoryIcon,
    },
    running: {
      label: "Running",
      variant: "secondary",
      icon: Loading03Icon,
      spin: true,
    },
    succeeded: {
      label: "Succeeded",
      variant: "default",
      icon: CheckmarkCircle02Icon,
    },
    failed: {
      label: "Failed",
      variant: "destructive",
      icon: Alert01Icon,
    },
  };
  const item = map[status];
  return (
    <Badge
      variant={item.variant}
      className="h-6 gap-1.5 rounded-none px-2.5 text-[11px] uppercase tracking-[0.16em]"
    >
      <HugeiconsIcon
        icon={item.icon}
        strokeWidth={1.8}
        className={item.spin ? "size-3 animate-spin" : "size-3"}
      />
      {item.label}
    </Badge>
  );
}

function SectionHeader({
  eyebrow,
  meta,
}: {
  eyebrow: string;
  meta?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between border-b border-border pb-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {eyebrow}
      </p>
      {meta ? (
        <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
          {meta}
        </span>
      ) : null}
    </div>
  );
}

export function DocumentWorkspace({
  documentId,
}: {
  documentId: Id<"documents">;
}) {
  const doc = useQuery(api.documents.getDocument, { documentId });
  const snapshot = useQuery(api.snapshots.getLatestSnapshot, { documentId });
  const runs = useQuery(api.writingRuns.listRunsForDocument, { documentId });

  const saveSnapshot = useMutation(api.snapshots.saveSnapshot);
  const renameDocument = useMutation(api.documents.renameDocument);
  const createRun = useMutation(api.writingRuns.createRun);
  const executeRun = useAction(api.writingRuns.executeRun);

  const [titleDraft, setTitleDraft] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [sources, setSources] = useState("");
  const [rubric, setRubric] = useState("");
  const [generating, setGenerating] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [pendingRunId, setPendingRunId] =
    useState<Id<"writingRuns"> | null>(null);
  const [insertingRunId, setInsertingRunId] =
    useState<Id<"writingRuns"> | null>(null);

  // We feed the editor with the latest known JSON. When the user clicks
  // "Insert at end" we update this override so the editor hydrates the new
  // content without losing what was already typed.
  const [editorOverride, setEditorOverride] =
    useState<string | undefined>(undefined);

  useEffect(() => {
    if (doc) setTitleDraft(doc.title);
  }, [doc?._id, doc?.title]); // eslint-disable-line react-hooks/exhaustive-deps

  const pendingRun = useMemo(() => {
    if (!pendingRunId || !runs) return null;
    return runs.find((r) => r._id === pendingRunId) ?? null;
  }, [pendingRunId, runs]);

  const latestRun = runs?.[0] ?? null;
  const activeRun = pendingRun ?? latestRun;

  useEffect(() => {
    if (editorOverride && snapshot?.editorJson === editorOverride) {
      setEditorOverride(undefined);
    }
  }, [editorOverride, snapshot?.editorJson]);

  async function handleTitleBlur() {
    if (!doc) return;
    const next = titleDraft.trim();
    if (!next || next === doc.title) {
      setTitleDraft(doc.title);
      return;
    }
    await renameDocument({ documentId, title: next });
  }

  async function handleGenerate(kind: RunKind) {
    if (generating) return;
    setWorkspaceError(null);
    setGenerating(true);
    try {
      const instruction = JSON.stringify({ prompt, sources, rubric });
      const runId = await createRun({ documentId, kind, instruction });
      setPendingRunId(runId);
      const mockOutput = mockOutputForKind(kind, { prompt, sources, rubric });
      await executeRun({ runId, mockOutput });
    } catch (error) {
      setWorkspaceError(
        error instanceof Error ? error.message : "Unable to start this run.",
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleInsertRun(run: Doc<"writingRuns">) {
    if (!run.outputText || insertingRunId) return;
    setWorkspaceError(null);
    setInsertingRunId(run._id);
    try {
      const base = editorOverride ?? snapshot?.editorJson ?? undefined;
      const nextDoc = appendTextToDocument(base, run.outputText);
      const nextJson = JSON.stringify(nextDoc);
      setEditorOverride(nextJson);
      await saveSnapshot({
        documentId,
        editorJson: nextJson,
        source: "ai-run",
      });
    } catch (error) {
      setWorkspaceError(
        error instanceof Error ? error.message : "Unable to insert this run.",
      );
    } finally {
      setInsertingRunId(null);
    }
  }

  if (doc === undefined || snapshot === undefined) {
    return <DocumentWorkspaceSkeleton />;
  }

  if (doc === null) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-6 py-16 text-center">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Document
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Document not found
        </h1>
        <p className="text-sm text-muted-foreground">
          It may have been deleted, or you may not have access. Head back to
          your drive.
        </p>
      </div>
    );
  }

  const lastSnapshotLabel = snapshot
    ? `Last saved ${formatDateTime(snapshot._creationTime)}`
    : "No snapshots yet";

  const editorJson = editorOverride ?? snapshot?.editorJson ?? undefined;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="flex min-w-0 flex-col gap-5">
        <header className="flex flex-col gap-3 border-b border-border pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Writing portal
          </p>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Input
                aria-label="Document title"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    (e.target as HTMLInputElement).blur();
                  }
                }}
                placeholder="Untitled"
                className="h-auto border-0 bg-transparent p-0 text-3xl font-semibold tracking-tight shadow-none focus-visible:border-0 focus-visible:ring-0 md:text-3xl"
              />
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Draft manually, generate from structured inputs, and keep each
                outline or draft run anchored to this document&apos;s history.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={doc.status === "archived" ? "outline" : "secondary"}
                className="h-6 gap-1.5 rounded-none px-2.5 text-[11px] uppercase tracking-[0.16em]"
              >
                <HugeiconsIcon
                  icon={FileEditIcon}
                  strokeWidth={1.8}
                  className="size-3"
                />
                {doc.status}
              </Badge>
              <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
                {lastSnapshotLabel}
              </span>
            </div>
          </div>
        </header>

        <WritingEditor documentId={documentId} initialJson={editorJson} />
      </section>

      <aside className="flex flex-col gap-4">
        <InputsCard
          prompt={prompt}
          sources={sources}
          rubric={rubric}
          onPrompt={setPrompt}
          onSources={setSources}
          onRubric={setRubric}
        />
        <GenerationCard
          generating={generating}
          activeRun={activeRun}
          errorMessage={workspaceError}
          onGenerate={handleGenerate}
        />
        <HistoryCard
          runs={runs ?? []}
          insertingRunId={insertingRunId}
          onInsert={handleInsertRun}
        />
      </aside>
    </div>
  );
}

function InputsCard({
  prompt,
  sources,
  rubric,
  onPrompt,
  onSources,
  onRubric,
}: {
  prompt: string;
  sources: string;
  rubric: string;
  onPrompt: (v: string) => void;
  onSources: (v: string) => void;
  onRubric: (v: string) => void;
}) {
  return (
    <section className="flex flex-col gap-4 border border-border bg-card p-4">
      <SectionHeader eyebrow="Inputs" />
      <p className="text-xs leading-relaxed text-muted-foreground">
        Prompt, sources, and rubric shape every generation.
      </p>
      <div className="flex flex-col gap-3">
        <InputField
          id="ws-prompt"
          label="Prompt"
          placeholder="The question, assignment, or thesis you're writing toward."
          value={prompt}
          onChange={onPrompt}
          rows={3}
        />
        <InputField
          id="ws-sources"
          label="Source material"
          placeholder="Paste research notes, quotes, or reference links."
          value={sources}
          onChange={onSources}
          rows={3}
        />
        <InputField
          id="ws-rubric"
          label="Rubric"
          placeholder="What does a strong piece look like here?"
          value={rubric}
          onChange={onRubric}
          rows={2}
        />
      </div>
    </section>
  );
}

function InputField({
  id,
  label,
  placeholder,
  value,
  onChange,
  rows,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={id}
        className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
      >
        {label}
      </Label>
      <Textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function GenerationCard({
  generating,
  activeRun,
  errorMessage,
  onGenerate,
}: {
  generating: boolean;
  activeRun: Doc<"writingRuns"> | null;
  errorMessage: string | null;
  onGenerate: (kind: RunKind) => void;
}) {
  const inFlight =
    generating ||
    activeRun?.status === "queued" ||
    activeRun?.status === "running";

  return (
    <section className="flex flex-col gap-4 border border-border bg-card p-4">
      <SectionHeader eyebrow="Generation" />
      <div className="flex flex-col gap-2">
        <Button
          className="w-full justify-start gap-2 rounded-none"
          disabled={inFlight}
          onClick={() => onGenerate("outline")}
        >
          <HugeiconsIcon icon={Idea01Icon} strokeWidth={1.8} />
          Generate outline
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 rounded-none"
          disabled={inFlight}
          onClick={() => onGenerate("draft")}
        >
          <HugeiconsIcon icon={FileEditIcon} strokeWidth={1.8} />
          Generate draft
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 rounded-none text-muted-foreground"
          disabled={inFlight || !activeRun}
          onClick={() => {
            if (activeRun) onGenerate(activeRun.kind);
          }}
        >
          <HugeiconsIcon icon={ArrowReloadHorizontalIcon} strokeWidth={1.8} />
          Regenerate last
        </Button>
      </div>
      {errorMessage ? (
        <div className="flex flex-col gap-1 border border-destructive/40 bg-destructive/5 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-destructive">
            Run error
          </p>
          <p className="text-sm leading-relaxed text-destructive">
            {errorMessage}
          </p>
        </div>
      ) : null}
      {activeRun ? (
        <div className="flex flex-col gap-2 border border-border bg-background p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Current run · {kindLabel(activeRun.kind)}
            </span>
            <StatusBadge status={activeRun.status} />
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {instructionSummary(activeRun.instruction)}
          </p>
          {activeRun.outputText ? (
            <p
              className={
                activeRun.status === "failed"
                  ? "text-sm leading-relaxed text-destructive"
                  : "line-clamp-4 text-sm leading-relaxed text-muted-foreground"
              }
            >
              {activeRun.outputText}
            </p>
          ) : (
            <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <HugeiconsIcon
                icon={Loading03Icon}
                strokeWidth={1.8}
                className="size-3 animate-spin"
              />
              Working on it…
            </p>
          )}
        </div>
      ) : (
        <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
          <HugeiconsIcon
            icon={SparklesIcon}
            strokeWidth={1.8}
            className="size-3"
          />
          Runs appear here as they execute.
        </p>
      )}
    </section>
  );
}

function HistoryCard({
  runs,
  insertingRunId,
  onInsert,
}: {
  runs: Doc<"writingRuns">[];
  insertingRunId: Id<"writingRuns"> | null;
  onInsert: (run: Doc<"writingRuns">) => void;
}) {
  return (
    <section className="flex flex-col gap-4 border border-border bg-card p-4">
      <SectionHeader
        eyebrow="History"
        meta={runs.length ? `${runs.length} latest` : "0"}
      />
      {runs.length === 0 ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Every run — outline, draft, rewrite — is stored as a structured record
          you can revisit or insert back into the draft.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {runs.map((run) => (
            <li
              key={run._id}
              className="flex flex-col gap-2 border border-border bg-background p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {kindLabel(run.kind)}
                </span>
                <StatusBadge status={run.status} />
              </div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
                {formatDateTime(run._creationTime)}
              </p>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                {instructionSummary(run.instruction)}
              </p>
              {run.outputText ? (
                <p
                  className={
                    run.status === "failed"
                      ? "text-sm leading-relaxed text-destructive"
                      : "line-clamp-4 text-sm leading-relaxed text-muted-foreground"
                  }
                >
                  {run.outputText}
                </p>
              ) : null}
              <div className="flex items-center justify-end pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 rounded-none"
                  disabled={
                    run.status !== "succeeded" ||
                    !run.outputText ||
                    insertingRunId !== null
                  }
                  onClick={() => onInsert(run)}
                >
                  <HugeiconsIcon icon={AiMagicIcon} strokeWidth={1.8} />
                  {insertingRunId === run._id ? "Inserting..." : "Insert at end"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DocumentWorkspaceSkeleton() {
  return (
    <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="h-3 w-20 animate-pulse bg-card/60" />
          <div className="h-9 w-72 animate-pulse bg-card/60" />
          <div className="h-4 w-48 animate-pulse bg-card/40" />
        </div>
        <div className="h-[520px] animate-pulse border border-border bg-card/40" />
      </section>
      <aside className="flex flex-col gap-4">
        <div className="h-48 animate-pulse border border-border bg-card/40" />
        <div className="h-40 animate-pulse border border-border bg-card/40" />
        <div className="h-56 animate-pulse border border-border bg-card/40" />
      </aside>
    </div>
  );
}
