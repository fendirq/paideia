"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

// ─── Types ───

interface Sample {
  label: string;
  content: string;
  wordCount: number;
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
  const [uploading, setUploading] = useState(false);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [teacher, setTeacher] = useState<TeacherProfile>({ ...DEFAULT_TEACHER });
  const [self, setSelf] = useState<SelfAssessment>({ ...DEFAULT_SELF });
  const [style, setStyle] = useState<WritingStyle>({ ...DEFAULT_STYLE });
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          setSamples(data.samples.map((s: Sample) => ({
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

    for (const file of fileArray) {
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch("/api/portal/upload-sample", { method: "POST", body: form });
        if (!res.ok) continue;
        const { text, wordCount } = await res.json();
        newSamples.push({ label: file.name, content: text, wordCount });
      } catch {
        // skip failed uploads
      }
    }

    setSamples((prev) => [...prev, ...newSamples].slice(0, 6));
    setUploading(false);
  };

  const removeSample = (index: number) => {
    setSamples((prev) => prev.filter((_, i) => i !== index));
  };

  const canAdvance = (): boolean => {
    if (step === 0) return samples.length >= 1;
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
          samples: samples.map((s, i) => ({
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
  }, [samples, teacher, self, style, router]);

  if (loading) {
    return <p className="text-white/50 text-center py-12">Loading...</p>;
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
                ? "bg-accent text-white font-medium"
                : i < step
                  ? "bg-white/10 text-white/70 cursor-pointer hover:bg-white/20"
                  : "bg-white/[0.04] text-white/30"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Step 0: Writing Samples — single drop zone */}
      {step === 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-white mb-1">Writing Samples</h2>
            <p className="text-white/60 text-sm">
              Upload up to 6 files of your past writing to be analyzed. We&apos;ll extract the text and study your style, tone, and patterns. Accepted formats: PDF, DOCX.
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
                : "border-white/20 hover:border-white/40"
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
            <svg className="w-10 h-10 mx-auto mb-3 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
            </svg>
            <p className="text-white font-medium text-sm mb-1">
              {uploading ? "Uploading..." : "Drop files here or click to browse"}
            </p>
            <p className="text-white/40 text-xs">
              {samples.length}/6 files uploaded &middot; PDF or DOCX
            </p>
          </div>

          {/* Uploaded files list */}
          {samples.length > 0 && (
            <div className="space-y-2">
              {samples.map((sample, i) => (
                <div key={i} className="flex items-center justify-between border border-white/[0.08] rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span className="text-white text-sm truncate">{sample.label}</span>
                    <span className="text-white/40 text-xs shrink-0">{sample.wordCount} words</span>
                  </div>
                  <button
                    onClick={() => removeSample(i)}
                    className="text-white/30 hover:text-white/60 transition-colors ml-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 1: Teacher Profile */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-white mb-1">Teacher Profile</h2>
            <p className="text-white/60 text-sm">Help us understand what your teacher expects.</p>
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
            <h2 className="font-display text-lg font-semibold text-white mb-1">Self-Assessment</h2>
            <p className="text-white/60 text-sm">Be honest — this helps us match your level.</p>
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
            <h2 className="font-display text-lg font-semibold text-white mb-1">Writing Style</h2>
            <p className="text-white/60 text-sm">Describe how you naturally write.</p>
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
            <h2 className="font-display text-lg font-semibold text-white mb-1">Review & Save</h2>
            <p className="text-white/60 text-sm">Confirm your profile before saving.</p>
          </div>

          <ReviewSection title="Writing Samples" items={[`${samples.length} file(s) — ${samples.reduce((sum, s) => sum + s.wordCount, 0)} total words`]} />
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
      <div className="flex justify-between mt-8 pt-6 border-t border-white/[0.08]">
        <button
          onClick={() => setStep(step - 1)}
          disabled={step === 0}
          className="text-sm text-white/40 hover:text-white transition-colors disabled:opacity-30"
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
      <label className="block text-sm font-medium text-white/70 mb-2">{label}</label>
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
                : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70"
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
              : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70"
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
    <div className="border border-white/[0.08] rounded-xl p-4">
      <h3 className="text-sm font-medium text-white mb-2">{title}</h3>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="text-xs text-white/60">{item}</li>
        ))}
      </ul>
    </div>
  );
}
