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

export interface PromptContext {
  subject: string;
  unitName: string;
  teacherName: string;
  description: string;
  ragChunks: { content: string }[];
  helpType: string | null;
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

export function buildSystemPrompt(context: PromptContext): string {
  const group = classifySubject(context.subject);

  const safeUnit = sanitize(context.unitName, 200);
  const safeTeacher = sanitize(context.teacherName, 100);
  const safeDescription = sanitize(context.description, 2000);

  const ragContext =
    context.ragChunks.length > 0
      ? `\n\n## Uploaded Material Context\nThe student uploaded coursework about "${safeUnit}" in ${context.subject} (teacher: ${safeTeacher}). They described their struggle as: "${safeDescription}"\n\nRelevant excerpts from their uploaded materials:\n${context.ragChunks.map((c, i) => `[Excerpt ${i + 1}]: ${sanitize(c.content, 4000)}`).join("\n\n")}`
      : "";

  const helpTypeContext = context.helpType
    ? `\nHelp type requested: ${context.helpType}`
    : "";

  const subjectSections = buildSubjectSections(group);
  const actionRules = buildActionRules(group);

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
Teacher: ${safeTeacher}
Student's stated struggle: "${safeDescription}"${helpTypeContext}
${ragContext}

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
- ALWAYS exactly 3 choices.`;
}
