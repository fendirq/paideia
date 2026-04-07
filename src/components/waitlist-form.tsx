"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function WaitlistForm() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setCodeLoading(true);
    setCodeError("");

    try {
      const result = await signIn("passcode", {
        passcode: code,
        redirect: false,
      });

      if (result?.error) {
        setCodeError("Invalid code.");
      } else {
        window.location.href = "/app";
        return;
      }
    } finally {
      setCodeLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
          <svg className="w-5 h-5 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <p className="text-white font-display font-semibold text-sm">You&apos;re on the list!</p>
        <p className="text-text-secondary text-xs">We&apos;ll text you when Paideia is ready.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(555) 123-4567"
          className="w-full bg-bg-surface/50 border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
          autoComplete="tel"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-accent/90 text-white font-display text-[13px] font-semibold rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
        >
          {loading ? "Joining..." : "Join Waitlist"}
        </button>
        {error && <p className="text-red-400 text-[11px] text-center">{error}</p>}
      </form>

      <button
        onClick={() => setCodeOpen(!codeOpen)}
        className="block w-full text-center bg-bg-surface/50 border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-text-muted hover:text-text-primary transition-colors"
      >
        Access with Code
      </button>

      {codeOpen && (
        <form onSubmit={handleCodeSubmit} className="space-y-2">
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter access code"
            className="w-full bg-bg-surface/50 border border-white/[0.06] rounded-lg px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
            autoFocus
          />
          <button
            type="submit"
            disabled={codeLoading || !code}
            className="w-full bg-accent hover:bg-accent/90 text-white font-display text-[13px] font-semibold rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
          >
            {codeLoading ? "Verifying..." : "Enter"}
          </button>
          {codeError && <p className="text-red-400 text-[11px] text-center">{codeError}</p>}
        </form>
      )}
    </div>
  );
}
