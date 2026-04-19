import { stripThinkingTags } from "./strip-thinking";

// Matches common model variants: ---ACTIONS---, ---ACTION---, ---ACT---, ACTIONS:
const ACTION_SEPARATOR = /\n*\s*-{0,3}\s*ACT(?:ION)?S?\s*-{0,3}\s*:?\s*/i;

export function splitActions(text: string): { before: string; after: string | null } {
  const match = text.match(ACTION_SEPARATOR);
  if (!match || match.index === undefined) return { before: text, after: null };
  return {
    before: text.slice(0, match.index),
    after: text.slice(match.index + match[0].length),
  };
}

export function parseActionsFromResponse(fullText: string): {
  message: string;
  suggestedActions: string[];
} {
  const cleaned = stripThinkingTags(fullText);
  const { before, after } = splitActions(cleaned);

  if (!after) {
    return { message: cleaned.trim(), suggestedActions: [] };
  }

  const message = before.trim();
  const suggestedActions = after
    .split(/[\n\[\]]/)
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    // Trim trailing acknowledgment text that the model sometimes
    // appends after an action with no separating newline (e.g.
    // "I want to explore free will.Great choice! Ethics is a..." —
    // observed with Gemini 2.5-flash). Actions are terse imperatives;
    // any extension past the first sentence terminator is the model
    // leaking its next paragraph into the action list.
    .map((line) => stripTrailingSentence(line))
    .filter((line) => line.length > 0 && line !== "I still don't understand")
    .slice(0, 3);

  return { message, suggestedActions };
}

// Keep only the first sentence of an action candidate. Splits on
// ., !, or ? followed by whitespace OR a capital letter (capital-
// after-period catches the glued-acknowledgment case where there's
// no whitespace: "free will.Great choice!").
function stripTrailingSentence(line: string): string {
  const match = line.match(/^([^.!?]*[.!?])(?:\s+|(?=[A-Z]))/);
  if (match && match[1].length >= 4) return match[1].trim();
  return line;
}
