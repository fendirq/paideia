"use client";

import { usePathname } from "next/navigation";

export function BackgroundVideo() {
  const pathname = usePathname();
  const isSessionPage = /^\/app\/sessions\/[^/]+$/.test(pathname);

  if (isSessionPage) return null;

  return (
    <div className="fixed inset-0 h-screen w-full z-0 overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
