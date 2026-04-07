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
  teacherPriorities: string[];
  teacherPenalizes: string;
  formattingRules: string[];
}

interface SelfAssessment {
  gradeRange: string;
  writingApproach: string;
  voiceDescription: string;
  additionalNotes: string;
}

const DEFAULT_TEACHER: TeacherProfile = {
  gradeLevel: "",
  teacherPriorities: [],
  teacherPenalizes: "",
  formattingRules: [],
};

const DEFAULT_SELF: SelfAssessment = {
  gradeRange: "",
  writingApproach: "",
  voiceDescription: "",
  additionalNotes: "",
};

// ─── Wizard ───

export function AggregateWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [teacher, setTeacher] = useState<TeacherProfile>({ ...DEFAULT_TEACHER });
  const [self, setSelf] = useState<SelfAssessment>({ ...DEFAULT_SELF });
  const [dragOver, setDragOver] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing profile on mount
  useEffect(() => {
    fetch("/api/portal/aggregate")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setHasExistingProfile(true);
          const tp = data.profile.teacherProfile ?? {};
          const sa = data.profile.selfAssessment ?? {};

          if (tp.teacherPriorities) {
            setTeacher(tp);
          } else {
            setTeacher({
              gradeLevel: tp.gradeLevel || "",
              teacherPriorities: tp.focusAreas || [],
              teacherPenalizes: tp.notes || "",
              formattingRules: [],
            });
          }

          if (sa.writingApproach !== undefined) {
            setSelf(sa);
          } else {
            setSelf({
              gradeRange: sa.gradeRange || "",
              writingApproach: sa.effortLevel || "",
              voiceDescription: "",
              additionalNotes: "",
            });
          }
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
    setConfirmDelete(null);
  };

  const canAdvance = (): boolean => {
    if (step === 0) return samples.length >= 1;
    if (step === 1) return !!teacher.gradeLevel && teacher.teacherPriorities.length > 0;
    if (step === 2) return !!self.gradeRange;
    return true;
  };

  const save = useCallback(async () => {
    setSaving(true);
    setAnalyzing(true);
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
        }),
      });
      if (res.ok) router.push("/portal/home");
    } finally {
      setSaving(false);
      setAnalyzing(false);
    }
  }, [samples, teacher, self, router]);

  if (loading) {
    return <p className="text-white/50 text-center py-12">Loading...</p>;
  }

  const steps = ["Samples", "Class", "You", "Review"];

  return (
    <div className="glass p-8">
      {/* Step indicator — clickable to any step when editing existing profile */}
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
                ? "bg-accent text-white font-medium"
                : hasExistingProfile || i < step
                  ? "bg-white/10 text-white/70 cursor-pointer hover:bg-white/20"
                  : "bg-white/[0.04] text-white/30"
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
            <h2 className="font-display text-lg font-semibold text-white mb-1">Writing Samples</h2>
            <p className="text-white/60 text-sm">
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
                <div key={i} className="flex items-center justify-between border border-white/15 rounded-full px-5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    <span className="text-white text-sm truncate">{sample.label}</span>
                    <span className="text-white/40 text-xs shrink-0">{sample.wordCount} words</span>
                  </div>
                  {confirmDelete === i ? (
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <span className="text-white/50 text-xs">Remove?</span>
                      <button
                        onClick={() => removeSample(i)}
                        className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-white/40 hover:text-white/60 text-xs transition-colors"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(i)}
                      className="text-white/30 hover:text-white/60 transition-colors ml-2"
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

      {/* Step 1: About Your Class */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-white mb-1">About Your Class</h2>
            <p className="text-white/60 text-sm">Tell us about your teacher and their expectations.</p>
          </div>

          <Field label="Grade Level">
            <select
              value={teacher.gradeLevel}
              onChange={(e) => setTeacher({ ...teacher, gradeLevel: e.target.value })}
              className="select-field"
            >
              <option value="">Select...</option>
              <option value="9th">9th Grade</option>
              <option value="10th">10th Grade</option>
              <option value="11th">11th Grade</option>
              <option value="12th">12th Grade</option>
              <option value="College">College</option>
            </select>
          </Field>

          <Field label="What does your teacher care most about? (pick 2-3)">
            <CheckboxGroup
              options={[
                "Clear thesis/argument",
                "Quality of evidence",
                "Depth of analysis",
                "Essay structure",
                "Grammar & mechanics",
                "Original thinking",
                "Following the rubric",
              ]}
              selected={teacher.teacherPriorities}
              onChange={(v) => setTeacher({ ...teacher, teacherPriorities: v })}
            />
          </Field>

          <Field label="What does your teacher usually mark you down for?">
            <textarea
              value={teacher.teacherPenalizes}
              onChange={(e) => setTeacher({ ...teacher, teacherPenalizes: e.target.value })}
              placeholder="e.g. weak thesis statements, not enough evidence, run-on sentences..."
              rows={3}
              className="input-field font-serif resize-y"
            />
          </Field>

          <Field label="Formatting rules">
            <CheckboxGroup
              options={[
                "MLA format",
                "No first person",
                "No contractions",
                "Must include thesis in intro",
                "5-paragraph structure",
                "None / no specific rules",
              ]}
              selected={teacher.formattingRules}
              onChange={(v) => setTeacher({ ...teacher, formattingRules: v })}
            />
          </Field>
        </div>
      )}

      {/* Step 2: About You */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-white mb-1">About You</h2>
            <p className="text-white/60 text-sm">Help us calibrate the output to match your level.</p>
          </div>

          <Field label="What grade do you typically get on essays?">
            <select
              value={self.gradeRange}
              onChange={(e) => setSelf({ ...self, gradeRange: e.target.value })}
              className="select-field"
            >
              <option value="">Select...</option>
              <option value="A/A-">A / A-</option>
              <option value="B+/B">B+ / B</option>
              <option value="B-/C+">B- / C+</option>
              <option value="C or below">C or below</option>
            </select>
          </Field>

          <Field label="How do you usually approach essays?">
            <RadioGroup
              name="approach"
              options={[
                "Write it all last minute",
                "Moderate effort over a few days",
                "Careful drafting and revision",
                "Depends on the assignment",
              ]}
              selected={self.writingApproach}
              onChange={(v) => setSelf({ ...self, writingApproach: v })}
            />
          </Field>

          <Field label="How would a friend recognize your writing without your name on it?">
            <textarea
              value={self.voiceDescription}
              onChange={(e) => setSelf({ ...self, voiceDescription: e.target.value })}
              placeholder="1-3 sentences — what makes your writing yours?"
              rows={3}
              className="input-field font-serif resize-y"
            />
          </Field>

          <Field label="Anything else we should know? (optional)">
            <textarea
              value={self.additionalNotes}
              onChange={(e) => setSelf({ ...self, additionalNotes: e.target.value })}
              placeholder="e.g. my teacher loves class discussion references, I always get marked down for run-ons..."
              rows={2}
              className="input-field font-serif resize-y"
            />
          </Field>
        </div>
      )}

      {/* Step 3: Review & Save */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-white mb-1">Review & Save</h2>
            <p className="text-white/60 text-sm">
              {analyzing
                ? "Analyzing your writing style..."
                : "Confirm your profile before saving. We'll automatically analyze your writing samples to build a style fingerprint."}
            </p>
          </div>

          <ReviewSection title="Writing Samples" items={[
            `${samples.length} file(s) — ${samples.reduce((sum, s) => sum + s.wordCount, 0)} total words`,
          ]} />
          <ReviewSection title="Class Info" items={[
            `Grade: ${teacher.gradeLevel || "Not set"}`,
            `Teacher priorities: ${teacher.teacherPriorities.join(", ") || "None"}`,
            `Marks down for: ${teacher.teacherPenalizes || "Not specified"}`,
            `Format rules: ${teacher.formattingRules.join(", ") || "None"}`,
          ]} />
          <ReviewSection title="About You" items={[
            `Typical grade: ${self.gradeRange || "Not set"}`,
            `Approach: ${self.writingApproach || "Not set"}`,
            `Voice: ${self.voiceDescription || "Not described"}`,
            ...(self.additionalNotes ? [`Notes: ${self.additionalNotes}`] : []),
          ]} />
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-white/[0.08]">
        <button
          onClick={() => step === 0 ? router.back() : setStep(step - 1)}
          className="text-sm text-white/40 hover:text-white transition-colors"
        >
          Back
        </button>
        {step < 3 ? (
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
