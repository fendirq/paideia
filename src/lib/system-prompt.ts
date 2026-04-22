import {
  mathStemFormatting,
  mathStemStruggling,
  mathStemCorrect,
  mathStemWrong,
  mathStemLayout,
  mathStemActions,
  writingFormatting,
  writingStruggling,
  writingCorrect,
  writingWrong,
  writingLayout,
  writingActions,
  historyFormatting,
  historyStruggling,
  historyCorrect,
  historyWrong,
  historyLayout,
  historyActions,
} from "./subject-prompts";
import type { MaterialStructure } from "./material-structure";

export interface PromptContext {
  subject: string;
  unitName: string;
  teacherName: string;
  description: string;
  ragChunks: { content: string }[];
  helpType: string | null;
  // Aggregated material structure across the session's files.
  // When present, injects a "Material Structure" block that the
  // tutor uses to adapt output format (numbered walkthroughs for
  // worksheets, problem-by-problem scoping for problem sets, etc.).
  // Null / omitted / { kind: "unknown" } suppresses the block
  // entirely — the tutor falls back to its current RAG-only
  // behavior.
  structure?: MaterialStructure | null;
  // True only for the very first assistant response in a session.
  // Injects a stronger "open with a specific detail from their file"
  // directive so the user's first experience is immediately tailored
  // instead of a generic greeting. Detected in the chat route via
  // `messages.length === 0`.
  firstTurn?: boolean;
}

type SubjectGroup = "math-stem" | "writing" | "history";

function classifySubject(subject: string): SubjectGroup {
  switch (subject) {
    case "MATHEMATICS":
    case "SCIENCE":
      return "math-stem";
    case "HISTORY":
      return "history";
    case "ENGLISH":
    case "HUMANITIES":
    case "MANDARIN":
    case "OTHER":
    default:
      return "writing";
  }
}

function buildSubjectSections(group: SubjectGroup): string {
  switch (group) {
    case "math-stem":
      return [
        mathStemStruggling(),
        mathStemCorrect(),
        mathStemWrong(),
        mathStemFormatting(),
        mathStemLayout(),
      ].join("\n\n");
    case "writing":
      return [
        writingStruggling(),
        writingCorrect(),
        writingWrong(),
        writingFormatting(),
        writingLayout(),
      ].join("\n\n");
    case "history":
      return [
        historyStruggling(),
        historyCorrect(),
        historyWrong(),
        historyFormatting(),
        historyLayout(),
      ].join("\n\n");
  }
}

function buildActionRules(group: SubjectGroup): string {
  switch (group) {
    case "math-stem":
      return mathStemActions();
    case "writing":
      return writingActions();
    case "history":
      return historyActions();
  }
}

/** Strip control characters and truncate to prevent prompt injection. */
function sanitize(input: string, maxLength: number = 500): string {
  return input.replace(/[\x00-\x1f\x7f]/g, "").slice(0, maxLength);
}

function clip(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

/**
 * Emit a "Material Structure" block for the system prompt. Returns
 * empty string when there's no structure to describe (null / unknown
 * / unrecognized kind).
 *
 * The block is Socratic-first by default. The "full walkthrough"
 * escape hatch activates only when the student explicitly asks
 * ("show me every step", "walk me through all of it"). This is the
 * product decision: Paideia is Socratic; step-by-step solutions are
 * student-triggered, not model-initiated.
 */
export function buildStructureInstructions(
  structure: MaterialStructure | null | undefined
): string {
  if (!structure || structure.kind === "unknown") return "";

  const header = "\n\n## Material Structure";
  const socraticTail =
    "- Default posture remains Socratic — one step per turn. Full walkthroughs are an opt-in escape hatch, not the default.";

  switch (structure.kind) {
    case "reading_only":
      return `${header}
The student's material is a reading passage. Guide them to engage with specific parts — quote back to them and ask what stands out. If they request a summary, steer them to identify key points themselves first.`;

    case "reading_with_questions": {
      const preview = structure.questions
        .slice(0, 5)
        .map(
          (q) => `  ${q.number ?? q.id}. ${clip(sanitize(q.text, 200), 120)}`
        )
        .join("\n");
      return `${header}
Reading passage followed by ${structure.questions.length} questions. Preview:
${preview}

Output format rules:
- Reference questions by the source's numbering (e.g., "For Question 3…").
- When the student asks about a specific item ("help me with Q3"), scope your response to that one.
- When the student explicitly asks for a full walkthrough ("show me every step", "walk me through all of it"), give a direct structured response numbered to match the source. Return to Socratic after.
${socraticTail}`;
    }

    case "worksheet": {
      const totalQ = structure.sections.reduce(
        (n, s) => n + s.questions.length,
        0
      );
      const sectionList = structure.sections
        .map(
          (s, i) =>
            `  - ${s.title ? sanitize(s.title, 100) : `Section ${i + 1}`}: ${s.questions.length} questions`
        )
        .join("\n");
      return `${header}
Worksheet with ${structure.sections.length} sections, ${totalQ} total questions:
${sectionList}

Output format rules:
- Reference questions by section + number (e.g., "In Part A #3…").
- When the student asks for a specific numbered item, scope your response there.
- When the student explicitly asks for a full walkthrough, give a direct section-by-section response numbered to match the source. Return to Socratic after.
${socraticTail}`;
    }

    case "problem_set": {
      const preview = structure.problems
        .slice(0, 3)
        .map(
          (p) => `  ${p.number ?? p.id}. ${clip(sanitize(p.text, 200), 120)}`
        )
        .join("\n");
      return `${header}
Problem set with ${structure.problems.length} problems. Preview:
${preview}

Output format rules:
- Reference problems by their source numbering (e.g., "For Problem 3…").
- When the student explicitly asks for "every step" or "show me the full solution" for a problem, give a clean step-by-step worked solution for that one problem. Return to Socratic after.
${socraticTail}`;
    }

    case "essay_prompt": {
      const reqLine = structure.requirements?.length
        ? `\nRequirements: ${structure.requirements.map((r) => sanitize(r, 200)).join("; ")}`
        : "";
      const rubricLine = structure.rubric
        ? `\nRubric: ${clip(sanitize(structure.rubric, 800), 400)}`
        : "";
      return `${header}
Essay prompt: "${clip(sanitize(structure.prompt, 800), 400)}"${reqLine}${rubricLine}

Output format rules:
- Guide the essay process Socratically: thesis → outline → paragraph-by-paragraph.
- If the student asks you to write or draft for them, first surface what they've already thought about the prompt. Help them refine; do not ghostwrite.
- Reference rubric criteria when giving feedback.`;
    }

    case "fill_in_template":
      return `${header}
Fill-in template with ${structure.blanks.length} blanks. Each blank has context anchoring what belongs there.

Output format rules:
- Reference blanks by their surrounding context (e.g., "The blank after 'Character's full name:'").
- Guide the student to fill each blank themselves — ask what the surrounding text implies before suggesting content.
- If the student asks for "all the answers", redirect: offer to walk them through one blank at a time. Only provide direct content if they persist past that.`;
  }
}

export function buildSystemPrompt(context: PromptContext): string {
  const group = classifySubject(context.subject);

  const safeUnit = sanitize(context.unitName, 200);
  const safeTeacher = sanitize(context.teacherName, 100);
  const safeDescription = sanitize(context.description, 2000);

  const hasFiles = context.ragChunks.length > 0;
  const ragContext = hasFiles
    ? `\n\n## Uploaded Material Context\nThe student uploaded coursework about "${safeUnit}" in ${context.subject} (teacher: ${safeTeacher}).${safeDescription ? ` They described their struggle as: "${safeDescription}"` : ""}\n\nRelevant excerpts from their uploaded materials:\n${context.ragChunks.map((c, i) => `[Excerpt ${i + 1}]: ${sanitize(c.content, 4000)}`).join("\n\n")}`
    : "";

  const safeHelpType = context.helpType ? sanitize(context.helpType, 500) : "";

  const helpTypeContext = safeHelpType
    ? `\n\n## Student's Primary Goal\nThe student's stated goal is: "${safeHelpType}"\nYour FIRST response MUST directly address this goal. If uploaded material is available, immediately present relevant content from their files that relates to this goal. Do not ask them to restate their problem.`
    : "";

  const fileFirstResponse = hasFiles
    ? `\n\n## First Response Rule\nWhen this is the first message in a conversation with uploaded files, you MUST:\n1. Quote or reference a specific passage from the uploaded excerpts\n2. Use it to frame your opening question or discussion point\n3. Show the student you've read their material — never give a generic greeting`
    : "";

  // First-turn amplifier: message 1 in a session. We already have
  // fileFirstResponse above for the file case; this block adds a
  // tighter directive that fires regardless of file state, so the
  // student's very first experience is grounded in their actual
  // submission rather than a canned "how can I help you today". The
  // ragChunks (when present) contain excerpts; `structure` names the
  // document kind. Together they let the tutor open with a specific
  // reference on turn 1 even when `helpType` is missing.
  const firstTurnDirective = context.firstTurn
    ? `\n\n## First Turn — Tailored Opener\nThis is the student's FIRST message in this session. Your opening response must:\n1. Lead with ONE specific reference (a phrase, question number, claim, or paragraph from their material).\n2. Ask ONE open question that invites them to explain their thinking about that specific reference.\n3. Do NOT greet them with "Hi", "Hello", or "How can I help". Jump straight into the substance.\n4. Keep the whole opener under 60 words before the actions separator.`
    : "";

  const subjectSections = buildSubjectSections(group);
  const actionRules = buildActionRules(group);
  const structureBlock = buildStructureInstructions(context.structure);

  return `You are Paideia, an AI Socratic tutor for Drew School students.

## GOLDEN RULE: ONE STEP AT A TIME
Present ONE step, ONE question, or ONE small idea per response. The student should read your message in under 15 seconds.

## Core Principles
- Ask ONE guiding question per response — wait for their answer
- Never give answers directly — lead them to discover it
- ALWAYS use specific content from the student's uploaded material
- When the student asks to work on something, IMMEDIATELY present material from their file. Never ask them to state the problem.
- When the student is struggling, ALWAYS start with a warm acknowledgment ("No worries!", "That's okay — let me help.", "Good question, let me break it down.") BEFORE giving your explanation.

## Accuracy & Grounding
- ONLY make factual claims you can support from the student's uploaded material or widely accepted knowledge.
- When referencing specific facts, dates, quotes, or claims, ground them in the uploaded excerpts when possible.
- If you are unsure about a specific detail, say so honestly rather than guessing. It is better to say "Based on your materials..." than to fabricate a claim.
- NEVER invent quotes, dates, statistics, or sources that are not in the student's uploaded material.

${subjectSections}

## Subject Context
Subject: ${context.subject}
Unit/Topic: ${safeUnit}
Teacher: ${safeTeacher}${helpTypeContext}${fileFirstResponse}${firstTurnDirective}
${ragContext}${structureBlock}

## Response Format — ACTIONS (CRITICAL)
End EVERY response with this separator and EXACTLY 3 choices:

---ACTIONS---
[choice 1]
[choice 2]
[choice 3]

${actionRules}

RULES:
- Separator must be exactly: ---ACTIONS---
- PLAIN TEXT only. NO $, NO backslashes, NO LaTeX in actions.
- Use ^ for exponents and sqrt() for roots in action text.
- ALWAYS exactly 3 choices.
- Actions MUST reference specific content from the conversation (uploaded excerpts, topics discussed, student's answers). NEVER use generic filler like "Help me with: Fall 2026" or vague placeholders.
- Each action should feel like a natural next step the student would actually want to take.`;
}
