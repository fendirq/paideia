"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SessionCard } from "@/components/session-card";
import Link from "next/link";
import { SUBJECT_COLORS, SUBJECT_LABELS } from "@/lib/subject-constants";
import { ConfirmModal } from "@/components/confirm-modal";

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

export function SessionsList({ sessions: initialSessions }: SessionsListProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initialSessions);
  const [filter, setFilter] = useState("ALL");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [confirmDeleteSession, setConfirmDeleteSession] = useState<string | null>(null);
  const [confirmDeleteInquiry, setConfirmDeleteInquiry] = useState<string | null>(null);
  const [deletingSession, setDeletingSession] = useState(false);
  const [deletingInquiry, setDeletingInquiry] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleDeleteSession(sessionId: string) {
    setDeletingSession(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        router.refresh();
        setConfirmDeleteSession(null);
      } else {
        setDeleteError("Failed to remove session. Please try again.");
      }
    } catch {
      setDeleteError("Network error. Please try again.");
    }
    setDeletingSession(false);
  }

  async function handleDeleteInquiry(inquiryId: string) {
    setDeletingInquiry(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}`, { method: "DELETE" });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.inquiryId !== inquiryId));
        router.refresh();
        setConfirmDeleteInquiry(null);
      } else {
        setDeleteError("Failed to remove class. Please try again.");
      }
    } catch {
      setDeleteError("Network error. Please try again.");
    }
    setDeletingInquiry(false);
  }

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
              <div className="group/header flex items-center gap-3 mb-3">
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
                <button
                  onClick={() => setConfirmDeleteInquiry(inquiryId)}
                  className="w-5 h-5 rounded-full bg-[rgba(40,32,24,0.60)] border border-[rgba(168,152,128,0.15)] flex items-center justify-center opacity-0 group-hover/header:opacity-100 transition-opacity text-text-muted hover:text-red-400"
                  title="Remove class"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Session rows */}
              <div className="space-y-0.5">
                {visibleSessions.map((s) => (
                  <div key={s.id} className="group/session relative">
                    <SessionCard
                      id={s.id}
                      unitName={s.unitName}
                      subject={s.subject}
                      messageCount={s.messageCount}
                      startedAt={s.startedAt}
                    />
                    <button
                      onClick={() => setConfirmDeleteSession(s.id)}
                      className="absolute top-1/2 -translate-y-1/2 right-2 w-5 h-5 rounded-full bg-[rgba(40,32,24,0.60)] border border-[rgba(168,152,128,0.15)] flex items-center justify-center opacity-0 group-hover/session:opacity-100 transition-opacity text-text-muted hover:text-red-400 z-10"
                      title="Remove session"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
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

      {deleteError && (
        <p className="text-red-400 text-xs text-center mt-4">{deleteError}</p>
      )}

      <ConfirmModal
        open={!!confirmDeleteSession}
        title="Remove this session?"
        message="Chat history will be deleted."
        onConfirm={() => confirmDeleteSession && handleDeleteSession(confirmDeleteSession)}
        onCancel={() => setConfirmDeleteSession(null)}
        loading={deletingSession}
      />

      <ConfirmModal
        open={!!confirmDeleteInquiry}
        title="Remove this class?"
        message="All sessions, files, and chat history will be deleted."
        onConfirm={() => confirmDeleteInquiry && handleDeleteInquiry(confirmDeleteInquiry)}
        onCancel={() => setConfirmDeleteInquiry(null)}
        loading={deletingInquiry}
      />
    </div>
  );
}
