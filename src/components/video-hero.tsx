"use client";

import { useEffect, useRef } from "react";

interface VideoHeroProps {
  userName?: string | null;
}

export function VideoHero({ userName }: VideoHeroProps) {
  const displayName = userName?.split(" ")[0] ?? "there";
  const videoRef = useRef<HTMLVideoElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const progress = Math.min(scrollY / vh, 1);

      if (videoRef.current) {
        const scale = 1 + progress * 0.2;
        videoRef.current.style.transform = `scale(${scale})`;
      }

      if (textRef.current) {
        const opacity = Math.max(1 - scrollY / (vh * 0.4), 0);
        const translateY = scrollY * 0.3;
        textRef.current.style.opacity = String(opacity);
        textRef.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-0 h-screen w-full z-0 overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover will-change-transform"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Centered welcome */}
      <div ref={textRef} className="absolute inset-0 flex items-center justify-center will-change-[opacity,transform]">
        <h1 className="font-display text-[42px] md:text-[56px] font-bold tracking-[0.1em] text-text-primary drop-shadow-lg text-center">
          Welcome, {displayName}.
        </h1>
      </div>
    </div>
  );
}
