import { describe, expect, it, vi, afterEach } from "vitest";
import {
  buildPersistedRequirements,
  fetchSourceContext,
  formatSourceContextForPrompt,
  inferRequiredEvidenceCount,
  inferTargetWordCount,
  isPrivateIp,
  normalizeSourceLinks,
} from "@/lib/source-context";

describe("source-context helpers", () => {
  it("normalizes and deduplicates links", () => {
    const links = normalizeSourceLinks([
      "https://example.com/article",
      "https://example.com/article",
      "notaurl",
      "http://example.org/source",
    ]);

    expect(links).toEqual([
      "https://example.com/article",
      "http://example.org/source",
    ]);
  });

  it("infers target word count from a range", () => {
    expect(inferTargetWordCount("Write a 700 to 850 word essay about the Abbasids.")).toBe(775);
  });

  it("infers target word count from a single value", () => {
    expect(inferTargetWordCount("Write a 600-word response.")).toBe(600);
  });

  it("infers required evidence count from rubric language", () => {
    expect(inferRequiredEvidenceCount("Use at least three specific pieces of evidence.")).toBe(3);
    expect(inferRequiredEvidenceCount("Use at least 4 evidence points in your response.")).toBe(4);
    expect(inferRequiredEvidenceCount("Use five specific historical examples in your essay.")).toBe(5);
    expect(inferRequiredEvidenceCount("Incorporate 6 pieces of concrete evidence from the packet.")).toBe(6);
    expect(inferRequiredEvidenceCount("Include seven concrete details drawn from the primary sources.")).toBe(7);
  });

  it("builds persisted requirements with source sections", () => {
    const result = buildPersistedRequirements(
      "Use three pieces of evidence.",
      ["https://example.com/source-1"],
      "Primary source excerpt here.",
    );

    expect(result).toContain("Use three pieces of evidence.");
    expect(result).toContain("Source Links:");
    expect(result).toContain("Source Notes:");
  });

  it("formats source context for prompts", () => {
    const result = formatSourceContextForPrompt(
      [{ url: "https://example.com", title: "Example", excerpt: "Important source text." }],
      "Teacher note.",
    );

    expect(result).toContain("APPROVED SOURCE MATERIAL");
    expect(result).toContain("Important source text.");
    expect(result).toContain("USER-PROVIDED SOURCE NOTES");
  });
});

describe("isPrivateIp (SSRF guard)", () => {
  it("rejects IPv4 loopback + RFC1918 + cloud metadata ranges", () => {
    expect(isPrivateIp("127.0.0.1")).toBe(true);
    expect(isPrivateIp("0.0.0.0")).toBe(true);
    expect(isPrivateIp("10.0.0.5")).toBe(true);
    expect(isPrivateIp("172.16.0.1")).toBe(true);
    expect(isPrivateIp("172.31.255.255")).toBe(true);
    expect(isPrivateIp("192.168.1.1")).toBe(true);
    expect(isPrivateIp("169.254.169.254")).toBe(true); // AWS/GCE metadata
    expect(isPrivateIp("100.64.0.1")).toBe(true);      // CGNAT
    expect(isPrivateIp("224.0.0.1")).toBe(true);       // multicast
  });

  it("accepts public IPv4 ranges", () => {
    expect(isPrivateIp("8.8.8.8")).toBe(false);
    expect(isPrivateIp("172.15.0.1")).toBe(false); // just outside 172.16-31
    expect(isPrivateIp("172.32.0.1")).toBe(false);
    expect(isPrivateIp("192.167.1.1")).toBe(false);
    expect(isPrivateIp("100.63.0.1")).toBe(false);
  });

  it("rejects IPv6 loopback + unique-local + link-local + multicast", () => {
    expect(isPrivateIp("::1")).toBe(true);
    expect(isPrivateIp("::")).toBe(true);
    expect(isPrivateIp("fc00::1")).toBe(true);
    expect(isPrivateIp("fd00::1")).toBe(true);
    expect(isPrivateIp("fe80::1")).toBe(true);
    expect(isPrivateIp("ff02::1")).toBe(true);
    expect(isPrivateIp("::ffff:127.0.0.1")).toBe(true); // v4-mapped loopback
    expect(isPrivateIp("::ffff:192.168.1.1")).toBe(true);
  });

  it("accepts public IPv6", () => {
    expect(isPrivateIp("2606:4700:4700::1111")).toBe(false); // Cloudflare DNS
    expect(isPrivateIp("2001:4860:4860::8888")).toBe(false); // Google DNS
  });

  it("fails closed on garbage", () => {
    expect(isPrivateIp("not-an-ip")).toBe(true);
    expect(isPrivateIp("")).toBe(true);
  });
});

describe("fetchSourceContext (SSRF + per-URL isolation)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects private IP literals without issuing fetch", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await fetchSourceContext([
      "http://127.0.0.1/admin",
      "http://169.254.169.254/latest/meta-data/",
      "http://192.168.1.1/",
    ]);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.resolved).toEqual([]);
    expect(result.failures.length).toBe(3);
    expect(result.failures.every((f) => /private|loopback/i.test(f.reason))).toBe(true);
  });

  it("rejects localhost hostname without issuing fetch", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await fetchSourceContext(["http://localhost:8080/admin"]);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.resolved).toEqual([]);
    expect(result.failures[0]?.reason).toMatch(/localhost/);
  });

  it("rejects .internal and .local pseudo-TLDs without issuing fetch", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await fetchSourceContext([
      "http://secrets.internal/",
      "http://box.local/",
    ]);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.failures.length).toBe(2);
    expect(result.failures.every((f) => /private-zone/i.test(f.reason))).toBe(true);
  });

  it("does not reject public IPv6 literal URLs (URL.hostname brackets)", async () => {
    // URL.hostname wraps IPv6 literals in brackets ("[2606:...]"); without
    // stripping, `net.isIP` fails, DNS lookup fails on the bracketed
    // form, and public IPv6 sources would be blocked. This exercises
    // the bracket-stripping added to assertPublicUrl.
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      return new Response(
        "<html><head><title>v6 site</title></head><body><p>body</p></body></html>",
        { status: 200, headers: { "content-type": "text/html" } },
      );
    });
    const result = await fetchSourceContext(["http://[2606:4700:4700::1111]/"]);
    expect(result.resolved.length).toBe(1);
    expect(result.failures).toEqual([]);
  });

  it("rejects private IPv6 literal URLs in bracketed form", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await fetchSourceContext([
      "http://[::1]/",
      "http://[fc00::1]/",
      "http://[fe80::1]/",
    ]);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.resolved).toEqual([]);
    expect(result.failures.length).toBe(3);
  });

  it("isolates a single failing URL from the rest of the batch", async () => {
    // First URL resolves 404; second succeeds with HTML.
    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("404")) {
        return new Response("gone", { status: 404 });
      }
      return new Response(
        "<html><head><title>Live</title></head><body><p>content body</p></body></html>",
        { status: 200, headers: { "content-type": "text/html" } },
      );
    });
    const result = await fetchSourceContext([
      "https://example.com/404",
      "https://example.com/ok",
    ]);
    expect(result.resolved.length).toBe(1);
    expect(result.resolved[0]?.title).toBe("Live");
    expect(result.failures.length).toBe(1);
    expect(result.failures[0]?.reason).toMatch(/HTTP 404/);
  });
});
