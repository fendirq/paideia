"use client";

import { useState } from "react";
import Link from "next/link";

interface ClassCardProps {
  id: string;
  name: string;
  subject: string;
  period?: number | null;
  joinCode: string;
  studentCount: number;
  sessionCount: number;
}

export function ClassCard({ id, name, subject, period, joinCode, studentCount, sessionCount }: ClassCardProps) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  }

  const subjectLabel = subject.charAt(0) + subject.slice(1).toLowerCase();

  return (
    <Link
      href={`/app/teacher/class/${id}`}
      className="block bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[14px] p-5 transition-all hover:border-accent/20 hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display font-semibold text-[15px] text-text-primary">{name}</h3>
          <span className="text-[12px] text-text-muted">{subjectLabel}{period ? ` · P${period}` : ""}</span>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); copyCode(); }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(35,28,20,0.50)] border border-[rgba(168,152,128,0.15)] text-[12px] font-mono text-text-secondary hover:text-text-primary transition-colors"
        >
          {joinCode}
          {copied ? (
            <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex gap-4 text-[13px] text-text-muted">
        <span>{studentCount} student{studentCount !== 1 ? "s" : ""}</span>
        <span>{sessionCount} session{sessionCount !== 1 ? "s" : ""}</span>
      </div>
    </Link>
  );
}
