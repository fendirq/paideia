"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export function PinInput() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const submit = useCallback(
    async (code: string) => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch("/api/portal/verify-code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        if (res.ok) {
          router.push("/portal/home");
        } else {
          setError(true);
          setDigits(Array(6).fill(""));
          setTimeout(() => inputsRef.current[0]?.focus(), 300);
        }
      } catch {
        setError(true);
        setDigits(Array(6).fill(""));
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError(false);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (value && index === 5) {
      const code = next.join("");
      if (code.length === 6) submit(code);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    if (pasted.length === 6) {
      submit(pasted);
    } else {
      inputsRef.current[pasted.length]?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className={`flex gap-3 ${error ? "animate-shake" : ""}`}
        onPaste={handlePaste}
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputsRef.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={loading}
            autoFocus={i === 0}
            className="w-12 h-14 text-center text-xl font-mono bg-white/[0.06] border border-white/[0.1] rounded-xl text-text-primary focus:outline-none focus:border-accent/60 transition-colors disabled:opacity-50"
          />
        ))}
      </div>
      {error && (
        <p className="text-red-400 text-sm">Invalid code. Try again.</p>
      )}
      {loading && (
        <p className="text-text-muted text-sm">Verifying...</p>
      )}
    </div>
  );
}
