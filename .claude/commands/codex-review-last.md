---
description: Run Codex review against the most recent commit; summarize findings by severity
allowed-tools: Bash(codex exec:*), Bash(mkdir:*), Bash(date:*), Write, Read
---

Review the single most recent commit (HEAD) using Codex. Useful immediately after landing a focused change, before moving to the next one.

Steps to execute:

1. Ensure `tmp/codex-reviews/` exists: `mkdir -p tmp/codex-reviews`.
2. Capture a timestamp: `date +%Y%m%d-%H%M%S`.
3. Run Codex: `codex exec review --commit HEAD --full-auto` and save output to `tmp/codex-reviews/<timestamp>-head.md`.
4. Parse findings into HIGH / MEDIUM / LOW buckets (same criteria as `/codex-review`).
5. Produce the summary in conversation:

```
Codex review (HEAD commit, <timestamp>)
Raw: tmp/codex-reviews/<timestamp>-head.md

HIGH (N):
- ...

MEDIUM (N):
- ...

LOW (N):
- ...

Recommendation: <amend/fix before next commit | safe to continue>
```

6. Do NOT echo the raw Codex transcript into conversation — only the triaged summary.

If `codex exec review` fails or Codex is unavailable, report the failure and stop; do not synthesize a fake review.
