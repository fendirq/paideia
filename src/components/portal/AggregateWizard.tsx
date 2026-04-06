"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── Types ───

interface Sample {
  label: string;
  content: string;
  wordCount: number;
  mode: "paste" | "upload";
}

interface TeacherProfile {
  gradeLevel: string;
  strictness: string[];
  focusAreas: string[];
  notes: string;
}

interface SelfAssessment {
  writingStrength: string;
  writingWeakness: string;
  gradeRange: string;
  effortLevel: string;
}

interface WritingStyle {
  toneTraits: string[];
  sentenceStyle: string[];
  vocabularyLevel: string;
  commonPhrases: string;
  quirks: string;
}

const EMPTY_SAMPLE: Sample = { label: "", content: "", wordCount: 0, mode: "paste" };

const DEFAULT_TEACHER: TeacherProfile = {
  gradeLevel: "",
  strictness: [],
  focusAreas: [],
  notes: "",
};

const DEFAULT_SELF: SelfAssessment = {
  writingStrength: "",
  writingWeakness: "",
  gradeRange: "",
  effortLevel: "",
};

const DEFAULT_STYLE: WritingStyle = {
  toneTraits: [],
  sentenceStyle: [],
  vocabularyLevel: "",
  commonPhrases: "",
  quirks: "",
};

// ─── Wizard ───

export function AggregateWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [samples, setSamples] = useState<Sample[]>(
    Array.from({ length: 6 }, () => ({ ...EMPTY_SAMPLE }))
  );
  const [teacher, setTeacher] = useState<TeacherProfile>({ ...DEFAULT_TEACHER });
  const [self, setSelf] = useState<SelfAssessment>({ ...DEFAULT_SELF });
  const [style, setStyle] = useState<WritingStyle>({ ...DEFAULT_STYLE });

  // Load existing profile on mount
  useEffect(() => {
    fetch("/api/portal/aggregate")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setTeacher(data.profile.teacherProfile ?? DEFAULT_TEACHER);
          setSelf(data.profile.selfAssessment ?? DEFAULT_SELF);
          setStyle(data.profile.writingStyle ?? DEFAULT_STYLE);
        }
        if (data.samples?.length) {
          const loaded = data.samples.map((s: { label: string; content: string; wordCount: number }) => ({
            label: s.label,
            content: s.content,
            wordCount: s.wordCount,
            mode: "paste" as const,
          }));
          while (loaded.length < 6) loaded.push({ ...EMPTY_SAMPLE });
          setSamples(loaded);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateSample = (i: number, partial: Partial<Sample>) => {
    setSamples((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], ...partial };
      if ("content" in partial) {
        next[i].wordCount = (partial.content ?? "").split(/\s+/).filter(Boolean).length;
      }
      return next;
    });
  };

  const handleFileUpload = async (i: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/portal/upload-sample", { method: "POST", body: form });
    if (!res.ok) return;
    const { text, wordCount } = await res.json();
    updateSample(i, { content: text, wordCount, label: samples[i].label || file.name });
  };

  const filledSamples = samples.filter((s) => s.content.trim().length > 0);

  const canAdvance = (): boolean => {
    if (step === 0) return filledSamples.length >= 1 && filledSamples.every((s) => s.wordCount >= 200);
    if (step === 1) return !!teacher.gradeLevel;
    if (step === 2) return !!self.gradeRange;
    if (step === 3) return style.toneTraits.length > 0;
    return true;
  };

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/portal/aggregate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          samples: filledSamples.map((s, i) => ({
            label: s.label || `Sample ${i + 1}`,
            content: s.content,
            wordCount: s.wordCount,
          })),
          teacherProfile: teacher,
          selfAssessment: self,
          writingStyle: style,
        }),
      });
      if (res.ok) router.push("/portal/home");
    } finally {
      setSaving(false);
    }
  }, [filledSamples, teacher, self, style, router]);

  if (loading) {
    return <p className="text-text-muted text-center py-12">Loading...</p>;
  }

  const steps = ["Samples", "Teacher", "Self", "Style", "Review"];

  return (
    <div className="glass p-8">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((label, i) => (
          <button
            key={label}
            onClick={() => i < step && setStep(i)}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              i === step
                ? "bg-accent text-bg-base font-medium"
                : i < step
                  ? "bg-white/10 text-text-secondary cursor-pointer hover:bg-white/20"
                  : "bg-white/[0.04] text-text-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Step 0: Writing Samples */}
      {step === 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary mb-1">Writing Samples</h2>
            <p className="text-text-muted text-sm">Upload or paste up to 6 samples. Each must be at least 200 words.</p>
          </div>
          {samples.map((sample, i) => (
            <div key={i} className="border border-white/[0.06] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  placeholder={`Sample ${i + 1} label`}
                  value={sample.label}
                  onChange={(e) => updateSample(i, { label: e.target.value })}
                  className="bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none w-48"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateSample(i, { mode: "paste" })}
                    className={`text-xs px-2 py-0.5 rounded ${sample.mode === "paste" ? "bg-white/10 text-text-primary" : "text-text-muted"}`}
                  >
                    Paste
                  </button>
                  <button
                    onClick={() => updateSample(i, { mode: "upload" })}
                    className={`text-xs px-2 py-0.5 rounded ${sample.mode === "upload" ? "bg-white/10 text-text-primary" : "text-text-muted"}`}
                  >
                    Upload
                  </button>
                  <span className={`text-xs ${sample.wordCount >= 200 ? "text-accent" : "text-text-muted"}`}>
                    {sample.wordCount} words
                  </span>
                </div>
              </div>
              {sample.mode === "paste" ? (
                <textarea
                  value={sample.content}
                  onChange={(e) => updateSample(i, { content: e.target.value })}
                  placeholder="Paste your writing here..."
                  rows={4}
                  className="w-full bg-bg-base border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 resize-y font-serif"
                />
              ) : (
                <div>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(i, f);
                    }}
                    className="text-sm text-text-muted file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-white/10 file:text-text-primary"
                  />
                  {sample.content && (
                    <p className="text-xs text-accent mt-2">Extracted {sample.wordCount} words</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step 1: Teacher Profile */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary mb-1">Teacher Profile</h2>
            <p className="text-text-muted text-sm">Help us understand what your teacher expects.</p>
          </div>

          <Field label="Grade Level">
            <select
              value={teacher.gradeLevel}
              onChange={(e) => setTeacher({ ...teacher, gradeLevel: e.target.value })}
              className="select-field"
            >
              <option value="">Select...</option>
              <option value="9">9th Grade</option>
              <option value="10">10th Grade</option>
              <option value="11">11th Grade</option>
              <option value="12">12th Grade</option>
              <option value="college">College</option>
            </select>
          </Field>

          <Field label="Teacher Strictness">
            <CheckboxGroup
              options={["Strict on grammar", "Strict on formatting", "Strict on citations", "Values creativity", "Prefers formal tone", "Lenient grader"]}
              selected={teacher.strictness}
              onChange={(v) => setTeacher({ ...teacher, strictness: v })}
            />
          </Field>

          <Field label="Focus Areas">
            <CheckboxGroup
              options={["Thesis development", "Evidence & analysis", "Organization", "Voice & tone", "Grammar & mechanics", "Close reading"]}
              selected={teacher.focusAreas}
              onChange={(v) => setTeacher({ ...teacher, focusAreas: v })}
            />
          </Field>

          <Field label="Additional Notes">
            <textarea
              value={teacher.notes}
              onChange={(e) => setTeacher({ ...teacher, notes: e.target.value })}
              placeholder="Any other details about your teacher's expectations..."
              rows={3}
              className="input-field font-serif resize-y"
            />
          </Field>
        </div>
      )}

      {/* Step 2: Self-Assessment */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary mb-1">Self-Assessment</h2>
            <p className="text-text-muted text-sm">Be honest — this helps us match your level.</p>
          </div>

          <Field label="Your Biggest Strength">
            <RadioGroup
              name="strength"
              options={["Strong arguments", "Clear writing", "Good vocabulary", "Creative ideas", "Solid structure"]}
              selected={self.writingStrength}
              onChange={(v) => setSelf({ ...self, writingStrength: v })}
            />
          </Field>

          <Field label="Your Biggest Weakness">
            <RadioGroup
              name="weakness"
              options={["Run-on sentences", "Weak thesis", "Poor organization", "Grammar errors", "Too informal"]}
              selected={self.writingWeakness}
              onChange={(v) => setSelf({ ...self, writingWeakness: v })}
            />
          </Field>

          <Field label="Typical Grade Range">
            <select
              value={self.gradeRange}
              onChange={(e) => setSelf({ ...self, gradeRange: e.target.value })}
              className="select-field"
            >
              <option value="">Select...</option>
              <option value="A">A (90-100)</option>
              <option value="B+">B+ (87-89)</option>
              <option value="B">B (83-86)</option>
              <option value="B-">B- (80-82)</option>
              <option value="C+">C+ (77-79)</option>
              <option value="C">C (70-76)</option>
              <option value="below-C">Below C</option>
            </select>
          </Field>

          <Field label="Effort You Typically Put In">
            <RadioGroup
              name="effort"
              options={["Last minute", "Moderate effort", "High effort", "Perfectionist"]}
              selected={self.effortLevel}
              onChange={(v) => setSelf({ ...self, effortLevel: v })}
            />
          </Field>
        </div>
      )}

      {/* Step 3: Writing Style */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary mb-1">Writing Style</h2>
            <p className="text-text-muted text-sm">Describe how you naturally write.</p>
          </div>

          <Field label="Tone Traits">
            <CheckboxGroup
              options={["Casual", "Formal", "Conversational", "Academic", "Sarcastic", "Straightforward", "Flowery", "Dry"]}
              selected={style.toneTraits}
              onChange={(v) => setStyle({ ...style, toneTraits: v })}
            />
          </Field>

          <Field label="Sentence Style">
            <CheckboxGroup
              options={["Short & punchy", "Long & complex", "Mix of both", "Lots of commas", "Uses dashes", "Fragment-heavy"]}
              selected={style.sentenceStyle}
              onChange={(v) => setStyle({ ...style, sentenceStyle: v })}
            />
          </Field>

          <Field label="Vocabulary Level">
            <select
              value={style.vocabularyLevel}
              onChange={(e) => setStyle({ ...style, vocabularyLevel: e.target.value })}
              className="select-field"
            >
              <option value="">Select...</option>
              <option value="basic">Basic — simple words</option>
              <option value="moderate">Moderate — occasional SAT words</option>
              <option value="advanced">Advanced — strong vocabulary</option>
              <option value="mixed">Mixed — inconsistent</option>
            </select>
          </Field>

          <Field label="Common Phrases or Filler Words">
            <textarea
              value={style.commonPhrases}
              onChange={(e) => setStyle({ ...style, commonPhrases: e.target.value })}
              placeholder='e.g. "In conclusion", "This shows that", "Furthermore"...'
              rows={2}
              className="input-field font-serif resize-y"
            />
          </Field>

          <Field label="Any Quirks or Habits">
            <textarea
              value={style.quirks}
              onChange={(e) => setStyle({ ...style, quirks: e.target.value })}
              placeholder="e.g. overuse of semicolons, always start with a quote, tend to repeat words..."
              rows={2}
              className="input-field font-serif resize-y"
            />
          </Field>
        </div>
      )}

      {/* Step 4: Review & Save */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-text-primary mb-1">Review & Save</h2>
            <p className="text-text-muted text-sm">Confirm your profile before saving.</p>
          </div>

          <ReviewSection title="Writing Samples" items={[`${filledSamples.length} sample(s) — ${filledSamples.reduce((sum, s) => sum + s.wordCount, 0)} total words`]} />
          <ReviewSection title="Teacher Profile" items={[
            `Grade: ${teacher.gradeLevel || "Not set"}`,
            `Focus: ${teacher.focusAreas.join(", ") || "None"}`,
            `Style: ${teacher.strictness.join(", ") || "None"}`,
          ]} />
          <ReviewSection title="Self-Assessment" items={[
            `Strength: ${self.writingStrength || "Not set"}`,
            `Weakness: ${self.writingWeakness || "Not set"}`,
            `Grade range: ${self.gradeRange || "Not set"}`,
            `Effort: ${self.effortLevel || "Not set"}`,
          ]} />
          <ReviewSection title="Writing Style" items={[
            `Tone: ${style.toneTraits.join(", ") || "Not set"}`,
            `Sentences: ${style.sentenceStyle.join(", ") || "Not set"}`,
            `Vocabulary: ${style.vocabularyLevel || "Not set"}`,
          ]} />
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-white/[0.06]">
        <button
          onClick={() => setStep(step - 1)}
          disabled={step === 0}
          className="text-sm text-text-muted hover:text-text-primary transition-colors disabled:opacity-30"
        >
          Back
        </button>
        {step < 4 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canAdvance()}
            className="btn-primary text-sm disabled:opacity-30"
          >
            Next
          </button>
        ) : (
          <button
            onClick={save}
            disabled={saving}
            className="btn-primary text-sm disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Shared Components ───

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-2">{label}</label>
      {children}
    </div>
  );
}

function CheckboxGroup({
  options,
  selected,
  onChange,
}: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() =>
              onChange(active ? selected.filter((s) => s !== opt) : [...selected, opt])
            }
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              active
                ? "bg-accent/20 border-accent/40 text-accent-light"
                : "bg-white/[0.04] border-white/[0.08] text-text-muted hover:text-text-secondary"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function RadioGroup({
  name,
  options,
  selected,
  onChange,
}: {
  name: string;
  options: string[];
  selected: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <label
          key={opt}
          className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer transition-colors ${
            selected === opt
              ? "bg-accent/20 border-accent/40 text-accent-light"
              : "bg-white/[0.04] border-white/[0.08] text-text-muted hover:text-text-secondary"
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt}
            checked={selected === opt}
            onChange={() => onChange(opt)}
            className="sr-only"
          />
          {opt}
        </label>
      ))}
    </div>
  );
}

function ReviewSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border border-white/[0.06] rounded-xl p-4">
      <h3 className="text-sm font-medium text-text-primary mb-2">{title}</h3>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="text-xs text-text-secondary">{item}</li>
        ))}
      </ul>
    </div>
  );
}
