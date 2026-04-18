---
description: Run Codex review against uncommitted changes; summarize findings as high/medium/low
allowed-tools: Bash(codex exec:*), Bash(mkdir:*), Bash(date:*), Write, Read
---

Review the uncommitted working tree (staged + unstaged + untracked) using Codex, then summarize findings by severity.

Steps to execute:

1. Ensure `tmp/codex-reviews/` exists: `mkdir -p tmp/codex-reviews`.
2. Capture a timestamp: `date +%Y%m%d-%H%M%S` (use as filename stem).
3. Run Codex: `codex exec review --uncommitted --full-auto` and pipe output to `tmp/codex-reviews/<timestamp>-uncommitted.md` (also capture to a variable or read back with Read after).
4. Parse the Codex output. Organize findings into three buckets:
   - **HIGH**: bugs that would cause runtime failure, security issues, data corruption, silent failures, API contract violations.
   - **MEDIUM**: logic issues, style inconsistencies that will cause bugs later, missing error handling for plausible failure modes.
   - **LOW**: nits, minor style, preference-level suggestions.
5. Produce the summary in conversation in this format:

```
Codex review (uncommitted, <timestamp>)
Raw: tmp/codex-reviews/<timestamp>-uncommitted.md

HIGH (N):
- <one-line finding>  [<file>:<line>]
- ...

MEDIUM (N):
- <one-line finding>  [<file>:<line>]
- ...

LOW (N):
- <one-line finding>
- ...

Recommendation: <address HIGH before commit | safe to commit | review Medium items>
```

6. If Codex output has zero findings, print `Codex review: clean (no findings)`.
7. Do NOT dump the full Codex transcript into conversation — only the triaged summary. The raw file is for the user to open if they want details.

If `codex exec review` fails or Codex isn't available, report the failure clearly and stop; do not synthesize a fake review.
