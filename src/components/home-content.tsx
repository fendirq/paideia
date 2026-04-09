"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VideoHero } from "@/components/video-hero";
import { AddClassForm } from "@/components/add-class-form";
import { JoinClassModal } from "@/components/join-class-modal";

interface EnrolledClass {
  id: string;
  name: string;
  subject: string;
  period: number | null;
  teacherName: string | null;
  studentCount: number;
}

interface HomeContentProps {
  userName?: string | null;
  enrolledClasses?: EnrolledClass[];
}

export function HomeContent({ userName, enrolledClasses = [] }: HomeContentProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

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
                  <Link
                    key={c.id}
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
          </section>
        </div>
      </div>

      {showJoin && (
        <JoinClassModal
          onJoined={() => { setShowJoin(false); router.refresh(); }}
          onClose={() => setShowJoin(false)}
        />
      )}
    </div>
  );
}
