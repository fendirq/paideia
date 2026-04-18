import { lookup as dnsLookup } from "node:dns/promises";
import net from "node:net";
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

/**
 * Any address that the deploy network must not be able to reach through
 * a user-supplied URL: loopback, link-local (including cloud metadata
 * endpoints), RFC1918 private, CGNAT, multicast, reserved. Fails closed
 * on anything not recognizable as a valid public IP.
 */
export function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return true;
    const [a, b] = parts;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT (100.64.0.0/10)
    if (a === 169 && b === 254) return true;           // link-local / cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
    if (a >= 224) return true;                             // multicast + reserved
    return false;
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === "::" || lower === "::1") return true;
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local (fc00::/7)
    if (lower.startsWith("fe80:") || lower.startsWith("fec0:")) return true; // link-local / deprecated site-local
    if (lower.startsWith("ff")) return true;                                 // multicast
    if (lower.startsWith("::ffff:")) {
      // IPv4-mapped: validate the embedded v4 form
      const tail = lower.slice("::ffff:".length);
      return isPrivateIp(tail);
    }
    return false;
  }
  return true; // not a recognizable IP literal: fail closed
}

/**
 * Reject user-supplied URLs that point to internal infrastructure before
 * we hit `fetch`. This blocks the common SSRF paths:
 *   - loopback / RFC1918 / link-local / cloud metadata IPs
 *   - hostnames that resolve to any of the above
 *   - names like `localhost`, `*.internal` that some platforms resolve
 *     to private addresses at the socket layer
 *
 * Does NOT protect against DNS rebinding (a public A record that flips
 * to a private IP between this lookup and fetch's own resolve). That
 * risk is bounded by forcing `redirect: "error"` on the fetch and by
 * Vercel's function-runtime network isolation, but the
 * pin-resolve-and-fetch-IP-with-host-header pattern is the cleaner
 * long-term fix if the threat model widens.
 */
async function assertPublicUrl(url: string): Promise<void> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("invalid URL");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("only http/https URLs are allowed");
  }
  const hostnameRaw = parsed.hostname.toLowerCase();
  if (!hostnameRaw) throw new Error("URL missing hostname");

  // URL.hostname returns IPv6 literals wrapped in brackets
  // (e.g. "[2606:4700:4700::1111]"). `net.isIP` rejects the bracketed
  // form as 0, which would cause legitimate public IPv6 URLs to fall
  // through to DNS and be rejected as "hostname did not resolve".
  // Strip the brackets before any IP/hostname classification.
  const hostname = hostnameRaw.startsWith("[") && hostnameRaw.endsWith("]")
    ? hostnameRaw.slice(1, -1)
    : hostnameRaw;

  // Obvious private-name fast path (skip DNS when we can).
  if (hostname === "localhost" || hostname === "ip6-localhost") {
    throw new Error("localhost URLs are not allowed");
  }
  if (hostname.endsWith(".localhost") || hostname.endsWith(".internal") || hostname.endsWith(".local")) {
    throw new Error("private-zone hostnames are not allowed");
  }

  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error("private / loopback IPs are not allowed");
    return;
  }

  const addresses = await dnsLookup(hostname, { all: true });
  if (!addresses.length) throw new Error("hostname did not resolve");
  for (const { address } of addresses) {
    if (isPrivateIp(address)) {
      throw new Error("hostname resolves to a private IP");
    }
  }
}

function describeSourceError(err: unknown): string {
  if (err instanceof DOMException && err.name === "TimeoutError") return "fetch timed out (15s)";
  if (err instanceof DOMException && err.name === "AbortError") return "fetch aborted";
  if (err instanceof Error) return err.message;
  return "fetch failed";
}

async function fetchOneSource(url: string): Promise<ResolvedSource> {
  await assertPublicUrl(url);

  const response = await fetch(url, {
    headers: {
      "User-Agent": "PaideiaSourceFetcher/1.0 (+https://paideia.app)",
      Accept:
        "text/html,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain;q=0.9,*/*;q=0.8",
    },
    // `redirect: "error"` blocks the DNS-rebinding-via-redirect vector
    // where a public origin 302s to `http://169.254.169.254/`. The cost
    // is that users must supply the final URL themselves for sites that
    // require a redirect from http → https; worth it for the security
    // property.
    redirect: "error",
    signal: AbortSignal.timeout(SOURCE_FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`source returned HTTP ${response.status}`);
  }

  const contentLength = Number(response.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_SOURCE_FETCH_BYTES) {
    throw new Error("source is too large (> 5 MB)");
  }

  const contentType = response.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
  const mimeType = resolveMimeType(contentType, new URL(url).pathname);

  if (isExtractableType(mimeType, url)) {
    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_SOURCE_FETCH_BYTES) {
      throw new Error("source is too large (> 5 MB)");
    }
    const text = await extractText(Buffer.from(arrayBuffer), mimeType);
    return {
      url,
      title: new URL(url).hostname,
      excerpt: clipExcerpt(text),
    };
  }

  const html = await response.text();
  if (html.length > MAX_SOURCE_FETCH_BYTES) {
    throw new Error("source is too large (> 5 MB)");
  }
  const { title, text } = stripHtml(html);
  return {
    url,
    title,
    excerpt: clipExcerpt(text),
  };
}

/**
 * Fetch user-supplied source URLs with per-URL isolation. One failing
 * URL no longer kills the whole batch, and each failure carries a
 * specific reason so the caller can log and surface it distinctly.
 *
 * Every URL is SSRF-checked (see `assertPublicUrl`) before the fetch
 * is issued.
 */
export async function fetchSourceContext(urls: string[]): Promise<SourceContextResult> {
  const resolved: ResolvedSource[] = [];
  const failures: SourceFetchFailure[] = [];

  for (const url of urls.slice(0, MAX_SOURCE_LINKS)) {
    try {
      const source = await fetchOneSource(url);
      if (source.excerpt.length > 0) {
        resolved.push(source);
      } else {
        failures.push({ url, reason: "source had no extractable text" });
      }
    } catch (err) {
      failures.push({ url, reason: describeSourceError(err) });
    }
  }

  return { resolved, failures };
}
