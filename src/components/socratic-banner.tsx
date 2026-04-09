"use client";

const SUBJECT_COLORS: Record<string, string> = {
  MATHEMATICS: "#5b9bd5",
  ENGLISH: "#c57bdb",
  HISTORY: "#e8a838",
  SCIENCE: "#7a9a6b",
  MANDARIN: "#e87838",
  HUMANITIES: "#d4a574",
  OTHER: "#a39e98",
};

const HELP_TYPE_LABELS: Record<string, string> = {
  "problem-solving": "Problem Solving",
  "concept-review": "Concept Review",
  "exam-prep": "Exam Prep",
  "lab-analysis": "Lab Analysis",
  "essay-feedback": "Essay Feedback",
  "thesis-development": "Thesis Development",
  "reading-analysis": "Reading Analysis",
  "source-analysis": "Source Analysis",
  "essay-writing": "Essay Writing",
  "chronological-review": "Timeline Review",
  "reading-practice": "Reading Practice",
  "writing-practice": "Writing Practice",
  "grammar-review": "Grammar Review",
  practice: "Practice",
};

interface SocraticBannerProps {
  subject: string;
  helpType?: string | null;
}

export function SocraticBanner({ subject, helpType }: SocraticBannerProps) {
  const color = SUBJECT_COLORS[subject] ?? SUBJECT_COLORS.OTHER;
  const label = subject.charAt(0) + subject.slice(1).toLowerCase();
  const helpLabel = helpType ? HELP_TYPE_LABELS[helpType] ?? helpType : null;

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${color}15`, color }}
    >
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span>Socratic Mode</span>
      <span style={{ color: `${color}99` }}>&middot;</span>
      <span>{label}</span>
      {helpLabel && (
        <>
          <span style={{ color: `${color}99` }}>&middot;</span>
          <span>{helpLabel}</span>
        </>
      )}
    </div>
  );
}
