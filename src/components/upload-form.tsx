"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SubjectChips } from "@/components/subject-chips";
import { SUBJECT_COLORS } from "@/lib/subject-constants";

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
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_TOTAL_SIZE = 100 * 1024 * 1024;

interface UploadedFile {
  key: string;
  file: File;
  url?: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

interface ExistingClass {
  id: string;
  subject: string;
  teacherName: string;
  unitName: string;
}

interface UploadFormProps {
  userRole: string;
  existingClasses: ExistingClass[];
}

export function UploadForm({ userRole, existingClasses }: UploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sidebar state
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(existingClasses.length === 0);

  // Form fields (for new class)
  const [subject, setSubject] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [unitName, setUnitName] = useState("");

  // Shared fields
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const isTeacher = userRole === "TEACHER";
  const selectedClass = existingClasses.find((c) => c.id === selectedClassId);

  const selectClass = (id: string) => {
    setSelectedClassId(id);
    setShowNewForm(false);
    setDescription("");
    setFiles([]);
    setError("");
  };

  const startNewClass = () => {
    setSelectedClassId(null);
    setShowNewForm(true);
    setSubject("");
    setTeacherName("");
    setUnitName("");
    setDescription("");
    setFiles([]);
    setError("");
  };

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
        valid.push({ key: crypto.randomUUID(), file, status: "pending" });
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
          i === index ? { ...f, status: "done" as const, url: data.url } : f
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

    const finalSubject = selectedClass?.subject ?? subject;
    const finalTeacher = selectedClass?.teacherName ?? teacherName;
    const finalUnit = selectedClass?.unitName ?? unitName;

    if (
      !finalSubject ||
      !finalTeacher ||
      !finalUnit ||
      !description ||
      files.length === 0
    ) {
      setError("Please fill in all fields and add at least one file");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const uploadResults = await Promise.all(
        files.map((f, i) => uploadFile(f, i))
      );

      const successfulUploads = uploadResults.filter(Boolean);
      if (successfulUploads.length === 0) {
        setError("All file uploads failed");
        setSubmitting(false);
        return;
      }

      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: finalSubject,
          teacherName: finalTeacher,
          unitName: finalUnit,
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
    <div className="flex gap-6 max-w-4xl">
      {/* Left sidebar — class list */}
      <div className="w-60 flex-shrink-0 space-y-2">
        <h3 className="font-display text-[11px] font-semibold tracking-[1.5px] uppercase text-text-muted mb-3">
          YOUR CLASSES
        </h3>

        {existingClasses.map((cls) => {
          const color = SUBJECT_COLORS[cls.subject] ?? SUBJECT_COLORS.OTHER;
          const isSelected = selectedClassId === cls.id;
          return (
            <button
              key={cls.id}
              type="button"
              onClick={() => selectClass(cls.id)}
              className={`w-full text-left px-4 py-3 rounded-[12px] border transition-all ${
                isSelected
                  ? "border-accent/40 bg-accent/[0.06]"
                  : "border-white/[0.04] bg-bg-inner hover:border-white/[0.08]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-[7px] h-[7px] rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="font-display text-[13px] font-semibold text-text-primary truncate">
                  {cls.unitName}
                </span>
              </div>
              <p className="text-[11px] text-text-muted truncate pl-[15px]">
                {cls.teacherName}
              </p>
            </button>
          );
        })}

        <button
          type="button"
          onClick={startNewClass}
          className={`w-full px-4 py-3 rounded-[12px] border-2 border-dashed transition-all text-center ${
            showNewForm && !selectedClassId
              ? "border-accent/40 text-accent"
              : "border-white/[0.06] text-text-muted hover:border-white/[0.1] hover:text-text-secondary"
          }`}
        >
          <span className="font-display text-[13px] font-medium">
            + Add class
          </span>
        </button>
      </div>

      {/* Right panel — form */}
      <div className="flex-1">
        {!showNewForm && !selectedClass ? (
          <div className="bg-bg-inner border border-white/[0.04] rounded-[16px] p-12 text-center">
            <p className="text-text-muted text-[14px]">
              Select a class or add a new one to upload coursework.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New class fields */}
            {showNewForm && !selectedClass && (
              <>
                <div>
                  <label className="block font-display text-[12px] font-medium text-text-secondary mb-2">
                    Subject
                  </label>
                  <SubjectChips value={subject} onChange={setSubject} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-display text-[12px] font-medium text-text-secondary mb-2">
                      Teacher
                    </label>
                    <input
                      type="text"
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      placeholder="e.g. Ms. Johnson"
                      className="w-full bg-bg-surface/50 border border-white/[0.06] rounded-[12px] px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block font-display text-[12px] font-medium text-text-secondary mb-2">
                      Unit / Topic
                    </label>
                    <input
                      type="text"
                      value={unitName}
                      onChange={(e) => setUnitName(e.target.value)}
                      placeholder="e.g. Integration by Parts"
                      className="w-full bg-bg-surface/50 border border-white/[0.06] rounded-[12px] px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Selected class header */}
            {selectedClass && (
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="w-[9px] h-[9px] rounded-full"
                  style={{
                    backgroundColor:
                      SUBJECT_COLORS[selectedClass.subject] ??
                      SUBJECT_COLORS.OTHER,
                  }}
                />
                <span className="font-display text-[16px] font-semibold text-text-primary">
                  {selectedClass.unitName}
                </span>
                <span className="text-[13px] text-text-muted">
                  {selectedClass.teacherName}
                </span>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block font-display text-[12px] font-medium text-text-secondary mb-2">
                {isTeacher
                  ? "Course / Class"
                  : "What are you struggling with?"}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder={
                  isTeacher
                    ? "Describe the course or class this material is for..."
                    : "Describe what you're having trouble with..."
                }
                className="w-full bg-bg-surface/50 border border-white/[0.06] rounded-[12px] px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors resize-none"
              />
            </div>

            {/* Drop zone */}
            <div>
              <label className="block font-display text-[12px] font-medium text-text-secondary mb-2">
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
                className={`border-2 border-dashed rounded-[12px] p-6 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? "border-accent bg-accent/5"
                    : "border-white/[0.06] hover:border-white/[0.1]"
                }`}
              >
                <svg
                  className="w-7 h-7 mx-auto mb-2 text-text-muted"
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
                <p className="text-text-secondary text-[13px]">
                  Drag & drop files here, or click to browse
                </p>
                <p className="text-text-muted text-[11px] mt-1">
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

              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {files.map((f, i) => (
                    <div
                      key={f.key}
                      className="flex items-center justify-between bg-bg-surface/50 rounded-[10px] px-3 py-2 border border-white/[0.04]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[13px] text-text-primary truncate">
                          {f.file.name}
                        </span>
                        <span className="text-[11px] text-text-muted flex-shrink-0">
                          {formatSize(f.file.size)}
                        </span>
                        {f.status === "uploading" && (
                          <span className="text-[11px] text-accent">
                            Uploading...
                          </span>
                        )}
                        {f.status === "done" && (
                          <span className="text-[11px] text-accent-light">
                            Done
                          </span>
                        )}
                        {f.status === "error" && (
                          <span className="text-[11px] text-red-400">
                            {f.error}
                          </span>
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

            {error && (
              <p className="text-red-400 text-[13px]">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting || files.length === 0}
              className="w-full bg-accent hover:bg-accent/90 text-white font-display text-[14px] font-semibold rounded-[12px] px-5 py-3.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Processing..."
                : isTeacher
                  ? "Upload Materials"
                  : "Submit & Start Tutoring"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
