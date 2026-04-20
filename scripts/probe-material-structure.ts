// Standalone probe for material-structure detection.
//
//   node --experimental-strip-types --env-file=.env.local \
//     scripts/probe-material-structure.ts [path-to-txt]
//
// With no args: runs against every fixture in scripts/fixtures/structure/.
// With a path arg: runs against that single file.
//
// Prints classification kind, elapsed ms, a pretty-printed structure
// (truncated where it'd flood the terminal), and any validation error
// from the detector.

import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { detectStructure } from "../src/lib/material-structure.ts";
import type { MaterialStructure } from "../src/lib/material-structure.ts";

const FIXTURES_DIR = "scripts/fixtures/structure";

function summarize(s: MaterialStructure): string {
  switch (s.kind) {
    case "reading_only":
      return `passage: ${s.passage.length} chars`;
    case "reading_with_questions":
      return `passage: ${s.passage.length} chars, ${s.questions.length} questions`;
    case "worksheet":
      return `${s.sections.length} sections, ${s.sections.reduce((n, sec) => n + sec.questions.length, 0)} total questions`;
    case "problem_set":
      return `${s.problems.length} problems`;
    case "essay_prompt":
      return `prompt: ${s.prompt.length} chars${s.requirements ? `, ${s.requirements.length} requirements` : ""}${s.rubric ? ", rubric present" : ""}`;
    case "fill_in_template":
      return `template: ${s.template.length} chars, ${s.blanks.length} blanks`;
    case "unknown":
      return "no structure detected";
  }
}

function truncateForDisplay(s: MaterialStructure): MaterialStructure {
  const clip = (str: string) =>
    str.length > 200 ? `${str.slice(0, 200)}… [${str.length} chars]` : str;
  switch (s.kind) {
    case "reading_only":
      return { kind: "reading_only", passage: clip(s.passage) };
    case "reading_with_questions":
      return {
        kind: "reading_with_questions",
        passage: clip(s.passage),
        questions: s.questions,
      };
    case "fill_in_template":
      return {
        kind: "fill_in_template",
        template: clip(s.template),
        blanks: s.blanks,
      };
    case "essay_prompt":
      return {
        kind: "essay_prompt",
        prompt: clip(s.prompt),
        requirements: s.requirements,
        rubric: s.rubric ? clip(s.rubric) : undefined,
      };
    default:
      return s;
  }
}

async function runOne(path: string): Promise<boolean> {
  const text = await readFile(path, "utf8");
  console.log(`\n=== ${path}  (${text.length} chars) ===`);
  const result = await detectStructure(text);
  console.log(`kind      : ${result.structure.kind}`);
  console.log(`elapsed   : ${result.elapsedMs}ms`);
  console.log(`model     : ${result.model}`);
  console.log(`summary   : ${summarize(result.structure)}`);
  if (result.error) console.log(`error     : ${result.error}`);
  console.log("structure :");
  console.log(JSON.stringify(truncateForDisplay(result.structure), null, 2));
  // Errors = runtime failures (network, JSON parse, schema mismatch).
  // A clean `unknown` is a legitimate classification, not a failure.
  return result.error === undefined;
}

async function main() {
  const target = process.argv[2];
  const paths = target
    ? [target]
    : (await readdir(FIXTURES_DIR))
        .filter((f) => f.endsWith(".txt"))
        .sort()
        .map((f) => join(FIXTURES_DIR, f));

  if (paths.length === 0) {
    console.error(`No .txt files in ${FIXTURES_DIR}`);
    process.exit(1);
  }

  let anyError = false;
  for (const path of paths) {
    try {
      const ok = await runOne(path);
      if (!ok) anyError = true;
    } catch (err) {
      anyError = true;
      console.error(`FAILED: ${path}:`, err);
    }
  }

  console.log(
    `\n${anyError ? "⚠️  Finished with errors." : "✅ All fixtures processed."}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
