---
description: Run Codex review against the branch diff from main; summarize findings by severity
allowed-tools: Bash(codex exec:*), Bash(mkdir:*), Bash(date:*), Write, Read
---

Review the entire branch diff (current HEAD compared to `main`) using Codex, then summarize findings by severity. Use this at phase completion, before PR creation, or for an E2E review of aggregated work.

Steps to execute:

1. Ensure `tmp/codex-reviews/` exists: `mkdir -p tmp/codex-reviews`.
2. Capture a timestamp: `date +%Y%m%d-%H%M%S`.
3. Run Codex: `codex exec review --base main --full-auto` and save output to `tmp/codex-reviews/<timestamp>-branch-vs-main.md`.
4. Parse the Codex output. Organize findings into HIGH / MEDIUM / LOW buckets using the same criteria as `/codex-review`:
   - HIGH: runtime bugs, security, data integrity, silent failures, API contract breaks.
   - MEDIUM: logic bugs latent under edge cases, missing error handling, pattern divergence.
   - LOW: nits, preference-level suggestions.
5. Produce the summary:

```
Codex review (branch vs main, <timestamp>)
Raw: tmp/codex-reviews/<timestamp>-branch-vs-main.md

HIGH (N):
- ...

MEDIUM (N):
- ...

LOW (N):
- ...

Recommendation: <block ship on HIGH | address MEDIUM before merge | safe to ship>
```

6. For Phase 9 (ship-gate review in the level-2-refinement plan), any HIGH finding is a blocker — flag this explicitly in the Recommendation line. Do not proceed to PR creation until HIGH items are resolved.

7. Do NOT surface the raw Codex transcript in conversation — only the triaged summary.

If `codex exec review` fails or Codex is unavailable, report the failure and stop; do not synthesize a fake review.
