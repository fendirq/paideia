"use client";

import { useState } from "react";
import Link from "next/link";
import { VideoHero } from "@/components/video-hero";
import { ConfirmModal } from "@/components/confirm-modal";

interface ClassItem {
  id: string;
  name: string;
  subject: string;
}

interface PortalHomeProps {
  userName?: string | null;
  initialClasses: ClassItem[];
  hasProfile: boolean;
}

const ESSAY_SUBJECTS = [
  { key: "HISTORY", label: "History" },
  { key: "ENGLISH", label: "English" },
  { key: "HUMANITIES", label: "Humanities" },
];

const SUBJECT_ICONS: Record<string, React.ReactNode> = {
  HISTORY: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  ENGLISH: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
  ),
  HUMANITIES: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 0 1-3.827-5.802" />
    </svg>
  ),
};

export function PortalHome({ userName, initialClasses, hasProfile }: PortalHomeProps) {
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSubject, setNewSubject] = useState("HISTORY");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleAdd() {
    if (saving || !newName.trim()) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/portal/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), subject: newSubject }),
      });

      if (res.ok) {
        const created = await res.json();
        setClasses((prev) => [created, ...prev]);
        setNewName("");
        setShowAdd(false);
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Failed to add class");
      }
    } catch {
      setError("Network error. Please try again.");
    }

    setSaving(false);
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/portal/classes?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setClasses((prev) => prev.filter((c) => c.id !== id));
        setConfirmDelete(null);
      } else {
        setError("Failed to remove class. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setDeleting(false);
  }

  return (
    <div>
      <VideoHero userName={userName} />

      {/* Spacer so the hero occupies the full first screen */}
      <div className="h-screen" />

      {/* Scroll-down section */}
      <div className="relative z-10 min-h-screen border-t border-[rgba(168,152,128,0.10)] rounded-t-3xl">
        <div className="flex flex-col items-center py-20 gap-6 max-w-lg mx-auto px-6">

          {/* Writing Profile link */}
          <Link
            href="/portal/aggregate"
            className="group flex items-center gap-4 px-5 py-3 rounded-2xl border border-[rgba(168,152,128,0.18)] bg-[rgba(40,32,24,0.40)] hover:bg-[rgba(40,32,24,0.60)] hover:border-accent/30 hover:shadow-[0_0_20px_rgba(168,152,128,0.12)] backdrop-blur-xl transition-all duration-300 w-full"
          >
            <span className="w-9 h-9 rounded-xl bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center transition-colors shrink-0">
              <svg className="w-[18px] h-[18px] text-accent group-hover:text-accent-light transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4 10.5a7.464 7.464 0 0 1-1.15 3.993m1.989 3.559A11.209 11.209 0 0 0 8.25 10.5a3.75 3.75 0 1 1 7.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 0 1-3.6 9.75m6.633-4.596a18.666 18.666 0 0 1-2.485 5.33" />
              </svg>
            </span>
            <div className="flex-1">
              <span className="text-sm font-display font-semibold text-text-primary block">
                {hasProfile ? "Writing Profile" : "Create Writing Profile"}
              </span>
              <span className="text-[11px] text-text-secondary/80">
                {hasProfile ? "View your style fingerprint" : "Build your style fingerprint"}
              </span>
            </div>
            <svg className="w-4 h-4 text-text-muted/50 group-hover:text-text-muted group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>

          {/* Your Classes section */}
          <div className="w-full mt-2">
            <h3 className="text-xs font-display font-semibold text-text-secondary/60 uppercase tracking-wider mb-3 px-1">
              Your Classes
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {classes.map((cls) => {
                const href = hasProfile
                  ? `/portal/class/${cls.id}`
                  : `/portal/aggregate?next=/portal/class/${cls.id}`;

                return (
                  <div key={cls.id} className="relative group">
                    <Link
                      href={href}
                      className="block p-5 rounded-2xl border border-[rgba(168,152,128,0.15)] bg-[rgba(40,32,24,0.30)] hover:bg-[rgba(40,32,24,0.50)] hover:border-accent/20 backdrop-blur-xl transition-all"
                    >
                      <div className="w-10 h-10 rounded-xl bg-accent/10 group-hover:bg-accent/15 flex items-center justify-center mb-3 text-accent transition-colors">
                        {SUBJECT_ICONS[cls.subject] || SUBJECT_ICONS.HISTORY}
                      </div>
                      <span className="text-sm font-display font-semibold text-text-primary block">{cls.name}</span>
                      <span className="text-[11px] text-text-muted mt-0.5 block">{cls.subject}</span>
                    </Link>
                    {/* Delete button */}
                    <button
                      onClick={() => setConfirmDelete(cls.id)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[rgba(40,32,24,0.60)] border border-[rgba(168,152,128,0.15)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-red-400"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}

              {/* Add Class card */}
              <button
                onClick={() => { setShowAdd((prev) => !prev); setError(""); }}
                className="p-5 rounded-2xl border border-dashed border-[rgba(168,152,128,0.20)] bg-[rgba(40,32,24,0.15)] hover:bg-[rgba(40,32,24,0.30)] hover:border-accent/20 backdrop-blur-xl transition-all flex flex-col items-center justify-center gap-2 min-h-[120px]"
              >
                <div className="w-10 h-10 rounded-xl bg-accent/8 flex items-center justify-center text-accent/60">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <span className="text-[12px] font-display text-text-muted">Add Class</span>
              </button>
            </div>

            {/* Inline add form */}
            {showAdd && (
              <div className="mt-4 p-4 rounded-xl border border-accent/20 bg-[rgba(40,32,24,0.40)] backdrop-blur-xl space-y-3">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Class name (e.g. AP US History)"
                  className="w-full bg-bg-base/60 border border-[rgba(168,152,128,0.15)] rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  autoFocus
                />
                <div className="flex gap-2">
                  {ESSAY_SUBJECTS.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setNewSubject(s.key)}
                      className={`flex-1 text-[11px] font-display py-2 rounded-lg border transition-colors ${
                        newSubject === s.key
                          ? "border-accent/40 bg-accent/15 text-accent-light"
                          : "border-[rgba(168,152,128,0.15)] text-text-secondary hover:border-accent/30 hover:text-accent"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={handleAdd}
                    disabled={saving || !newName.trim()}
                    className="bg-accent text-[#281c14] text-[12px] font-display font-semibold rounded-full px-4 py-1.5 hover:bg-accent-light transition-colors disabled:opacity-50"
                  >
                    {saving ? "Adding..." : "Add"}
                  </button>
                  <button
                    onClick={() => { setShowAdd(false); setError(""); setNewName(""); }}
                    className="text-[12px] text-text-muted hover:text-text-secondary transition-colors px-3"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {!showAdd && error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <ConfirmModal
            open={!!confirmDelete}
            title="Remove this class?"
            message="This class will be removed from your portal."
            onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
            onCancel={() => setConfirmDelete(null)}
            loading={deleting}
          />
        </div>
      </div>
    </div>
  );
}
