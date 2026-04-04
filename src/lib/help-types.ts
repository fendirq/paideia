// Shared help type definitions used by both client UI and server validation.

export const HELP_TYPES: Record<string, { value: string; label: string; description: string }[]> = {
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

export const DEFAULT_HELP_TYPES = [
  { value: "concept-review", label: "Concept Review", description: "Understand a concept or idea" },
  { value: "practice", label: "Practice", description: "Work through exercises" },
  { value: "exam-prep", label: "Exam Prep", description: "Prepare for an upcoming test" },
];

// Flat set of all valid help type values for server-side validation.
export const VALID_HELP_TYPES = new Set(
  [
    ...Object.values(HELP_TYPES).flat(),
    ...DEFAULT_HELP_TYPES,
  ].map((ht) => ht.value)
);
