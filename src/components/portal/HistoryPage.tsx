"use client";

import { useState, useEffect, useCallback } from "react";
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

interface HistoryPageProps {
  subject: string;
}

export function HistoryPage({ subject }: HistoryPageProps) {
  const [essays, setEssays] = useState<EssayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<FullEssay | null>(null);
  const [loadingEssay, setLoadingEssay] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const subjectLabel = subject.charAt(0).toUpperCase() + subject.slice(1);

  useEffect(() => {
    fetch(`/api/portal/generations?subject=${subject}`)
      .then((r) => r.json())
      .then((d) => setEssays(d.essays ?? []))
      .catch((err) => {
        console.error("portal.history: essay list fetch failed", err);
        setLoadError("Couldn't load history. Refresh to retry.");
      })
      .finally(() => setLoading(false));
  }, [subject]);

  const openEssay = useCallback(async (id: string) => {
    setLoadingEssay(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/portal/generations/${id}`);
      if (res.ok) {
        const { essay } = await res.json();
        setSelected(essay);
      } else {
        setLoadError("Couldn't open that essay.");
      }
    } catch (err) {
      console.error("portal.history: essay fetch failed", err);
      setLoadError("Network error opening essay. Try again.");
    }
    setLoadingEssay(false);
  }, []);

  const filtered = essays.filter((e) => {
    if (search && !e.assignment.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  // Detail view
  if (selected) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] px-6 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <button
            onClick={() => setSelected(null)}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Back to history
          </button>

          <div>
            <h1 className="font-display text-2xl font-bold text-text-primary mb-1">
              Past Assignment
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(168,152,128,0.08)] text-text-muted">
                Level {selected.level}
              </span>
              <span className="text-xs text-text-muted">
                {selected.wordCount} words
              </span>
              <span className="text-xs text-text-muted">
                {new Date(selected.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Assignment prompt */}
          <div className="glass p-5">
            <p className="text-xs font-medium text-text-muted mb-2">Assignment</p>
            <p className="text-sm text-text-primary whitespace-pre-wrap">{selected.assignment}</p>
            {selected.requirements && (
              <>
                <p className="text-xs font-medium text-text-muted mt-4 mb-2">Requirements</p>
                <p className="text-sm text-text-secondary whitespace-pre-wrap">{selected.requirements}</p>
              </>
            )}
          </div>

          {/* Essay */}
          <div className="glass p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-text-muted">Generated Essay</p>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(selected.essay);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-xs px-3 py-1 rounded-full bg-[rgba(168,152,128,0.08)] text-text-muted hover:text-text-primary transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="font-serif text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
              {selected.essay}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-text-primary">
            History — {subjectLabel}
          </h1>
          <Link
            href={`/portal/${subject}/generate`}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(168,152,128,0.08)] text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New
          </Link>
        </div>

        {loadError && (
          <p className="text-red-400/80 text-sm text-center" role="alert">{loadError}</p>
        )}

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assignments..."
            className="w-full bg-[rgba(168,152,128,0.14)] border border-[rgba(168,152,128,0.15)] rounded-full pl-11 pr-4 py-3 text-sm font-display text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>

        {/* Essay list */}
        {loading ? (
          <p className="text-sm text-text-muted text-center py-12 animate-pulse">
            Loading...
          </p>
        ) : filtered.length === 0 ? (
          <div className="glass px-8 py-4 text-center">
            <p className="text-text-muted text-sm">
              {essays.length === 0
                ? "Nothing to see here."
                : "No results match your search."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => openEssay(item.id)}
                disabled={loadingEssay}
                className="w-full text-left glass p-5 hover:bg-[rgba(168,152,128,0.08)] transition-colors"
              >
                <p className="text-sm text-text-primary font-medium truncate">
                  {item.assignment.length > 100
                    ? item.assignment.slice(0, 100) + "..."
                    : item.assignment}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(168,152,128,0.08)] text-text-muted">
                    Level {item.level}
                  </span>
                  <span className="text-xs text-text-muted">
                    {item.wordCount} words
                  </span>
                  <span className="text-xs text-text-muted">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
