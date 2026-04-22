// Shared help type definitions used by both client UI and server validation.

import type { MaterialStructure } from "./material-structure";

export interface HelpTypeOption {
  value: string;
  label: string;
  description: string;
}

/**
 * Prefixes that identify a structure-aware help-type value produced
 * by `structureAwareHelpTypes`. The values encode dynamic per-file
 * specifics (e.g. `work-through-problem-3`) so they can't live in
 * the static `VALID_HELP_TYPES` set; `isStructureAwareHelpType`
 * below whitelists them at validation time instead.
 */
const STRUCTURE_AWARE_PREFIXES = [
  "work-through-problem-",
  "discuss-question-",
  "walk-through-worksheet",
  "unpack-essay-prompt",
  "fill-template-guided",
  "analyze-passage",
] as const;

export function isStructureAwareHelpType(value: string): boolean {
  return STRUCTURE_AWARE_PREFIXES.some((p) => value === p || value.startsWith(p));
}

/**
 * Structure-aware help-type options prepended to the static per-subject
 * list when a file's MaterialStructure is known. Values carry dynamic
 * suffixes (problem number, question index) so they're NOT members of
 * `VALID_HELP_TYPES` — validators must also accept
 * `isStructureAwareHelpType(value)` or these selections silently drop
 * to null. The tutor's system prompt handles structure-aware goals via
 * the `helpTypeContext` block in src/lib/system-prompt.ts.
 */
export function structureAwareHelpTypes(
  structure: MaterialStructure | null | undefined,
): HelpTypeOption[] {
  if (!structure || structure.kind === "unknown") return [];
  switch (structure.kind) {
    case "problem_set":
      return structure.problems.length > 0
        ? [
            {
              value: `work-through-problem-${structure.problems[0].number ?? "1"}`,
              label: `Work through problem ${structure.problems[0].number ?? "1"}`,
              description: "Start with the first problem and walk through it step by step.",
            },
          ]
        : [];
    case "reading_with_questions":
      return structure.questions.length > 0
        ? [
            {
              value: `discuss-question-${structure.questions[0].number ?? "1"}`,
              label: `Discuss question ${structure.questions[0].number ?? "1"}`,
              description: "Unpack the first reading-response question Socratically.",
            },
          ]
        : [];
    case "worksheet":
      return [
        {
          value: "walk-through-worksheet",
          label: "Walk through the worksheet",
          description: "Work each section in order with one question at a time.",
        },
      ];
    case "essay_prompt":
      return [
        {
          value: "unpack-essay-prompt",
          label: "Unpack the prompt",
          description: "Break down what the prompt is actually asking before drafting.",
        },
      ];
    case "fill_in_template":
      return [
        {
          value: "fill-template-guided",
          label: "Fill the template guided",
          description: "Step through each blank with context-anchored prompts.",
        },
      ];
    case "reading_only":
      return [
        {
          value: "analyze-passage",
          label: "Analyze the passage",
          description: "Work through the argument and key claims together.",
        },
      ];
  }
}

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
