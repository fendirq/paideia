"use client";

import { useState } from "react";
import Link from "next/link";
import { SUBJECT_COLORS, SUBJECT_LABELS } from "@/lib/subject-constants";

interface SessionItem {
  id: string;
  messageCount: number;
  startedAt: string;
  status: string;
}

interface ClassItem {
  id: string;
  subject: string;
  unitName: string;
  teacherName: string;
  sessions: SessionItem[];
}

interface ClassFoldersProps {
  classes: ClassItem[];
}

export function ClassFolders({ classes }: ClassFoldersProps) {
  const [openFolder, setOpenFolder] = useState<string | null>(null);

  if (classes.length === 0) {
    return (
      <div className="bg-bg-inner border border-white/[0.04] rounded-[16px] p-12 text-center">
        <p className="text-text-muted mb-3">No classes yet.</p>
        <Link
          href="/app"
          className="text-accent text-sm hover:text-accent-light transition-colors"
        >
          Go to Home to add a class
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {classes.map((cls) => {
        const isOpen = openFolder === cls.id;
        const color = SUBJECT_COLORS[cls.subject] ?? SUBJECT_COLORS.OTHER;
        const label = SUBJECT_LABELS[cls.subject] ?? "Other";

        return (
          <div key={cls.id} className="rounded-[16px] border border-white/[0.04] overflow-hidden">
            {/* Folder header */}
            <button
              onClick={() => setOpenFolder(isOpen ? null : cls.id)}
              className="w-full flex items-center gap-4 bg-bg-inner hover:bg-bg-elevated/50 px-5 py-4 transition-colors"
            >
              {/* Folder icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${color}15` }}
              >
                <svg
                  className="w-5 h-5 transition-transform"
                  style={{ color, transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  {isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                  )}
                </svg>
              </div>

              {/* Class info */}
              <div className="flex-1 text-left">
                <h3 className="font-display font-semibold text-[15px] text-text-primary">
                  {cls.unitName}
                </h3>
                <p className="text-[12px] text-text-muted">
                  {label} · {cls.teacherName} · {cls.sessions.length} session{cls.sessions.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Chevron */}
              <svg
                className="w-4 h-4 text-text-muted transition-transform"
                style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {/* Folder contents — sessions */}
            {isOpen && (
              <div className="border-t border-white/[0.04] bg-bg-base/40">
                {cls.sessions.length === 0 ? (
                  <div className="px-5 py-6 text-center">
                    <p className="text-text-muted text-sm mb-4">No sessions in this class yet.</p>
                    <Link
                      href={`/app/start/${cls.id}`}
                      className="inline-block bg-accent border-2 border-accent-light rounded-full px-6 py-2.5 text-[13px] font-medium text-white shadow-[0_0_20px_rgba(74,157,91,0.3)] hover:bg-accent-light transition-colors"
                    >
                      Start New Chat
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.04]">
                    {cls.sessions.map((s, i) => (
                      <Link
                        key={s.id}
                        href={`/app/sessions/${s.id}`}
                        className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.03] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-[11px] text-text-muted font-medium">
                            {i + 1}
                          </span>
                          <div>
                            <p className="text-[13px] text-text-primary">
                              Session {cls.sessions.length - i}
                            </p>
                            <p className="text-[11px] text-text-muted">
                              {s.messageCount} message{s.messageCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] text-text-muted">
                          {new Date(s.startedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
