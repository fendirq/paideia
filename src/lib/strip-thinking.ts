// Strip DeepSeek R1 <think>...</think> reasoning tags from output.
// R1 sometimes starts a sentence inside <think> and finishes outside, leaving a
// fragment like "me connect this..." instead of "Let me connect this...".

const VALID_LOWERCASE_STARTERS = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "from", "if", "in",
  "is", "it", "its", "nor", "not", "of", "on", "or", "so", "the", "to",
]);

export function stripThinkingTags(text: string): string {
  let cleaned = text
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .replace(/<think>[\s\S]*$/g, "")
    .trim();

  // If the response starts with a lowercase word that isn't a common sentence
  // starter, the beginning was likely inside the think block. Capitalize it.
  if (cleaned && /^[a-z]/.test(cleaned)) {
    const firstWord = cleaned.split(/\s/)[0];
    if (!VALID_LOWERCASE_STARTERS.has(firstWord)) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
  }

  return cleaned;
}
