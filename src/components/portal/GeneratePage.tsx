"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { EssayOutput } from "./EssayOutput";

interface GeneratePageProps {
  subject: string;
  hasLevel2?: boolean;
}

export function GeneratePage({ subject, hasLevel2 = false }: GeneratePageProps) {
  const [assignment, setAssignment] = useState("");
  const wordCount = 500;
  const [requirements, setRequirements] = useState("");
  const [level, setLevel] = useState<1 | 2>(1);
  const [essay, setEssay] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadingRubric, setUploadingRubric] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rubricInputRef = useRef<HTMLInputElement>(null);

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
      try {
        await fetch("/api/portal/generations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject,
            assignment,
            requirements,
            level,
            essay: essayText,
          }),
        });
      } catch {}
    },
    [subject, assignment, requirements, level]
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
    } catch {
      // skip
    } finally {
      setUploading(false);
    }
  };

  const generate = useCallback(async () => {
    if (!assignment.trim() || generating) return;
    setGenerating(true);
    setEssay("");
    setError("");

    try {
      const res = await fetch("/api/portal/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignment, wordCount, requirements, level }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Generation failed");
        setGenerating(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      let streamError = false;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              setError(parsed.error);
              streamError = true;
              break;
            }
            if (parsed.content) {
              fullText += parsed.content;
              setEssay(fullText);
            }
          } catch {
            // skip
          }
        }
        if (streamError) break;
      }

      if (!streamError && fullText) saveEssay(fullText);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setGenerating(false);
    }
  }, [assignment, wordCount, requirements, level, generating, saveEssay]);

  const subjectLabel = subject.charAt(0).toUpperCase() + subject.slice(1);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">
            Generate — {subjectLabel}
          </h1>
        </div>

        {/* Assignment input */}
        <div className="glass p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Assignment Prompt
            </label>
            {/* File upload drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 hover:border-white/40 rounded-xl p-6 text-center cursor-pointer transition-colors mb-3"
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
              <svg className="w-8 h-8 mx-auto mb-2 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
              </svg>
              <p className="text-white text-sm font-medium">
                {uploading ? "Extracting text..." : "Upload assignment file"}
              </p>
              <p className="text-white/40 text-xs mt-1">PDF or DOCX</p>
            </div>
            {assignment && (
              <div className="relative">
                <textarea
                  value={assignment}
                  onChange={(e) => setAssignment(e.target.value)}
                  rows={4}
                  className="input-field font-serif resize-y text-white"
                />
                <button
                  onClick={() => setAssignment("")}
                  className="absolute top-2 right-2 text-white/30 hover:text-white/60 transition-colors"
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
              <label className="block text-sm font-medium text-white/70 mb-2">
                Rubric / Requirements
              </label>
              <div
                onClick={() => !requirements && rubricInputRef.current?.click()}
                className={`border-2 border-dashed border-white/20 hover:border-white/40 rounded-xl p-3 text-center cursor-pointer transition-colors ${requirements ? "border-solid border-white/[0.06]" : ""}`}
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
                      }
                    } catch {} finally {
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
                      className="input-field font-serif resize-y text-white text-xs border-0 p-0 bg-transparent"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); setRequirements(""); }}
                      className="absolute top-0 right-0 text-white/30 hover:text-white/60 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5 mx-auto mb-1 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                    </svg>
                    <p className="text-white/40 text-xs">
                      {uploadingRubric ? "Extracting..." : "Upload rubric"}
                    </p>
                  </>
                )}
              </div>
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
              <span className="text-sm font-display font-semibold text-white">Level 1</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">Standard</span>
            </div>
            <p className="text-xs text-white/50">
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
                <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              )}
              <span className="text-sm font-display font-semibold text-white">Level 2</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent-light">
                {hasLevel2 ? "Enhanced" : "Unlock"}
              </span>
            </div>
            <p className="text-xs text-white/50">
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
            className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-all"
          >
            <svg className="w-4 h-4 text-white/30 group-hover:text-white/50 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors flex-1">Past Assignments</span>
            <svg className="w-4 h-4 text-white/20 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
          <Link
            href="/portal/aggregate"
            className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-all"
          >
            <svg className="w-4 h-4 text-white/30 group-hover:text-white/50 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
            </svg>
            <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors flex-1">Writing Profile</span>
            <svg className="w-4 h-4 text-white/20 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
      </div>
    </div>
  );
}
