"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc", ".png", ".jpg", ".jpeg", ".heic"];
const MAX_FILE_SIZE = 25 * 1024 * 1024;

interface UploadedFile {
  key: string;
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

interface SessionSetupFormProps {
  classId: string;
}

export function SessionSetupForm({ classId }: SessionSetupFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const validateFile = useCallback((file: File): string | null => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) return `${file.name}: unsupported file type`;
    if (file.size > MAX_FILE_SIZE) return `${file.name}: exceeds 25MB limit`;
    return null;
  }, []);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const incoming = Array.from(newFiles);
    setFiles((prev) => {
      if (prev.length + incoming.length > 5) {
        setError("Maximum 5 files allowed");
        return prev;
      }
      setError("");
      const valid: UploadedFile[] = [];
      for (const file of incoming) {
        const err = validateFile(file);
        if (err) { setError(err); return prev; }
        valid.push({ key: crypto.randomUUID(), file, status: "pending" });
      }
      return [...prev, ...valid];
    });
  }, [validateFile]);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please describe what you're struggling with");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Upload files if any
      const uploadedFiles = [];
      for (let i = 0; i < files.length; i++) {
        setFiles((prev) => prev.map((f, j) => j === i ? { ...f, status: "uploading" } : f));
        const formData = new FormData();
        formData.append("file", files[i].file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          setFiles((prev) => prev.map((f, j) => j === i ? { ...f, status: "error", error: "Upload failed" } : f));
          continue;
        }
        const data = await res.json();
        setFiles((prev) => prev.map((f, j) => j === i ? { ...f, status: "done" } : f));
        uploadedFiles.push(data);
      }

      // Create session with the description as helpType
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryId: classId,
          helpType: description.trim(),
        }),
      });

      if (!res.ok) {
        setError("Failed to create session. Please try again.");
        setSubmitting(false);
        return;
      }

      const newSession = await res.json();
      router.push(`/app/sessions/${newSession.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Description — required */}
      <div>
        <label className="block font-display text-[12px] font-medium text-text-secondary mb-2">
          What are you struggling with? *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
          placeholder="e.g. I don't understand how to solve integrals using substitution..."
          className="w-full bg-[rgba(35,28,20,0.50)] border border-[rgba(168,152,128,0.15)] rounded-[12px] px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors resize-none"
        />
      </div>

      {/* File upload — optional */}
      <div>
        <label className="block font-display text-[12px] font-medium text-text-secondary mb-2">
          Upload a file or photo (optional)
        </label>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-[12px] p-6 text-center cursor-pointer transition-colors ${
            dragOver ? "border-accent bg-accent/5" : "border-[rgba(168,152,128,0.15)] hover:border-[rgba(168,152,128,0.35)]"
          }`}
        >
          <svg className="w-7 h-7 mx-auto mb-2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-text-secondary text-[13px]">Drag & drop files here, or click to browse</p>
          <p className="text-text-muted text-[11px] mt-1">PDF, DOCX, DOC, PNG, JPG, HEIC — Max 25MB each</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.heic"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
            className="hidden"
          />
        </div>

        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((f, i) => (
              <div key={f.key} className="flex items-center justify-between bg-[rgba(35,28,20,0.50)] rounded-[10px] px-3 py-2 border border-[rgba(168,152,128,0.12)]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[13px] text-text-primary truncate">{f.file.name}</span>
                  <span className="text-[11px] text-text-muted flex-shrink-0">{formatSize(f.file.size)}</span>
                  {f.status === "uploading" && <span className="text-[11px] text-accent">Uploading...</span>}
                  {f.status === "done" && <span className="text-[11px] text-accent-light">Done</span>}
                  {f.status === "error" && <span className="text-[11px] text-red-400">{f.error}</span>}
                </div>
                <button type="button" onClick={() => removeFile(i)} className="text-text-muted hover:text-text-primary ml-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-[13px]">{error}</p>}

      <button
        type="submit"
        disabled={submitting || !description.trim()}
        className="w-full bg-accent hover:bg-accent/90 text-[#281c14] font-display text-[14px] font-semibold rounded-[12px] px-5 py-3.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Starting session..." : "Start Session"}
      </button>
    </form>
  );
}
