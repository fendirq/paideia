import {
  JUDGE_THRESHOLDS,
  HEURISTIC_THRESHOLDS,
  meetsFloor,
  meetsTarget,
  type JudgeMetric,
  type HeuristicMetric,
  type Threshold,
} from "./thresholds.ts";

export interface MetricBreach {
  metric: string;
  value: number;
  threshold: Threshold;
  severity: "floor" | "target";
}

export interface ThresholdCheckResult {
  passed: boolean;
  elite: boolean;
  floorBreaches: MetricBreach[];
  targetMisses: MetricBreach[];
  targetHits: Array<{ metric: string; value: number }>;
  skipped: string[];
}

interface CheckContext {
  sourced: boolean;
}

function evaluateSingle(
  metric: string,
  value: number | undefined,
  threshold: Threshold,
  ctx: CheckContext,
  result: ThresholdCheckResult,
): void {
  if (threshold.onlyWhenSourced && !ctx.sourced) {
    result.skipped.push(metric);
    return;
  }

  if (value === undefined || Number.isNaN(value)) {
    result.skipped.push(metric);
    return;
  }

  if (!meetsFloor(value, threshold)) {
    result.floorBreaches.push({ metric, value, threshold, severity: "floor" });
    return;
  }

  if (!meetsTarget(value, threshold)) {
    result.targetMisses.push({ metric, value, threshold, severity: "target" });
    return;
  }

  result.targetHits.push({ metric, value });
}

export function checkJudgeScores(
  scores: Partial<Record<JudgeMetric, number>>,
  ctx: CheckContext,
): ThresholdCheckResult {
  const result: ThresholdCheckResult = {
    passed: true,
    elite: true,
    floorBreaches: [],
    targetMisses: [],
    targetHits: [],
    skipped: [],
  };

  for (const [metric, threshold] of Object.entries(JUDGE_THRESHOLDS) as Array<[JudgeMetric, Threshold]>) {
    evaluateSingle(metric, scores[metric], threshold, ctx, result);
  }

  result.passed = result.floorBreaches.length === 0;
  result.elite = result.passed && result.targetMisses.length === 0;
  return result;
}

export function checkHeuristics(
  metrics: Partial<Record<HeuristicMetric, number>>,
  ctx: CheckContext,
): ThresholdCheckResult {
  const result: ThresholdCheckResult = {
    passed: true,
    elite: true,
    floorBreaches: [],
    targetMisses: [],
    targetHits: [],
    skipped: [],
  };

  for (const [metric, threshold] of Object.entries(HEURISTIC_THRESHOLDS) as Array<[HeuristicMetric, Threshold]>) {
    evaluateSingle(metric, metrics[metric], threshold, ctx, result);
  }

  result.passed = result.floorBreaches.length === 0;
  result.elite = result.passed && result.targetMisses.length === 0;
  return result;
}

export function mergeResults(parts: ThresholdCheckResult[]): ThresholdCheckResult {
  const merged: ThresholdCheckResult = {
    passed: true,
    elite: true,
    floorBreaches: [],
    targetMisses: [],
    targetHits: [],
    skipped: [],
  };

  for (const part of parts) {
    merged.floorBreaches.push(...part.floorBreaches);
    merged.targetMisses.push(...part.targetMisses);
    merged.targetHits.push(...part.targetHits);
    merged.skipped.push(...part.skipped);
  }

  merged.passed = merged.floorBreaches.length === 0;
  merged.elite = merged.passed && merged.targetMisses.length === 0;
  return merged;
}

export function formatBreach(breach: MetricBreach): string {
  const { metric, value, threshold, severity } = breach;
  const bar = severity === "floor" ? threshold.floor : threshold.target;
  const direction = threshold.direction === "higher" ? ">=" : "<=";
  return `${metric}: got ${value}, need ${direction} ${bar} (${severity})`;
}
