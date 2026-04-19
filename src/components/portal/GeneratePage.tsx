"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { EssayOutput } from "./EssayOutput";
import { createSseParserState, extractSseDataMessages, flushSseDataMessages } from "@/lib/sse";
import { MAX_SOURCE_LINKS, MAX_SOURCE_TEXT_CHARS, buildPersistedRequirements, inferTargetWordCount, normalizeSourceLinks } from "@/lib/source-context";

interface GeneratePageProps {
  subject: string;
  hasLevel2?: boolean;
  classId?: string;
}

export function GeneratePage({ subject, hasLevel2 = false, classId }: GeneratePageProps) {
  const [assignment, setAssignment] = useState("");
  const [wordCount, setWordCount] = useState(500);
  const [requirements, setRequirements] = useState("");
  const [sourceLinksInput, setSourceLinksInput] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [level, setLevel] = useState<1 | 2>(1);
  const [essay, setEssay] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadingRubric, setUploadingRubric] = useState(false);
  const [uploadingSources, setUploadingSources] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [wordCountTouched, setWordCountTouched] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rubricInputRef = useRef<HTMLInputElement>(null);
  const sourceInputRef = useRef<HTMLInputElement>(null);

  // Fetch user's profile level on mount to pre-select (only if they have Level 2 access)
  useEffect(() => {
    if (!hasLevel2) return;
    fetch("/api/portal/aggregate")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile?.level === 2) setLevel(2);
      })
      .catch(() => {});
  }, [hasLevel2]);

  // Save essay after generation completes
  const saveEssay = useCallback(
    async (essayText: string) => {
      setSaveError("");
      try {
        const res = await fetch("/api/portal/generations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject,
            assignment,
            requirements: buildPersistedRequirements(
              requirements,
              normalizeSourceLinks(sourceLinksInput),
              sourceText,
            ),
            level,
            essay: essayText,
            portalClassId: classId || null,
          }),
        });
        if (!res.ok) {
          setSaveError("Essay generated but failed to save. Copy your text before leaving.");
        }
      } catch {
        setSaveError("Essay generated but failed to save. Copy your text before leaving.");
      }
    },
    [subject, assignment, requirements, sourceLinksInput, sourceText, level, classId]
  );

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/portal/upload-sample", { method: "POST", body: form });
      if (!res.ok) return;
      const { text } = await res.json();
      if (text.length > 5000) {
        setError("Extracted text is too long (max 5,000 characters). Try a shorter document or paste the key parts manually.");
        return;
      }
      setAssignment(text);
      if (!wordCountTouched) {
        const inferred = inferTargetWordCount(text);
        if (inferred) setWordCount(inferred);
      }
    } catch {
      setError("Failed to extract text from file. Try again or paste manually.");
    } finally {
      setUploading(false);
    }
  };

  const generate = useCallback(async () => {
    if (!assignment.trim() || generating) return;
    const normalizedSourceLinks = normalizeSourceLinks(sourceLinksInput);
    if (sourceLinksInput.trim() && normalizedSourceLinks.length === 0 && !sourceText.trim()) {
      setError("Paste valid source URLs or add source notes before generating.");
      return;
    }
    if (sourceText.length > MAX_SOURCE_TEXT_CHARS) {
      setError(`Source notes are too long. Keep them under ${MAX_SOURCE_TEXT_CHARS} characters.`);
      return;
    }
    setGenerating(true);
    setEssay("");
    setError("");

    try {
      const res = await fetch("/api/portal/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignment,
          wordCount,
          requirements,
          level,
          sourceLinks: normalizedSourceLinks,
          sourceText,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Generation failed");
        setGenerating(false);
        return;
      }

      if (!res.body) {
        setError("Server response was empty. Please try again.");
        setGenerating(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      const sseState = createSseParserState();
      let fullText = "";
      let streamError = false;
      // Parse-failure accounting — one or two malformed frames can
      // happen during re-connect or TCP hiccup, but a sustained stream
      // of unparseable JSON means the upstream is producing garbage
      // (model safety-block returning prose, provider outage echoing
      // HTML, etc.) and continuing silently would save an empty essay.
      let parseFailConsecutive = 0;
      let parseFailTotal = 0;
      const MAX_CONSECUTIVE_PARSE_FAILS = 5;
      const MAX_TOTAL_PARSE_FAILS = 15;

      const tripParseFailure = (): boolean => {
        if (
          parseFailConsecutive >= MAX_CONSECUTIVE_PARSE_FAILS ||
          parseFailTotal >= MAX_TOTAL_PARSE_FAILS
        ) {
          setError("Stream from model was malformed. Please try again.");
          return true;
        }
        return false;
      };

      const processFrame = (data: string): boolean => {
        if (data === "[DONE]") return false;
        try {
          const parsed = JSON.parse(data);
          parseFailConsecutive = 0;
          if (parsed.error) {
            setError(parsed.error);
            return true;
          }
          if (parsed.content) {
            fullText += parsed.content;
            setEssay(fullText);
          }
          return false;
        } catch {
          parseFailConsecutive += 1;
          parseFailTotal += 1;
          return tripParseFailure();
        }
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const messages = extractSseDataMessages(sseState, chunk);

          for (const data of messages) {
            if (processFrame(data)) {
              streamError = true;
              break;
            }
          }
          if (streamError) break;
        }

        for (const data of flushSseDataMessages(sseState)) {
          if (processFrame(data)) {
            streamError = true;
            break;
          }
        }
      } finally {
        reader.releaseLock();
      }

      if (!streamError && fullText) await saveEssay(fullText);
    } catch (err) {
      console.error("portal.generate: client stream failed", err);
      setError("Something went wrong. Try again.");
    } finally {
      setGenerating(false);
    }
  }, [assignment, wordCount, requirements, sourceLinksInput, sourceText, level, generating, saveEssay]);

  const subjectLabel = subject.charAt(0).toUpperCase() + subject.slice(1);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary mb-1">
            Generate — {subjectLabel}
          </h1>
        </div>

        {/* Assignment input */}
        <div className="glass p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Assignment Prompt
            </label>
            {/* File upload drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[rgba(168,152,128,0.20)] hover:border-[rgba(168,152,128,0.40)] rounded-xl p-6 text-center cursor-pointer transition-colors mb-3"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f);
                  e.target.value = "";
                }}
                className="hidden"
              />
              <svg className="w-8 h-8 mx-auto mb-2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
              <p className="text-text-primary text-sm font-medium">
                {uploading ? "Extracting text..." : "Upload assignment file"}
              </p>
              <p className="text-text-muted text-xs mt-1">PDF or DOCX</p>
            </div>
            {assignment && (
              <div className="relative">
                <textarea
                  value={assignment}
                  onChange={(e) => setAssignment(e.target.value)}
                  rows={4}
                  className="input-field font-serif resize-y text-text-primary"
                />
                <button
                  onClick={() => setAssignment("")}
                  className="absolute top-2 right-2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Rubric / Requirements
              </label>
              <div
                onClick={() => !requirements && rubricInputRef.current?.click()}
                className={`border-2 border-dashed border-[rgba(168,152,128,0.20)] hover:border-[rgba(168,152,128,0.40)] rounded-xl p-3 text-center cursor-pointer transition-colors ${requirements ? "border-solid border-[rgba(168,152,128,0.15)]" : ""}`}
              >
                <input
                  ref={rubricInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setUploadingRubric(true);
                    try {
                      const form = new FormData();
                      form.append("file", f);
                      const res = await fetch("/api/portal/upload-sample", { method: "POST", body: form });
                      if (res.ok) {
                        const { text } = await res.json();
                        if (text.length > 5000) {
                          setError("Rubric text is too long (max 5,000 characters). Try a shorter document.");
                          return;
                        }
                        setRequirements(text);
                        if (!wordCountTouched) {
                          const inferred = inferTargetWordCount(text);
                          if (inferred) setWordCount(inferred);
                        }
                      }
                    } catch {
                      setError("Failed to extract rubric. Try again or paste manually.");
                    } finally {
                      setUploadingRubric(false);
                    }
                    e.target.value = "";
                  }}
                  className="hidden"
                />
                {requirements ? (
                  <div className="relative">
                    <textarea
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      rows={2}
                      className="input-field font-serif resize-y text-text-primary text-xs border-0 p-0 bg-transparent"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); setRequirements(""); }}
                      className="absolute top-0 right-0 text-text-muted hover:text-text-secondary transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5 mx-auto mb-1 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                    </svg>
                    <p className="text-text-muted text-xs">
                      {uploadingRubric ? "Extracting..." : "Upload rubric"}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Word count */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Target Word Count — <span className="text-accent">{wordCount}</span>
            </label>
            <input
              type="range"
              min={250}
              max={2000}
              step={50}
              value={wordCount}
              onChange={(e) => {
                setWordCountTouched(true);
                setWordCount(Number(e.target.value));
              }}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-[11px] text-text-muted mt-1">
              <span>250</span>
              <span>2000</span>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Source Links
              </label>
              <textarea
                value={sourceLinksInput}
                onChange={(e) => setSourceLinksInput(e.target.value)}
                rows={4}
                placeholder={"Paste up to 3 source URLs, one per line\nhttps://example.com/primary-source"}
                className="input-field font-serif resize-y text-text-primary"
              />
              <p className="text-[11px] text-text-muted mt-2">
                Add up to {MAX_SOURCE_LINKS} URLs. Level 2 will fetch these and use them as approved evidence.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Source Notes / Excerpts
              </label>
              <div
                onClick={() => sourceInputRef.current?.click()}
                className="border border-dashed border-[rgba(168,152,128,0.20)] hover:border-[rgba(168,152,128,0.40)] rounded-xl px-4 py-3 text-center cursor-pointer transition-colors mb-3"
              >
                <input
                  ref={sourceInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setUploadingSources(true);
                    try {
                      const form = new FormData();
                      form.append("file", f);
                      const res = await fetch("/api/portal/upload-sample", { method: "POST", body: form });
                      if (res.ok) {
                        const { text } = await res.json();
                        setSourceText((prev) =>
                          [prev.trim(), text.slice(0, MAX_SOURCE_TEXT_CHARS).trim()]
                            .filter(Boolean)
                            .join("\n\n---\n\n")
                            .slice(0, MAX_SOURCE_TEXT_CHARS)
                        );
                      } else {
                        setError("Failed to extract source article. Try again or paste the excerpt manually.");
                      }
                    } catch {
                      setError("Failed to extract source article. Try again or paste the excerpt manually.");
                    } finally {
                      setUploadingSources(false);
                    }
                    e.target.value = "";
                  }}
                  className="hidden"
                />
                <p className="text-text-primary text-sm font-medium">
                  {uploadingSources ? "Extracting source article..." : "Upload source article"}
                </p>
                <p className="text-text-muted text-xs mt-1">PDF or DOCX</p>
              </div>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                rows={4}
                placeholder="Paste key quotations, article excerpts, or teacher-selected facts to force into the evidence pool."
                className="input-field font-serif resize-y text-text-primary"
              />
              <p className="text-[11px] text-text-muted mt-2">
                Use this if a source link is paywalled, messy, or you only want specific excerpts included.
              </p>
            </div>
          </div>
        </div>

        {/* Level selector */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setLevel(1)}
            className={`glass p-5 text-left transition-all ${
              level === 1 ? "ring-2 ring-accent/60" : "opacity-60 hover:opacity-80"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-display font-semibold text-text-primary">Level 1</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(168,152,128,0.08)] text-text-muted">Standard</span>
            </div>
            <p className="text-xs text-text-muted">
              Single-pass generation using your profile and samples. Fast and reliable.
            </p>
          </button>
          <button
            onClick={() => hasLevel2 ? setLevel(2) : (window.location.href = "/portal/upgrade")}
            className={`glass p-5 text-left transition-all ${
              !hasLevel2
                ? "opacity-50 hover:opacity-70"
                : level === 2
                  ? "ring-2 ring-accent/60"
                  : "opacity-60 hover:opacity-80"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {!hasLevel2 && (
                <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              )}
              <span className="text-sm font-display font-semibold text-text-primary">Level 2</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent-light">
                {hasLevel2 ? "Enhanced" : "Unlock"}
              </span>
            </div>
            <p className="text-xs text-text-muted">
              {hasLevel2
                ? "Two-pass: analyzes your style fingerprint first, then generates. More accurate but slower."
                : "Unlock enhanced generation powered by Claude Sonnet 4."}
            </p>
          </button>
        </div>

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={generating || !assignment.trim()}
          className="w-full btn-primary text-sm py-3 disabled:opacity-30"
        >
          {generating ? "Generating..." : `Generate with Level ${level}`}
        </button>

        {/* Past assignments + Edit profile */}
        <div className="space-y-2">
          <Link
            href={`/portal/${subject}/history`}
            className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-[rgba(168,152,128,0.15)] bg-[rgba(168,152,128,0.04)] hover:bg-[rgba(168,152,128,0.08)] transition-all"
          >
            <svg className="w-4 h-4 text-text-muted group-hover:text-text-muted transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className="text-sm text-text-muted group-hover:text-text-secondary transition-colors flex-1">Past Assignments</span>
            <svg className="w-4 h-4 text-text-muted/50 group-hover:text-text-muted group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
          <Link
            href="/portal/aggregate"
            className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-[rgba(168,152,128,0.15)] bg-[rgba(168,152,128,0.04)] hover:bg-[rgba(168,152,128,0.08)] transition-all"
          >
            <svg className="w-4 h-4 text-text-muted group-hover:text-text-muted transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
            </svg>
            <span className="text-sm text-text-muted group-hover:text-text-secondary transition-colors flex-1">Writing Profile</span>
            <svg className="w-4 h-4 text-text-muted/50 group-hover:text-text-muted group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        {/* Essay output */}
        {(essay || generating) && (
          <EssayOutput
            essay={essay}
            generating={generating}
            onRegenerate={generate}
          />
        )}

        {saveError && (
          <div className="mt-4 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm">
            {saveError}
          </div>
        )}
      </div>
    </div>
  );
}
