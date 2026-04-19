# Post-Merge E2E Review — PRs #19 + #20

**Date:** 2026-04-18
**Reviewer:** Claude (E2E pass + Codex double-check per the refinement plan's Phase 8 / Phase 9 pattern)
**Scope:** Two follow-up PRs opened after PR #18 merged; neither touches runtime behavior.
**Status:** ✅ Safe to ship — 0 HIGH findings, all actionable items addressed.

---

## Summary

Two follow-up PRs opened during post-merge ship verification:

- **PR #19** `chore/post-merge-polish` — `formatProviderSlot` helper with safe fallback, `scripts/verify-prod-gemini.ts` smoke-test tool, `docs/known-limitations.md`.
- **PR #20** `chore/add-college-elite-fixture` — cherry-picks the `college-elite-sourced` QA fixture from stale PR #17 (now closed) to complete the 5-fixture suite.

Neither PR changes runtime code paths in `src/app/api/` or `src/lib/providers/`. Blast radius is QA tooling and fixture data.

## Verification

| Check | PR #19 | PR #20 |
|---|---|---|
| `npm test` | ✅ 224 tests pass | ✅ 224 tests pass |
| `npx tsc --noEmit` | ✅ clean | ✅ clean |
| `npx eslint .` | ✅ clean | ✅ clean (fixture-only diff) |
| Claude manual review | ✅ no concerns | ✅ fixture content historically accurate, no copyright concerns |
| Codex review (Phase 9 analog) | see below | see below |
| Prod smoke (`verify-prod-gemini.ts`) | ✅ Gemini 3.1 Pro preview returns a real response end-to-end | n/a |

## Codex findings (triaged)

### PR #19

**Initial pass:** 1 P2.

- [P2] `scripts/verify-prod-gemini.ts:17` — `getProvider()` with no arg falls through to `resolveProviderName()` and can silently build the Anthropic client in envs where `LEVEL2_PROVIDER` is unset or `=anthropic`, producing a false-positive "smoke test passed" without ever exercising Gemini.
  - **Fix:** Pinned to `getProvider("gemini")` (commit `789828d`).
  - **Recheck:** clean — "I did not identify any discrete, actionable bugs in this diff."

**Final state:** 0 findings.

### PR #20

**Initial pass:** 1 P1 + 1 P2.

- [P1] `scripts/fixtures/qa/college-elite-sourced/assignment.txt:12` — assignment requires Abu Muslim discussion, but `source-context.txt` had no Abu Muslim material. Sourced runs penalize off-packet facts, so the fixture would systematically under-score.
  - **Fix:** Added Source 6 covering Abu Muslim's role as Khurasani coordinator and his 755 execution (commit `c5aca97`).
- [P2] `sample-4.txt:3` — references Abu Muslim's execution as counterargument, off-packet before the fix. Same commit resolves this (Abu Muslim's execution is now in Source 6).

**Recheck after fix:** P1 resolved; Codex surfaced two new P2s on closer inspection:

- [P2] `meta.json:30-38` — `quoteIntroStyle` and `overusedPhrases` don't appear in any of the four samples, but the Level 2 Writing prompt injects them as habits the student "typically" does. QA voice-fidelity score measures a contradictory profile.
- [P2] `sample-4.txt:1-7` (and sample-3) — two of four samples are short fragments (~190 / ~250 words) while the fixture targets 1200–1400-word essays. `buildLevel1Prompt` uses the two shortest samples inline, so Level 1 studies fragments instead of full-essay structure.

**Resolution for new P2s:** Accepted + documented in `docs/known-limitations.md`. Both are fixture-quality issues, not ship blockers. The fixture functions; its signals are directional rather than authoritative. The other four fixtures remain the gating set.

**Final state:** 0 HIGH/P1, 2 P2 accepted with docs.

## Known limitations (carried forward)

From `docs/known-limitations.md`:

1. Creative-writing variance (L2 median 6 vs floor 7) — accepted, documented.
2. `GEMINI_API_KEY` trailing newline in Vercel — cosmetic, SDK tolerates, deferred fix.
3. Kimi A/B not yet run (in flight at time of review; see task #7).
4. Greptile App install pending (user action).
5. `college-elite-sourced` fixture profile/sample misalignment (P2s above) — operator should treat scores as directional.

## Ship recommendation

**Merge both PRs.** 0 HIGH findings after one round of fixes on each PR. All runtime code unchanged; risk is limited to the QA harness and fixture data. Rollback is a single `git revert` per PR.

Recommended merge order:
1. **PR #19** first — `known-limitations.md` references PR #20's fixture, so landing #19 first means the doc is already authoritative when #20 lands.
2. **PR #20** second — fixture is additive; can be run via `npm run qa:generate college-elite-sourced` once merged.

No redeploy needed for either — both are QA-only changes.

## Raw Codex transcripts

- `tmp/codex-reviews/20260418-151209-pr19-branch-vs-main.md` — PR #19 initial
- `tmp/codex-reviews/20260418-151435-pr19-recheck.md` — PR #19 recheck (clean)
- `tmp/codex-reviews/20260418-151621-pr20-branch-vs-main.md` — PR #20 initial
- `tmp/codex-reviews/20260418-151930-pr20-recheck.md` — PR #20 recheck
