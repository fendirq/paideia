"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BackButton } from "@/components/back-button";

interface MaterialFile {
  id: string;
  fileName: string;
  fileType: string;
}

interface MaterialItem {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  files: MaterialFile[];
  threadId: string | null;
  messageCount: number;
  status: "not_started" | "in_progress" | "reviewed";
  createdAt: string;
}

interface ClassData {
  id: string;
  name: string;
  subject: string;
  period: number | null;
  description: string | null;
  pinnedNote: string | null;
  teacherName: string | null;
  _count: { enrollments: number };
  materials: MaterialItem[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  not_started: { label: "Not started", color: "text-text-muted" },
  in_progress: { label: "In progress", color: "text-yellow-500" },
  reviewed: { label: "Reviewed", color: "text-accent" },
};

export default function EnrolledClassPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingThread, setStartingThread] = useState<string | null>(null);
  const [threadError, setThreadError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/classes/${classId}`);
        if (!res.ok) {
          router.push("/app/classes");
          return;
        }
        setClassData(await res.json());
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [classId, router]);

  async function handleStartThread(materialId: string) {
    setStartingThread(materialId);
    setThreadError(null);
    try {
      const res = await fetch(`/api/classes/${classId}/materials/${materialId}/thread`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/app/sessions/${data.sessionId}`);
      } else {
        const err = await res.json().catch(() => ({}));
        setThreadError(err.error ?? "Failed to start session. Please try again.");
      }
    } catch {
      setThreadError("Network error. Please try again.");
    } finally {
      setStartingThread(null);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 mt-4">
        <div className="text-center py-12 text-text-muted text-[14px]">Loading...</div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 mt-4">
        <div className="text-center py-12 text-text-muted text-[14px]">Redirecting...</div>
      </div>
    );
  }

  const subjectLabel = classData.subject.charAt(0) + classData.subject.slice(1).toLowerCase();

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 mt-4 mb-8 bg-[rgba(40,32,24,0.55)] backdrop-blur-2xl border border-[rgba(168,152,128,0.15)] rounded-[20px]">
      <BackButton href="/app/classes" />

      {/* Class Header */}
      <div className="mb-6">
        <h1 className="font-serif text-[34px] text-text-primary">{classData.name}</h1>
        <div className="flex items-center gap-3 mt-1 text-[14px] text-text-secondary">
          <span>{subjectLabel}</span>
          {classData.period && <span>· Period {classData.period}</span>}
          <span>· {classData.teacherName || "Teacher"}</span>
        </div>
        {classData.description && (
          <p className="text-[13px] text-text-muted mt-2">{classData.description}</p>
        )}
      </div>

      {/* Pinned Note */}
      {classData.pinnedNote && (
        <div className="bg-accent/5 border border-accent/15 rounded-[12px] px-4 py-3 mb-6">
          <p className="text-[13px] text-text-secondary">{classData.pinnedNote}</p>
        </div>
      )}

      {/* Thread error */}
      {threadError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-[12px] px-4 py-3 mb-6">
          <p className="text-[13px] text-red-400">{threadError}</p>
        </div>
      )}

      {/* Materials */}
      <section>
        <h2 className="font-display font-semibold text-[18px] text-text-primary mb-4">Materials</h2>

        {classData.materials.length === 0 ? (
          <p className="text-[14px] text-text-muted text-center py-8">
            No materials yet. Your teacher will add assignments and files here.
          </p>
        ) : (
          <div className="space-y-3">
            {classData.materials.map((m) => {
              const statusInfo = STATUS_LABELS[m.status];
              const dueLabel = m.dueDate
                ? new Date(m.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
                : null;

              return (
                <div
                  key={m.id}
                  className="bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[14px] p-5 transition-all hover:border-accent/15"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display font-semibold text-[15px] text-text-primary">
                          {m.title}
                        </h3>
                        {dueLabel && (
                          <span className="shrink-0 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-display">
                            Due {dueLabel}
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-text-secondary line-clamp-2">{m.description}</p>

                      {m.files.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {m.files.map((f) => (
                            <span key={f.id} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[rgba(168,152,128,0.08)] text-[11px] text-text-muted">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                              </svg>
                              {f.fileName}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-[11px]">
                        <span className={statusInfo.color}>{statusInfo.label}</span>
                        {m.messageCount > 0 && (
                          <span className="text-text-muted">{m.messageCount} messages</span>
                        )}
                      </div>
                    </div>

                    {/* Action button */}
                    {m.threadId ? (
                      <Link
                        href={`/app/sessions/${m.threadId}`}
                        className="shrink-0 bg-accent/10 hover:bg-accent/20 text-accent text-[12px] font-display font-semibold rounded-[10px] px-4 py-2 transition-colors"
                      >
                        Continue
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleStartThread(m.id)}
                        disabled={startingThread === m.id}
                        className="shrink-0 bg-accent hover:bg-accent/90 text-[#281c14] text-[12px] font-display font-semibold rounded-[10px] px-4 py-2 transition-colors disabled:opacity-50"
                      >
                        {startingThread === m.id ? "Starting..." : "Start"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
