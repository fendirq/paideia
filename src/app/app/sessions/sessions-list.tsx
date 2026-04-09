"use client";

import { useState } from "react";
import { SessionCard } from "@/components/session-card";
import Link from "next/link";
import { SUBJECT_COLORS, SUBJECT_LABELS } from "@/lib/subject-constants";

interface SessionItem {
  id: string;
  inquiryId: string;
  subject: string;
  unitName: string;
  teacherName: string;
  messageCount: number;
  startedAt: string;
}

interface SessionsListProps {
  sessions: SessionItem[];
}

const RECENT_LIMIT = 2;

export function SessionsList({ sessions }: SessionsListProps) {
  const [filter, setFilter] = useState("ALL");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  if (sessions.length === 0) {
    return (
      <div className="bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[16px] p-12 text-center">
        <p className="text-text-muted mb-3">No sessions yet.</p>
        <Link
          href="/app/upload"
          className="text-accent text-sm hover:text-accent-light transition-colors"
        >
          Upload coursework to get started
        </Link>
      </div>
    );
  }

  // Get unique subjects for filter pills
  const subjects = Array.from(new Set(sessions.map((s) => s.subject)));

  // Filter sessions
  const filtered =
    filter === "ALL" ? sessions : sessions.filter((s) => s.subject === filter);

  // Group by inquiry
  const grouped = new Map<
    string,
    { subject: string; unitName: string; teacherName: string; sessions: SessionItem[] }
  >();
  for (const s of filtered) {
    if (!grouped.has(s.inquiryId)) {
      grouped.set(s.inquiryId, {
        subject: s.subject,
        unitName: s.unitName,
        teacherName: s.teacherName,
        sessions: [],
      });
    }
    grouped.get(s.inquiryId)!.sessions.push(s);
  }

  const toggleExpand = (inquiryId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(inquiryId)) next.delete(inquiryId);
      else next.add(inquiryId);
      return next;
    });
  };

  return (
    <div>
      {/* Subject filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-4 py-[7px] rounded-[20px] font-display text-[13px] font-medium transition-all border ${
            filter === "ALL"
              ? "border-accent bg-accent/[0.08] text-text-primary"
              : "border-[rgba(168,152,128,0.15)] bg-bg-surface text-text-secondary hover:border-[rgba(168,152,128,0.30)]"
          }`}
        >
          All
        </button>
        {subjects.map((subj) => {
          const color = SUBJECT_COLORS[subj] ?? SUBJECT_COLORS.OTHER;
          const label = SUBJECT_LABELS[subj] ?? subj;
          return (
            <button
              key={subj}
              onClick={() => setFilter(subj)}
              className={`flex items-center gap-[7px] px-4 py-[7px] rounded-[20px] font-display text-[13px] font-medium transition-all border ${
                filter === subj
                  ? "border-accent bg-accent/[0.08] text-text-primary"
                  : "border-[rgba(168,152,128,0.15)] bg-bg-surface text-text-secondary hover:border-[rgba(168,152,128,0.30)]"
              }`}
            >
              <span
                className="w-[7px] h-[7px] rounded-full"
                style={{ background: color }}
              />
              {label}
            </button>
          );
        })}
      </div>

      {/* Grouped sessions */}
      <div className="space-y-8">
        {Array.from(grouped.entries()).map(([inquiryId, group]) => {
          const isExpanded = expandedGroups.has(inquiryId);
          const recent = group.sessions.slice(0, RECENT_LIMIT);
          const past = group.sessions.slice(RECENT_LIMIT);
          const visibleSessions = isExpanded ? group.sessions : recent;

          return (
            <section key={inquiryId}>
              {/* Group divider label */}
              <div className="flex items-center gap-3 mb-3">
                <span className="font-display text-[11px] font-semibold tracking-[1.5px] uppercase text-text-muted">
                  {group.unitName}
                </span>
                <span className="text-[11px] text-text-muted">
                  · {group.teacherName}
                </span>
                <div className="flex-1 h-px bg-[rgba(168,152,128,0.08)]" />
                <span className="text-[11px] text-text-muted">
                  {group.sessions.length}
                </span>
              </div>

              {/* Session rows */}
              <div className="space-y-0.5">
                {visibleSessions.map((s) => (
                  <SessionCard
                    key={s.id}
                    id={s.id}
                    unitName={s.unitName}
                    subject={s.subject}
                    messageCount={s.messageCount}
                    startedAt={s.startedAt}
                  />
                ))}
              </div>

              {/* Past chats toggle */}
              {past.length > 0 && (
                <button
                  onClick={() => toggleExpand(inquiryId)}
                  className="mt-2 ml-4 text-[13px] text-accent hover:text-accent-light transition-colors font-display font-medium"
                >
                  {isExpanded
                    ? "Show less"
                    : `Past chats (${past.length}) \u2192`}
                </button>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
