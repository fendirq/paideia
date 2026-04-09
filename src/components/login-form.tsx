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
  const [mode, setMode] = useState<"login" | "passcode">("login");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoginLoading(true);

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
    setError("");

    if (!passcode.trim()) {
      setError("Please enter a passcode.");
      return;
    }

    setCodeLoading(true);

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

      {registered && (
        <p className="text-accent text-sm text-center">
          Account created! Sign in below.
        </p>
      )}

      {error && <p className="text-red-400 text-[13px] text-center">{error}</p>}

      {/* Form */}
      {mode === "login" ? (
        <form onSubmit={handleLogin} className="space-y-7">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              className="w-full bg-transparent border-b border-[rgba(168,152,128,0.20)] px-0 pt-5 pb-2 text-[14px] text-text-primary focus:outline-none focus:border-accent transition-colors"
              autoComplete="email"
            />
            <label className={`absolute left-0 transition-all duration-200 pointer-events-none font-display ${
              emailFocused || email
                ? "top-0 text-[10px] tracking-[0.15em] text-accent uppercase"
                : "top-5 text-[14px] text-text-primary"
            }`}>
              Email
            </label>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPassFocused(true)}
              onBlur={() => setPassFocused(false)}
              className="w-full bg-transparent border-b border-[rgba(168,152,128,0.20)] px-0 pt-5 pb-2 pr-12 text-[14px] text-text-primary focus:outline-none focus:border-accent transition-colors"
              autoComplete="current-password"
            />
            <label className={`absolute left-0 transition-all duration-200 pointer-events-none font-display ${
              passFocused || password
                ? "top-0 text-[10px] tracking-[0.15em] text-accent uppercase"
                : "top-5 text-[14px] text-text-primary"
            }`}>
              Password
            </label>
            {password && (
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-0 bottom-2 text-[11px] text-text-muted hover:text-accent transition-colors font-display"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-accent hover:bg-accent-light text-[#281c14] font-display text-[13px] font-semibold rounded-xl py-3 transition-colors disabled:opacity-50"
          >
            {loginLoading ? "Signing in..." : "Sign In"}
          </button>

          <div className="flex items-center justify-between text-[11px]">
            <Link href="/signup" className="text-text-muted hover:text-accent transition-colors">
              Create account
            </Link>
            <button
              type="button"
              onClick={() => setMode("passcode")}
              className="text-text-muted hover:text-accent transition-colors"
            >
              Use passcode
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handlePasscodeSubmit} className="space-y-7">
          <p className="text-text-secondary text-[13px] text-center">
            Enter your teacher&apos;s passcode
          </p>
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Passcode"
            className="w-full bg-transparent border-b border-[rgba(168,152,128,0.20)] px-0 py-2.5 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors text-center tracking-widest"
          />
          <button
            type="submit"
            disabled={codeLoading || !passcode}
            className="w-full bg-accent hover:bg-accent-light text-[#281c14] font-display text-[13px] font-semibold rounded-xl py-3 transition-colors disabled:opacity-50"
          >
            {codeLoading ? "Verifying..." : "Enter"}
          </button>
          <button
            type="button"
            onClick={() => setMode("login")}
            className="block mx-auto text-text-muted text-[11px] hover:text-accent transition-colors"
          >
            Back to sign in
          </button>
        </form>
      )}
    </div>
  );
}
