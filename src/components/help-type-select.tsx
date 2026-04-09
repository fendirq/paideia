"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HELP_TYPES, DEFAULT_HELP_TYPES } from "@/lib/help-types";

interface HelpTypeSelectProps {
  inquiryId: string;
  subject: string;
  onClose: () => void;
}

export function HelpTypeSelect({ inquiryId, subject, onClose }: HelpTypeSelectProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const helpTypes = HELP_TYPES[subject] ?? DEFAULT_HELP_TYPES;

  const startSession = (helpType: string) => {
    setLoading(helpType);
    router.push(`/app/sessions/new?inquiry=${encodeURIComponent(inquiryId)}&helpType=${encodeURIComponent(helpType)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(30,25,20,0.70)] backdrop-blur-sm">
      <div className="bg-bg-surface border border-[rgba(168,152,128,0.15)] rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display font-semibold text-lg">How can I help?</h2>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-text-muted">Choose what you need help with to get started.</p>
        </div>
        <div className="px-6 pb-6 space-y-2">
          {helpTypes.map((ht) => (
            <button
              key={ht.value}
              onClick={() => startSession(ht.value)}
              disabled={loading !== null}
              className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${
                loading === ht.value
                  ? "border-accent bg-accent/10"
                  : "border-[rgba(168,152,128,0.15)] hover:border-accent/30 hover:bg-bg-elevated/50"
              } disabled:opacity-60`}
            >
              <p className="text-sm font-medium text-text-primary">{ht.label}</p>
              <p className="text-xs text-text-muted mt-0.5">{ht.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
