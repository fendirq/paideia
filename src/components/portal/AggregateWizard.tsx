"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ─── Types ───

interface Sample {
  _id: string;
  label: string;
  content: string;
  wordCount: number;
}

interface TeacherProfile {
  gradeLevel: string;
  gradeOther: string;
  losesPointsFor: string[];
  losesPointsOther: string;
}

interface SelfAssessment {
  gradeRange: string;
  gradeRangeOther: string;
  revisionLevel: string;
  revisionOther: string;
  evidenceApproach: string;
  evidenceOther: string;
  conclusionApproach: string;
  conclusionOther: string;
  wordCountTendency: string;
  wordCountOther: string;
  writingHabits: string[];
  writingHabitsOther: string;
  quoteIntroStyle?: string[];
  quoteIntroOther?: string;
  overusedPhrases?: string[];
  overusedPhrasesOther?: string;
  selfEditFocus?: string[];
  selfEditOther?: string;
  timeSpentOn?: string;
  timeSpentOther?: string;
}

const DEFAULT_TEACHER: TeacherProfile = {
  gradeLevel: "",
  gradeOther: "",
  losesPointsFor: [],
  losesPointsOther: "",
};

const DEFAULT_SELF: SelfAssessment = {
  gradeRange: "",
  gradeRangeOther: "",
  revisionLevel: "",
  revisionOther: "",
  evidenceApproach: "",
  evidenceOther: "",
  conclusionApproach: "",
  conclusionOther: "",
  wordCountTendency: "",
  wordCountOther: "",
  writingHabits: [],
  writingHabitsOther: "",
};

// ─── Reusable Question Components ───

function SingleSelect({
  question,
  options,
  selected,
  onChange,
  otherValue,
  onOtherChange,
}: {
  question: string;
  options: string[];
  selected: string;
  onChange: (v: string) => void;
  otherValue: string;
  onOtherChange: (v: string) => void;
}) {
  const isOther = selected === "__other__";

  return (
    <div className="space-y-3">
      <h3 className="text-[15px] font-medium text-text-primary">{question}</h3>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
              selected === opt
                ? "bg-accent/20 border border-accent/40 text-accent-light"
                : "bg-[rgba(168,152,128,0.08)] border border-[rgba(168,152,128,0.15)] text-text-secondary hover:bg-[rgba(168,152,128,0.14)] hover:text-text-primary"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="border-t border-[rgba(168,152,128,0.15)]" />
      <button
        onClick={() => onChange("__other__")}
        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3 ${
          isOther
            ? "bg-accent/20 border border-accent/40 text-accent-light"
            : "bg-[rgba(168,152,128,0.08)] border border-[rgba(168,152,128,0.15)] text-text-muted hover:bg-[rgba(168,152,128,0.14)] hover:text-text-secondary"
        }`}
      >
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
        </svg>
        {isOther ? (
          <input
            type="text"
            value={otherValue}
            onChange={(e) => onOtherChange(e.target.value)}
            placeholder="Type your answer..."
            className="bg-transparent outline-none flex-1 text-text-primary placeholder:text-text-muted"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span>Something else</span>
        )}
      </button>
    </div>
  );
}

function MultiSelect({
  question,
  options,
  selected,
  onChange,
  otherValue,
  onOtherChange,
}: {
  question: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  otherValue: string;
  onOtherChange: (v: string) => void;
}) {
  const toggle = (opt: string) => {
    onChange(
      selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt]
    );
  };

  return (
    <div className="space-y-3">
      <h3 className="text-[15px] font-medium text-text-primary">{question}</h3>
      <div className="space-y-1.5">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3 ${
                active
                  ? "bg-accent/20 border border-accent/40 text-accent-light"
                  : "bg-[rgba(168,152,128,0.08)] border border-[rgba(168,152,128,0.15)] text-text-secondary hover:bg-[rgba(168,152,128,0.14)] hover:text-text-primary"
              }`}
            >
              <div className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                active ? "border-accent bg-accent" : "border-[rgba(168,152,128,0.30)]"
              }`}>
                {active && (
                  <svg className="w-3 h-3 text-[#281c14]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                )}
              </div>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="border-t border-[rgba(168,152,128,0.15)]" />
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[rgba(168,152,128,0.08)] border border-[rgba(168,152,128,0.15)]">
        <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
        </svg>
        <input
          type="text"
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="Something else..."
          className="bg-transparent outline-none flex-1 text-sm text-text-secondary placeholder:text-text-muted"
        />
      </div>
    </div>
  );
}

// ─── Wizard ───

export function AggregateWizard({ hasLevel2 = false }: { hasLevel2?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [level, setLevel] = useState<1 | 2>(1);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [teacher, setTeacher] = useState<TeacherProfile>({ ...DEFAULT_TEACHER });
  const [self, setSelf] = useState<SelfAssessment>({ ...DEFAULT_SELF });
  const [dragOver, setDragOver] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const [reviewExpanded, setReviewExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wizardRef = useRef<HTMLDivElement>(null);

  // Scroll to top of wizard when step changes
  useEffect(() => {
    wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  // Steps depend on level — Level 2 includes enhanced questions
  const steps = level === 2
    ? ["Level", "Samples", "Class", "You", "Enhanced", "Review"]
    : ["Level", "Samples", "Class", "You", "Review"];

  // Guard: clamp step if level switch reduces total steps
  useEffect(() => {
    if (step >= steps.length) setStep(steps.length - 1);
  }, [level, step, steps.length]);

  // Load existing profile on mount
  useEffect(() => {
    fetch("/api/portal/aggregate")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setHasExistingProfile(true);
          setLevel(data.profile.level === 2 ? 2 : 1);

          const tp = data.profile.teacherProfile ?? {};
          const sa = data.profile.selfAssessment ?? {};

          // New shape detection: check for losesPointsFor array (new) vs teacherPriorities (old)
          if (Array.isArray(tp.losesPointsFor)) {
            setTeacher(tp);
          } else {
            // Backward compat: map old fields
            setTeacher({
              gradeLevel: tp.gradeLevel || "",
              gradeOther: "",
              losesPointsFor: [],
              losesPointsOther: tp.teacherPenalizes || "",
            });
          }

          if (sa.revisionLevel !== undefined) {
            setSelf(sa);
          } else {
            // Backward compat: map old fields
            setSelf({
              ...DEFAULT_SELF,
              gradeRange: sa.gradeRange || "",
            });
          }
        }
        if (data.samples?.length) {
          setSamples(data.samples.map((s: Sample) => ({
            _id: crypto.randomUUID(),
            label: s.label,
            content: s.content,
            wordCount: s.wordCount,
          })));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const uploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).slice(0, 6 - samples.length);
    if (!fileArray.length) return;

    setUploading(true);
    const newSamples: Sample[] = [];

    setSaveError("");
    let failCount = 0;
    for (const file of fileArray) {
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch("/api/portal/upload-sample", { method: "POST", body: form });
        if (!res.ok) { failCount++; continue; }
        const { text, wordCount } = await res.json();
        newSamples.push({ _id: crypto.randomUUID(), label: file.name, content: text, wordCount });
      } catch {
        failCount++;
      }
    }

    if (failCount > 0) {
      setSaveError(`${failCount} file(s) could not be uploaded. Try again or use different files.`);
    }
    setSamples((prev) => [...prev, ...newSamples].slice(0, 6));
    setUploading(false);
  };

  const removeSample = useCallback((id: string) => {
    setSamples((prev) => prev.filter((s) => s._id !== id));
    setConfirmDelete(null);
  }, []);

  const canAdvance = (): boolean => {
    if (step === 0) return true; // Level selection — always valid
    const samplesStep = 1;
    const classStep = 2;
    const youStep = 3;

    // Require 3+ samples. Fewer than 3 gives the style-analysis model
    // too little signal — the schema asks for 10-15 signatureWords
    // and a confident voice fingerprint; 1-2 samples force the model
    // to hallucinate to fill the shape. Matches the UI copy "upload
    // 3-6 past essays".
    if (step === samplesStep) return samples.length >= 3;
    if (step === classStep) return !!teacher.gradeLevel;
    if (step === youStep) return !!self.gradeRange;
    // Level 2 Enhanced step requires at least the core fields
    if (step === 4 && level === 2) {
      return (self.quoteIntroStyle?.length ?? 0) > 0
        && (self.selfEditFocus?.length ?? 0) > 0
        && !!self.timeSpentOn;
    }
    return true;
  };

  const resolveValue = (val: string, other: string) =>
    val === "__other__" ? other : val;

  const save = useCallback(async () => {
    setSaving(true);
    setAnalyzing(true);
    setSaveError("");
    try {
      const res = await fetch("/api/portal/aggregate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          samples: samples.map((s, i) => ({
            label: s.label || `Sample ${i + 1}`,
            content: s.content,
            wordCount: s.wordCount,
          })),
          teacherProfile: teacher,
          selfAssessment: self,
        }),
      });
      if (res.ok) {
        // Parse response so we can surface a `warning` field (Level 1
        // style-analysis degraded, fingerprint unavailable, etc.) via
        // a query param the destination page can read. Without this
        // the server's warning contract is unused.
        const data: { warning?: string } = await res.json().catch(() => ({}));
        let dest = "/portal/home";
        if (nextUrl) {
          try {
            const parsed = new URL(nextUrl, window.location.origin);
            if (parsed.origin === window.location.origin && parsed.pathname.startsWith("/portal/")) {
              dest = parsed.pathname + (parsed.search || "") + (parsed.hash || "");
            }
          } catch {}
        }
        if (data.warning) {
          const sep = dest.includes("?") ? "&" : "?";
          dest = `${dest}${sep}warning=${encodeURIComponent(data.warning)}`;
        }
        router.push(dest);
      } else {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || "Failed to save profile. Please try again.");
      }
    } catch {
      setSaveError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
      setAnalyzing(false);
    }
  }, [level, samples, teacher, self, router, nextUrl]);

  if (loading) {
    return <p className="text-text-muted text-center py-12">Loading...</p>;
  }

  return (
    <div ref={wizardRef} className="glass p-8">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((label, i) => (
          <button
            key={label}
            onClick={() => {
              if (hasExistingProfile || i < step) {
                setConfirmDelete(null);
                setStep(i);
              }
            }}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              i === step
                ? "bg-accent text-[#281c14] font-medium"
                : hasExistingProfile || i < step
                  ? "bg-[rgba(168,152,128,0.10)] text-text-secondary cursor-pointer hover:bg-[rgba(168,152,128,0.20)]"
                  : "bg-[rgba(168,152,128,0.08)] text-text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Step 0: Level Selection */}
      {step === 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary mb-1">Choose Your Level</h2>
            <p className="text-text-secondary text-sm">
              This determines how many questions we ask and which AI model generates your essays.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => { setLevel(1); setStep(1); }}
              className={`text-left p-6 rounded-2xl transition-all ${
                level === 1
                  ? "bg-accent/10 ring-2 ring-accent/60 border border-accent/30"
                  : "bg-[rgba(168,152,128,0.08)] border border-[rgba(168,152,128,0.15)] opacity-60 hover:opacity-80"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-display font-semibold text-text-primary">Level 1</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(168,152,128,0.08)] text-text-muted">Standard</span>
              </div>
              <p className="text-sm text-text-muted">
                8 questions about your writing. Fast setup, solid results.
              </p>
            </button>
            <button
              onClick={() => hasLevel2 ? (() => { setLevel(2); setStep(1); })() : (window.location.href = "/portal/upgrade")}
              className={`text-left p-6 rounded-2xl transition-all ${
                !hasLevel2
                  ? "bg-[rgba(168,152,128,0.08)] border border-[rgba(168,152,128,0.15)] opacity-50 hover:opacity-70"
                  : level === 2
                    ? "bg-accent/10 ring-2 ring-accent/60 border border-accent/30"
                    : "bg-[rgba(168,152,128,0.08)] border border-[rgba(168,152,128,0.15)] opacity-60 hover:opacity-80"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {!hasLevel2 && (
                  <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                )}
                <span className="text-sm font-display font-semibold text-text-primary">Level 2</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent-light">
                  {hasLevel2 ? "Enhanced" : "Unlock"}
                </span>
              </div>
              <p className="text-sm text-text-muted">
                {hasLevel2
                  ? "12 in-depth questions for the most accurate voice match. Multi-pass refinement."
                  : "Unlock enhanced voice matching and multi-pass refinement."}
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Writing Samples */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary mb-1">Writing Samples</h2>
            <p className="text-text-secondary text-sm">
              Upload 3-6 past essays. We&apos;ll analyze your writing style, tone, and patterns automatically.
            </p>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-accent bg-accent/10"
                : "border-[rgba(168,152,128,0.20)] hover:border-[rgba(168,152,128,0.40)]"
            } ${samples.length >= 6 ? "opacity-30 pointer-events-none" : ""}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc"
              multiple
              onChange={(e) => {
                if (e.target.files?.length) uploadFiles(e.target.files);
                e.target.value = "";
              }}
              className="hidden"
            />
            <svg className="w-10 h-10 mx-auto mb-3 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
            </svg>
            <p className="text-text-primary font-medium text-sm mb-1">
              {uploading ? "Uploading..." : "Drop files here or click to browse"}
            </p>
            <p className="text-text-muted text-xs">
              {samples.length}/6 files uploaded &middot; PDF or DOCX
            </p>
          </div>

          {/* Uploaded files list */}
          {samples.length > 0 && (
            <div className="space-y-2">
              {samples.map((sample) => (
                <div
                  key={sample._id}
                  className="flex items-center justify-between bg-[rgba(168,152,128,0.08)] border border-[rgba(168,152,128,0.15)] rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span className="text-text-primary text-sm truncate">{sample.label}</span>
                    <span className="text-text-muted text-xs shrink-0">{sample.wordCount} words</span>
                  </div>
                  {confirmDelete === sample._id ? (
                    <div className="flex items-center gap-3 ml-3 shrink-0">
                      <span className="text-text-muted text-xs">Remove?</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeSample(sample._id); }}
                        className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(null); }}
                        className="text-text-muted hover:text-text-secondary text-xs transition-colors"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(sample._id)}
                      className="text-text-muted hover:text-text-secondary transition-colors ml-3 p-1 rounded-lg hover:bg-[rgba(168,152,128,0.08)]"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Your Class */}
      {step === 2 && (
        <div className="space-y-8">
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary mb-1">Your Class</h2>
            <p className="text-text-muted text-sm">Tell us about your class and teacher.</p>
          </div>

          <SingleSelect
            question="What grade level are you in?"
            options={[
              "11th Grade",
              "12th Grade",
              "College Freshman",
              "College Sophomore",
              "College Junior-Senior",
              "Graduate",
            ]}
            selected={teacher.gradeLevel}
            onChange={(v) => setTeacher({ ...teacher, gradeLevel: v })}
            otherValue={teacher.gradeOther}
            onOtherChange={(v) => setTeacher({ ...teacher, gradeOther: v })}
          />

          <MultiSelect
            question="What do you consistently lose points for?"
            options={[
              "Weak or unclear thesis",
              "Not enough evidence or quotes",
              "Surface-level analysis — not going deep enough",
              "Poor structure or organization",
              "Grammar and spelling errors",
              "Not following the prompt or rubric",
              "Weak introductions or conclusions",
              "Run-on sentences or fragments",
              "Lack of transitions between ideas",
              "Too informal or wrong tone",
              "Not citing sources properly",
            ]}
            selected={teacher.losesPointsFor}
            onChange={(v) => setTeacher({ ...teacher, losesPointsFor: v })}
            otherValue={teacher.losesPointsOther}
            onOtherChange={(v) => setTeacher({ ...teacher, losesPointsOther: v })}
          />
        </div>
      )}

      {/* Step 3: About You */}
      {step === 3 && (
        <div className="space-y-8">
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary mb-1">About You</h2>
            <p className="text-text-muted text-sm">Help us match your writing level and habits.</p>
          </div>

          <SingleSelect
            question="What grade do you typically get on essays?"
            options={["A / A-", "B+ / B", "B- / C+", "C or below"]}
            selected={self.gradeRange}
            onChange={(v) => setSelf({ ...self, gradeRange: v })}
            otherValue={self.gradeRangeOther}
            onOtherChange={(v) => setSelf({ ...self, gradeRangeOther: v })}
          />

          <SingleSelect
            question="How much do you revise before submitting?"
            options={[
              "I submit my first draft as-is",
              "I reread and fix obvious errors",
              "I do heavy revision across multiple drafts",
            ]}
            selected={self.revisionLevel}
            onChange={(v) => setSelf({ ...self, revisionLevel: v })}
            otherValue={self.revisionOther}
            onOtherChange={(v) => setSelf({ ...self, revisionOther: v })}
          />

          <SingleSelect
            question="When you use a quote or evidence, what do you usually do?"
            options={[
              "Drop it in and move on — the quote speaks for itself",
              "Explain what it means in a sentence or two",
              "Break it down and connect it back to my thesis",
              "I mostly paraphrase instead of quoting directly",
            ]}
            selected={self.evidenceApproach}
            onChange={(v) => setSelf({ ...self, evidenceApproach: v })}
            otherValue={self.evidenceOther}
            onOtherChange={(v) => setSelf({ ...self, evidenceOther: v })}
          />

          <SingleSelect
            question="How do you handle conclusions?"
            options={[
              "Restate thesis and summarize my points",
              "Try to add a final insight or broader connection",
              "They're usually my weakest part — I rush them",
              "I don't usually write a distinct conclusion",
            ]}
            selected={self.conclusionApproach}
            onChange={(v) => setSelf({ ...self, conclusionApproach: v })}
            otherValue={self.conclusionOther}
            onOtherChange={(v) => setSelf({ ...self, conclusionOther: v })}
          />

          <SingleSelect
            question="Do you usually hit the word/page count?"
            options={[
              "I struggle to reach the minimum",
              "I land right around the target",
              "I usually write too much and have to trim",
            ]}
            selected={self.wordCountTendency}
            onChange={(v) => setSelf({ ...self, wordCountTendency: v })}
            otherValue={self.wordCountOther}
            onOtherChange={(v) => setSelf({ ...self, wordCountOther: v })}
          />

          <MultiSelect
            question="What are your go-to writing habits?"
            options={[
              "I start essays with a question or hook quote",
              "I overuse certain transition words (however, furthermore, etc.)",
              "My introductions tend to be long/wordy",
              "I write in first person even when I probably shouldn't",
              "I use rhetorical questions a lot",
              "I repeat my thesis in different words throughout",
              "My paragraphs tend to be short",
              "I use informal language or slang sometimes",
              "I have a go-to closing phrase or style",
              "I struggle with commas and punctuation",
            ]}
            selected={self.writingHabits}
            onChange={(v) => setSelf({ ...self, writingHabits: v })}
            otherValue={self.writingHabitsOther}
            onOtherChange={(v) => setSelf({ ...self, writingHabitsOther: v })}
          />
        </div>
      )}

      {/* Step 4: Enhanced Profile — Level 2 only */}
      {step === 4 && level === 2 && (
        <div className="space-y-8">
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary mb-1">Enhanced Profile</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent-light font-medium">Level 2</span>
              <p className="text-text-muted text-sm">Deeper questions for the most accurate voice match.</p>
            </div>
          </div>

          <MultiSelect
            question="How do you introduce quotes into your writing?"
            options={[
              '"According to [author]..."',
              '"As [author] states/argues/explains..."',
              '"In the text, it says..."',
              "I just place the quote after my sentence",
              '"[Author] writes that..."',
              "I mostly paraphrase and rarely quote directly",
            ]}
            selected={self.quoteIntroStyle ?? []}
            onChange={(v) => setSelf({ ...self, quoteIntroStyle: v })}
            otherValue={self.quoteIntroOther ?? ""}
            onOtherChange={(v) => setSelf({ ...self, quoteIntroOther: v })}
          />

          <MultiSelect
            question="What words or phrases do you know you overuse?"
            options={[
              '"However" / "Furthermore" / "Moreover"',
              '"In conclusion" / "Overall" / "To summarize"',
              '"This shows that" / "This proves that"',
              '"Very" / "Really" / "Basically"',
              '"Additionally" / "Also"',
              '"It is important to note"',
            ]}
            selected={self.overusedPhrases ?? []}
            onChange={(v) => setSelf({ ...self, overusedPhrases: v })}
            otherValue={self.overusedPhrasesOther ?? ""}
            onOtherChange={(v) => setSelf({ ...self, overusedPhrasesOther: v })}
          />

          <MultiSelect
            question="When you reread before submitting, what do you usually fix?"
            options={[
              "Spelling and typos",
              "Awkward sentence phrasing",
              "Adding more analysis or explanation",
              "Making my thesis clearer",
              "Fixing transitions between paragraphs",
              "I don't usually reread before submitting",
            ]}
            selected={self.selfEditFocus ?? []}
            onChange={(v) => setSelf({ ...self, selfEditFocus: v })}
            otherValue={self.selfEditOther ?? ""}
            onOtherChange={(v) => setSelf({ ...self, selfEditOther: v })}
          />

          <SingleSelect
            question="What part of the essay do you spend the most time on?"
            options={[
              "Introduction — I need to get the opening right",
              "Body paragraphs — the analysis takes the most work",
              "Conclusion — I try to end strong",
              "Thesis statement — I rewrite it multiple times",
              "I spread my effort pretty evenly",
            ]}
            selected={self.timeSpentOn ?? ""}
            onChange={(v) => setSelf({ ...self, timeSpentOn: v })}
            otherValue={self.timeSpentOther ?? ""}
            onOtherChange={(v) => setSelf({ ...self, timeSpentOther: v })}
          />
        </div>
      )}

      {/* Review & Save — last step */}
      {step === steps.length - 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary mb-1">Review & Save</h2>
            <p className="text-text-secondary text-sm">
              {analyzing
                ? "Analyzing your writing style..."
                : "We'll analyze your writing samples and build a style fingerprint when you save."}
            </p>
          </div>

          {/* Writer Type Prediction */}
          <WriterTypePrediction
            gradeRange={resolveValue(self.gradeRange, self.gradeRangeOther)}
            revision={resolveValue(self.revisionLevel, self.revisionOther)}
            evidence={resolveValue(self.evidenceApproach, self.evidenceOther)}
            conclusion={resolveValue(self.conclusionApproach, self.conclusionOther)}
            wordCount={resolveValue(self.wordCountTendency, self.wordCountOther)}
            habits={self.writingHabits}
            level={level}
          />

          {/* Collapsible Profile Summary */}
          <button
            onClick={() => setReviewExpanded(!reviewExpanded)}
            className="w-full flex items-center justify-between bg-[rgba(168,152,128,0.08)] border border-[rgba(168,152,128,0.15)] rounded-xl px-5 py-4 transition-colors hover:bg-[rgba(168,152,128,0.08)]"
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
              </svg>
              <span className="text-sm text-text-secondary">Your responses</span>
              <span className="text-xs text-text-muted">{level === 2 ? "12 questions" : "8 questions"}</span>
            </div>
            <svg className={`w-4 h-4 text-text-muted transition-transform ${reviewExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {reviewExpanded && (
            <div className="space-y-2 pl-2">
              <ReviewItem label="Level" value={`Level ${level} — ${level === 2 ? "Enhanced" : "Standard"}`} />
              <ReviewItem label="Samples" value={`${samples.length} file(s) — ${samples.reduce((sum, s) => sum + s.wordCount, 0)} words`} />
              <ReviewItem label="Grade Level" value={resolveValue(teacher.gradeLevel, teacher.gradeOther)} />
              <ReviewItem label="Loses points for" value={[...teacher.losesPointsFor, teacher.losesPointsOther].filter(Boolean).join(", ")} />
              <ReviewItem label="Typical grade" value={resolveValue(self.gradeRange, self.gradeRangeOther)} />
              <ReviewItem label="Revision" value={resolveValue(self.revisionLevel, self.revisionOther)} />
              <ReviewItem label="Evidence" value={resolveValue(self.evidenceApproach, self.evidenceOther)} />
              <ReviewItem label="Conclusions" value={resolveValue(self.conclusionApproach, self.conclusionOther)} />
              <ReviewItem label="Word count" value={resolveValue(self.wordCountTendency, self.wordCountOther)} />
              <ReviewItem label="Habits" value={[...self.writingHabits, self.writingHabitsOther].filter(Boolean).join(", ")} />
              {level === 2 && (
                <>
                  <div className="border-t border-[rgba(168,152,128,0.15)] pt-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent-light font-medium">Level 2</span>
                  </div>
                  <ReviewItem label="Quote intros" value={[...(self.quoteIntroStyle ?? []), self.quoteIntroOther].filter(Boolean).join(", ")} />
                  <ReviewItem label="Overused phrases" value={[...(self.overusedPhrases ?? []), self.overusedPhrasesOther].filter(Boolean).join(", ")} />
                  <ReviewItem label="Self-editing" value={[...(self.selfEditFocus ?? []), self.selfEditOther].filter(Boolean).join(", ")} />
                  <ReviewItem label="Most time on" value={resolveValue(self.timeSpentOn ?? "", self.timeSpentOther ?? "")} />
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-[rgba(168,152,128,0.15)]">
        <button
          onClick={() => step === 0 ? router.back() : setStep(step - 1)}
          className="text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          Back
        </button>
        {step < steps.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canAdvance()}
            className="bg-accent hover:bg-accent-light text-[#281c14] font-display text-sm font-semibold rounded-xl px-6 py-2.5 transition-colors disabled:opacity-30"
          >
            Next
          </button>
        ) : (
          <button
            onClick={save}
            disabled={saving}
            className="bg-accent hover:bg-accent-light text-[#281c14] font-display text-sm font-semibold rounded-xl px-6 py-2.5 transition-colors disabled:opacity-50"
          >
            {analyzing ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing your style...
              </span>
            ) : saving ? "Saving..." : "Save Profile"}
          </button>
        )}
      </div>

      {saveError && (
        <p className="text-red-400 text-sm text-center mt-4">{saveError}</p>
      )}
    </div>
  );
}

// ─── Shared Components ───

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[rgba(168,152,128,0.15)] rounded-xl px-4 py-3">
      <span className="text-text-muted text-xs">{label}</span>
      <p className="text-text-primary text-sm mt-0.5">{value || "Not set"}</p>
    </div>
  );
}

// ─── Writer Type Prediction ───

function getWriterType(
  gradeRange: string,
  revision: string,
  evidence: string,
  conclusion: string,
  wordCount: string,
  habits: string[]
): { title: string; description: string; traits: string[] } {
  // Score dimensions
  const isHighGrade = gradeRange.includes("A");
  const isLowGrade = gradeRange.includes("C");
  const isFirstDraft = revision.includes("first draft");
  const isHeavyReviser = revision.includes("heavy revision");
  const dropsQuotes = evidence.includes("Drop it in");
  const deepAnalyzer = evidence.includes("Break it down");
  const rushesConclusions = conclusion.includes("weakest part") || conclusion.includes("don't usually");
  const overWrites = wordCount.includes("too much");
  const underWrites = wordCount.includes("struggle");
  const usesFirstPerson = habits.includes("I write in first person even when I probably shouldn't");
  const usesInformal = habits.includes("I use informal language or slang sometimes");
  const shortParagraphs = habits.includes("My paragraphs tend to be short");

  if (isHighGrade && isHeavyReviser && deepAnalyzer) {
    return {
      title: "The Perfectionist",
      description: "You revise heavily, analyze deeply, and aim high. Your writing is polished — sometimes over-polished. The AI will match your precision without making the essay feel robotic.",
      traits: ["High standards", "Deep analysis", "Multiple drafts"],
    };
  }

  if (isFirstDraft && (dropsQuotes || rushesConclusions)) {
    return {
      title: "The Sprint Writer",
      description: "You write fast and submit. Your essays have raw energy but may lack polish in conclusions and evidence integration. The AI will replicate that authentic first-draft feel.",
      traits: ["Fast drafts", "Raw energy", "Rough edges"],
    };
  }

  if (overWrites && (usesFirstPerson || usesInformal)) {
    return {
      title: "The Conversationalist",
      description: "You write like you talk — expressive, sometimes informal, always over the word count. The AI will capture your natural voice without toning it down.",
      traits: ["Verbose", "Expressive", "Informal tone"],
    };
  }

  if (underWrites && shortParagraphs) {
    return {
      title: "The Minimalist",
      description: "You say what you need to say and stop. Short paragraphs, tight sentences, never hitting the word count. The AI will write lean, not pad with filler.",
      traits: ["Concise", "Short paragraphs", "Under word count"],
    };
  }

  if (isLowGrade && rushesConclusions) {
    return {
      title: "The Work-in-Progress",
      description: "You're still developing your writing toolkit. The AI will match your current level honestly — not polished beyond recognition, but working with what you've got.",
      traits: ["Developing skills", "Rushed endings", "Growing"],
    };
  }

  if (deepAnalyzer && !isFirstDraft) {
    return {
      title: "The Analyst",
      description: "You live in the body paragraphs — evidence, analysis, connections. Your strength is making arguments, not necessarily wrapping them up neatly. The AI gets that.",
      traits: ["Evidence-driven", "Strong analysis", "Thesis-focused"],
    };
  }

  // Default
  return {
    title: "The Balanced Writer",
    description: "You have a steady approach — not too rushed, not too polished. You balance structure and voice. The AI will replicate your consistent middle-ground style.",
    traits: ["Consistent", "Balanced effort", "Reliable voice"],
  };
}

function WriterTypePrediction({
  gradeRange,
  revision,
  evidence,
  conclusion,
  wordCount,
  habits,
  level,
}: {
  gradeRange: string;
  revision: string;
  evidence: string;
  conclusion: string;
  wordCount: string;
  habits: string[];
  level: 1 | 2;
}) {
  const writerType = getWriterType(gradeRange, revision, evidence, conclusion, wordCount, habits);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[rgba(168,152,128,0.15)] bg-gradient-to-br from-accent/10 via-white/[0.04] to-white/[0.02] p-6">
      {/* Decorative glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />

      <div className="relative space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
            </svg>
          </div>
          <div>
            <p className="text-text-muted text-xs uppercase tracking-wider">Your writer type</p>
            <h3 className="text-lg font-display font-semibold text-text-primary">{writerType.title}</h3>
          </div>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed">{writerType.description}</p>

        <div className="flex flex-wrap gap-2">
          {writerType.traits.map((trait) => (
            <span
              key={trait}
              className="text-xs px-3 py-1 rounded-full bg-[rgba(168,152,128,0.08)] border border-[rgba(168,152,128,0.15)] text-text-muted"
            >
              {trait}
            </span>
          ))}
          <span className="text-xs px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent-light">
            Level {level}
          </span>
        </div>
      </div>
    </div>
  );
}
