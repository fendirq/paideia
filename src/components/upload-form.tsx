"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const SUBJECTS = [
  { value: "MATHEMATICS", label: "Mathematics" },
  { value: "ENGLISH", label: "English" },
  { value: "HISTORY", label: "History" },
  { value: "SCIENCE", label: "Science" },
  { value: "MANDARIN", label: "Mandarin" },
  { value: "HUMANITIES", label: "Humanities" },
  { value: "OTHER", label: "Other" },
];

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".doc",
  ".png",
  ".jpg",
  ".jpeg",
  ".heic",
];
const MAX_FILES = 5;
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB

interface UploadedFile {
  file: File;
  url?: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export function UploadForm({ userRole }: { userRole: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [subject, setSubject] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [unitName, setUnitName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const isTeacher = userRole === "TEACHER";

  const validateFile = useCallback(
    (file: File): string | null => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return `${file.name}: unsupported file type`;
      }
      if (file.size > MAX_FILE_SIZE) {
        return `${file.name}: exceeds 25MB limit`;
      }
      const totalSize =
        files.reduce((sum, f) => sum + f.file.size, 0) + file.size;
      if (totalSize > MAX_TOTAL_SIZE) {
        return "Total file size exceeds 100MB limit";
      }
      return null;
    },
    [files]
  );

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const incoming = Array.from(newFiles);
      if (files.length + incoming.length > MAX_FILES) {
        setError(`Maximum ${MAX_FILES} files allowed`);
        return;
      }
      setError("");
      const valid: UploadedFile[] = [];
      for (const file of incoming) {
        const err = validateFile(file);
        if (err) {
          setError(err);
          return;
        }
        valid.push({ file, status: "pending" });
      }
      setFiles((prev) => [...prev, ...valid]);
    },
    [files.length, validateFile]
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const uploadFile = async (
    uploadedFile: UploadedFile,
    index: number
  ): Promise<{
    url: string;
    fileName: string;
    fileType: string;
  } | null> => {
    setFiles((prev) =>
      prev.map((f, i) =>
        i === index ? { ...f, status: "uploading" as const } : f
      )
    );

    const formData = new FormData();
    formData.append("file", uploadedFile.file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index
              ? { ...f, status: "error" as const, error: data.error }
              : f
          )
        );
        return null;
      }

      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? { ...f, status: "done" as const, url: data.url }
            : f
        )
      );
      return data;
    } catch {
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? { ...f, status: "error" as const, error: "Upload failed" }
            : f
        )
      );
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !subject ||
      !teacherName ||
      !unitName ||
      !description ||
      files.length === 0
    ) {
      setError("Please fill in all fields and add at least one file");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // 1. Upload all files to Vercel Blob
      const uploadResults = await Promise.all(
        files.map((f, i) => uploadFile(f, i))
      );

      const successfulUploads = uploadResults.filter(Boolean);
      if (successfulUploads.length === 0) {
        setError("All file uploads failed");
        setSubmitting(false);
        return;
      }

      // 2. Create the inquiry
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          teacherName,
          unitName,
          description,
          files: successfulUploads,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create inquiry");
        setSubmitting(false);
        return;
      }

      const inquiry = await res.json();
      router.push(`/app/inquiry/${inquiry.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Subject
        </label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full bg-bg-surface border border-bg-elevated rounded-lg px-3 py-2.5 text-text-primary focus:outline-none focus:border-accent"
        >
          <option value="">Select a subject</option>
          {SUBJECTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Teacher Name */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Teacher Name
        </label>
        <input
          type="text"
          value={teacherName}
          onChange={(e) => setTeacherName(e.target.value)}
          placeholder="e.g. Ms. Johnson"
          className="w-full bg-bg-surface border border-bg-elevated rounded-lg px-3 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
      </div>

      {/* Unit Name */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Unit / Topic
        </label>
        <input
          type="text"
          value={unitName}
          onChange={(e) => setUnitName(e.target.value)}
          placeholder="e.g. Integration by Parts"
          className="w-full bg-bg-surface border border-bg-elevated rounded-lg px-3 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {isTeacher ? "Course / Class" : "What are you struggling with?"}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder={
            isTeacher
              ? "Describe the course or class this material is for..."
              : "Describe what you're having trouble with..."
          }
          className="w-full bg-bg-surface border border-bg-elevated rounded-lg px-3 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none"
        />
      </div>

      {/* File Upload Area */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Files ({files.length}/{MAX_FILES})
        </label>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-accent bg-accent/5"
              : "border-bg-elevated hover:border-text-muted"
          }`}
        >
          <svg
            className="w-8 h-8 mx-auto mb-2 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
            />
          </svg>
          <p className="text-text-secondary text-sm">
            Drag & drop files here, or click to browse
          </p>
          <p className="text-text-muted text-xs mt-1">
            PDF, DOCX, DOC, PNG, JPG, HEIC — Max 25MB each
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.heic"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
            className="hidden"
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-bg-surface rounded-lg px-3 py-2 border border-bg-elevated"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm text-text-primary truncate">
                    {f.file.name}
                  </span>
                  <span className="text-xs text-text-muted flex-shrink-0">
                    {formatSize(f.file.size)}
                  </span>
                  {f.status === "uploading" && (
                    <span className="text-xs text-accent">Uploading...</span>
                  )}
                  {f.status === "done" && (
                    <span className="text-xs text-accent-light">Done</span>
                  )}
                  {f.status === "error" && (
                    <span className="text-xs text-red-400">{f.error}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-text-muted hover:text-text-primary ml-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && <p className="text-red-400 text-sm">{error}</p>}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || files.length === 0}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting
          ? "Processing..."
          : isTeacher
            ? "Upload Materials"
            : "Submit & Start Tutoring"}
      </button>
    </form>
  );
}
