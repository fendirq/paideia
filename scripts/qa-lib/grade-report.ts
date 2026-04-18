import type { HeuristicMetric, JudgeMetric } from "./thresholds.ts";

/**
 * Canonical grade-report JSON shape. Written by the generation harness
 * (qa-baseline / qa-grade) and read by the diff script (qa-diff).
 * Stable schema — add new optional fields, never rename.
 */
export interface GradeReport {
  fixture: string;
  timestamp: string;
  provider: {
    level1: { name: string; model: string };
    level2: { name: string; model: string };
    judge: { name: string; model: string };
  };
  generations: GenerationResult[];
  notes?: string;
}

export type GenerationVariant = "level1" | "level2" | "level2-sourced";

export interface GenerationResult {
  variant: GenerationVariant;
  sourced: boolean;
  essay: string;
  wordCount: number;
  heuristics: Partial<Record<HeuristicMetric, number>>;
  judge: Partial<Record<JudgeMetric, number>> & {
    overallVerdict?: string;
    strengths?: string[];
    weaknesses?: string[];
    priorityFixes?: string[];
  };
}

export function emptyReport(fixture: string): GradeReport {
  return {
    fixture,
    timestamp: new Date().toISOString(),
    provider: {
      level1: { name: "", model: "" },
      level2: { name: "", model: "" },
      judge: { name: "", model: "" },
    },
    generations: [],
  };
}

export function findVariant(report: GradeReport, variant: GenerationVariant): GenerationResult | undefined {
  return report.generations.find((g) => g.variant === variant);
}
