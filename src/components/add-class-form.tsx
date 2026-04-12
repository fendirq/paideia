"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SUBJECT_LABELS } from "@/lib/subject-constants";

const SEMESTERS = ["Fall 2026", "Spring 2026"];

interface AddClassFormProps {
  onCancel?: () => void;
}

export function AddClassForm({ onCancel }: AddClassFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [className, setClassName] = useState("");
  const [teacher, setTeacher] = useState("");
  const [semester, setSemester] = useState(SEMESTERS[0]);
  const [subject, setSubject] = useState("OTHER");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitName: className,
          teacherName: teacher,
          description: semester,
          subject,
          files: [],
          source: "add-class",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/app/start/${data.id}`);
        return;
      }

      const data = await res.json().catch(() => null);
      setError(data?.error || `Something went wrong (${res.status})`);
    } catch {
      setError("Network error. Please try again.");
    }

    setSaving(false);
  }

  const selectClass = "w-full bg-bg-base/60 border border-[rgba(168,152,128,0.15)] rounded-xl px-4 py-3 pr-10 text-sm text-text-primary focus:outline-none focus:border-accent/50 transition-colors appearance-none bg-no-repeat bg-[length:16px_16px] bg-[center_right_12px] bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%238a7e70%22%20stroke-width%3D%222%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22m19.5%208.25-7.5%207.5-7.5-7.5%22%2F%3E%3C%2Fsvg%3E')]";

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 w-full">
      <form onSubmit={handleSubmit} className="bg-bg-inner/80 backdrop-blur-sm border border-[rgba(168,152,128,0.15)] rounded-2xl p-8 space-y-6">
        <h2 className="font-display text-xl font-semibold text-text-primary">New Session</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5" htmlFor="add-class-name">
              Class Name
            </label>
            <input
              id="add-class-name"
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. AP US History"
              required
              className="w-full bg-bg-base/60 border border-[rgba(168,152,128,0.15)] rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1.5" htmlFor="add-class-teacher">
              Teacher
            </label>
            <input
              id="add-class-teacher"
              type="text"
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              placeholder="e.g. Ms. Johnson"
              required
              className="w-full bg-bg-base/60 border border-[rgba(168,152,128,0.15)] rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1.5" htmlFor="add-class-subject">
                Subject
              </label>
              <select
                id="add-class-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={selectClass}
              >
                {Object.entries(SUBJECT_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-1.5" htmlFor="add-class-semester">
                Semester
              </label>
              <select
                id="add-class-semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className={selectClass}
              >
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-accent border-2 border-accent-light rounded-full px-6 py-2 text-[13px] font-medium text-[#281c14] hover:bg-accent-light transition-colors disabled:opacity-50"
          >
            {saving ? "Starting..." : "Begin"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-[rgba(40,32,24,0.50)] backdrop-blur-xl border border-[rgba(168,152,128,0.15)] rounded-full px-6 py-2 text-[13px] font-medium text-text-primary hover:bg-[rgba(168,152,128,0.18)] transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
