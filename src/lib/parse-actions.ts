import { stripThinkingTags } from "./strip-thinking";

export function parseActionsFromResponse(fullText: string): {
  message: string;
  suggestedActions: string[];
} {
  const cleaned = stripThinkingTags(fullText);

  const separator = "---ACTIONS---";
  const idx = cleaned.lastIndexOf(separator);
  if (idx === -1) {
    return { message: cleaned.trim(), suggestedActions: [] };
  }

  const message = cleaned.slice(0, idx).trim();
  const actionsText = cleaned.slice(idx + separator.length).trim();
  const suggestedActions = actionsText
    .split("\n")
    .map((line) => line.replace(/^\d+\.\s*/, "").replace(/^\[\d+\]\s*/, "").trim())
    .filter((line) => line.length > 0 && line !== "I still don't understand")
    .slice(0, 3);

  return { message, suggestedActions };
}
