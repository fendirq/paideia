#!/usr/bin/env node
/**
 * qa-multirun — run the QA generation pipeline N times on a fixture and
 * aggregate the judge/heuristic scores into stable median/min/max bands.
 * Addresses Gemini thinking-mode generation variance: a single run can
 * swing overallWriting by ±2 points, so single-run elite verdicts are
 * unreliable. Median of N runs is the honest signal.
 *
 * Usage:
 *   QA_RUNS=3 node --experimental-strip-types scripts/qa-multirun.ts <scenario>
 *   QA_RUNS=3 npm run qa:multirun -- <scenario>
 *
 * Output structure under output/qa/<scenario>/:
 *   - run-1/, run-2/, ..., run-N/ — archived per-run essays + grade-report.json
 *   - grade-report.json — aggregated GradeReport with medians in generations[]
 *                         and a runs[] field containing each run's raw scores
 *   - report.md — aggregated markdown with median + range (min..max)
 *
 * qa:diff still consumes grade-report.json and compares against baselines
 * as before — medians flow through transparently.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { summarize } from "./qa-lib/median.ts";
import type { GradeReport, GenerationResult, GenerationVariant } from "./qa-lib/grade-report.ts";

const ROOT = process.cwd();
const QA_OUTPUT_ROOT = path.join(ROOT, "output", "qa");

function parseRunCount(): number {
  const raw = Number(process.env.QA_RUNS ?? 3);
  if (!Number.isInteger(raw) || raw < 1 || raw > 10) {
    console.error(`QA_RUNS must be an integer 1-10, got: ${process.env.QA_RUNS}`);
    process.exit(2);
  }
  return raw;
}

function scenarioOutputDir(scenario: string): string {
  // Mirror loadDefaultScenario/loadFixtureScenario naming conventions.
  return scenario === "default"
    ? path.join(QA_OUTPUT_ROOT, "generation")
    : path.join(QA_OUTPUT_ROOT, scenario);
}

function executeSingleRun(scenario: string, runIndex: number, total: number): GradeReport {
  console.log(`\n${"=".repeat(60)}\nRun ${runIndex}/${total} — scenario "${scenario}"\n${"=".repeat(60)}`);

  execFileSync(
    "node",
    [
      "--experimental-strip-types",
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      "scripts/qa-generation.ts",
      scenario,
    ],
    { stdio: "inherit", cwd: ROOT },
  );

  const outputDir = scenarioOutputDir(scenario);
  const reportPath = path.join(outputDir, "grade-report.json");
  if (!fs.existsSync(reportPath)) {
    throw new Error(`Run ${runIndex}: expected ${reportPath} to exist after qa-generation`);
  }

  return JSON.parse(fs.readFileSync(reportPath, "utf8")) as GradeReport;
}

function archiveRun(scenario: string, runIndex: number): void {
  const outputDir = scenarioOutputDir(scenario);
  const runDir = path.join(outputDir, `run-${runIndex}`);
  fs.mkdirSync(runDir, { recursive: true });

  for (const file of [
    "grade-report.json",
    "report.md",
    "level1-essay.txt",
    "level2-essay.txt",
    "level2-sourced-essay.txt",
  ]) {
    const src = path.join(outputDir, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(runDir, file));
    }
  }
}

function collectNumericFields(
  runs: GradeReport[],
  variant: GenerationVariant,
  path: "heuristics" | "judge",
): Record<string, number[]> {
  const collected: Record<string, number[]> = {};
  for (const run of runs) {
    const gen = run.generations.find((g) => g.variant === variant);
    if (!gen) continue;
    const bucket = gen[path] as Record<string, unknown>;
    for (const [key, value] of Object.entries(bucket)) {
      if (typeof value !== "number") continue;
      if (!collected[key]) collected[key] = [];
      collected[key].push(value);
    }
  }
  return collected;
}

function aggregateMedians(runs: GradeReport[]): GenerationResult[] {
  if (runs.length === 0) return [];
  const variants = Array.from(new Set(runs.flatMap((r) => r.generations.map((g) => g.variant))));

  const aggregated: GenerationResult[] = [];
  for (const variant of variants) {
    const firstWithVariant = runs
      .map((r) => r.generations.find((g) => g.variant === variant))
      .find((g) => g !== undefined)!;

    const heurCollected = collectNumericFields(runs, variant, "heuristics");
    const judgeCollected = collectNumericFields(runs, variant, "judge");

    const medianField = (collected: Record<string, number[]>): Record<string, number> => {
      const out: Record<string, number> = {};
      for (const [k, vs] of Object.entries(collected)) {
        const s = summarize(vs);
        if (!Number.isNaN(s.median)) out[k] = Number(s.median.toFixed(2));
      }
      return out;
    };

    // Collect aggregate word count across runs (median).
    const wordCounts = runs
      .map((r) => r.generations.find((g) => g.variant === variant)?.wordCount)
      .filter((v): v is number => typeof v === "number");
    const medianWordCount = Math.round(summarize(wordCounts).median);

    // Use the first run's essay text as the representative (closest-to-median
    // selection is possible but adds complexity; first-run is stable).
    aggregated.push({
      variant,
      sourced: firstWithVariant.sourced,
      essay: firstWithVariant.essay,
      wordCount: medianWordCount,
      heuristics: medianField(heurCollected) as GenerationResult["heuristics"],
      judge: {
        ...(medianField(judgeCollected) as Omit<GenerationResult["judge"], "overallVerdict" | "strengths" | "weaknesses" | "priorityFixes">),
        overallVerdict: firstWithVariant.judge.overallVerdict ?? "",
        strengths: firstWithVariant.judge.strengths ?? [],
        weaknesses: firstWithVariant.judge.weaknesses ?? [],
        priorityFixes: firstWithVariant.judge.priorityFixes ?? [],
      },
    });
  }

  return aggregated;
}

function writeAggregatedReport(scenario: string, runs: GradeReport[]): void {
  const outputDir = scenarioOutputDir(scenario);
  const first = runs[0];

  const aggregated: GradeReport & { runs: GradeReport["generations"][] } = {
    ...first,
    timestamp: new Date().toISOString(),
    generations: aggregateMedians(runs),
    runs: runs.map((r) => r.generations),
  };

  fs.writeFileSync(
    path.join(outputDir, "grade-report.json"),
    JSON.stringify(aggregated, null, 2),
  );

  // Update markdown summary with median + range.
  const lines: string[] = [
    "# Multi-run QA Report",
    "",
    `Generated at: ${aggregated.timestamp}`,
    `Runs: ${runs.length}`,
    "",
    "## Median scores (aggregated across runs)",
    "",
  ];
  for (const gen of aggregated.generations) {
    lines.push(`### ${gen.variant} (sourced=${gen.sourced}, median words=${gen.wordCount})`);
    lines.push("");
    lines.push("| metric | min | median | max |");
    lines.push("|---|---|---|---|");
    const judgeSeries = collectNumericFields(runs, gen.variant, "judge");
    const heurSeries = collectNumericFields(runs, gen.variant, "heuristics");
    for (const [k, vs] of Object.entries(judgeSeries)) {
      const s = summarize(vs);
      lines.push(`| judge.${k} | ${s.min} | ${s.median} | ${s.max} |`);
    }
    for (const [k, vs] of Object.entries(heurSeries)) {
      const s = summarize(vs);
      lines.push(`| heur.${k} | ${s.min} | ${s.median} | ${s.max} |`);
    }
    lines.push("");
  }
  fs.writeFileSync(path.join(outputDir, "report.md"), lines.join("\n"));
}

function main(): void {
  const scenarioName = process.argv[2] || "default";
  const runCount = parseRunCount();

  console.log(`qa-multirun: ${runCount} runs × ${scenarioName}`);

  const runs: GradeReport[] = [];
  for (let i = 1; i <= runCount; i++) {
    const report = executeSingleRun(scenarioName, i, runCount);
    runs.push(report);
    archiveRun(scenarioName, i);
  }

  console.log("\n=== Aggregating medians ===");
  writeAggregatedReport(scenarioName, runs);

  const outputDir = scenarioOutputDir(scenarioName);
  console.log(`Median grade report written: ${path.relative(ROOT, path.join(outputDir, "grade-report.json"))}`);
  console.log(`Aggregated markdown report: ${path.relative(ROOT, path.join(outputDir, "report.md"))}`);
  console.log(`Per-run archives: ${path.relative(ROOT, outputDir)}/run-{1..${runCount}}/`);
}

main();
