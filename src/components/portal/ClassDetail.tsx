"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface EssayItem {
  id: string;
  assignment: string;
  level: number;
  wordCount: number;
  createdAt: string;
}

interface FullEssay extends EssayItem {
  essay: string;
  requirements: string | null;
}

interface ClassDetailProps {
  classId: string;
  className: string;
  subject: string;
  essays: EssayItem[];
}

export function ClassDetail({ classId, className, subject, essays }: ClassDetailProps) {
  const [selected, setSelected] = useState<FullEssay | null>(null);
  const [loadingEssay, setLoadingEssay] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadError, setLoadError] = useState("");

  const subjectLabel = subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();

  const openEssay = useCallback(async (id: string) => {
    setLoadingEssay(true);
    setLoadError("");
    try {
      const res = await fetch(`/api/portal/generations/${id}`);
      if (res.ok) {
        const { essay } = await res.json();
        setSelected(essay);
      } else {
        setLoadError("Failed to load essay. Please try again.");
      }
    } catch {
      setLoadError("Network error. Please try again.");
    }
    setLoadingEssay(false);
  }, []);

  const handleCopy = useCallback(() => {
    if (!selected) return;
    navigator.clipboard.writeText(selected.essay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [selected]);

  // Essay detail view
  if (selected) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button
          onClick={() => { setSelected(null); setCopied(false); }}
          className="text-accent text-sm hover:text-accent-light transition-colors mb-6 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Back to {className}
        </button>

        <div className="mb-4">
          <h1 className="font-display font-semibold text-lg text-text-primary">
            {selected.assignment.slice(0, 120)}{selected.assignment.length > 120 ? "..." : ""}
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Level {selected.level} · {selected.wordCount} words · {new Date(selected.createdAt).toLocaleDateString()}
          </p>
          {selected.requirements && (
            <p className="text-xs text-text-secondary mt-2">
              Requirements: {selected.requirements}
            </p>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={handleCopy}
            className="text-xs bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 rounded-full px-4 py-1.5 transition-colors"
          >
            {copied ? "Copied!" : "Copy Essay"}
          </button>
        </div>

        <div className="bg-[rgba(40,32,24,0.30)] border border-[rgba(168,152,128,0.10)] rounded-2xl p-6">
          <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-text-secondary leading-relaxed">
            {selected.essay}
          </div>
        </div>
      </div>
    );
  }

  // Class essay list view
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link
        href="/portal/home"
        className="text-accent text-sm hover:text-accent-light transition-colors mb-6 flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Back
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-semibold text-xl text-text-primary">{className}</h1>
          <p className="text-sm text-text-muted mt-1">{subjectLabel}</p>
        </div>
        <Link
          href={`/portal/${subject.toLowerCase()}/generate?classId=${classId}`}
          className="bg-accent hover:bg-accent-light text-[#281c14] font-display text-[12px] font-semibold rounded-full px-5 py-2 transition-colors"
        >
          Generate Essay
        </Link>
      </div>

      {loadError && (
        <p className="text-red-400 text-xs mb-4">{loadError}</p>
      )}

      {essays.length === 0 ? (
        <div className="bg-[rgba(40,32,24,0.30)] border border-[rgba(168,152,128,0.10)] rounded-2xl p-12 text-center">
          <p className="text-text-muted mb-3">No essays yet.</p>
          <Link
            href={`/portal/${subject.toLowerCase()}/generate?classId=${classId}`}
            className="text-accent text-sm hover:text-accent-light transition-colors"
          >
            Generate your first essay
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {essays.map((e) => (
            <button
              key={e.id}
              onClick={() => openEssay(e.id)}
              disabled={loadingEssay}
              className="w-full text-left bg-[rgba(40,32,24,0.30)] border border-[rgba(168,152,128,0.10)] rounded-xl p-4 hover:border-accent/20 hover:bg-[rgba(40,32,24,0.45)] transition-all disabled:opacity-60"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-display text-[14px] font-medium text-text-primary truncate pr-4">
                  {e.assignment.slice(0, 100)}{e.assignment.length > 100 ? "..." : ""}
                </h3>
                <span className="text-[10px] bg-accent/10 text-accent rounded-full px-2 py-0.5 shrink-0">
                  L{e.level}
                </span>
              </div>
              <p className="text-[11px] text-text-muted mt-1">
                {e.wordCount} words · {new Date(e.createdAt).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
