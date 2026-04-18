// Server-only source-fetching: SSRF guard, HTML/text extraction,
// per-URL isolated fetch with timeout + size caps. This module imports
// Node-only APIs (`node:dns`, `node:net`) and must NEVER end up in a
// client bundle — the `import "server-only"` below will fail the
// build at compile time if a `"use client"` file imports it.

import "server-only";
import { lookup as dnsLookup } from "node:dns/promises";
import net from "node:net";
import { extractText, resolveMimeType, isExtractableType } from "./extract-text.ts";
import {
  MAX_SOURCE_EXCERPT_CHARS,
  MAX_SOURCE_LINKS,
  type ResolvedSource,
  type SourceContextResult,
  type SourceFetchFailure,
} from "./source-context.ts";

const MAX_SOURCE_FETCH_BYTES = 5 * 1024 * 1024;
const SOURCE_FETCH_TIMEOUT_MS = 15_000;

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
 * to a private IP between this lookup and fetch's own socket-level
 * resolve). That risk is bounded by forcing `redirect: "error"` on the
 * fetch and by Vercel's function-runtime network isolation, but the
 * pin-resolve-and-fetch-IP-with-host-header pattern (via a custom
 * undici Agent) is the cleaner long-term fix if the threat model
 * widens.
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
