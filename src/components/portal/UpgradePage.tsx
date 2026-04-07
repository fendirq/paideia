"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface UpgradePageProps {
  hasPaid: boolean;
}

export function UpgradePage({ hasPaid }: UpgradePageProps) {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";
  const canceled = searchParams.get("canceled") === "true";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(hasPaid);
  const [pollTimedOut, setPollTimedOut] = useState(false);

  // Poll for payment confirmation when redirected from Stripe
  useEffect(() => {
    if (!success || hasPaid) return;
    let attempts = 0;
    const poll = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch("/api/portal/payment-status");
        const data = await res.json();
        if (data.hasLevel2) {
          setConfirmed(true);
          clearInterval(poll);
        }
      } catch { /* retry */ }
      if (attempts >= 10) {
        clearInterval(poll);
        setPollTimedOut(true);
      }
    }, 2000);
    return () => clearInterval(poll);
  }, [success, hasPaid]);

  const handleCheckout = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/portal/checkout", { method: "POST" });
      const data = await res.json();
      if (data.alreadyPaid) {
        window.location.reload();
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Something went wrong.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  // Already paid or payment confirmed via polling
  if (confirmed) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
        <div className="glass p-8 max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white mb-2">Level 2 Unlocked</h1>
            <p className="text-white/60 text-sm">
              You now have access to enhanced essay generation powered by Claude Sonnet 4.
            </p>
          </div>
          <Link
            href="/portal/home"
            className="inline-block btn-primary text-sm px-6 py-2.5"
          >
            Back to Portal
          </Link>
        </div>
      </div>
    );
  }

  // Payment redirect but webhook hasn't fired yet
  if (success && !confirmed) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
        <div className="glass p-8 max-w-md w-full text-center space-y-6">
          <div className={`w-16 h-16 rounded-2xl bg-white/[0.06] flex items-center justify-center mx-auto ${pollTimedOut ? "" : "animate-pulse"}`}>
            <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white mb-2">
              {pollTimedOut ? "Almost There" : "Processing Payment..."}
            </h1>
            <p className="text-white/60 text-sm">
              {pollTimedOut
                ? "Your payment was received but confirmation is taking longer than usual. Try refreshing the page."
                : "Confirming your purchase. This usually takes a few seconds."}
            </p>
          </div>
          {pollTimedOut && (
            <button
              onClick={() => window.location.reload()}
              className="btn-primary text-sm px-6 py-2.5"
            >
              Refresh Page
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
      <div className="glass p-8 max-w-lg w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-white mb-2">
            Unlock Level 2
          </h1>
          <p className="text-white/60 text-sm">
            One-time purchase. Enhanced generation forever.
          </p>
        </div>

        {canceled && (
          <p className="text-yellow-400/80 text-sm text-center">
            Payment was canceled. You can try again below.
          </p>
        )}

        {/* Comparison */}
        <div className="space-y-3">
          {/* Level 1 */}
          <div className="border border-white/[0.08] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-display font-semibold text-white">Level 1</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">Current</span>
            </div>
            <ul className="space-y-2 text-sm text-white/50">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                8 profile questions
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Single-pass generation (DeepSeek-V3)
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-white/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Fast and reliable
              </li>
            </ul>
          </div>

          {/* Level 2 */}
          <div className="border border-accent/30 bg-accent/[0.06] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-display font-semibold text-white">Level 2</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent-light">Enhanced</span>
            </div>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-accent-light shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                12 in-depth profile questions
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-accent-light shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Two-pass generation (Claude Sonnet 4)
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-accent-light shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Style fingerprint analysis
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-accent-light shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
                Most accurate voice matching
              </li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full btn-primary text-sm py-3 disabled:opacity-50"
        >
          {loading ? "Redirecting to checkout..." : "Upgrade Now"}
        </button>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <Link
          href="/portal/home"
          className="block text-center text-white/40 hover:text-white/60 text-xs transition-colors"
        >
          Maybe later
        </Link>
      </div>
    </div>
  );
}
