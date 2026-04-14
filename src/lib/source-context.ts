import { extractText, resolveMimeType, isExtractableType } from "./extract-text.ts";

export const MAX_SOURCE_LINKS = 3;
const MAX_SOURCE_FETCH_BYTES = 5 * 1024 * 1024;
const MAX_SOURCE_EXCERPT_CHARS = 2200;
export const MAX_SOURCE_TEXT_CHARS = 4000;
const SOURCE_FETCH_TIMEOUT_MS = 15_000;

export interface ResolvedSource {
  url: string;
  title: string;
  excerpt: string;
}

export type PromptSourceType = "PRIMARY" | "SECONDARY" | "LECTURE" | "NOTES" | "REFERENCE";

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

export function inferRequiredQuoteCount(text: string): number | null {
  const normalized = text.toLowerCase().replace(/,/g, "");

  const wordMap: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
  };

  const quoteKinds = String.raw`(?:quote|quotes|quotation|quotations|quoted phrase|quoted phrases)`;
  const numericPatterns = [
    new RegExp(`\\bat least (\\d+)\\s+(?:short\\s+)?${quoteKinds}\\b`),
    new RegExp(`\\binclude (\\d+)\\s+(?:short\\s+)?${quoteKinds}\\b`),
    new RegExp(`\\buse (\\d+)\\s+(?:short\\s+)?${quoteKinds}\\b`),
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
    new RegExp(`\\bat least (${wordAlternation})\\s+(?:short\\s+)?${quoteKinds}\\b`),
    new RegExp(`\\binclude (${wordAlternation})\\s+(?:short\\s+)?${quoteKinds}\\b`),
    new RegExp(`\\buse (${wordAlternation})\\s+(?:short\\s+)?${quoteKinds}\\b`),
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
              `--- Source ${index + 1}: ${source.title} ---\nTYPE: ${inferPromptSourceType(source)}\nURL: ${source.url}\n${source.excerpt}`
          )
          .join("\n\n")
    );
  }

  if (sourceText?.trim()) {
    sections.push(`USER-PROVIDED SOURCE NOTES:\n${sourceText.trim().slice(0, MAX_SOURCE_TEXT_CHARS)}`);
  }

  return sections.join("\n\n");
}

export function inferPromptSourceType(source: Pick<ResolvedSource, "title" | "excerpt">): PromptSourceType {
  const haystack = `${source.title}\n${source.excerpt}`.toLowerCase();

  if (
    /\b(letter|chronicle|speech|sermon|decree|edict|memoir|diary|account|excerpt|primary source|al-tabari|ibn battuta)\b/.test(haystack)
  ) {
    return "PRIMARY";
  }
  if (/\b(historiography|historian|interpretation|analysis|analytical|secondary source)\b/.test(haystack)) {
    return "SECONDARY";
  }
  if (/\b(lecture|seminar|class discussion|discussion)\b/.test(haystack)) {
    return "LECTURE";
  }
  if (/\b(notes|packet|study guide|summary)\b/.test(haystack)) {
    return "NOTES";
  }
  return "REFERENCE";
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripHtml(html: string): { title: string; text: string } {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = decodeEntities(titleMatch?.[1] ?? "Source");

  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<\/(p|div|section|article|li|h1|h2|h3|h4|h5|h6|br)>/gi, "\n")
    .replace(/<[^>]+>/g, " ");

  const text = decodeEntities(cleaned)
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  return { title: title.trim() || "Source", text };
}

function clipExcerpt(text: string, maxChars = MAX_SOURCE_EXCERPT_CHARS): string {
  const clipped = text.trim();
  if (clipped.length <= maxChars) return clipped;
  return `${clipped.slice(0, maxChars).trimEnd()}...`;
}

export async function fetchSourceContext(urls: string[]): Promise<ResolvedSource[]> {
  const resolved: ResolvedSource[] = [];

  for (const url of urls.slice(0, MAX_SOURCE_LINKS)) {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "PaideiaSourceFetcher/1.0 (+https://paideia.app)",
        Accept: "text/html,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(SOURCE_FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch source: ${url}`);
    }

    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_SOURCE_FETCH_BYTES) {
      throw new Error(`Source is too large: ${url}`);
    }

    const contentType = response.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
    const mimeType = resolveMimeType(contentType, new URL(url).pathname);

    if (isExtractableType(mimeType, url)) {
      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength > MAX_SOURCE_FETCH_BYTES) {
        throw new Error(`Source is too large: ${url}`);
      }
      const text = await extractText(Buffer.from(arrayBuffer), mimeType);
      resolved.push({
        url,
        title: new URL(url).hostname,
        excerpt: clipExcerpt(text),
      });
      continue;
    }

    const html = await response.text();
    if (html.length > MAX_SOURCE_FETCH_BYTES) {
      throw new Error(`Source is too large: ${url}`);
    }
    const { title, text } = stripHtml(html);
    resolved.push({
      url,
      title,
      excerpt: clipExcerpt(text),
    });
  }

  return resolved.filter((source) => source.excerpt.length > 0);
}
