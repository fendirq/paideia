"use client";

import { useState } from "react";

const SUBJECTS = [
  { value: "MATHEMATICS", label: "Mathematics" },
  { value: "ENGLISH", label: "English" },
  { value: "HISTORY", label: "History" },
  { value: "SCIENCE", label: "Science" },
  { value: "MANDARIN", label: "Mandarin" },
  { value: "HUMANITIES", label: "Humanities" },
  { value: "OTHER", label: "Other" },
] as const;

interface CreateClassFormProps {
  onCreated: () => void;
  onCancel: () => void;
}

export function CreateClassForm({ onCreated, onCancel }: CreateClassFormProps) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [period, setPeriod] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !subject) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/teacher/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subject, period: period ? Number(period) : null, description }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create class");
        setLoading(false);
        return;
      }

      onCreated();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[14px] p-6 space-y-4">
      <h3 className="font-display font-semibold text-lg text-text-primary">Create a Class</h3>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Class name (e.g. AP History Period 3)"
        className="w-full bg-[rgba(35,28,20,0.50)] border border-[rgba(168,152,128,0.15)] rounded-[12px] px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
        required
      />

      <select
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="w-full bg-[rgba(35,28,20,0.50)] border border-[rgba(168,152,128,0.15)] rounded-[12px] px-4 py-3 text-[14px] text-text-primary focus:outline-none focus:border-accent/50 transition-colors appearance-none"
        required
      >
        <option value="" className="bg-bg-surface text-text-muted">Select subject</option>
        {SUBJECTS.map((s) => (
          <option key={s.value} value={s.value} className="bg-bg-surface text-text-primary">
            {s.label}
          </option>
        ))}
      </select>

      <select
        value={period}
        onChange={(e) => setPeriod(e.target.value)}
        className="w-full bg-[rgba(35,28,20,0.50)] border border-[rgba(168,152,128,0.15)] rounded-[12px] px-4 py-3 text-[14px] text-text-primary focus:outline-none focus:border-accent/50 transition-colors appearance-none"
      >
        <option value="" className="bg-bg-surface text-text-muted">Select period (optional)</option>
        {[1, 2, 3, 4, 5, 6, 7].map((p) => (
          <option key={p} value={p} className="bg-bg-surface text-text-primary">
            Period {p}
          </option>
        ))}
      </select>

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className="w-full bg-[rgba(35,28,20,0.50)] border border-[rgba(168,152,128,0.15)] rounded-[12px] px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors resize-none"
      />

      {error && <p className="text-red-400 text-[13px]">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || !name.trim() || !subject}
          className="flex-1 bg-accent hover:bg-accent/90 text-[#281c14] font-display text-[14px] font-semibold rounded-[12px] px-5 py-3 transition-colors disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Class"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3 text-[14px] text-text-muted hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
