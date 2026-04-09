"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { JoinClassModal } from "@/components/join-class-modal";
import { BackButton } from "@/components/back-button";

interface SessionItem {
  id: string;
  unitName: string;
  teacherName: string | null;
  subject: string;
}

interface EnrolledClass {
  id: string;
  name: string;
  subject: string;
  teacherName: string | null;
  studentCount: number;
  joinedAt: string;
}

export default function MyClassesPage() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [enrolled, setEnrolled] = useState<EnrolledClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoin, setShowJoin] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [sessionsRes, enrolledRes] = await Promise.all([
        fetch("/api/classes"),
        fetch("/api/classes/enrolled"),
      ]);

      if (sessionsRes.ok) {
        const data = await sessionsRes.json();
        setSessions(data.classes ?? []);
      }
      if (enrolledRes.ok) {
        setEnrolled(await enrolledRes.json());
      }
    } catch (e) {
      console.error("Failed to load classes:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function subjectLabel(s: string) {
    return s.charAt(0) + s.slice(1).toLowerCase();
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8 mt-4 mb-8">
        <div className="text-center py-12 text-text-muted text-[14px]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 mt-4 mb-8 bg-[rgba(40,32,24,0.55)] backdrop-blur-2xl border border-[rgba(168,152,128,0.15)] rounded-[20px]">
      <BackButton href="/app" />

      <div className="mb-8">
        <h1 className="font-serif text-[34px] text-text-primary">My Classes</h1>
        <p className="text-[15px] text-text-primary mt-1">Your sessions and enrolled classes.</p>
      </div>

      {/* My Sessions */}
      <section className="mb-10">
        <h2 className="font-display font-semibold text-[18px] text-text-primary mb-4">My Sessions</h2>
        {sessions.length === 0 ? (
          <p className="text-[14px] text-text-muted py-4">No sessions yet. Create one from the home page.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((s) => (
              <Link
                key={s.id}
                href={`/app/start/${s.id}`}
                className="block bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[14px] p-5 transition-all hover:border-accent/20 hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
              >
                <h3 className="font-display font-semibold text-[15px] text-text-primary">{s.unitName}</h3>
                <p className="text-[12px] text-text-muted mt-1">{subjectLabel(s.subject)}</p>
                <p className="text-[13px] text-text-muted mt-2">{s.teacherName || "Teacher"}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Teacher Classes */}
      <section>
        <h2 className="font-display font-semibold text-[18px] text-text-primary mb-4">Teacher Classes</h2>
        {enrolled.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-[14px] text-text-muted mb-4">No teacher classes yet.</p>
            <button
              onClick={() => setShowJoin(true)}
              className="bg-accent hover:bg-accent/90 text-[#281c14] font-display text-[13px] font-semibold rounded-full px-5 py-2.5 transition-colors"
            >
              + Join Class
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrolled.map((c) => (
              <Link
                key={c.id}
                href={`/app/enrolled/${c.id}`}
                className="block bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[14px] p-5 transition-all hover:border-accent/20 hover:shadow-[0_4px_16px_rgba(0,0,0,0.15)]"
              >
                <h3 className="font-display font-semibold text-[15px] text-text-primary">{c.name}</h3>
                <p className="text-[12px] text-text-muted mt-1">{subjectLabel(c.subject)}</p>
                <div className="flex gap-4 mt-2 text-[13px] text-text-muted">
                  <span>{c.teacherName || "Teacher"}</span>
                  <span>{c.studentCount} student{c.studentCount !== 1 ? "s" : ""}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {showJoin && (
        <JoinClassModal
          onJoined={() => { setShowJoin(false); fetchData(); }}
          onClose={() => setShowJoin(false)}
        />
      )}
    </div>
  );
}
