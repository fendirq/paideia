# Paideia Level 2 Refinement — Design Spec

**Date:** 2026-04-16
**Branch:** `feat/gemini-provider-abstraction`
**Status:** Approved, ready to execute

---

## 1. Goal

Refine Paideia's generation system so it produces elite-quality essays across a 5-fixture suite spanning simple-through-complex difficulty, at both Level 1 and Level 2. Migrate Level 2 from Claude Opus 4.6 to Gemini 3.1 Pro preview (provider abstraction already in place). Add local Codex code review and Greptile PR review. Ship atomically: Claude E2E review → Codex double-check → PR → merge → Vercel deploy with new env.

## 2. Non-Goals

- Rewriting the existing 12-pass Level 2 pipeline architecture (refinements only).
- Portal UI or authentication changes.
- Adding new feature surface (essay classification, new assignment types) beyond the QA fixture expansion.
- Migrating Level 1 to a different provider (Together AI stays; only the model is A/B'd).

## 3. Constraints

- **No Anthropic API calls at runtime.** All 12 call sites in `src/app/api/portal/generate/route.ts` and the Sonnet judge in `scripts/qa-generation.ts` get replaced with Gemini via `getProvider()` from `src/lib/providers/`. The Anthropic provider code remains in the repo as dormant multi-provider insurance.
- **Every refinement is QA-gated.** The `qa:baseline` / `qa:grade` / `qa:diff` scripts enforce numeric elite floors; any phase that regresses on any floor is reverted.
- **E2E review before ship.** Claude reviews the full diff from `main`, then Codex double-checks via `codex exec review --base main`. Any HIGH severity finding blocks the ship.
- **Nothing pushed without explicit user approval** at Phase 10.

## 4. Model Assignments

| Level | Provider | Primary model | Fallback |
|---|---|---|---|
| Level 1 (free) | Together AI | A/B winner: `deepseek-ai/DeepSeek-V3` vs. best Kimi checkpoint | — |
| Level 2 (premium) | Gemini | `gemini-3.1-pro-preview` | `gemini-3-pro-preview` |
| QA Judge | Gemini | `gemini-3.1-pro-preview` | — |

Kimi candidate identifier to be confirmed at Phase 1.5 (likely `moonshotai/Kimi-K2-Instruct-0905` or newer on Together AI).

## 5. Fixture Set

Five fixtures span the difficulty ladder and three essay types.

| # | Fixture | Type | Research by | Complexity |
|---|---|---|---|---|
| 1 | `college-level` (existing) | Historical argument, sourced | — | Medium |
| 2 | `college-elite-sourced` (existing) | Sourced historical analysis with counter-argument | — | High |
| 3 | `comparative-essay` (new) | Comparative across two subjects | Codex research | High |
| 4 | `analytical-essay` (new) | Deep analytical / close-reading | Codex research | High |
| 5 | `creative-writing` (new) | Personal narrative, voice-dominated | Codex research | Medium-High |

Each Codex-researched fixture must deliver:
- Assignment prompt document (≥ 300 words, realistic instructor tone)
- Weighted rubric (4–5 criteria, percentages or points)
- Source packet where applicable (4–6 sources for sourced variants)
- Student-input package: grade level, self-assessment, writing habits, 4–6 sample essays (sourced from permissively-licensed or synthetic-authored material)

Claude writes the research brief per fixture; Codex executes; Claude validates each fixture before it lands.

## 6. Elite Quality Bar

All thresholds must hold across **all 5 fixtures × both levels**. A single regression on a floor blocks the change.

| Metric | Elite target | Non-negotiable floor |
|---|---|---|
| Judge overall writing | ≥ 8 / 10 | ≥ 7 |
| Judge voice naturalness | ≥ 8 / 10 | ≥ 7 |
| Judge source integration (sourced variants) | ≥ 7 / 10 | ≥ 6 |
| Judge rubric accuracy | ≥ 8 / 10 | ≥ 7 |
| Heuristic AI resistance | ≥ 9 / 10 | ≥ 8 |
| Heuristic authenticity | = 10 / 10 | ≥ 9 |
| Max same-transition reuse | ≤ 2 per essay | ≤ 2 |
| Max repeated opener run | ≤ 2 | ≤ 2 |

Judge metrics are Gemini's output; heuristics are computed deterministically in `qa-generation.ts`.

## 7. Architecture Overview

```
 User input                              
   │                                     
   ▼                                     
 /api/portal/generate  (route.ts)        
   │                                     
   ├─► Level 1 path:  Together AI      
   │     LEVEL1_MODEL env-driven (DeepSeek-V3 | Kimi)     
   │                                     
   └─► Level 2 path:  getProvider() ──►  src/lib/providers/  
         │                                 ├── anthropic.ts (dormant)
         │                                 ├── gemini.ts   (active)
         │                                 └── index.ts    (resolves via LEVEL2_PROVIDER env)
         │                                 
         12-pass pipeline (plan → draft → critique → audit → expand → evidence → attribute → compliance → quote → trim → source-flow → polish)
         ▲                                     
         │                                     
 QA harness (scripts/qa-generation.ts) ───► same provider abstraction
         │                                     
         └─► Judge call (Gemini) → JudgeScores → qa:diff → pass/fail gate
```

## 8. Execution Phases

### Part 1 — Foundations

- **Phase 0 (done):** Provider abstraction (commit `5326357`), Codex CLI install, `.claude/settings.local.json` allowlist.
- **Phase 1:** CI runs `npm test`. Build `scripts/qa-baseline.ts`, `scripts/qa-grade.ts`, `scripts/qa-diff.ts`. Add `npm run` scripts: `qa:baseline`, `qa:grade`, `qa:diff`. Establish baselines on the 2 existing fixtures via Gemini (requires `GEMINI_API_KEY`).
- **Phase 1.5 — Level 1 A/B:** Make `LEVEL1_MODEL` env-driven in `route.ts` (remove the hardcoded constant at line 41). Add `LEVEL1_MODEL_CANDIDATE` for A/B. Run across all fixtures. Winner becomes default.
- **Phase 2 — Route wire-up:** Delete `createLevel2Message` helper and `LEVEL2_PRIMARY_MODEL`/`LEVEL2_FALLBACK_MODEL` constants in `route.ts`. Replace all 12 call sites with `provider.createLevel2Message(...)`. Rename `streamLevel2Anthropic` → `streamLevel2`. Replace Anthropic judge in `qa-generation.ts:757-762` with Gemini judge wrapper. Default `LEVEL2_PROVIDER=gemini` in `.env.example`.

### Part 2 — Codex Research + Stress Test

- **Phase 2.5 — Fixture construction:** For each of `comparative-essay`, `analytical-essay`, `creative-writing`, Claude writes a research brief and runs `codex exec <brief>`. Codex produces the assignment/rubric/sources/samples. Claude validates and commits under `scripts/fixtures/qa/<name>/`.
- **Phase 3 — Stress test:** `qa:grade` runs across all 5 fixtures × Level 1 winner × Level 2 Gemini. Output committed to `output/qa/stress-test-v1/summary.md` with per-fixture strengths, gaps, and per-metric scores.

### Part 3 — Refinement (iterative, QA-gated)

- **Phase 4 — Prompt & pipeline refinement.** Each iteration follows this loop:
  1. Identify one concrete weakness from stress-test findings.
  2. Single focused edit (prompt wording, pipeline pass condition, or fingerprint heuristic).
  3. `qa:grade` on affected fixtures.
  4. `qa:diff` vs. baseline — nonzero exit if any floor regresses.
  5. `/codex-review` on the diff; summarize + triage findings.
  6. Commit only if QA and triaged review both pass.

  Candidate refinements (validated by stress-test data — only those the test proves necessary ship):
  - Soften quality-floor language (`essay-generator.ts:1048-1058`) to reduce formality creep.
  - Cap favorite-transition reuse (≤2 per essay) in the Writing prompt (`essay-generator.ts:1024`).
  - Require a "thinking beat" before claims (show student weighing an alternative).
  - Reframe source integration from "announce" to "absorb" in Draft pass (`essay-generator.ts:1035-1041`).
  - Drop scripted short-sentence templates (`essay-generator.ts:1015`).
  - Gate conversational first-person voice on `shouldAllowFirstPerson` — already exists, extend to a frequency slider.
  - Merge sourced-logic into Draft (Pass 2) — currently only Plan branches.
  - Tighten conditional pass skipping (unsourced essays should often skip Expansion / Compliance / Trim / Source Flow).
  - Inter-pass voice-regression guard: reject any pass output that regresses burstiness / favorite-transition / signature-word metrics by >15% vs. prior pass.

### Part 4 — Infrastructure

- **Phase 5 — Codex review slash commands.** Create `.claude/commands/codex-review.md`, `-branch.md`, `-last.md`. Invoke `codex exec review --uncommitted | --base main | --commit HEAD`. Claude summarizes + triages findings (high/medium/low). Raw transcript saved to `tmp/codex-reviews/`.
- **Phase 6 — Greptile.** User installs GitHub App. Claude commits `.greptile` config at repo root (advisory mode, ignore `node_modules`/`output/qa`/`.next`, flag any wording change in `src/lib/essay-generator.ts`).
- **Phase 7 — Gemini context caching.** Evaluate only if cost/latency metrics justify; otherwise defer.

### Part 5 — Final Validation + Ship

- **Phase 8 — Claude E2E review.** Read full `git diff main..HEAD`. Verify: all 5 fixtures clear elite floors; `npm test` passes; no secrets leaked; Gemini and Kimi configs documented in `.env.example`; all Anthropic runtime call sites removed. Produce `output/qa/e2e-review.md`.
- **Phase 9 — Codex double-check.** `codex exec review --base main`. Claude summarizes + triages. Any HIGH severity finding blocks — fix in-loop, re-run Phase 8 + 9.
- **Phase 10 — Ship.**
  1. Create PR with: phase-by-phase summary, elite-verification table, Codex triage summary, cost totals, rollback plan.
  2. Merge to `main` (no squash — preserve phase commits).
  3. Vercel auto-deploys from `main`.
  4. Update Vercel env via MCP (or `vercel:env` skill / Vercel CLI if MCP lacks env mutation): add `GEMINI_API_KEY` and `LEVEL2_PROVIDER=gemini` to Production + Preview.
  5. Verify deploy health via `mcp__plugin_vercel_vercel__get_deployment` and runtime logs.

## 9. Rollback Plan

- Each phase ships as its own commit on `feat/gemini-provider-abstraction`. `git revert <sha>` restores any single phase without affecting others.
- Runtime kill switch: flip `LEVEL2_PROVIDER=anthropic` (and populate `ANTHROPIC_API_KEY`) to restore pre-migration behavior without code changes. Anthropic provider is dormant, not deleted.
- Kimi/DeepSeek kill switch: flip `LEVEL1_MODEL` env var.

## 10. Cost Projection

| Item | Estimated API spend |
|---|---|
| Phase 1 Gemini baselines (2 existing fixtures) | ~$3 |
| Phase 1.5 Level 1 A/B (5 fixtures × 2 models) | ~$0.25 |
| Phase 2.5 Codex research (GPT-5 tokens × 3 fixtures) | ~$3 |
| Phase 3 stress test (10 essays + 10 judgments) | ~$2 |
| Phase 4 refinement iterations (~20 × $2) | ~$40 |
| Phase 8–9 E2E + Codex review | ~$2 |
| **Total** | **~$55** |

## 11. Open Items (tracked in task list)

- Confirm exact Kimi checkpoint on Together AI at Phase 1.5.
- User provides `GEMINI_API_KEY` when ready (blocks Phase 1 baseline run; Phase 1 harness work itself is not blocked).
- Confirm Vercel MCP env-mutation capability; if absent, install Vercel CLI before Phase 10.

## 12. Success Criteria

- All 5 fixtures × Level 1 winner × Level 2 Gemini clear elite floors simultaneously.
- `npm test` passes in CI.
- Codex review at Phase 9 has zero HIGH severity findings.
- Vercel deploy at Phase 10 returns healthy, generation endpoint `POST /api/portal/generate` succeeds end-to-end against production with a real Gemini key.
- Final QA report committed to `output/qa/final-elite-verification.md`.
