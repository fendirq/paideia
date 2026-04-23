"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircleIcon,
  CircleIcon,
  FileAddIcon,
  Delete02Icon,
  SparklesIcon,
  QuillWrite02Icon,
} from "@hugeicons/core-free-icons";

import { api } from "../../../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SAMPLE_TARGET = 3;

type ChecklistStep = {
  id: "01" | "02" | "03";
  title: string;
  description: string;
  done: boolean;
};

export function ProfileTrainingFlow() {
  const profile = useQuery(api.profile.getProfile);
  const samples = useQuery(
    api.profile.listSamples,
    profile ? { profileId: profile._id } : "skip",
  );
  const createProfile = useMutation(api.profile.createProfile);
  const addSampleMetadata = useMutation(api.profile.addSampleMetadata);
  const updateProfileSummary = useMutation(api.profile.updateProfileSummary);
  const markProfileReady = useMutation(api.profile.markProfileReady);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [notes, setNotes] = useState("");
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [readyingProfile, setReadyingProfile] = useState(false);

  const sampleCount = profile?.sampleCount ?? 0;
  const isReady = profile?.status === "ready";
  const hasNotes = Boolean(profile?.summary?.trim());
  const canMarkReady = sampleCount >= SAMPLE_TARGET && hasNotes;
  const progress = Math.min(
    100,
    Math.round((sampleCount / SAMPLE_TARGET) * 100),
  );

  useEffect(() => {
    setNotes(profile?.summary ?? "");
  }, [profile?._id, profile?.summary]);

  const checklist = useMemo<ChecklistStep[]>(
    () => [
      {
        id: "01",
        title: "Upload samples",
        description: "Add 3–5 writing pieces that sound like you.",
        done: sampleCount >= 1,
      },
      {
        id: "02",
        title: "Add preferences",
        description: "Teach Paideia the tone, rhythm, and habits to keep.",
        done: hasNotes,
      },
      {
        id: "03",
        title: "Mark ready",
        description: "Activate the profile so drafts generate in your voice.",
        done: isReady,
      },
    ],
    [hasNotes, isReady, sampleCount],
  );

  async function handleStartTraining() {
    if (starting) return;
    setStarting(true);
    try {
      await createProfile({});
    } finally {
      setStarting(false);
    }
  }

  async function handleAddSample(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile || submitting) return;
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    setSubmitting(true);
    try {
      const trimmedExcerpt = excerpt.trim();
      await addSampleMetadata({
        profileId: profile._id,
        title: trimmedTitle,
        excerpt: trimmedExcerpt.length > 0 ? trimmedExcerpt : null,
      });
      setTitle("");
      setExcerpt("");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveNotes(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile || savingNotes) return;
    setSavingNotes(true);
    try {
      await updateProfileSummary({
        profileId: profile._id,
        summary: notes.trim(),
      });
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleMarkReady() {
    if (!profile || readyingProfile || !canMarkReady) return;
    setReadyingProfile(true);
    try {
      await markProfileReady({ profileId: profile._id });
    } finally {
      setReadyingProfile(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-10 font-sans">
      <header className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Voice training
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex max-w-2xl flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Train your writing profile
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Upload 3–5 real writing samples so Paideia learns your voice. The
              more honest the material, the more the model will sound like you
              when it drafts and rewrites.
            </p>
          </div>
          {isReady ? (
            <Badge className="h-6 gap-1.5 bg-primary px-2.5 text-[11px] uppercase tracking-[0.16em]">
              <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} />
              Profile ready
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="h-6 gap-1.5 px-2.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
            >
              <HugeiconsIcon icon={QuillWrite02Icon} strokeWidth={2} />
              {profile ? "Training in progress" : "Not started"}
            </Badge>
          )}
        </div>
      </header>

      <section aria-labelledby="checklist-heading" className="flex flex-col gap-3">
        <h2
          id="checklist-heading"
          className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
        >
          Checklist
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {checklist.map((step) => (
            <Card
              key={step.id}
              data-state={step.done ? "done" : "pending"}
              className="relative bg-card/70 transition-colors data-[state=done]:bg-card"
            >
              <CardHeader className="gap-2">
                <div className="flex items-start justify-between gap-3">
                  <span
                    aria-hidden
                    className="flex size-8 items-center justify-center border border-border bg-background font-mono text-[11px] font-semibold tracking-tight text-muted-foreground"
                  >
                    {step.id}
                  </span>
                  <HugeiconsIcon
                    icon={step.done ? CheckmarkCircleIcon : CircleIcon}
                    strokeWidth={1.8}
                    size={18}
                    className={
                      step.done ? "text-primary" : "text-muted-foreground/50"
                    }
                  />
                </div>
                <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
                  {step.title}
                </CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {profile ? (
        <section aria-labelledby="samples-heading" className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h2
                  id="samples-heading"
                  className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                >
                  Training progress
                </h2>
                <p className="text-sm text-foreground">
                  {sampleCount} / {SAMPLE_TARGET} samples added
                </p>
              </div>
              {isReady ? (
                <Badge className="h-6 px-2.5 text-[11px] uppercase tracking-[0.16em]">
                  Profile ready
                </Badge>
              ) : null}
            </div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              className="h-1.5 w-full overflow-hidden bg-secondary"
            >
              <div
                className="h-full bg-primary transition-[width] duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Ready unlocks once you&apos;ve added {SAMPLE_TARGET} samples and
              captured the voice notes Paideia should preserve.
            </p>
          </div>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
                Voice notes
              </CardTitle>
              <CardDescription>
                Capture the tone, pacing, habits, and context Paideia should
                hold onto when it drafts in your voice.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4" onSubmit={handleSaveNotes}>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="profile-summary">Preferences and context</Label>
                  <Textarea
                    id="profile-summary"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Examples: keep my intros direct, avoid over-formal transitions, and preserve my habit of grounding claims in lived examples."
                    rows={5}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {hasNotes
                      ? "Voice notes saved. Update them any time as your writing goals shift."
                      : "Add a few lines about your voice before marking this profile ready."}
                  </p>
                  <Button
                    type="submit"
                    variant="outline"
                    className="gap-2 rounded-none"
                    disabled={savingNotes}
                  >
                    {savingNotes ? "Saving…" : "Save notes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {samples === undefined ? (
            <Card className="bg-card/60">
              <CardContent className="py-10 text-center text-xs text-muted-foreground">
                Loading samples…
              </CardContent>
            </Card>
          ) : samples.length === 0 ? (
            <Card className="border-dashed bg-card/60">
              <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                <span className="flex size-12 items-center justify-center border border-border bg-background text-muted-foreground">
                  <HugeiconsIcon
                    icon={FileAddIcon}
                    strokeWidth={1.6}
                    size={22}
                  />
                </span>
                <div className="flex max-w-sm flex-col gap-1.5">
                  <p className="text-sm font-semibold tracking-tight text-foreground">
                    No samples yet
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Add your first piece of writing below. A paragraph is
                    enough — a full essay is better.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {samples.map((sample) => (
                <Card key={sample._id} className="bg-card">
                  <CardHeader className="flex flex-row items-start justify-between gap-2">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
                        {sample.title}
                      </CardTitle>
                      <CardDescription>
                        {sample.excerpt
                          ? `${sample.excerpt.slice(0, 180)}${sample.excerpt.length > 180 ? "…" : ""}`
                          : "No excerpt provided."}
                      </CardDescription>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 shrink-0 rounded-none text-muted-foreground"
                      aria-label="Remove sample"
                      disabled
                    >
                      <HugeiconsIcon
                        icon={Delete02Icon}
                        strokeWidth={1.8}
                        size={14}
                      />
                    </Button>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
                Add a sample
              </CardTitle>
              <CardDescription>
                Paste a title and an excerpt. You can replace or extend this
                later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="flex flex-col gap-4"
                onSubmit={handleAddSample}
              >
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="sample-title">Title</Label>
                  <Input
                    id="sample-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. College essay — summer internship"
                    maxLength={120}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="sample-excerpt">Excerpt</Label>
                  <Textarea
                    id="sample-excerpt"
                    value={excerpt}
                    onChange={(event) => setExcerpt(event.target.value)}
                    placeholder="Paste a paragraph or two that represents how you write."
                    rows={5}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] text-muted-foreground">
                    {sampleCount >= SAMPLE_TARGET
                      ? "You can keep adding — more samples sharpen the voice."
                      : `${SAMPLE_TARGET - sampleCount} more to unlock ready review.`}
                  </p>
                  <Button
                    type="submit"
                    className="rounded-none gap-2"
                    disabled={submitting || title.trim().length === 0}
                  >
                    <HugeiconsIcon icon={FileAddIcon} strokeWidth={2} />
                    {submitting ? "Adding…" : "Add sample"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
                Readiness
              </CardTitle>
              <CardDescription>
                Confirm the profile only after the samples and notes feel like a
                real baseline for your writing voice.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center justify-between gap-3">
              <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                {isReady
                  ? "This profile is ready for document drafting and revision flows."
                  : canMarkReady
                    ? "Everything is in place. Mark the profile ready when you want future drafts to rely on this training set."
                    : "To mark ready, add at least three samples and save your voice notes first."}
              </p>
              <Button
                type="button"
                className="gap-2 rounded-none"
                onClick={handleMarkReady}
                disabled={isReady || readyingProfile || !canMarkReady}
              >
                <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} />
                {isReady
                  ? "Profile ready"
                  : readyingProfile
                    ? "Marking ready…"
                    : "Mark ready"}
              </Button>
            </CardContent>
          </Card>
        </section>
      ) : (
        <section aria-labelledby="start-heading">
          <Card className="border-dashed bg-card/60">
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <span className="flex size-14 items-center justify-center border border-border bg-background text-muted-foreground">
                <HugeiconsIcon icon={FileAddIcon} strokeWidth={1.6} size={28} />
              </span>
              <div className="flex max-w-sm flex-col gap-1.5">
                <h2
                  id="start-heading"
                  className="font-heading text-base font-semibold tracking-tight text-foreground"
                >
                  Start voice training
                </h2>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Create a profile to begin uploading samples. You can pause and
                  return any time — nothing ships to the editor until you mark
                  the profile ready.
                </p>
              </div>
              <Button
                size="lg"
                className="rounded-none gap-2"
                onClick={handleStartTraining}
                disabled={starting}
              >
                <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} />
                {starting ? "Starting…" : "Start training"}
              </Button>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
