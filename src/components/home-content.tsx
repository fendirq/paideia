"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VideoHero } from "@/components/video-hero";
import { AddClassForm } from "@/components/add-class-form";
import { JoinClassModal } from "@/components/join-class-modal";
import { ConfirmModal } from "@/components/confirm-modal";

interface EnrolledClass {
  id: string;
  name: string;
  subject: string;
  period: number | null;
  teacherName: string | null;
  studentCount: number;
}

interface SelfDirectedClass {
  id: string;
  unitName: string;
  subject: string;
  teacherName: string;
  sessionCount: number;
}

interface HomeContentProps {
  userName?: string | null;
  enrolledClasses?: EnrolledClass[];
  selfDirectedClasses?: SelfDirectedClass[];
}

export function HomeContent({
  userName,
  enrolledClasses: initialClasses = [],
  selfDirectedClasses: initialSelfDirected = [],
}: HomeContentProps) {
  const router = useRouter();
  const [enrolledClasses, setEnrolledClasses] = useState(initialClasses);
  const [selfDirected, setSelfDirected] = useState(initialSelfDirected);
  const [showForm, setShowForm] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState("");
  const [confirmDeleteInquiry, setConfirmDeleteInquiry] = useState<string | null>(null);
  const [deletingInquiry, setDeletingInquiry] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleLeave(classId: string) {
    setLeaving(true);
    setLeaveError("");
    try {
      const res = await fetch(`/api/classes/enroll?classId=${classId}`, { method: "DELETE" });
      if (res.ok) {
        setEnrolledClasses((prev) => prev.filter((c) => c.id !== classId));
        setConfirmLeave(null);
      } else {
        setLeaveError("Failed to leave class. Please try again.");
      }
    } catch {
      setLeaveError("Network error. Please try again.");
    }
    setLeaving(false);
  }

  async function handleDeleteInquiry(inquiryId: string) {
    setDeletingInquiry(true);
    setDeleteError("");
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}`, { method: "DELETE" });
      if (res.ok) {
        setSelfDirected((prev) => prev.filter((c) => c.id !== inquiryId));
        setConfirmDeleteInquiry(null);
      } else {
        setDeleteError("Failed to remove. Please try again.");
      }
    } catch {
      setDeleteError("Network error. Please try again.");
    }
    setDeletingInquiry(false);
  }

  function subjectLabel(s: string) {
    return s.charAt(0) + s.slice(1).toLowerCase();
  }

  return (
    <div>
      <VideoHero userName={userName} />

      {/* Spacer so the hero occupies the full first screen */}
      <div className="h-screen" />

      {/* Scroll-down section */}
      <div className="relative z-10 min-h-screen border-t border-[rgba(168,152,128,0.10)] rounded-t-3xl">
        <div className="max-w-3xl mx-auto px-6 py-16">

          {/* Enrolled Classes — primary section */}
          {enrolledClasses.length > 0 && (
            <section className="mb-12">
              <h2 className="font-display font-semibold text-[18px] text-text-primary mb-4">
                Your Classes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {enrolledClasses.map((c) => (
                  <div key={c.id} className="relative group">
                    <Link
                      href={`/app/enrolled/${c.id}`}
                      className="block bg-[rgba(40,32,24,0.40)] border border-[rgba(168,152,128,0.12)] rounded-[14px] p-5 transition-all hover:border-accent/20 hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
                    >
                      <h3 className="font-display font-semibold text-[15px] text-text-primary">
                        {c.name}
                      </h3>
                      <p className="text-[12px] text-text-muted mt-1">
                        {subjectLabel(c.subject)}{c.period ? ` · P${c.period}` : ""}
                      </p>
                      <p className="text-[13px] text-text-muted mt-2">
                        {c.teacherName || "Teacher"}
                      </p>
                    </Link>
                    <button
                      onClick={() => setConfirmLeave(c.id)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[rgba(40,32,24,0.60)] border border-[rgba(168,152,128,0.15)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-red-400"
                      title="Leave class"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Join class card */}
                <button
                  onClick={() => setShowJoin(true)}
                  className="flex flex-col items-center justify-center bg-[rgba(40,32,24,0.25)] border border-dashed border-[rgba(168,152,128,0.20)] rounded-[14px] p-5 transition-all hover:border-accent/30 hover:bg-[rgba(40,32,24,0.40)] min-h-[100px]"
                >
                  <span className="text-accent text-[20px] leading-none mb-1">+</span>
                  <span className="text-[13px] font-display text-text-secondary">Join a Class</span>
                </button>
              </div>
            </section>
          )}

          {/* No classes yet — prominent join CTA */}
          {enrolledClasses.length === 0 && (
            <section className="mb-12 text-center">
              <h2 className="font-display font-semibold text-[18px] text-text-primary mb-2">
                Get Started
              </h2>
              <p className="text-[14px] text-text-muted mb-6">
                Join a class to start learning with your teacher&apos;s materials.
              </p>
              <button
                onClick={() => setShowJoin(true)}
                className="bg-accent hover:bg-accent/90 text-[#281c14] font-display text-[13px] font-semibold rounded-full px-6 py-2.5 transition-colors"
              >
                + Join a Class
              </button>
            </section>
          )}

          {leaveError && (
            <p className="text-red-400 text-xs text-center mb-4">{leaveError}</p>
          )}

          {/* Self-directed session — secondary */}
          <section className="border-t border-[rgba(168,152,128,0.08)] pt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display font-semibold text-[15px] text-text-secondary">
                  Self-Directed Study
                </h2>
                <p className="text-[12px] text-text-muted mt-0.5">
                  Create your own tutoring session on any topic.
                </p>
              </div>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-[rgba(168,152,128,0.08)] border border-[rgba(168,152,128,0.18)] hover:bg-[rgba(168,152,128,0.14)] text-text-secondary text-[12px] font-display font-semibold rounded-full px-4 py-2 transition-colors"
                >
                  Create Session
                </button>
              )}
            </div>

            {showForm && (
              <AddClassForm onCancel={() => setShowForm(false)} />
            )}

            {/* Past self-directed sessions */}
            {selfDirected.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {selfDirected.map((c) => (
                  <div key={c.id} className="relative group">
                    <Link
                      href={`/app/start/${c.id}`}
                      className="block bg-[rgba(40,32,24,0.30)] border border-[rgba(168,152,128,0.10)] rounded-[14px] p-4 transition-all hover:border-accent/20 hover:bg-[rgba(40,32,24,0.45)]"
                    >
                      <h4 className="font-display font-semibold text-[14px] text-text-primary truncate">
                        {c.unitName}
                      </h4>
                      <p className="text-[12px] text-text-muted mt-1">
                        {subjectLabel(c.subject)} · {c.teacherName}
                      </p>
                      <p className="text-[11px] text-text-muted/70 mt-1.5">
                        {c.sessionCount} {c.sessionCount === 1 ? "session" : "sessions"}
                      </p>
                    </Link>
                    <button
                      onClick={() => setConfirmDeleteInquiry(c.id)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[rgba(40,32,24,0.60)] border border-[rgba(168,152,128,0.15)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-red-400"
                      title="Remove"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {deleteError && (
              <p className="text-red-400 text-xs mt-3">{deleteError}</p>
            )}
          </section>
        </div>
      </div>

      {showJoin && (
        <JoinClassModal
          onJoined={() => { setShowJoin(false); router.refresh(); }}
          onClose={() => setShowJoin(false)}
        />
      )}

      <ConfirmModal
        open={!!confirmLeave}
        title="Leave this class?"
        message="You'll be unenrolled from this class. You can rejoin with the class code."
        confirmLabel="Leave"
        onConfirm={() => confirmLeave && handleLeave(confirmLeave)}
        onCancel={() => setConfirmLeave(null)}
        loading={leaving}
      />

      <ConfirmModal
        open={!!confirmDeleteInquiry}
        title="Remove this study?"
        message="All sessions, files, and chat history will be deleted."
        onConfirm={() => confirmDeleteInquiry && handleDeleteInquiry(confirmDeleteInquiry)}
        onCancel={() => setConfirmDeleteInquiry(null)}
        loading={deletingInquiry}
      />
    </div>
  );
}
