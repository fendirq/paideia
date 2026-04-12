"use client";

import { useState } from "react";

interface UploadedFile {
  uid: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  status: "pending" | "uploading" | "done" | "error";
}

interface PendingUploadFile extends UploadedFile {
  _file: File;
}

interface AddMaterialFormProps {
  classId: string;
  onCreated: () => void;
  onCancel: () => void;
}

export function AddMaterialForm({ classId, onCreated, onCancel }: AddMaterialFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected) return;

    const newFiles: PendingUploadFile[] = Array.from(selected).map((f) => ({
      uid: crypto.randomUUID(),
      fileName: f.name,
      fileUrl: "",
      fileType: f.type || "application/octet-stream",
      status: "pending" as const,
      _file: f,
    }));

    setFiles((prev) => [
      ...prev,
      ...newFiles.map(({ uid, fileName, fileUrl, fileType, status }) => ({
        uid,
        fileName,
        fileUrl,
        fileType,
        status,
      })),
    ]);

    // Upload each file concurrently
    const uploadAll = async () => {
      await Promise.allSettled(
        newFiles.map(async (uf) => {
          setFiles((prev) =>
            prev.map((f) => (f.uid === uf.uid ? { ...f, status: "uploading" } : f))
          );

          try {
            const formData = new FormData();
            formData.append("file", uf._file);

            const res = await fetch("/api/upload", { method: "POST", body: formData });
            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            setFiles((prev) =>
              prev.map((f) =>
                f.uid === uf.uid ? { ...f, fileUrl: data.url, status: "done" } : f
              )
            );
          } catch {
            setFiles((prev) =>
              prev.map((f) => (f.uid === uf.uid ? { ...f, status: "error" } : f))
            );
          }
        })
      );
    };
    uploadAll();

    e.target.value = "";
  }

  function removeFile(uid: string) {
    setFiles((prev) => {
      const target = prev.find((f) => f.uid === uid);
      if (target?.status === "uploading") return prev;
      return prev.filter((f) => f.uid !== uid);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!description.trim()) {
      setError("Description is required — tell students what to learn");
      return;
    }

    const uploading = files.some((f) => f.status === "uploading");
    if (uploading) {
      setError("Files are still uploading...");
      return;
    }

    const erroredFiles = files.filter((f) => f.status === "error");
    if (erroredFiles.length > 0) {
      setError(`${erroredFiles.length} file(s) failed to upload. Remove them or re-attach before saving.`);
      return;
    }

    setLoading(true);

    try {
      const uploadedFiles = files
        .filter((f) => f.status === "done")
        .map((f) => ({ fileName: f.fileName, fileUrl: f.fileUrl, fileType: f.fileType }));

      const res = await fetch(`/api/teacher/classes/${classId}/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          dueDate: dueDate || null,
          files: uploadedFiles,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create material");
        return;
      }

      onCreated();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[rgba(35,28,20,0.40)] border border-[rgba(168,152,128,0.12)] rounded-[12px] p-5 space-y-4 mb-4">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Material title (e.g. Chapter 5 Reading)"
        className="w-full bg-[rgba(35,28,20,0.50)] border border-[rgba(168,152,128,0.15)] rounded-[10px] px-4 py-2.5 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What should students learn and understand from this material?"
        rows={3}
        className="w-full bg-[rgba(35,28,20,0.50)] border border-[rgba(168,152,128,0.15)] rounded-[10px] px-4 py-2.5 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors resize-none"
      />

      <div className="flex gap-3">
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="flex-1 bg-[rgba(35,28,20,0.50)] border border-[rgba(168,152,128,0.15)] rounded-[10px] px-4 py-2.5 text-[14px] text-text-primary focus:outline-none focus:border-accent/50 transition-colors [color-scheme:dark]"
          placeholder="Due date (optional)"
        />
        <label className="flex items-center gap-2 px-4 py-2.5 bg-[rgba(35,28,20,0.50)] border border-[rgba(168,152,128,0.15)] rounded-[10px] text-[13px] text-text-muted hover:text-text-primary hover:border-accent/30 transition-colors cursor-pointer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
          </svg>
          Attach files
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.heic"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((f) => (
            <div key={f.uid} className="flex items-center gap-2 text-[12px]">
              <span className={`w-1.5 h-1.5 rounded-full ${
                f.status === "done" ? "bg-accent" : f.status === "uploading" ? "bg-yellow-500 animate-pulse" : f.status === "error" ? "bg-red-400" : "bg-text-muted"
              }`} />
              <span className="text-text-secondary flex-1 truncate">{f.fileName}</span>
              <button type="button" onClick={() => removeFile(f.uid)} disabled={f.status === "uploading"} className="text-text-muted hover:text-red-400 transition-colors disabled:opacity-30">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-red-400 text-[13px]">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-accent hover:bg-accent/90 text-[#281c14] font-display text-[13px] font-semibold rounded-[10px] px-5 py-2.5 transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : "Add Material"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={files.some((f) => f.status === "uploading")}
          className="px-4 py-2.5 text-[13px] text-text-muted hover:text-text-primary transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
