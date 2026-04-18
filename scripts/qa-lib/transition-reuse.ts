/**
 * Count the maximum reuse of any *distinctive* favorite transition in an
 * essay. "Distinctive" means multi-word phrases (≥2 words) OR single words
 * of length ≥7 (e.g. "However", "Actually"). Single common English words
 * like "The", "But", "What", "If", "And", "So" are excluded — the style
 * analyzer sometimes lists these as favorites, but their raw count in any
 * essay reflects English grammar rather than transition overuse. Counting
 * them was producing values like 16 on 1000-word essays and triggering
 * false-positive transition-overuse floor breaches.
 */
export function computeMaxTransitionReuse(essay: string, favorites: string[]): number {
  const distinctive = favorites.filter(isDistinctiveTransition);
  if (distinctive.length === 0) return 0;
  const lower = essay.toLowerCase();
  return Math.max(
    ...distinctive.map((t) => {
      const pattern = new RegExp(
        `\\b${escapeRegex(t.toLowerCase())}\\b`,
        "g",
      );
      return (lower.match(pattern) ?? []).length;
    }),
  );
}

export function isDistinctiveTransition(t: string): boolean {
  const trimmed = t.trim();
  if (!trimmed) return false;
  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount >= 2) return true;
  return trimmed.length >= 7;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
