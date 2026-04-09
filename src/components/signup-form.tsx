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

      // Auto-login and redirect to onboarding
      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Account created but auto-login failed — fall back to manual login
        window.location.href = "/login?registered=true";
        return;
      }

      window.location.href = "/onboarding";
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="input-field w-full"
        autoComplete="name"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="input-field w-full"
        autoComplete="email"
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone number"
        className="input-field w-full"
        autoComplete="tel"
      />
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 8 characters)"
          className="input-field w-full pr-14"
          autoComplete="new-password"
        />
        {password && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-text-muted hover:text-accent transition-colors font-display"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>
      <div className="relative">
        <input
          type={showConfirm ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm password"
          className="input-field w-full pr-14"
          autoComplete="new-password"
        />
        {confirm && (
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-text-muted hover:text-accent transition-colors font-display"
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-2.5 text-sm disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>

      <p className="text-center text-text-muted text-xs">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:text-accent-light transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  );
}
