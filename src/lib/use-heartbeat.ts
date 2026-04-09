"use client";

import { useEffect, useRef } from "react";

const HEARTBEAT_INTERVAL = 30_000; // 30 seconds

export function useHeartbeat(sessionId: string) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    function sendHeartbeat() {
      fetch(`/api/sessions/${sessionId}/heartbeat`, { method: "POST" }).catch(() => {
        // Silently ignore heartbeat failures
      });
    }

    // Start interval — first heartbeat fires after 30s, not immediately
    intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

    // Send final heartbeat on tab close
    function handleUnload() {
      if (sessionId) {
        navigator.sendBeacon(`/api/sessions/${sessionId}/heartbeat`);
      }
    }
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [sessionId]);
}
