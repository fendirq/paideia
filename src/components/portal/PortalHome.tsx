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
      <div className="relative z-10 min-h-screen border-t border-[rgba(168,152,128,0.10)] rounded-t-3xl">
        <div className="flex flex-col items-center py-20 gap-6">
          {/* Writing Profile link */}
          <Link
            href="/portal/aggregate"
            className="group flex items-center gap-4 px-5 py-3 rounded-2xl border border-[rgba(168,152,128,0.18)] bg-[rgba(40,32,24,0.40)] hover:bg-[rgba(40,32,24,0.60)] hover:border-accent/30 hover:shadow-[0_0_20px_rgba(168,152,128,0.12)] backdrop-blur-xl transition-all duration-300"
          >
            <span className="w-9 h-9 rounded-xl bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center transition-colors shrink-0">
              <svg className="w-[18px] h-[18px] text-accent group-hover:text-accent-light transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4 10.5a7.464 7.464 0 0 1-1.15 3.993m1.989 3.559A11.209 11.209 0 0 0 8.25 10.5a3.75 3.75 0 1 1 7.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 0 1-3.6 9.75m6.633-4.596a18.666 18.666 0 0 1-2.485 5.33" />
              </svg>
            </span>
            <div className="flex-1">
              <span className="text-sm font-display font-semibold text-text-primary block">
                {hasProfile ? "Writing Profile" : "Create Writing Profile"}
              </span>
              <span className="text-[11px] text-text-muted">
                {hasProfile ? "View your style fingerprint" : "Build your style fingerprint"}
              </span>
            </div>
            <svg className="w-4 h-4 text-text-muted/50 group-hover:text-text-muted group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                    className="bg-[rgba(40,32,24,0.35)] backdrop-blur-xl border border-[rgba(168,152,128,0.20)] rounded-full px-6 py-2 text-[13px] font-medium text-text-primary hover:bg-[rgba(40,32,24,0.55)] transition-colors"
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
