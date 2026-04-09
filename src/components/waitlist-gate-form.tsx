"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function WaitlistGateForm() {
  const router = useRouter();

  // Email signup state
  const [email, setEmail] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");

  // Code access state
  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState("");
  const [codeFocused, setCodeFocused] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState("");

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    setJoinError("");

    if (!email.trim()) {
      setJoinError("Please enter your email address.");
      return;
    }

    setJoinLoading(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setJoinError(data.error || "Something went wrong.");
        setJoinLoading(false);
        return;
      }

      setJoined(true);
    } catch {
      setJoinError("Something went wrong. Try again.");
      setJoinLoading(false);
    }
  }

  async function handleCode(e: React.FormEvent) {
    e.preventDefault();
    setCodeError("");

    if (!code.trim()) {
      setCodeError("Please enter your access code.");
      return;
    }

    setCodeLoading(true);

    try {
      const res = await fetch("/api/waitlist/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCodeError(data.error || "Invalid code.");
        setCodeLoading(false);
        return;
      }

      router.push("/login");
    } catch {
      setCodeError("Something went wrong. Try again.");
      setCodeLoading(false);
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

      {joined ? (
        /* ── Success state ── */
        <div className="flex flex-col items-center gap-4 pt-2">
          <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center">
            <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-text-primary text-[15px] font-display font-semibold">
            You&apos;re on the list!
          </p>
          <p className="text-text-muted text-[13px] text-center">
            We&apos;ll notify you when Paideia is ready.
          </p>
        </div>
      ) : (
        /* ── Email signup form ── */
        <>
          <p className="text-text-secondary text-[13px] text-center">
            Join the waitlist
          </p>

          {joinError && <p className="text-red-400 text-[13px] text-center">{joinError}</p>}

          <form onSubmit={handleJoin} className="space-y-7">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                className="w-full bg-transparent border-b border-[rgba(168,152,128,0.20)] px-0 pt-5 pb-2 text-[14px] text-text-primary focus:outline-none focus:border-accent transition-colors"
                autoComplete="email"
                autoFocus
              />
              <label
                className={`absolute left-0 transition-all duration-200 pointer-events-none font-display ${
                  emailFocused || email
                    ? "top-0 text-[10px] tracking-[0.15em] text-accent uppercase"
                    : "top-5 text-[14px] text-text-primary"
                }`}
              >
                Email
              </label>
            </div>

            <button
              type="submit"
              disabled={joinLoading}
              className="w-full bg-accent hover:bg-accent-light text-[#281c14] font-display text-[13px] font-semibold rounded-xl py-3 transition-colors disabled:opacity-50"
            >
              {joinLoading ? "Joining..." : "Join Waitlist"}
            </button>
          </form>
        </>
      )}

      {/* ── Divider + code access ── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[rgba(168,152,128,0.12)]" />
        <button
          type="button"
          onClick={() => setShowCode((v) => !v)}
          className="text-text-muted text-[11px] hover:text-accent transition-colors whitespace-nowrap"
        >
          {showCode ? "Hide" : "Already have an access code?"}
        </button>
        <div className="flex-1 h-px bg-[rgba(168,152,128,0.12)]" />
      </div>

      {showCode && (
        <>
          {codeError && <p className="text-red-400 text-[13px] text-center">{codeError}</p>}

          <form onSubmit={handleCode} className="space-y-7">
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onFocus={() => setCodeFocused(true)}
                onBlur={() => setCodeFocused(false)}
                className="w-full bg-transparent border-b border-[rgba(168,152,128,0.20)] px-0 pt-5 pb-2 text-[14px] text-text-primary focus:outline-none focus:border-accent transition-colors text-center tracking-[0.3em]"
                autoComplete="off"
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
              disabled={codeLoading}
              className="w-full bg-accent hover:bg-accent-light text-[#281c14] font-display text-[13px] font-semibold rounded-xl py-3 transition-colors disabled:opacity-50"
            >
              {codeLoading ? "Verifying..." : "Continue"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
