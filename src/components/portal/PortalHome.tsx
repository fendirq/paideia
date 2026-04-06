"use client";

import Link from "next/link";
import { SUBJECT_LABELS, SUBJECT_COLORS } from "@/lib/subject-constants";

interface ClassItem {
  id: string;
  name: string;
  subject: string;
}

interface PortalHomeProps {
  classes: ClassItem[];
  hasProfile: boolean;
}

const ESSAY_SUBJECTS = ["HISTORY", "ENGLISH", "HUMANITIES"];

export function PortalHome({ classes, hasProfile }: PortalHomeProps) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-6">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl font-bold tracking-[0.1em] text-text-primary mb-2">
          The Portal
        </h1>
        <p className="text-text-muted text-sm">
          {hasProfile ? "Select a class to generate" : "Start by building your writing profile"}
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
        {/* Aggregate Writing button */}
        <Link
          href="/portal/aggregate"
          className="bg-accent/20 backdrop-blur-xl border border-accent/40 rounded-full px-6 py-2.5 text-[13px] font-medium text-accent-light hover:bg-accent/30 transition-colors"
        >
          {hasProfile ? "Edit Writing Profile" : "Aggregate Writing"}
        </Link>

        {/* Class pills */}
        {classes.map((cls) => {
          const color = SUBJECT_COLORS[cls.subject] ?? SUBJECT_COLORS.OTHER;
          const isEssaySubject = ESSAY_SUBJECTS.includes(cls.subject);
          const href = isEssaySubject
            ? hasProfile
              ? `/portal/${cls.subject.toLowerCase()}/generate`
              : "/portal/aggregate"
            : `/portal/${cls.subject.toLowerCase()}`;

          return (
            <Link
              key={cls.id}
              href={href}
              className="backdrop-blur-xl border rounded-full px-6 py-2.5 text-[13px] font-medium transition-colors hover:brightness-125"
              style={{
                backgroundColor: `${color}20`,
                borderColor: `${color}40`,
                color: color,
              }}
            >
              {cls.name}
              <span className="ml-2 opacity-60 text-[11px]">
                {SUBJECT_LABELS[cls.subject] ?? cls.subject}
              </span>
            </Link>
          );
        })}
      </div>

      {classes.length === 0 && (
        <p className="text-text-muted text-sm mt-6">
          No classes yet. Add classes from the main app first.
        </p>
      )}
    </div>
  );
}
