"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export function LoginForm() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoginLoading(false);
    } else {
      window.location.href = "/app";
    }
  }

  async function handlePasscodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCodeLoading(true);
    setError("");

    const result = await signIn("passcode", {
      passcode,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid passcode.");
      setCodeLoading(false);
    } else {
      window.location.href = "/app";
    }
  }

  return (
    <div className="w-full max-w-[400px] bg-[rgba(34,33,30,0.7)] backdrop-blur-[20px] border border-white/[0.06] rounded-[20px] p-8 space-y-6">
      {registered && (
        <p className="text-accent text-sm text-center">
          Account created! Sign in below.
        </p>
      )}

      {/* Email + Password */}
      <form onSubmit={handleLogin} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full bg-bg-surface/50 border border-white/[0.06] rounded-[12px] px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
          autoComplete="email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full bg-bg-surface/50 border border-white/[0.06] rounded-[12px] px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
          autoComplete="current-password"
          required
        />
        {error && <p className="text-red-400 text-[13px]">{error}</p>}
        <button
          type="submit"
          disabled={loginLoading}
          className="w-full bg-accent hover:bg-accent/90 text-white font-display text-[14px] font-semibold rounded-[12px] px-5 py-3.5 transition-colors disabled:opacity-50"
        >
          {loginLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className="text-center text-text-muted text-xs">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-accent hover:text-accent-light transition-colors">
          Sign up
        </Link>
      </p>

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
        <button
          type="submit"
          disabled={codeLoading || !passcode}
          className="w-full bg-accent hover:bg-accent/90 text-white font-display text-[14px] font-semibold rounded-[12px] px-5 py-3.5 transition-colors disabled:opacity-50"
        >
          {codeLoading ? "Verifying..." : "Enter"}
        </button>
      </form>
    </div>
  );
}
