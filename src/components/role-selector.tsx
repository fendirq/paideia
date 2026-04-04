"use client";

import { useState } from "react";

export function RoleSelector() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState(false);

  async function selectRole(role: "STUDENT" | "TEACHER") {
    setLoading(role);
    setError(false);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      if (res.ok) {
        window.location.href = "/app";
      } else {
        setError(true);
        setLoading(null);
      }
    } catch {
      setError(true);
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {error && (
        <p className="text-red-400 text-[13px]">
          Something went wrong. Please try again.
        </p>
      )}
      <div className="grid grid-cols-2 gap-5 w-full">
      <button
        onClick={() => selectRole("STUDENT")}
        disabled={loading !== null}
        className="bg-[rgba(34,33,30,0.7)] backdrop-blur-[20px] border border-white/[0.06] rounded-[20px] p-8 text-center transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_12px_28px_rgba(0,0,0,0.2)] group disabled:opacity-50"
        style={{ transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <svg
          className="w-12 h-12 mx-auto mb-4 text-text-secondary group-hover:text-accent transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"
          />
        </svg>
        <span className="font-display font-semibold text-[16px] text-text-primary">
          {loading === "STUDENT" ? "Setting up..." : "Student"}
        </span>
      </button>

      <button
        onClick={() => selectRole("TEACHER")}
        disabled={loading !== null}
        className="bg-[rgba(34,33,30,0.7)] backdrop-blur-[20px] border border-white/[0.06] rounded-[20px] p-8 text-center transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_12px_28px_rgba(0,0,0,0.2)] group disabled:opacity-50"
        style={{ transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <svg
          className="w-12 h-12 mx-auto mb-4 text-text-secondary group-hover:text-accent transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
        <span className="font-display font-semibold text-[16px] text-text-primary">
          {loading === "TEACHER" ? "Setting up..." : "Teacher"}
        </span>
      </button>
      </div>
    </div>
  );
}
