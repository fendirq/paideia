// Client-safe helpers for source-link normalization, rubric parsing,
// and prompt-facing source formatting. This file is imported by both
// Next.js Server Components (API routes) and Client Components — it
// must NOT depend on Node-only APIs. Server-only fetching logic
// (DNS / net / file extraction) lives in `./source-fetch.ts`, which
// carries `import "server-only"` so client bundles fail fast if a
// "use client" file ever accidentally pulls it in.

export const MAX_SOURCE_LINKS = 3;
export const MAX_SOURCE_TEXT_CHARS = 4000;
export const MAX_SOURCE_EXCERPT_CHARS = 2200;

export interface ResolvedSource {
  url: string;
  title: string;
  excerpt: string;
}

export interface SourceFetchFailure {
  url: string;
  reason: string;
}

export interface SourceContextResult {
  resolved: ResolvedSource[];
  failures: SourceFetchFailure[];
}

export function normalizeSourceLinks(input: string[] | string | undefined): string[] {
  const rawItems = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input.split(/\r?\n|,/)
      : [];

  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const item of rawItems) {
    const trimmed = item.trim();
    if (!trimmed) continue;

    try {
      const url = new URL(trimmed);
      if (!["http:", "https:"].includes(url.protocol)) continue;
      const href = url.toString();
      if (seen.has(href)) continue;
      seen.add(href);
      normalized.push(href);
      if (normalized.length >= MAX_SOURCE_LINKS) break;
    } catch {
      continue;
    }
  }

  return normalized;
}

export function inferTargetWordCount(text: string): number | null {
  const normalized = text.toLowerCase().replace(/,/g, "");

  const rangeMatch = normalized.match(/\b(\d{3,4})\s*(?:to|-)\s*(\d{3,4})\s*words?\b/);
  if (rangeMatch) {
    const min = Number(rangeMatch[1]);
    const max = Number(rangeMatch[2]);
    if (Number.isFinite(min) && Number.isFinite(max) && min >= 250 && max <= 2000 && min < max) {
      return Math.round((min + max) / 2 / 25) * 25;
    }
  }

  const exactMatch = normalized.match(/\b(\d{3,4})\s*-\s*word\b|\b(\d{3,4})\s*words?\b/);
  const value = exactMatch ? Number(exactMatch[1] || exactMatch[2]) : NaN;
  if (Number.isFinite(value) && value >= 250 && value <= 2000) {
    return Math.round(value / 25) * 25;
  }

  return null;
}

export function inferWordCountBounds(text: string): { min: number | null; max: number | null } {
  const normalized = text.toLowerCase().replace(/,/g, "");

  const rangeMatch = normalized.match(/\b(\d{3,4})\s*(?:to|-)\s*(\d{3,4})\s*words?\b/);
  if (rangeMatch) {
    const min = Number(rangeMatch[1]);
    const max = Number(rangeMatch[2]);
    if (Number.isFinite(min) && Number.isFinite(max) && min >= 250 && max <= 2000 && min < max) {
      return { min, max };
    }
  }

  const exactMatch = normalized.match(/\b(\d{3,4})\s*-\s*word\b|\b(\d{3,4})\s*words?\b/);
  const value = exactMatch ? Number(exactMatch[1] || exactMatch[2]) : NaN;
  if (Number.isFinite(value) && value >= 250 && value <= 2000) {
    return { min: value, max: value };
  }

  return { min: null, max: null };
}

export function inferRequiredEvidenceCount(text: string): number | null {
  const normalized = text.toLowerCase().replace(/,/g, "");
  const descriptors = String.raw`(?:(?:specific|concrete|historical)\s+)*`;
  const evidenceKinds = String.raw`(?:evidence|support|examples|details)`;
  const supportPhrase = String.raw`(?:(?:pieces of\s+)?${descriptors}${evidenceKinds}|${descriptors}(?:pieces of\s+)?${evidenceKinds})`;

  const wordMap: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  };

  const numericPatterns = [
    new RegExp(`\\bat least (\\d+)\\s+${supportPhrase}\\b`),
    new RegExp(`\\binclude (\\d+)\\s+${supportPhrase}\\b`),
    new RegExp(`\\buse (\\d+)\\s+${supportPhrase}\\b`),
    new RegExp(`\\bincorporate (\\d+)\\s+${supportPhrase}\\b`),
    new RegExp(`\\b(\\d+)\\s+${supportPhrase}\\b`),
  ];

  for (const pattern of numericPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      const count = Number(match[1]);
      if (Number.isFinite(count) && count > 0) return count;
    }
  }

  const wordAlternation = Object.keys(wordMap).join("|");
  const wordPatterns = [
    new RegExp(`\\bat least (${wordAlternation})\\s+${supportPhrase}\\b`),
    new RegExp(`\\binclude (${wordAlternation})\\s+${supportPhrase}\\b`),
    new RegExp(`\\buse (${wordAlternation})\\s+${supportPhrase}\\b`),
    new RegExp(`\\bincorporate (${wordAlternation})\\s+${supportPhrase}\\b`),
  ];

  for (const pattern of wordPatterns) {
    const match = normalized.match(pattern);
    if (match) {
      return wordMap[match[1]] ?? null;
    }
  }

  return null;
}

export function buildPersistedRequirements(
  requirements: string | undefined,
  sourceLinks: string[],
  sourceText: string | undefined,
): string | null {
  const sections: string[] = [];

  if (requirements?.trim()) {
    sections.push(requirements.trim());
  }
  if (sourceLinks.length > 0) {
    sections.push(`Source Links:\n${sourceLinks.join("\n")}`);
  }
  if (sourceText?.trim()) {
    sections.push(`Source Notes:\n${sourceText.trim().slice(0, MAX_SOURCE_TEXT_CHARS)}`);
  }

  const combined = sections.join("\n\n");
  return combined ? combined.slice(0, 5000) : null;
}

export function formatSourceContextForPrompt(
  sources: ResolvedSource[],
  sourceText?: string,
): string {
  const sections: string[] = [];

  if (sources.length > 0) {
    sections.push(
      "APPROVED SOURCE MATERIAL:\n" +
        sources
          .map(
            (source, index) =>
              `--- Source ${index + 1}: ${source.title} ---\nURL: ${source.url}\n${source.excerpt}`
          )
          .join("\n\n")
    );
  }

  if (sourceText?.trim()) {
    sections.push(`USER-PROVIDED SOURCE NOTES:\n${sourceText.trim().slice(0, MAX_SOURCE_TEXT_CHARS)}`);
  }

  return sections.join("\n\n");
}
