# Deep QA Report

Generated: 2026-04-12

## Scope

This QA pass tested the current writing pipeline against a harder `college-level` scenario with:

- a college-standard sample corpus
- a longer historiographical Abbasid Revolution prompt
- strict rubric requirements
- a source-backed variant

Artifacts generated in this run:

- `output/qa/college-level/level1-essay.txt`
- `output/qa/college-level/level2-essay.txt`
- `output/qa/college-level/level2-sourced-essay.txt`
- `output/qa/college-level/report.md`

## Pipeline Changes Under Test

This report validates the recent Level 2 refinements that were added across the writing pipeline:

1. `Level 2` now treats evidence-strengthening as a standard pass instead of reserving it only for source-backed runs.
2. No-source prompts now push for concrete but student-plausible detail instead of textbook-style overprecision.
3. The attribution/compliance stages explicitly try to satisfy evidence count, thesis clarity, and word-count requirements.
4. Final cleanup now strips unsupported classroom-attribution language in no-source runs and normalizes source phrasing in sourced runs.
5. The QA harness now supports named scenarios via `QA_SCENARIO`, which allowed this college-level fixture set to coexist with the original baseline harness.

## Grading Scale

All judge metrics use a `1-10` scale:

- `aiDetectionResistance`: 10 means least likely to read as AI.
- `sampleAccuracy`: 10 means closest match to the student's real writing.
- `rubricAccuracy`: 10 means strongest prompt/rubric compliance.
- `evidenceHandling`: 10 means concrete, well-integrated, well-explained evidence.
- `overallWriting`: 10 means strongest overall essay at the student's actual level.

The deterministic heuristic scores are not the final grade. They are guardrail metrics that mainly track burstiness, signature words, transition use, opener variety, and obvious AI-style phrasing.

## Scorecard

| Variant | AI Resist | Sample Acc | Rubric Acc | Evidence | Overall | Word Count |
|---|---:|---:|---:|---:|---:|---:|
| Level 1 | 6 | 4 | 5 | 4 | 5 | 1138 |
| Level 2 | 8 | 7 | 9 | 8 | 8 | 1331 |
| Level 2 + Sources | 9 | 8 | 9 | 8 | 8 | 1471 |

## What Improved

### Level 2 vs Level 1

The improvement is real and material:

- `rubricAccuracy`: `5 -> 9`
- `evidenceHandling`: `4 -> 8`
- `overallWriting`: `5 -> 8`
- `sampleAccuracy`: `4 -> 7`

The strongest difference is not just polish. `Level 2` actually satisfies the assignment better. It handled:

- the two-part thesis requirement
- the Abu Muslim / Khurasan requirement
- the mawali requirement
- the Battle of the Zab requirement
- the Baghdad / administrative-change requirement
- counterargument structure
- primary-vs-secondary interpretive comparison

`Level 1` could speak competently about the topic, but it still behaved like a generic essay writer. It paraphrased requirements rather than fully inhabiting the sampled voice and rubric.

### Source-Backed Level 2

The sourced path also improved in the ways the recent refinements were intended to improve it:

- stronger AI-resistance score than unsourced `Level 2`
- better sample match than `Level 1`
- clearer interpretive structure than the baseline `Level 1` path

The sourced essay did successfully:

- name and compare source perspectives
- keep a college-level thesis
- use a direct quoted phrase from the packet
- stay analytically focused rather than just descriptive

## Uploaded Writing Pieces

The generated essays were saved as:

- [level1-essay.txt](/Users/kingtom91/Documents/Projects/Paideia/output/qa/college-level/level1-essay.txt)
- [level2-essay.txt](/Users/kingtom91/Documents/Projects/Paideia/output/qa/college-level/level2-essay.txt)
- [level2-sourced-essay.txt](/Users/kingtom91/Documents/Projects/Paideia/output/qa/college-level/level2-sourced-essay.txt)

## Interpretation

### Level 1

`Level 1` remains usable as a baseline, but it is not competitive for strict college-level writing. The main failures were:

- weak sample matching
- missing source-specific quotation behavior
- weaker comparison between primary and analytical interpretation
- more formulaic academic phrasing than the real samples

### Level 2

`Level 2` is clearly the stronger path for hard prompts. Its best behavior in this test:

- handled the complicated prompt without collapsing into summary
- preserved most of the sample's analytical tone
- made a defensible middle-position thesis
- integrated evidence with explanation rather than stacking facts

Its main remaining weakness is that it can still sound too systematically complete. The essay sometimes feels like it is checking requirements in sequence rather than thinking unevenly the way a real student does.

### Level 2 + Sources

The sourced `Level 2` path is strong, but not yet finished:

- it still drifts into slightly generic source-attribution phrasing
- it still overweights smoothness over student-level irregularity
- it exceeded the upper word ceiling in this run

That means the sourced path is close, but the attribution and max-word trimming behavior still need another refinement pass.

## Recommendation

Current recommendation after the college-standard QA pass:

1. Keep the current `Level 2` unsourced pipeline.
2. Continue refining sourced `Level 2` attribution so it names source speakers/claims more naturally.
3. Add a stronger hard ceiling after the compliance pass so sourced outputs stop drifting above max word count.
4. Revisit paragraph and transition guidance for long-form college assignments so they scale better beyond the original high-school baseline.

## Related Review

The end-to-end coexistence review is saved separately in:

- [e2e-review.md](/Users/kingtom91/Documents/Projects/Paideia/output/qa/college-level/e2e-review.md)
