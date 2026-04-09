"use client";

import { useState } from "react";

interface JoinClassModalProps {
  onJoined: () => void;
  onClose: () => void;
}

export function JoinClassModal({ onJoined, onClose }: JoinClassModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/classes/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joinCode: code.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to join class");
        setLoading(false);
        return;
      }

      setSuccess(`Joined ${data.className}!`);
      setLoading(false);
      setTimeout(() => {
        onJoined();
      }, 1200);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[rgba(30,25,20,0.70)] backdrop-blur-sm" onClick={loading ? undefined : onClose} />
      <div className="relative bg-bg-surface border border-[rgba(168,152,128,0.15)] rounded-[20px] p-8 w-full max-w-sm space-y-5">
        <h3 className="font-display font-semibold text-lg text-text-primary">Join a Class</h3>
        <p className="text-[13px] text-text-muted">Enter the class code from your teacher.</p>

        {success ? (
          <div className="text-center py-4">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-accent-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-text-primary font-medium text-[14px]">{success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. A1B2C3"
              maxLength={8}
              className="w-full bg-bg-inner border border-[rgba(168,152,128,0.15)] rounded-[12px] px-4 py-3 text-center text-[18px] font-mono tracking-[0.3em] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors uppercase"
              autoFocus
            />

            {error && <p className="text-red-400 text-[13px] text-center">{error}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="flex-1 bg-accent hover:bg-accent/90 text-[#281c14] font-display text-[14px] font-semibold rounded-[12px] px-5 py-3 transition-colors disabled:opacity-50"
              >
                {loading ? "Joining..." : "Join"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 text-[14px] text-text-muted hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
