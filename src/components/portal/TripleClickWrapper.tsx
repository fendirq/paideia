"use client";

import { useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

interface TripleClickWrapperProps {
  children: React.ReactNode;
}

export function TripleClickWrapper({ children }: TripleClickWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const clickTimestamps = useRef<number[]>([]);
  const isPortal = pathname.startsWith("/portal");

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const now = Date.now();
      clickTimestamps.current.push(now);

      // Keep only clicks within the last 2 seconds
      clickTimestamps.current = clickTimestamps.current.filter(
        (t) => now - t < 2000
      );

      if (clickTimestamps.current.length >= 3) {
        e.preventDefault();
        clickTimestamps.current = [];
        // Toggle: portal → app, app → portal
        router.push(isPortal ? "/app" : "/portal/access");
      }
    },
    [router, isPortal]
  );

  return <span onClick={handleClick}>{children}</span>;
}
