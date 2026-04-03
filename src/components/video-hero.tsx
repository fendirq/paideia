"use client";

import { useEffect, useState } from "react";

export function VideoHero() {
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    function handleScroll() {
      const scrollY = window.scrollY;
      const fadeEnd = window.innerHeight * 0.6;
      setOpacity(Math.max(0, 1 - scrollY / fadeEnd));
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Fixed video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Hero overlay */}
      <div className="relative z-10 h-screen flex flex-col items-center justify-center">
        <h1
          className="font-display font-bold text-6xl md:text-8xl text-white tracking-[0.15em] drop-shadow-lg transition-opacity duration-300"
          style={{ opacity }}
        >
          PAIDEIA
        </h1>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-12 flex flex-col items-center gap-2 text-white/50 transition-opacity duration-300"
          style={{ opacity }}
        >
          <span className="text-xs font-body tracking-widest uppercase">Scroll</span>
          <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </div>
    </>
  );
}
