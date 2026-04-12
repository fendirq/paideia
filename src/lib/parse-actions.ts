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
    .filter((line) => line.length > 0 && line !== "I still don't understand")
    .slice(0, 3);

  return { message, suggestedActions };
}
