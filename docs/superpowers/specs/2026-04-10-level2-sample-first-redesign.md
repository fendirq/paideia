# Level 2 Generation Pipeline: Sample-First Redesign

**Date:** 2026-04-10
**Status:** Approved
**Scope:** `src/lib/essay-generator.ts` (prompt builders) + `src/app/api/portal/generate/route.ts` (pipeline orchestration)

---

## Problem

The Level 2 essay generation pipeline produces mechanically structured essays that fail voice authenticity despite having access to rich writing data. QA testing revealed:

1. **One-sentence paragraphs throughout** — the model interprets `avgParagraphLength` from the fingerprint as a hard rule and applies it to every paragraph
2. **Zero natural errors** — despite Rule 6 ("include grammar patterns") and Rule 12 ("include subtle traces of weaknesses"), the refinement pass at temp 0.3 removes intentional imperfections because its system prompt says "fix deviations"
3. **Mechanical formula repetition** — "As Fitzgerald [verb]... This shows/proves that..." repeats identically 3 times because Rule 15 mandates "use ONLY these phrasings" and the voice placement plan pre-assigns where each pattern goes
4. **Over-application of every trait** — 18 mandatory rules create checklist compliance. Every declared habit appears in every section. Real writers are inconsistent.
5. **AI-detectable output** — perfect grammar + mechanical structure + formulaic patterns would trigger both AI detectors and human suspicion

**Root cause:** The pipeline extracts writing patterns into a fingerprint (lossy), then tries to reconstruct natural voice from 18 mandatory rules (double-lossy). The actual writing samples — the ground truth — are relegated to "Reference" appendix material while rules dominate.

---

## Solution: Sample-First Architecture

Flip the priority. The student's actual writing samples become the primary input. The fingerprint becomes a supporting reference sheet. Questionnaire data becomes context about the writer, not mandates.

Claude Sonnet 4 is excellent at style mimicry from examples. The current pipeline fights this strength by replacing examples with rules.

---

## What Changes

### 1. essay-generator.ts — Prompt Builders

#### Delete
- `buildLevel2OutlinePrompt()` (lines 368-423) — replaced by `buildLevel2PlanPrompt()`
- `buildLevel2GenerationPrompt()` (lines 427-493) — replaced by `buildLevel2WritingPrompt()`
- `buildRefinementPrompt()` (lines 497-534) — replaced by `buildLevel2AuditPrompt()`
- `mapHabitsToInstructions()` (lines 536-556) — habits become context, not instructions

#### Add
- `buildLevel2PlanPrompt(opts)` — lightweight structural outline, no voice placement
- `buildLevel2WritingPrompt(opts, outline)` — sample-first generation prompt
- `buildLevel2AuditPrompt(essay, fingerprint, samples, selfAssessment)` — forensic sample comparison
- `formatFingerprintNarrative(fingerprint, selfAssessment)` — converts fingerprint JSON + questionnaire data into readable "Writer's Profile" narrative

#### Modify
- `selectDiverseSamples()` — increase `maxChars` from 8000 to 12000

#### Keep (no changes)
- `StyleFingerprint` interface and all types
- `buildStyleAnalysisPrompt()` — fingerprint extraction unchanged
- `buildLevel1Prompt()` — Level 1 pipeline unchanged
- `buildLegacyLevel1Prompt()` — legacy fallback unchanged
- `normalizeFingerprint()` — unchanged
- `resolveValue()`, `formatList()` — unchanged
- `GenerateOptions`, `LegacyGenerateOptions` interfaces — unchanged

### 2. route.ts — Pipeline Orchestration

#### Modify in `streamLevel2Anthropic()`
- Pass 1 system prompt: simplified to pure structure planning
- Pass 2: prompt goes in `messages[0].role: "user"` (not system), system prompt is the identity framing. Temperature 0.5 -> 0.6
- Pass 3 system prompt: forensic comparison framing instead of "fix deviations"
- Import updated function names

#### Keep (no changes)
- 3-pass architecture (plan -> write -> audit)
- Pass 1 non-streaming, Pass 2 non-streaming, Pass 3 streaming
- All timeouts (45s, 75s, 55s)
- All validation guards (level, payment, profile checks)
- Error handling and timeout detection
- `maxDuration = 180`
- Level 1 and Legacy pipelines entirely untouched
- Model selection (`LEVEL2_MODEL`)
- SSE streaming format

---

## New Prompt Designs

### Pass 1: Plan (was "Outline")

**System prompt:**
```
You are an essay planning assistant. Create a concise structural outline for the assignment.
```

**User prompt (`buildLevel2PlanPrompt`):**
```
Create a structural outline for this essay assignment.

ASSIGNMENT:
{assignment}

{requirements ? "REQUIREMENTS/RUBRIC:\n" + requirements : ""}

TARGET WORD COUNT: {wordCount}

STUDENT CONTEXT:
- Grade level: {gradeLevel}
- Typical grade: {gradeRange}
- Evidence approach: {evidence}
- Conclusion approach: {conclusion}

The outline should include:
- A thesis direction (not the exact wording)
- Number of body paragraphs and what each argues
- Which evidence or quotes to use in each paragraph
- A brief note on conclusion approach

Keep it structural. Do NOT include voice instructions, style notes, phrase placements, or writing tips. Structure only.
```

**Key difference from current:** No fingerprint injection, no "voice placement plan", no phrase assignment to specific paragraphs. Pure structure.

**Temperature:** 0.4 (unchanged)

---

### Pass 2: Write (was "Generation")

**System prompt (in route.ts):**
```
You are ghostwriting an essay as a specific student. Your only goal is to produce writing that is indistinguishable from their own. Study their writing samples carefully — they are your primary guide. Write exactly as they would. Not better. Not worse.
```

**User prompt (`buildLevel2WritingPrompt`):**

```
THEIR ACTUAL WRITING — study this carefully before you begin. This is how they really write:

--- Sample 1: {label} ---
{content}

--- Sample 2: {label} ---
{content}

--- Sample 3: {label} ---
{content}

Read the samples above multiple times. Notice how they build paragraphs, how long their sentences are, how they introduce evidence, what transitions they use, what mistakes they make, how sophisticated (or not) their vocabulary is. You must write the way THEY write.

---

WRITER'S PROFILE (analyst's notes on this student's patterns):

{formatted fingerprint narrative — see formatFingerprintNarrative() below}

---

WHAT THE STUDENT SAYS ABOUT THEMSELVES:

- Grade level: {gradeLevel}, typically earns {gradeRange}
- Revision style: {revision} — {revision description mapped inline}
- Evidence approach: {evidence}
- Conclusion approach: {conclusion}
- Word count tendency: {wordCountTendency}
- Known weaknesses (loses points for): {losesPoints}
- Writing habits: {habits joined as comma list, including other}
{quoteIntroStyle ? "- They typically introduce quotes like: " + quoteIntros : ""}
{overusedPhrases ? "- They know they overuse these phrases: " + overused : ""}
{selfEditFocus ? "- When self-editing, they focus on fixing: " + selfEdit : ""}
{timeSpentOn ? "- They spend the most time polishing: " + timeSpent : ""}

---

ASSIGNMENT:
{assignment}

{requirements ? "REQUIREMENTS/RUBRIC:\n" + requirements : ""}

OUTLINE TO FOLLOW:
{outline}

---

CRITICAL GUIDELINES:

- The writing samples above are your ground truth. When in doubt, match what you see in the samples.
- Do NOT apply every stylistic trait in every paragraph. Real writers are inconsistent — their habits appear naturally, sometimes more, sometimes less. If they overuse "however," it should appear a few times, not in every paragraph.
- If they make errors in their samples (comma splices, run-ons, informal language), include similar errors. Do NOT write a flawless essay for a flawed writer. Match their actual error rate from the samples.
- Match their paragraph length from the samples. If their paragraphs are typically 4-6 sentences with variation, write 4-6 sentence paragraphs with variation. Do not write uniform single-sentence paragraphs.
- Match their vocabulary level exactly. If they use simple, direct words in their samples, do not reach for impressive synonyms or academic phrasing.
- The essay should earn a grade consistent with {gradeRange} — not higher. A B student's essay should read like a B essay.
- Target ~{wordCount} words.

AVOID THESE AI-DETECTOR RED FLAGS:
"delve into", "it's important to note", "in today's society", "furthermore", "multifaceted", "nuanced", "pivotal", "underscores", "highlights the importance of", "it is worth noting", "plays a crucial role", "serves as a testament"

Write the essay now. Return ONLY the essay text, no commentary or headers.
```

**Key differences from current:**
1. Samples come FIRST, prominently, with explicit instruction to study them
2. Fingerprint is a readable narrative ("Writer's Profile"), not raw JSON + 18 numbered rules
3. Questionnaire data is presented as context ("the student says..."), not mandates ("you MUST...")
4. Anti-checklist directive: "do NOT apply every trait in every paragraph"
5. Error matching tied to samples: "match their actual error rate from the samples"
6. Paragraph length tied to samples: "match their paragraph length from the samples"
7. AI red flags moved from Pass 3 into Pass 2 to prevent them from being generated in the first place

**Temperature:** 0.6 (up from 0.5 — more natural variation)

---

### Pass 3: Audit (was "Refinement")

**System prompt (in route.ts):**
```
You are a writing forensics expert. Your job is to compare a generated essay against a student's real writing samples and determine if it sounds like the same person wrote both. Fix anything that doesn't match.
```

**User prompt (`buildLevel2AuditPrompt`):**

```
STUDENT'S REAL WRITING — this is the reference standard:

{samples via selectDiverseSamples(samples, 12000)}

---

GENERATED ESSAY TO AUDIT:

{essay}

---

WRITER'S PROFILE (for reference):

{formatted fingerprint narrative}

---

YOUR TASK:

Read the student's real writing samples carefully. Then read the generated essay. Ask yourself: would a teacher who has read dozens of this student's essays believe they wrote this one?

Fix any passage where the answer is no. Specifically look for:

- Vocabulary that is more sophisticated than what appears in their samples
- Sentences that are more polished or complex than their typical writing
- Paragraph structures that don't match their natural patterns (if they write multi-sentence paragraphs in their samples, the essay should too)
- Missing natural errors — if they make comma splices, run-ons, or informal phrasings in their samples, the essay should include similar imperfections
- Transitions or connective phrases they never use in their samples
- AI-detector phrases: "delve into", "it's important to note", "in today's society", "furthermore", "in conclusion", "multifaceted", "nuanced", "pivotal", "underscores", "highlights the importance of", "it is worth noting", "plays a crucial role", "serves as a testament"
- Any passage that reads as "too perfect" compared to their actual writing level

IMPORTANT:
- Do NOT add polish, sophistication, or improve the essay's quality
- Do NOT remove intentional imperfections — they are there because the student writes that way
- Do NOT make the essay better. Make it more authentic.
- Preserve everything that already sounds like the student
- Return ONLY the corrected essay, no commentary

```

**Key differences from current:**
1. Framed as forensic comparison against samples, not checklist verification
2. No numbered checklist of fingerprint rules to verify
3. Explicitly says "do NOT remove intentional imperfections"
4. Asks the key question: "would a teacher believe they wrote this?"
5. Samples are the reference standard, fingerprint is supplementary

**Temperature:** 0.3 (unchanged — conservative fixing is correct)

---

## New Helper: formatFingerprintNarrative()

Converts the fingerprint JSON + self-assessment data into a readable narrative. This replaces raw `JSON.stringify(fingerprint, null, 2)` in the prompts.

```typescript
export function formatFingerprintNarrative(
  fp: StyleFingerprint,
  sa: SelfAssessment,
): string {
  const lines: string[] = [];

  // Sentence patterns
  lines.push(`Sentences: Averages ~${fp.sentencePatterns.averageLength} words per sentence with ${fp.sentencePatterns.variation} variation. ${fp.sentencePatterns.tendency}`);

  // Vocabulary
  lines.push(`Vocabulary: ${fp.vocabulary.tier} tier. ${fp.vocabulary.wordChoicePattern}`);
  if (fp.vocabulary.signatureWords.length) {
    lines.push(`  Frequently uses: ${fp.vocabulary.signatureWords.join(", ")}`);
  }
  if (fp.vocabulary.avoidedWords.length) {
    lines.push(`  Never uses: ${fp.vocabulary.avoidedWords.join(", ")}`);
  }

  // Transitions
  if (fp.transitions.favorites.length) {
    lines.push(`Transitions: Favors ${fp.transitions.favorites.join(", ")}`);
  }
  if (fp.transitions.neverUses.length) {
    lines.push(`  Avoids: ${fp.transitions.neverUses.join(", ")}`);
  }

  // Structure
  lines.push(`Structure: ${fp.structure.introPattern} Paragraphs typically ${fp.structure.avgParagraphLength} sentences. ${fp.structure.bodyParagraphPattern} ${fp.structure.conclusionPattern}`);
  lines.push(`  Thesis placement: ${fp.structure.thesisPlacement}`);

  // Evidence
  lines.push(`Evidence style: ${fp.evidenceStyle.method}. ${fp.evidenceStyle.analysisPattern} Analysis depth: ${fp.evidenceStyle.analysisDepth}. ${fp.evidenceStyle.citationHabits}`);

  // Errors
  if (fp.errors.grammarPatterns.length || fp.errors.punctuationHabits.length) {
    const errorParts: string[] = [];
    if (fp.errors.grammarPatterns.length) errorParts.push(fp.errors.grammarPatterns.join(", "));
    if (fp.errors.punctuationHabits.length) errorParts.push(fp.errors.punctuationHabits.join(", "));
    lines.push(`Common errors: ${errorParts.join(". ")}. ${fp.errors.spellingTendency}`);
  }

  // Voice
  lines.push(`Voice: ${fp.voice.formality} formality, ${fp.voice.perspective} perspective. ${fp.voice.contractions ? "Uses contractions." : "Avoids contractions."} ${fp.voice.toneDescription}`);
  if (fp.voice.distinctiveTraits.length) {
    lines.push(`  Distinctive traits: ${fp.voice.distinctiveTraits.join(", ")}`);
  }

  // Rhetoric
  lines.push(`Argumentation: ${fp.rhetoric.argumentStyle}. Counter-arguments: ${fp.rhetoric.counterArguments}. Assertiveness: ${fp.rhetoric.assertiveness}.`);
  if (fp.rhetoric.hedgingLanguage.length) {
    lines.push(`  Hedging phrases: ${fp.rhetoric.hedgingLanguage.join(", ")}`);
  }

  // Rhythm
  if (fp.rhythm.sentenceOpeners.length) {
    lines.push(`Sentence openers: ${fp.rhythm.sentenceOpeners.join(", ")}`);
  }
  lines.push(`Paragraph rhythm: ${fp.rhythm.paragraphRhythm}. List usage: ${fp.rhythm.listUsage}.`);

  // Overall
  if (fp.overallAssessment) {
    lines.push(`\nOverall: ${fp.overallAssessment}`);
  }

  return lines.join("\n");
}
```

This produces output like:
```
Sentences: Averages ~18 words per sentence with medium variation. Favors compound sentences joined by "and"
Vocabulary: moderate tier. Uses simple verbs, rarely uses adverbs
  Frequently uses: shows, proves, explains, important, society, also, because
  Never uses: juxtaposition, dichotomy, paradigm, exemplifies
Transitions: Favors However, Also, This shows that, In the text
  Avoids: Furthermore, Moreover, Subsequently, Nevertheless
Structure: Broad context statement narrowing to thesis. Paragraphs typically 4 sentences. Topic sentence + quote + analysis + wrap. Restates thesis with slight expansion.
  Thesis placement: End of first paragraph
Evidence style: quote-dump. States the quote then explains in 1 sentence. Analysis depth: moderate. Uses parenthetical page numbers
Common errors: comma splices before "and", run-on sentences. Avoids semicolons, inconsistent comma usage. Occasional misspellings of complex words
Voice: mixed formality, third-person perspective. Uses contractions. Attempts academic tone but slips into conversational register
  Distinctive traits: ends analysis sentences with "which shows...", uses "In the text" to start evidence paragraphs
Argumentation: states-then-defends. Counter-arguments: ignores. Assertiveness: moderate.
  Hedging phrases: I think, it seems like, kind of, probably
Sentence openers: The, This shows, In the text, However, Also, It
Paragraph rhythm: uniform. List usage: never.

Overall: A competent but developing writer who relies on familiar structures. Shows awareness of analytical conventions but defaults to surface-level engagement. Most distinctive feature is the repetitive "This shows that" analysis pattern.
```

Much easier for Claude to internalize than raw JSON with nested objects.

---

## Modified Helper: selectDiverseSamples()

One change: increase `maxChars` default from 8000 to 12000.

```typescript
function selectDiverseSamples(samples: Sample[], maxChars = 12000): string {
  // ... same logic, just higher budget
}
```

This allows more sample text to be included, giving Claude more voice data. Token impact is minimal (~1000 extra tokens) against Sonnet 4's 200K context.

---

## Route Changes (route.ts)

### streamLevel2Anthropic()

**Pass 1 — line 236-242:**
- Change: `buildLevel2OutlinePrompt(opts)` -> `buildLevel2PlanPrompt(opts)`
- System prompt stays: `"You are an essay planning assistant. Create structured outlines that match a student's writing patterns."` -> simplified to `"You are an essay planning assistant. Create a concise structural outline for the assignment."`
- Temperature: 0.4 (unchanged)

**Pass 2 — line 250-257:**
- Change: `buildLevel2GenerationPrompt(opts, outline)` -> `buildLevel2WritingPrompt(opts, outline)`
- System prompt changes from the entire generation prompt to: `"You are ghostwriting an essay as a specific student. Your only goal is to produce writing that is indistinguishable from their own. Study their writing samples carefully — they are your primary guide. Write exactly as they would. Not better. Not worse."`
- The full writing prompt goes in `messages[0]` as the user message (currently the user message is just "Write the essay now, following the outline.")
- Temperature: 0.5 -> **0.6**

**Pass 3 — line 292-298:**
- Change: `buildRefinementPrompt(...)` -> `buildLevel2AuditPrompt(...)`
- System prompt changes from `"You are a quality control editor specializing in voice matching. Fix deviations from the student's real writing voice. Do not add polish or sophistication. Return only the corrected essay."` to `"You are a writing forensics expert. Your job is to compare a generated essay against a student's real writing samples and determine if it sounds like the same person wrote both. Fix anything that doesn't match."`
- Temperature: 0.3 (unchanged)

### Imports
Update import names to match new function names.

---

## Files Modified

| File | Changes |
|------|---------|
| `src/lib/essay-generator.ts` | Replace 3 prompt builders + habits mapper. Add `formatFingerprintNarrative()`. Update `selectDiverseSamples()` default. |
| `src/app/api/portal/generate/route.ts` | Update import names, system prompts, Pass 2 message structure, Pass 2 temperature. |

**Total files:** 2
**No schema changes. No new dependencies. No new routes.**

---

## What Is NOT Changing

- Fingerprint extraction (`buildStyleAnalysisPrompt`, aggregate route) — untouched
- `StyleFingerprint` interface — untouched
- Database schema — untouched
- Level 1 pipeline — untouched
- Legacy pipeline — untouched
- All validation guards — untouched
- Error handling and timeouts — untouched
- SSE streaming format — untouched
- `normalizeFingerprint()` — untouched
- AggregateWizard UI — untouched
- GeneratePage UI — untouched

---

## Verification

After implementation:
1. Generate a Level 2 essay with the same test profile/samples used in QA
2. Compare output against the 3 red flags identified:
   - Paragraphs should be multi-sentence (matching sample patterns), not single-sentence
   - Natural errors should be present if the student's samples contain errors
   - Stylistic traits (quote intros, overused phrases) should appear inconsistently, not in every paragraph
3. Run the essay through an AI detection check (manual assessment)
4. `npx tsc --noEmit` passes
5. `npx next build` passes
