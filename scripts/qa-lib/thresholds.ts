/**
 * Elite QA thresholds for the Paideia generation pipeline.
 *
 * Every Level 1 / Level 2 refinement is gated against these numbers. A change
 * that crosses any `floor` is automatically reverted by `qa:diff`. A change
 * that improves a `target` is allowed to ship. Elite = all metrics meet or
 * exceed `target` across all fixtures × both levels simultaneously.
 *
 * Shape is forward-compatible: the judge currently emits 5 scores; Phase 2
 * expands it to the full 8-score schema below. Missing scores are treated
 * as "not checked" rather than "failed".
 */

export type JudgeMetric =
  | "aiDetectionResistance"
  | "sampleAccuracy"
  | "rubricAccuracy"
  | "evidenceHandling"
  | "overallWriting"
  | "voiceNaturalness"
  | "sourceIntegration"
  | "academicQuality";

export type HeuristicMetric =
  | "heuristicAiResistance"
  | "heuristicAuthenticity"
  | "maxRepeatedOpenerRun"
  | "maxTransitionReuse"
  | "sentenceStdDev";

export type ThresholdDirection = "higher" | "lower";

export interface Threshold {
  target: number;
  floor: number;
  direction: ThresholdDirection;
  onlyWhenSourced?: boolean;
}

export const JUDGE_THRESHOLDS: Record<JudgeMetric, Threshold> = {
  aiDetectionResistance: { target: 9, floor: 8, direction: "higher" },
  sampleAccuracy: { target: 8, floor: 7, direction: "higher" },
  rubricAccuracy: { target: 8, floor: 7, direction: "higher" },
  evidenceHandling: { target: 8, floor: 7, direction: "higher" },
  overallWriting: { target: 8, floor: 7, direction: "higher" },
  voiceNaturalness: { target: 8, floor: 7, direction: "higher" },
  sourceIntegration: { target: 7, floor: 6, direction: "higher", onlyWhenSourced: true },
  academicQuality: { target: 8, floor: 7, direction: "higher" },
};

export const HEURISTIC_THRESHOLDS: Record<HeuristicMetric, Threshold> = {
  heuristicAiResistance: { target: 9, floor: 8, direction: "higher" },
  heuristicAuthenticity: { target: 10, floor: 9, direction: "higher" },
  maxRepeatedOpenerRun: { target: 2, floor: 2, direction: "lower" },
  maxTransitionReuse: { target: 2, floor: 2, direction: "lower" },
  sentenceStdDev: { target: 7, floor: 6, direction: "higher" },
};

export function meetsFloor(value: number, threshold: Threshold): boolean {
  return threshold.direction === "higher" ? value >= threshold.floor : value <= threshold.floor;
}

export function meetsTarget(value: number, threshold: Threshold): boolean {
  return threshold.direction === "higher" ? value >= threshold.target : value <= threshold.target;
}
