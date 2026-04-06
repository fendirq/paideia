"use client";

import { useState } from "react";
import Link from "next/link";
import { Document, Packer, Paragraph, TextRun } from "docx";

interface EssayOutputProps {
  essay: string;
  generating: boolean;
  onRegenerate: () => void;
}

export function EssayOutput({ essay, generating, onRegenerate }: EssayOutputProps) {
  const [copied, setCopied] = useState(false);
  const wordCount = essay.split(/\s+/).filter(Boolean).length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(essay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    const paragraphs = essay.split("\n\n").map(
      (text) =>
        new Paragraph({
          children: [
            new TextRun({
              text,
              font: "Times New Roman",
              size: 24, // 12pt
            }),
          ],
          spacing: { after: 200 },
        })
    );

    const doc = new Document({
      sections: [{ children: paragraphs }],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "essay.docx";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-text-primary">
          Output
          {!generating && (
            <span className="ml-2 text-text-muted font-normal">
              {wordCount} words
            </span>
          )}
        </h3>
        {generating && (
          <span className="text-xs text-accent animate-pulse">Generating...</span>
        )}
      </div>

      {/* Essay text */}
      <div className="bg-bg-base border border-white/[0.06] rounded-xl p-5 max-h-[60vh] overflow-y-auto">
        <div className="font-serif text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
          {essay || "Waiting for output..."}
        </div>
      </div>

      {/* Actions */}
      {!generating && essay && (
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleCopy}
            className="text-xs px-4 py-2 rounded-full bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
          >
            {copied ? "Copied!" : "Copy to Clipboard"}
          </button>
          <button
            onClick={handleDownload}
            className="text-xs px-4 py-2 rounded-full bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
          >
            Download .docx
          </button>
          <button
            onClick={onRegenerate}
            className="text-xs px-4 py-2 rounded-full bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
          >
            Regenerate
          </button>
          <Link
            href="/portal/aggregate"
            className="text-xs px-4 py-2 rounded-full bg-white/[0.04] text-text-muted hover:text-text-secondary transition-colors"
          >
            Edit Profile
          </Link>
        </div>
      )}
    </div>
  );
}
