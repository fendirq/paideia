# Known Limitations

Current, user-visible limitations in the Paideia generation system. Scope: things a user or operator needs to know that are *not* bugs and *not* scheduled fixes.

Last reviewed: 2026-04-18.

## Level 2 creative-writing variance

**Symptom.** On narrative / creative-writing assignments, Level 2 essay quality varies substantially between runs on the same prompt. On the internal QA scoreboard, the judge's `overallWriting` metric spans 4–9 across repeated runs; the median of three runs lands around 6, below the elite floor of 7.

**Scope.** Affects only narrative assignments. Argumentative essays (comparative, analytical, historical / sourced) are stable and hit the elite floor (≥ 8 / 10 overall on the 4-fixture argumentative suite).

**Root cause.** Gemini 3.1 Pro preview's thinking-mode stochasticity interacts with voice-matching on narrative prose. The pipeline already strips raw writing samples from the narrative Writing and Audit passes (voice profile only) and skips argumentative-only passes on narrative assignments, but variance persists at the model layer.

**What we tried (shipped in PR #18).**
- `isNarrativeAssignment` detection gating the pipeline
- Narrative-specific Writing + Audit prompts (no raw-sample copying)
- Skipping argumentative-only passes (evidence / attribution / compliance / source-flow) on narratives

**What's deferred.**
- Lower-temperature narrative Draft pass
- Multirun-gated self-consistency (generate N, pick median-quality)
- Inter-pass voice-regression guard (reject passes that regress burstiness / transition / signature-word metrics > 15% vs prior pass)

**Operator guidance.** For student narrative writing, expect run-to-run variability. A second regeneration is usually cheap and may produce a materially better result. Argumentative assignments do not need this caveat.

**References.**
- `output/qa/e2e-review.md` — full scoreboard and migration posture
- `docs/superpowers/specs/2026-04-16-level2-refinement-design.md` — elite quality bar
- `output/qa/creative-writing/` — fixture baselines across three runs

## GEMINI_API_KEY in Vercel has a trailing newline (cosmetic)

**Symptom.** The production value of `GEMINI_API_KEY` in Vercel includes a trailing `\n`. The Google Gemini SDK currently tolerates this; production is working correctly.

**Risk.** If a future SDK update tightens header validation, auth will fail until the env var is re-added without the trailing newline.

**Fix path.** `vercel env update GEMINI_API_KEY production --value "<key>" --yes` during a scheduled ops window (requires redeploy to take effect).

## Kimi A/B on Level 1 not yet run

The `LEVEL1_MODEL` env var is driven by config and supports swapping between DeepSeek V3 (current default) and Moonshot Kimi without code changes. The head-to-head scoreboard across all 5 fixtures is pending and should run post-ship. Outcome may move the Level 1 default.

## Greptile PR review not yet active

`.greptile` config is committed and will take effect once the Greptile GitHub App is installed on the repository (`github.com/apps/greptile`). Until then, Codex review is the primary AI-side PR gate.

## `college-elite-sourced` fixture — noisy signals

The 5th QA fixture (`scripts/fixtures/qa/college-elite-sourced/`) was cherry-picked in PR #20 to complete the 5-fixture suite the design spec targets. It works, but Codex review surfaced two fixture-quality P2s that degrade its signal relative to the other four:

1. **Self-assessment profile contradicts samples.** `meta.json` lists `quoteIntroStyle` and `overusedPhrases` that do not appear in any of the four samples. The Level 2 Writing prompt (`buildLevel2WritingPrompt`) injects these as habits the student "typically" does, so on this fixture the generator is being told to imitate patterns absent from the ground truth — voice-fidelity scoring is measuring a contradictory profile.
2. **Two samples are short fragments.** The fixture targets a 1200–1400 word essay, but `sample-3.txt` (~190 words) and `sample-4.txt` (~250 words) are short-answer length. `buildLevel1Prompt` uses the two shortest samples as inline references, so Level 1 studies fragments instead of full-essay structure on this scenario.

**Operator guidance.** Treat `college-elite-sourced` judge scores as directional, not authoritative, until the profile/sample alignment is rewritten. The other four fixtures remain the gating set.

**Fix path.** Rewrite `sample-3.txt` and `sample-4.txt` to full-essay length (~900–1100 words each) and update `meta.json.selfAssessment.quoteIntroStyle` / `overusedPhrases` to reference phrases that actually appear in the sample corpus.
