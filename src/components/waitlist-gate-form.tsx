"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function WaitlistGateForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeFocused, setCodeFocused] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("Please enter your access code.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/waitlist/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Invalid code.");
        setLoading(false);
        return;
      }

      router.push("/login");
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[300px] space-y-7">
      {/* Wordmark */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-px bg-accent/40" />
          <h1 className="font-display font-bold text-xl tracking-[0.25em] text-text-primary">
            PAIDEIA
          </h1>
          <div className="w-8 h-px bg-accent/40" />
        </div>
        <p className="text-text-muted/60 text-[11px] tracking-[0.2em] font-display">EST. 2026</p>
      </div>

      <p className="text-text-secondary text-[13px] text-center">
        Enter your access code to continue.
      </p>

      {error && <p className="text-red-400 text-[13px] text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-7">
        <div className="relative">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onFocus={() => setCodeFocused(true)}
            onBlur={() => setCodeFocused(false)}
            className="w-full bg-transparent border-b border-[rgba(168,152,128,0.20)] px-0 pt-5 pb-2 text-[14px] text-text-primary focus:outline-none focus:border-accent transition-colors text-center tracking-[0.3em]"
            autoComplete="off"
            autoFocus
          />
          <label
            className={`absolute left-0 right-0 text-center transition-all duration-200 pointer-events-none font-display ${
              codeFocused || code
                ? "top-0 text-[10px] tracking-[0.15em] text-accent uppercase"
                : "top-5 text-[14px] text-text-primary"
            }`}
          >
            Access Code
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-accent-light text-[#281c14] font-display text-[13px] font-semibold rounded-xl py-3 transition-colors disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Continue"}
        </button>
      </form>
    </div>
  );
}
