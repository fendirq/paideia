"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RoleSelector() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function selectRole(role: "STUDENT" | "TEACHER") {
    setLoading(role);

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });

    if (res.ok) {
      router.push("/app");
      router.refresh();
    } else {
      setLoading(null);
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Welcome to Paideia</h1>
        <p className="text-text-secondary">
          Tell us about yourself to get started.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => selectRole("STUDENT")}
          disabled={loading !== null}
          className="card p-6 text-center hover:border-accent transition-colors group disabled:opacity-50"
        >
          <svg
            className="w-10 h-10 mx-auto mb-3 text-text-secondary group-hover:text-accent transition-colors"
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
          <span className="font-display font-semibold text-text-primary">
            {loading === "STUDENT" ? "Setting up..." : "I'm a Student"}
          </span>
        </button>

        <button
          onClick={() => selectRole("TEACHER")}
          disabled={loading !== null}
          className="card p-6 text-center hover:border-accent transition-colors group disabled:opacity-50"
        >
          <svg
            className="w-10 h-10 mx-auto mb-3 text-text-secondary group-hover:text-accent transition-colors"
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
          <span className="font-display font-semibold text-text-primary">
            {loading === "TEACHER" ? "Setting up..." : "I'm a Teacher"}
          </span>
        </button>
      </div>
    </div>
  );
}
