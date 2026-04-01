"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const [showPasscode, setShowPasscode] = useState(false);
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
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Paideia</h1>
        <p className="text-text-secondary text-sm">
          AI-powered tutoring for Drew School
        </p>
      </div>

      <button
        onClick={handleGoogleSignIn}
        className="btn-primary w-full flex items-center justify-center gap-3"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-bg-elevated" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-bg-base px-2 text-text-muted">or</span>
        </div>
      </div>

      {!showPasscode ? (
        <button
          onClick={() => setShowPasscode(true)}
          className="w-full text-center text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          Enter with passcode
        </button>
      ) : (
        <form onSubmit={handlePasscodeSubmit} className="space-y-3">
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter passcode"
            className="w-full bg-bg-surface border border-bg-elevated rounded-lg px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading || !passcode}
            className="btn-secondary w-full disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Enter as Guest"}
          </button>
        </form>
      )}

      <p className="text-text-muted text-xs text-center">
        Paideia is exclusively for Drew School students and faculty.
      </p>
    </div>
  );
}
