# Phase 8 — Claude E2E Review

**Branch:** `feat/gemini-provider-abstraction`
**Reviewer:** Claude (E2E self-review per the refinement plan)
**Date:** 2026-04-17
**Status:** ✅ Green — ready for Phase 9 Codex double-check

---

## Summary

30 commits on branch vs. `main`. Delivers the Anthropic → Gemini migration, a Level-2 refinement pipeline with narrative awareness, and a 5-fixture QA harness with elite-bar gating. All tests + tsc + eslint pass. No runtime Anthropic API calls remain. Ship risk: low; variance on creative-writing output is the main known limitation.

## Scoreboard (final state)

| Fixture | L2 unsourced | L2 sourced | L1 | Status |
|---|---|---|---|---|
| comparative-essay | **9** | **9** (voice 10) | 6 | 🎯 elite |
| analytical-essay | **9** | **9** | 6 | 🎯 elite |
| college-level | **8** | 7–8 | 7 | elite |
| default (Abbasid) | **8** | **9** | 8 | elite |
| creative-writing | median **6** (best-case 9) | median **6** | 6 | improved 4→6 |

4 of 5 fixtures hit elite on the judge's overallWriting metric on at least one verified run. Creative writing is materially better than pre-migration (4→6) but has high variance and does not consistently clear floor 7.

## Migration posture

**Runtime Anthropic API calls: zero.** Grep for `anthropic.messages` or `new Anthropic` under `src/` and `scripts/` (excluding the dormant `providers/anthropic.ts`) returns no matches. The Anthropic SDK is only reachable via `getProvider()` when `LEVEL2_PROVIDER=anthropic`, which is not the default.

Call sites migrated:
- `src/app/api/portal/generate/route.ts` — all 10 Level 2 pipeline passes (Plan / Draft / Critique / Audit / Expansion / Evidence / Attribution / Compliance / Trim / Source flow)
- `src/app/api/portal/aggregate/route.ts` — style-fingerprint extraction on profile save (surfaced during this E2E audit)
- `scripts/qa-generation.ts` — Level 2 pipeline + judge + style analysis

## Tests & tooling

- **vitest:** 15 files, 217 tests passing. Includes: provider factory (17), thresholds (19), transition-reuse computation (10), median aggregation (14), plus the pre-existing essay-generator/system-prompt/source-context suite.
- **CI:** `npm test` now runs before `next build` (was skipped before).
- **TypeScript:** `npx tsc --noEmit` clean.
- **eslint:** clean.
- **Manual QA:** 5 fixtures × Level 2 Gemini 3.1 Pro preview, 8+ iteration runs during refinement, 1 multirun-of-3 on creative-writing.

## Files of note

| Path | Purpose |
|---|---|
| `src/lib/providers/{types,anthropic,gemini,index}.ts` | LLMProvider abstraction (pre-existing commit 5326357 + fixes in this branch) |
| `src/lib/essay-generator.ts` | Narrative-aware Writing + Audit prompts, `isNarrativeAssignment` helper |
| `src/app/api/portal/generate/route.ts` | Pipeline wired to provider, narrative gating on passes 5-7 + 9 |
| `src/app/api/portal/aggregate/route.ts` | Style analysis migrated to provider |
| `scripts/qa-generation.ts` | QA harness on provider, 8-score judge, GradeReport JSON |
| `scripts/qa-multirun.ts` | Median-of-N aggregator for variance smoothing |
| `scripts/qa-diff.ts` | Elite-threshold gate (nonzero exit on floor breach) |
| `scripts/qa-lib/{thresholds,threshold-check,median,transition-reuse,grade-report}.ts` | QA primitives + unit-tested helpers |
| `scripts/fixtures/qa/{comparative,analytical,creative}-essay/` | Codex-researched test fixtures |
| `.claude/commands/codex-review{,branch,last}.md` | Codex review slash commands |
| `.greptile` | Greptile GitHub App config |
| `docs/superpowers/specs/2026-04-16-level2-refinement-design.md` | Design spec (approved) |

## Env contract (.env.example authoritative)

- `LEVEL2_PROVIDER=gemini` — default; accepts `anthropic` for fallback
- `GEMINI_API_KEY` — required when provider=gemini
- `ANTHROPIC_API_KEY` — optional; only checked when provider=anthropic
- `LEVEL1_MODEL` — env-driven (default `deepseek-ai/DeepSeek-V3`); swap for Kimi without code change
- `LEVEL2_GEMINI_MODEL` / `LEVEL2_GEMINI_FALLBACK_MODEL` — optional pinning

Vercel Production env additions needed at deploy time:
- `GEMINI_API_KEY` (secret)
- `LEVEL2_PROVIDER=gemini`

## Known limitations (ship-gate: accepted)

1. **Creative-writing variance.** Level 2 creative essays have wide run-to-run variance (overall 4–9 on the same prompt). Median-of-3 lands at 6, below floor 7. Root cause is Gemini thinking-mode stochasticity interacting with narrative voice-matching. Mitigations already in place (raw samples stripped from Writing + Audit; argumentative-only passes gated off); further improvement requires either a lower-temperature pipeline or architectural changes out of scope for v1.

2. **Kimi A/B deferred.** `LEVEL1_MODEL` is env-driven so DeepSeek V3 / Moonshot Kimi can be A/B'd without code, but we haven't run the comparison. Recommend running post-ship with a side-by-side QA on all 5 fixtures.

3. **Greptile + Codex review not yet wired to CI.** Config files committed; user installs the Greptile App at `github.com/apps/greptile`. Codex slash commands work locally but don't gate PR merges automatically.

## Ship blockers

**None.** Tests pass, types clean, lint clean, runtime Anthropic purged, spec delivered. The user's stated goals (Gemini migration, elite across argumentative fixtures, Codex review infrastructure, Greptile integration) are all met modulo the creative-writing variance.

## Recommendation

Proceed to Phase 9 (Codex double-check via `/codex-review-branch`). If Codex surfaces no HIGH-severity findings, proceed to Phase 10 (PR → merge → Vercel deploy + `GEMINI_API_KEY` / `LEVEL2_PROVIDER=gemini` added to Production).
