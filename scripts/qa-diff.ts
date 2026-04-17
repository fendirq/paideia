#!/usr/bin/env node
/**
 * qa-diff — compare a current QA grade report against a baseline, enforce
 * elite floors, and detect regressions.
 *
 * Exit codes:
 *   0 — current meets all elite floors AND has not regressed vs baseline
 *   1 — current breaches a floor or regresses a metric by more than noise
 *   2 — invocation error (bad args, missing files, malformed JSON)
 *
 * Usage:
 *   npm run qa:diff -- <baseline.json> <current.json>
 *   npm run qa:diff -- --baseline <path> --current <path>
 */

import fs from "node:fs";
import path from "node:path";
import { checkJudgeScores, checkHeuristics, mergeResults, formatBreach, type ThresholdCheckResult } from "./qa-lib/threshold-check.ts";
import type { GradeReport, GenerationResult } from "./qa-lib/grade-report.ts";

// Noise tolerance for judge scores. A drop >= REGRESSION_DELTA from baseline
// on a metric that baseline was passing counts as a regression, even if the
// current value still meets the floor.
const REGRESSION_DELTA = 1.0;

interface DiffArgs {
  baseline: string;
  current: string;
}

function parseArgs(argv: string[]): DiffArgs {
  const flags: Record<string, string> = {};
  const positional: string[] = [];

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--baseline" || arg === "--current") {
      const value = argv[++i];
      if (!value) usageError(`${arg} requires a path argument`);
      flags[arg.slice(2)] = value;
    } else if (arg.startsWith("--")) {
      usageError(`Unknown flag: ${arg}`);
    } else {
      positional.push(arg);
    }
  }

  const baseline = flags.baseline ?? positional[0];
  const current = flags.current ?? positional[1];
  if (!baseline || !current) {
    usageError("Both baseline and current paths are required");
  }
  return { baseline, current };
}

function usageError(msg: string): never {
  console.error(`qa-diff: ${msg}`);
  console.error("Usage: npm run qa:diff -- <baseline.json> <current.json>");
  process.exit(2);
}

function loadReport(filePath: string): GradeReport {
  if (!fs.existsSync(filePath)) {
    console.error(`qa-diff: file not found: ${filePath}`);
    process.exit(2);
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as GradeReport;
  } catch (err) {
    console.error(`qa-diff: failed to parse ${filePath}: ${(err as Error).message}`);
    process.exit(2);
  }
}

function evaluateGeneration(gen: GenerationResult): ThresholdCheckResult {
  return mergeResults([
    checkJudgeScores(gen.judge, { sourced: gen.sourced }),
    checkHeuristics(gen.heuristics, { sourced: gen.sourced }),
  ]);
}

interface Regression {
  variant: string;
  metric: string;
  baseline: number;
  current: number;
  delta: number;
}

function findRegressions(baseline: GradeReport, current: GradeReport): Regression[] {
  const regressions: Regression[] = [];

  for (const currentGen of current.generations) {
    const baselineGen = baseline.generations.find((g) => g.variant === currentGen.variant);
    if (!baselineGen) continue;

    for (const [metric, baselineValue] of Object.entries(baselineGen.judge)) {
      if (typeof baselineValue !== "number") continue;
      const currentValue = (currentGen.judge as Record<string, unknown>)[metric];
      if (typeof currentValue !== "number") continue;
      const delta = currentValue - baselineValue;
      if (delta <= -REGRESSION_DELTA) {
        regressions.push({
          variant: currentGen.variant,
          metric: `judge.${metric}`,
          baseline: baselineValue,
          current: currentValue,
          delta,
        });
      }
    }
  }

  return regressions;
}

function printVariantReport(gen: GenerationResult, check: ThresholdCheckResult): void {
  const status = check.elite ? "ELITE" : check.passed ? "PASS" : "FAIL";
  console.log(`  [${status}] ${gen.variant} (sourced=${gen.sourced}, words=${gen.wordCount})`);

  if (check.floorBreaches.length > 0) {
    console.log("    Floor breaches:");
    for (const breach of check.floorBreaches) {
      console.log(`      - ${formatBreach(breach)}`);
    }
  }
  if (check.targetMisses.length > 0 && check.targetMisses.length <= 5) {
    console.log("    Target misses (passing floor, not elite):");
    for (const miss of check.targetMisses) {
      console.log(`      - ${formatBreach(miss)}`);
    }
  } else if (check.targetMisses.length > 5) {
    console.log(`    Target misses: ${check.targetMisses.length} metrics below elite`);
  }
}

function main(): void {
  const { baseline: baselinePath, current: currentPath } = parseArgs(process.argv);

  const baseline = loadReport(baselinePath);
  const current = loadReport(currentPath);

  console.log(`qa-diff: baseline=${path.relative(process.cwd(), baselinePath)} current=${path.relative(process.cwd(), currentPath)}`);
  console.log(`  fixture: ${current.fixture}`);
  console.log(`  baseline provider: ${baseline.provider.level2.name}/${baseline.provider.level2.model}`);
  console.log(`  current provider:  ${current.provider.level2.name}/${current.provider.level2.model}`);
  console.log();

  let allPass = true;
  let allElite = true;

  console.log("Floor checks (current vs thresholds):");
  for (const gen of current.generations) {
    const check = evaluateGeneration(gen);
    if (!check.passed) allPass = false;
    if (!check.elite) allElite = false;
    printVariantReport(gen, check);
  }

  const regressions = findRegressions(baseline, current);
  console.log();
  if (regressions.length > 0) {
    console.log(`Regressions vs baseline (>= ${REGRESSION_DELTA} drop):`);
    for (const reg of regressions) {
      console.log(`  - ${reg.variant} ${reg.metric}: ${reg.baseline} -> ${reg.current} (Δ ${reg.delta.toFixed(2)})`);
    }
    allPass = false;
  } else {
    console.log("Regressions vs baseline: none");
  }

  console.log();
  if (!allPass) {
    console.log("RESULT: FAIL — floor breach or regression detected.");
    process.exit(1);
  }
  if (!allElite) {
    console.log("RESULT: PASS (not elite) — all floors met, some metrics below target.");
    process.exit(0);
  }
  console.log("RESULT: ELITE — all metrics meet or exceed target, no regressions.");
  process.exit(0);
}

main();
