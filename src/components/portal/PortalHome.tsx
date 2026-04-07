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
          {/* Writing Profile link — slim banner row */}
          <Link
            href="/portal/aggregate"
            className="group flex items-center gap-3 px-6 py-2 rounded-full border border-white/20 bg-black/30 hover:bg-black/40 backdrop-blur-xl transition-all"
          >
            <svg className="w-4.5 h-4.5 text-white/40 group-hover:text-white/60 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
            </svg>
            <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors flex-1">
              {hasProfile ? "Writing Profile" : "Create Writing Profile"}
            </span>
            <svg className="w-4 h-4 text-white/20 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
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
