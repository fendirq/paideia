"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { HelpTypeSelect } from "./help-type-select";

interface FileItem {
  id: string;
  fileName: string;
  fileType: string;
  extractedText: string | null;
  createdAt: string;
}

interface FileCabinetProps {
  files: FileItem[];
  inquiryId: string;
  unitName: string;
  teacherName: string;
  subject: string;
  description: string;
  chunkCount: number;
  teacherNotes?: string | null;
  isTeacher?: boolean;
}

export function FileCabinet({
  files,
  inquiryId,
  unitName,
  teacherName,
  subject,
  description,
  chunkCount,
  teacherNotes,
  isTeacher,
}: FileCabinetProps) {
  const [selectedFileId, setSelectedFileId] = useState<string | null>(
    files[0]?.id ?? null
  );
  const [showHelpSelect, setShowHelpSelect] = useState(false);

  const selectedFile = files.find((f) => f.id === selectedFileId);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-bg-inner">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/app"
            className="text-sm text-text-muted hover:text-text-primary transition-colors inline-flex items-center gap-1 mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Back
          </Link>
          <h1 className="text-2xl font-display font-bold">{unitName}</h1>
          <p className="text-text-muted text-sm">
            {subject.charAt(0) + subject.slice(1).toLowerCase()} &middot; {teacherName}
          </p>
          {description && (
            <p className="text-text-secondary text-sm mt-2 max-w-2xl">
              {description}
            </p>
          )}
          {isTeacher && (
            <div className="mt-4">
              <NotesField inquiryId={inquiryId} defaultNotes={teacherNotes ?? ""} />
            </div>
          )}
        </div>

        {/* Two-panel layout */}
        <div className="flex gap-6 min-h-[500px]">
          {/* Left: File list */}
          <div className="w-72 shrink-0">
            <div className="bg-bg-surface/50 border border-white/[0.04] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.04]">
                <h2 className="text-sm font-display font-semibold text-text-secondary">
                  Files ({files.length})
                </h2>
              </div>
              <div className="divide-y divide-white/[0.03]">
                {files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => setSelectedFileId(file.id)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      selectedFileId === file.id
                        ? "bg-bg-elevated/50"
                        : "hover:bg-bg-elevated/30"
                    }`}
                  >
                    <p className="text-sm font-medium text-text-primary truncate">
                      {file.fileName}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {file.fileType.split("/").pop()?.toUpperCase()} &middot;{" "}
                      {new Date(file.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </button>
                ))}
                {files.length === 0 && (
                  <p className="px-4 py-6 text-sm text-text-muted text-center">
                    No files uploaded yet.
                  </p>
                )}
              </div>
            </div>

            {chunkCount > 0 && (
              <p className="text-xs text-text-muted mt-3 px-1">
                {chunkCount} chunk{chunkCount !== 1 ? "s" : ""} indexed
              </p>
            )}
          </div>

          {/* Right: File preview */}
          <div className="flex-1 bg-bg-surface/50 border border-white/[0.04] rounded-xl overflow-hidden">
            {/* Start Session CTA */}
            <div className="px-6 py-4 border-b border-white/[0.04] flex items-center justify-between">
              <h2 className="text-sm font-display font-semibold text-text-secondary">
                {selectedFile?.fileName ?? "Select a file"}
              </h2>
              <button
                onClick={() => setShowHelpSelect(true)}
                className="bg-accent border-2 border-accent-light rounded-full px-5 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(74,157,91,0.3)] hover:bg-accent-light transition-colors"
              >
                Start Session
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[600px]">
              {selectedFile?.extractedText ? (
                <pre className="text-sm text-text-secondary font-body leading-relaxed whitespace-pre-wrap">
                  {selectedFile.extractedText}
                </pre>
              ) : selectedFile ? (
                <p className="text-sm text-text-muted">
                  No text preview available for this file.
                </p>
              ) : (
                <p className="text-sm text-text-muted text-center py-12">
                  Select a file from the left panel to preview.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showHelpSelect && (
        <HelpTypeSelect
          inquiryId={inquiryId}
          subject={subject}
          onClose={() => setShowHelpSelect(false)}
        />
      )}
    </div>
  );
}

function NotesField({ inquiryId, defaultNotes }: { inquiryId: string; defaultNotes: string }) {
  const [notes, setNotes] = useState(defaultNotes);
  const [noteStatus, setNoteStatus] = useState("");
  const savingRef = useRef(false);

  const saveNotes = (value: string) => {
    if (savingRef.current) return;
    savingRef.current = true;
    fetch(`/api/inquiries/${inquiryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherNotes: value }),
    })
      .then((res) => {
        setNoteStatus(res.ok ? "Saved" : "Error saving");
        setTimeout(() => setNoteStatus(""), 2000);
      })
      .catch(() => {
        setNoteStatus("Error saving");
        setTimeout(() => setNoteStatus(""), 2000);
      })
      .finally(() => {
        savingRef.current = false;
      });
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-1.5">
        <label className="block text-xs font-medium text-text-muted">
          Teacher Notes (visible to you only)
        </label>
        <span className="text-xs text-text-muted">{noteStatus}</span>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={(e) => saveNotes(e.target.value)}
        maxLength={5000}
        rows={3}
        placeholder="Add notes about this student's progress..."
        className="w-full max-w-lg bg-bg-surface border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 resize-none"
      />
    </>
  );
}
