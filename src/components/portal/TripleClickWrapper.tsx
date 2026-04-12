"use client";

import { useRef, useCallback, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface TripleClickWrapperProps {
  children: React.ReactNode;
  href: string;
}

export function TripleClickWrapper({ children, href }: TripleClickWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const clickTimestamps = useRef<number[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPortal = pathname.startsWith("/portal");

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      const now = Date.now();
      clickTimestamps.current.push(now);
      clickTimestamps.current = clickTimestamps.current.filter(
        (t) => now - t < 2000
      );

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (clickTimestamps.current.length >= 3) {
        clickTimestamps.current = [];
        router.push(isPortal ? "/app" : "/portal/home");
        return;
      }

      // Debounce normal navigation to allow triple-click window
      debounceRef.current = setTimeout(() => {
        router.push(href);
      }, 350);
    },
    [router, isPortal, href]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <span onClick={handleClick} className="cursor-pointer">
      {children}
    </span>
  );
}
