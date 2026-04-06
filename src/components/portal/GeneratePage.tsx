"use client";

import { useState, useCallback } from "react";
import { EssayOutput } from "./EssayOutput";

interface GeneratePageProps {
  subject: string;
}

export function GeneratePage({ subject }: GeneratePageProps) {
  const [assignment, setAssignment] = useState("");
  const [wordCount, setWordCount] = useState(500);
  const [requirements, setRequirements] = useState("");
  const [level, setLevel] = useState<1 | 2>(1);
  const [essay, setEssay] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

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
              continue;
            }
            if (parsed.content) {
              fullText += parsed.content;
              setEssay(fullText);
            }
          } catch {
            // skip
          }
        }
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setGenerating(false);
    }
  }, [assignment, wordCount, requirements, level, generating]);

  const subjectLabel = subject.charAt(0).toUpperCase() + subject.slice(1);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary mb-1">
            Generate — {subjectLabel}
          </h1>
          <p className="text-text-muted text-sm">
            Describe your assignment and choose a generation level.
          </p>
        </div>

        {/* Assignment input */}
        <div className="glass p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Assignment Prompt
            </label>
            <textarea
              value={assignment}
              onChange={(e) => setAssignment(e.target.value)}
              placeholder="Paste or describe your assignment here..."
              rows={4}
              className="input-field font-serif resize-y"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Target Word Count
              </label>
              <input
                type="number"
                value={wordCount}
                onChange={(e) => setWordCount(Number(e.target.value))}
                min={100}
                max={5000}
                step={50}
                className="input-field"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Additional Requirements
              </label>
              <input
                type="text"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="e.g. MLA format, 3 sources..."
                className="input-field"
              />
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
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-text-muted">Standard</span>
            </div>
            <p className="text-xs text-text-muted">
              Single-pass generation using your profile and samples. Fast and reliable.
            </p>
          </button>
          <button
            onClick={() => setLevel(2)}
            className={`glass p-5 text-left transition-all ${
              level === 2 ? "ring-2 ring-accent/60" : "opacity-60 hover:opacity-80"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-display font-semibold text-text-primary">Level 2</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent-light">Enhanced</span>
            </div>
            <p className="text-xs text-text-muted">
              Two-pass: analyzes your style fingerprint first, then generates. More accurate but slower.
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
