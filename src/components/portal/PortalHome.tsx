"use client";

import Link from "next/link";
import { VideoHero } from "@/components/video-hero";

interface ClassItem {
  id: string;
  name: string;
  subject: string;
}

interface PortalHomeProps {
  userName?: string | null;
  classes: ClassItem[];
  hasProfile: boolean;
}

const ESSAY_SUBJECTS = ["HISTORY", "ENGLISH", "HUMANITIES"];

export function PortalHome({ userName, classes, hasProfile }: PortalHomeProps) {
  return (
    <div>
      <VideoHero userName={userName} greeting="With ez" />

      {/* Spacer so the hero occupies the full first screen */}
      <div className="h-screen" />

      {/* Scroll-down section */}
      <div className="relative z-10 min-h-screen border-t border-white/[0.1] rounded-t-3xl">
        <div className="flex flex-col items-center py-20 gap-6">
          {/* Aggregate Writing button — solid green, white text */}
          <Link
            href="/portal/aggregate"
            className="flex flex-col items-center gap-4 group"
          >
            <div className="w-16 h-16 rounded-full bg-accent border-2 border-accent-light flex items-center justify-center shadow-[0_0_20px_rgba(74,157,91,0.3)] group-hover:bg-accent-light transition-colors">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </div>
            <span className="bg-accent hover:bg-accent-light rounded-full px-6 py-2 text-[13px] font-medium text-white transition-colors">
              {hasProfile ? "Edit Writing Profile" : "Aggregate Writing"}
            </span>
          </Link>

          {/* Class pills — same style as main app */}
          {classes.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 mt-4 max-w-2xl px-6">
              {classes.map((cls) => {
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
                    className="bg-black/30 backdrop-blur-xl border border-white/20 rounded-full px-6 py-2 text-[13px] font-medium text-white hover:bg-black/40 transition-colors"
                  >
                    {cls.name}
                  </Link>
                );
              })}
            </div>
          )}

          {classes.length === 0 && (
            <p className="text-text-muted text-sm mt-4">
              No classes yet. Add classes from the main app first.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
