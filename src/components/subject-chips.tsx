"use client";

const SUBJECT_OPTIONS = [
  { value: "MATHEMATICS", label: "Math", color: "#5b9bd5" },
  { value: "ENGLISH", label: "English", color: "#c57bdb" },
  { value: "HISTORY", label: "History", color: "#e8a838" },
  { value: "SCIENCE", label: "Science", color: "#7a9a6b" },
  { value: "HUMANITIES", label: "Humanities", color: "#d4a574" },
  { value: "MANDARIN", label: "Mandarin", color: "#e87838" },
  { value: "OTHER", label: "Other", color: "#a39e98" },
];

interface SubjectChipsProps {
  value: string;
  onChange: (value: string) => void;
}

export function SubjectChips({ value, onChange }: SubjectChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {SUBJECT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex items-center gap-[7px] px-4 py-[9px] rounded-[20px] font-display text-[13px] font-medium transition-all border ${
            value === opt.value
              ? "border-accent bg-accent/[0.08] text-text-primary"
              : "border-[rgba(168,152,128,0.15)] bg-bg-surface text-text-secondary hover:border-[rgba(168,152,128,0.30)]"
          }`}
        >
          <span
            className="w-[7px] h-[7px] rounded-full"
            style={{ background: opt.color }}
          />
          {opt.label}
        </button>
      ))}
    </div>
  );
}
