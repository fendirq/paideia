"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const HELP_TYPES: Record<string, { value: string; label: string; description: string }[]> = {
  MATHEMATICS: [
    { value: "problem-solving", label: "Problem Solving", description: "Work through practice problems step by step" },
    { value: "concept-review", label: "Concept Review", description: "Understand a concept or formula" },
    { value: "exam-prep", label: "Exam Prep", description: "Prepare for an upcoming test" },
  ],
  SCIENCE: [
    { value: "problem-solving", label: "Problem Solving", description: "Work through practice problems step by step" },
    { value: "concept-review", label: "Concept Review", description: "Understand a concept or theory" },
    { value: "lab-analysis", label: "Lab Analysis", description: "Analyze experimental data or results" },
  ],
  ENGLISH: [
    { value: "essay-feedback", label: "Essay Feedback", description: "Get feedback on a draft or outline" },
    { value: "thesis-development", label: "Thesis Development", description: "Develop or refine your argument" },
    { value: "reading-analysis", label: "Reading Analysis", description: "Analyze a text or passage" },
  ],
  HISTORY: [
    { value: "source-analysis", label: "Source Analysis", description: "Analyze a primary or secondary source" },
    { value: "essay-writing", label: "Essay Writing", description: "Structure a historical argument" },
    { value: "chronological-review", label: "Timeline Review", description: "Review events and their connections" },
  ],
  HUMANITIES: [
    { value: "essay-feedback", label: "Essay Feedback", description: "Get feedback on a draft or outline" },
    { value: "thesis-development", label: "Thesis Development", description: "Develop or refine your argument" },
    { value: "reading-analysis", label: "Reading Analysis", description: "Analyze a text or passage" },
  ],
  MANDARIN: [
    { value: "reading-practice", label: "Reading Practice", description: "Practice reading comprehension" },
    { value: "writing-practice", label: "Writing Practice", description: "Practice writing and composition" },
    { value: "grammar-review", label: "Grammar Review", description: "Review grammar and sentence structure" },
  ],
};

const DEFAULT_HELP_TYPES = [
  { value: "concept-review", label: "Concept Review", description: "Understand a concept or idea" },
  { value: "practice", label: "Practice", description: "Work through exercises" },
  { value: "exam-prep", label: "Exam Prep", description: "Prepare for an upcoming test" },
];

interface HelpTypeSelectProps {
  inquiryId: string;
  subject: string;
  onClose: () => void;
}

export function HelpTypeSelect({ inquiryId, subject, onClose }: HelpTypeSelectProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const helpTypes = HELP_TYPES[subject] ?? DEFAULT_HELP_TYPES;

  const startSession = (helpType: string) => {
    setLoading(helpType);
    router.push(`/app/sessions/new?inquiry=${encodeURIComponent(inquiryId)}&helpType=${encodeURIComponent(helpType)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-surface border border-white/[0.06] rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display font-semibold text-lg">How can I help?</h2>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-text-muted">Choose what you need help with to get started.</p>
        </div>
        <div className="px-6 pb-6 space-y-2">
          {helpTypes.map((ht) => (
            <button
              key={ht.value}
              onClick={() => startSession(ht.value)}
              disabled={loading !== null}
              className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${
                loading === ht.value
                  ? "border-accent bg-accent/10"
                  : "border-white/[0.06] hover:border-accent/30 hover:bg-bg-elevated/50"
              } disabled:opacity-60`}
            >
              <p className="text-sm font-medium text-text-primary">{ht.label}</p>
              <p className="text-xs text-text-muted mt-0.5">{ht.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
