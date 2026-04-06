"use client";

import { useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

interface TripleClickWrapperProps {
  children: React.ReactNode;
}

export function TripleClickWrapper({ children }: TripleClickWrapperProps) {
  const router = useRouter();
  const clickTimestamps = useRef<number[]>([]);

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
        router.push("/portal/access");
      }
    },
    [router]
  );

  return <span onClick={handleClick}>{children}</span>;
}
