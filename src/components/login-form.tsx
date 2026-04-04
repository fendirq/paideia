"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleGoogleSignIn() {
    signIn("google", { callbackUrl: "/app" });
  }

  async function handlePasscodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("passcode", {
      passcode,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid passcode.");
      setLoading(false);
    } else {
      window.location.href = "/app";
    }
  }

  return (
    <div className="w-full max-w-[400px] bg-[rgba(34,33,30,0.7)] backdrop-blur-[20px] border border-white/[0.06] rounded-[20px] p-8 space-y-6">
      {/* Google OAuth */}
      <button
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 bg-white text-[#1a1915] font-display text-[14px] font-semibold rounded-[12px] px-5 py-3.5 hover:bg-white/90 transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/[0.06]" />
        </div>
        <div className="relative flex justify-center text-[12px]">
          <span className="bg-[rgba(34,33,30,0.7)] px-3 text-text-muted font-display">
            or
          </span>
        </div>
      </div>

      {/* Passcode form */}
      <form onSubmit={handlePasscodeSubmit} className="space-y-3">
        <input
          type="password"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Enter passcode"
          className="w-full bg-bg-surface/50 border border-white/[0.06] rounded-[12px] px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
        />
        {error && <p className="text-red-400 text-[13px]">{error}</p>}
        <button
          type="submit"
          disabled={loading || !passcode}
          className="w-full bg-accent hover:bg-accent/90 text-white font-display text-[14px] font-semibold rounded-[12px] px-5 py-3.5 transition-colors disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Enter"}
        </button>
      </form>

      <p className="text-text-muted text-[12px] text-center leading-relaxed">
        Exclusively for Drew School students and faculty.
      </p>
    </div>
  );
}
