# E2E Review

Generated: 2026-04-12

## Findings

### 1. Long-form assignments still inherit high-school paragraph assumptions

Severity: medium

Files:

- [essay-generator.ts](/Users/kingtom91/Documents/Projects/Paideia/src/lib/essay-generator.ts:680)

Why it matters:

The core Level 2 writing prompt still tells the model that a `~wordCount` essay should have `4-5 total paragraphs`. That assumption made sense for the original shorter high-school scenario, but it does not scale cleanly to the new college-level prompt. In the college test, the model still produced usable output, but the prompt is internally misaligned for longer assignments. That raises the chance of compressed argument structure, overstuffed body paragraphs, or later repair passes having to undo the original plan.

Recommended fix:

Make paragraph guidance conditional on target length, for example:

- shorter essays: `4-5 paragraphs`
- mid-length essays: `5-6 paragraphs`
- long-form essays: `6-8 paragraphs`

### 2. Source-attribution cleanup still reduces specificity and weakens sourced essays

Severity: medium

Files:

- [route.ts](/Users/kingtom91/Documents/Projects/Paideia/src/app/api/portal/generate/route.ts:525)
- [essay-generator.ts](/Users/kingtom91/Documents/Projects/Paideia/src/lib/essay-generator.ts:1146)
- [essay-generator.ts](/Users/kingtom91/Documents/Projects/Paideia/src/lib/essay-generator.ts:1245)

Why it matters:

The sourced path now avoids the worst `class notes` phrasing, but the current cleanup strategy often rewrites source language into generic phrases like `According to the source`. That is cleaner than fake classroom attribution, but it still leaves evidence sounding less specific than the rubric expects. The college QA run exposed this directly: sourced `Level 2` still lost points for generic attribution even after the cleanup changes.

Recommended fix:

- Preserve named source labels when they exist.
- Rewrite toward `According to al-Tabari` / `The packet's social-grievance note argues` rather than generic `the source`.
- Prefer source-specific normalization over blanket replacement.

### 3. Upper word-count ceilings are still soft, not hard

Severity: medium

Files:

- [route.ts](/Users/kingtom91/Documents/Projects/Paideia/src/app/api/portal/generate/route.ts:548)
- [route.ts](/Users/kingtom91/Documents/Projects/Paideia/src/app/api/portal/generate/route.ts:563)
- [source-context.ts](/Users/kingtom91/Documents/Projects/Paideia/src/lib/source-context.ts:66)

Why it matters:

The pipeline now infers `min` and `max` word-count bounds and passes them into attribution/compliance prompts, but acceptance logic only guards the lower bound strongly. In the college QA run, sourced `Level 2` landed at `1471` words against a `1200-1400` target and still shipped because there is no final hard rejection or deterministic trim when the model overshoots the ceiling.

Recommended fix:

- Add a post-compliance ceiling guard.
- If `maxWords` is known and the candidate exceeds it materially, either:
  - run one final trim pass, or
  - reject the candidate and keep the prior shorter draft.

### 4. Evidence-count inference is still narrower than the strict prompts it now needs to support

Severity: medium

Files:

- [source-context.ts](/Users/kingtom91/Documents/Projects/Paideia/src/lib/source-context.ts:87)

Why it matters:

`inferRequiredEvidenceCount()` currently recognizes a limited family of `at least N evidence` phrasings. That works for the baseline prompt and for this college fixture, but it will miss many stricter rubric patterns such as:

- `use five specific historical examples`
- `incorporate 4 pieces of concrete evidence`
- numbered requirement lists that imply the count rather than spelling `at least`

When inference fails, later evidence-enforcement passes lose one of their strongest guardrails.

Recommended fix:

- Broaden regex support for `examples`, `details`, `historical developments`, and `pieces of support`.
- Consider falling back to rubric-list parsing when exact phrasing is absent.

## Architecture Review

### Portal UI

Entry point:

- [GeneratePage.tsx](/Users/kingtom91/Documents/Projects/Paideia/src/components/portal/GeneratePage.tsx:15)

Role in the system:

- gathers assignment text
- optionally extracts rubric text from uploaded files
- accepts source URLs and user source notes
- infers word count from prompt/rubric text
- streams the generated essay over SSE
- persists the generated result after completion

Coexistence assessment:

The UI changes coexist cleanly with the older flow. The source-link and source-note fields are additive and do not block the old no-source path. The persistence behavior stores source info inside the saved requirements blob, which keeps backward compatibility intact even though it is less structured than a dedicated saved-source schema.

### Source Context Layer

Core file:

- [source-context.ts](/Users/kingtom91/Documents/Projects/Paideia/src/lib/source-context.ts:1)

Role in the system:

- normalizes and caps URLs
- fetches remote source material with timeout and size guards
- extracts text from HTML/PDF/DOCX/plain text
- infers target word counts and evidence requirements
- formats approved source material for prompting

Coexistence assessment:

This layer coexists well with both old and new flows. If no sources are supplied, the rest of the system still works. If sources are supplied, the route gets a prompt-ready source bundle without needing the prompt builders themselves to know anything about HTTP fetching.

### Generation Route

Core file:

- [route.ts](/Users/kingtom91/Documents/Projects/Paideia/src/app/api/portal/generate/route.ts:162)

Role in the system:

- authenticates the user
- checks profile shape and payment gating
- resolves fingerprinted vs legacy profiles
- dispatches Level 1 vs Level 2 pipelines
- runs the full staged Level 2 process
- streams the final essay back through SSE

Coexistence assessment:

The route is the main coexistence point and generally does its job well. The key success is that the new Level 2 stages are layered onto the same request shape without breaking:

- Level 1
- old legacy Level 1 fallback
- no-source Level 2
- source-backed Level 2

The route remains readable enough to reason about, but it is now carrying a lot of orchestration logic. The next stage of maintainability work should probably extract the Level 2 pipeline into its own module to reduce route-level complexity.

### Prompt Builder Layer

Core file:

- [essay-generator.ts](/Users/kingtom91/Documents/Projects/Paideia/src/lib/essay-generator.ts:561)

Role in the system:

- builds all Level 1 and Level 2 prompts
- formats the fingerprint narrative
- selects sample excerpts
- sanitizes outputs
- applies deterministic cleanup for attribution and surface voice

Coexistence assessment:

This is where most of the new and old behavior meet. The sample-first Level 2 redesign now coexists with:

- the older Level 1 prompt
- the legacy no-fingerprint path
- the newer sourced-writing path
- the QA harness

The main tension is that the prompt set is still tuned around the original high-school baseline, while the new scenario harness can now test much more advanced student profiles. The architecture supports both, but some prompt constants are still biased toward the original use case.

### Auth / Admin Bypass

Core file:

- [auth.ts](/Users/kingtom91/Documents/Projects/Paideia/src/lib/auth.ts:7)

Role in the system:

- keeps the passcode-backed admin user pinned to `ADMIN`
- ensures Level 2 admin bypass remains stable

Coexistence assessment:

This change is isolated and clean. It does not interfere with the writing pipeline directly, but it matters operationally because the QA/review workflow depends on the admin bypass being reliable.

### QA Harness

Core file:

- [qa-generation.ts](/Users/kingtom91/Documents/Projects/Paideia/scripts/qa-generation.ts:695)

Role in the system:

- builds sample fingerprints from a fixture corpus
- runs Level 1 / Level 2 / Level 2 + Sources generation
- applies the same staged logic as the app route
- computes deterministic metrics
- asks a judge model for rubric/sample evaluations
- saves essays and reports to scenario-specific output folders

Coexistence assessment:

The new scenario-based harness is a good addition. It coexists well with the original regression test because:

- the old baseline still lives under `default`
- the new college corpus lives under `college-level`
- outputs are separated by folder
- the same generation logic is reused for both

The main downside is duplication: the script still mirrors a large amount of route orchestration logic. That is acceptable for now because it gives a faithful QA environment, but long-term it increases drift risk.

## Overall Verdict

No blocking coexistence problems were found between the new writing-pipeline work and the older generation flow.

The system currently coexists in a workable way across:

- legacy Level 1
- current Level 1
- current Level 2 no-source
- current Level 2 source-backed
- scenario-based QA harnesses

The biggest remaining risks are not hard integration failures. They are scaling and polish problems:

- long-form prompt assumptions still reflect shorter essays
- sourced attribution cleanup is cleaner but still too generic
- max-word ceilings are not enforced hard enough
- evidence-count inference is narrower than the new rubric complexity now being tested
