"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!email.includes("@")) {
      setError("Enter a valid email address");
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Enter a valid 10-digit phone number");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        window.location.href = "/login?registered=true";
        return;
      }

      window.location.href = "/onboarding";
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  const labelCls = (focused: boolean, value: string) =>
    `absolute left-0 transition-all duration-200 pointer-events-none font-display ${
      focused || value
        ? "top-0 text-[10px] tracking-[0.15em] text-accent uppercase"
        : "top-5 text-[14px] text-text-primary"
    }`;

  const inputCls =
    "w-full bg-transparent border-b border-[rgba(168,152,128,0.20)] px-0 pt-5 pb-2 text-[14px] text-text-primary focus:outline-none focus:border-accent transition-colors";

  return (
    <div className="w-full max-w-[300px] space-y-7">
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

      {error && <p className="text-red-400 text-[13px] text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-7">
        <div className="relative">
          <input
            id="signup-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            className={inputCls}
            autoComplete="name"
          />
          <label htmlFor="signup-name" className={labelCls(nameFocused, name)}>
            Name
          </label>
        </div>

        <div className="relative">
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            className={inputCls}
            autoComplete="email"
          />
          <label htmlFor="signup-email" className={labelCls(emailFocused, email)}>
            Email
          </label>
        </div>

        <div className="relative">
          <input
            id="signup-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onFocus={() => setPhoneFocused(true)}
            onBlur={() => setPhoneFocused(false)}
            className={inputCls}
            autoComplete="tel"
          />
          <label htmlFor="signup-phone" className={labelCls(phoneFocused, phone)}>
            Phone
          </label>
        </div>

        <div className="relative">
          <input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setPassFocused(true)}
            onBlur={() => setPassFocused(false)}
            className={`${inputCls} pr-12`}
            autoComplete="new-password"
          />
          <label htmlFor="signup-password" className={labelCls(passFocused, password)}>
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

        <div className="relative">
          <input
            id="signup-confirm-password"
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onFocus={() => setConfirmFocused(true)}
            onBlur={() => setConfirmFocused(false)}
            className={`${inputCls} pr-12`}
            autoComplete="new-password"
          />
          <label
            htmlFor="signup-confirm-password"
            className={labelCls(confirmFocused, confirm)}
          >
            Confirm Password
          </label>
          {confirm && (
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-0 bottom-2 text-[11px] text-text-muted hover:text-accent transition-colors font-display"
            >
              {showConfirm ? "Hide" : "Show"}
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent hover:bg-accent-light text-[#281c14] font-display text-[13px] font-semibold rounded-xl py-3 transition-colors disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <div className="text-center text-[11px] text-text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:text-accent-light transition-colors">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
