"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SUBJECTS = [
  "ALL",
  "MATHEMATICS",
  "ENGLISH",
  "HISTORY",
  "SCIENCE",
  "MANDARIN",
  "HUMANITIES",
  "OTHER",
] as const;

const subjectLabel = (s: string) =>
  s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase();

interface InquiryItem {
  id: string;
  subject: string;
  unitName: string;
  teacherName: string;
  description: string;
  createdAt: string;
  files: { fileName: string }[];
  _count: { sessions: number; chunks: number };
}

interface LibraryViewProps {
  inquiries: InquiryItem[];
}

export function LibraryView({ inquiries }: LibraryViewProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeSubject, setActiveSubject] = useState<string>("ALL");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const filtered = inquiries.filter((inq) => {
    if (activeSubject !== "ALL" && inq.subject !== activeSubject) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        inq.unitName.toLowerCase().includes(q) ||
        inq.teacherName.toLowerCase().includes(q) ||
        inq.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(false);
    try {
      const res = await fetch(`/api/inquiries/${deleteTarget}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
        setDeleteTarget(null);
      } else {
        setDeleteError(true);
      }
    } catch {
      setDeleteError(true);
    } finally {
      setIsDeleting(false);
    }
  };

  // Only show subject tabs that have inquiries
  const subjectsWithData = new Set(inquiries.map((i) => i.subject));
  const visibleSubjects = SUBJECTS.filter(
    (s) => s === "ALL" || subjectsWithData.has(s)
  );

  return (
    <>
      {/* Delete modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative bg-bg-surface border border-bg-elevated rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-display font-semibold text-text-primary mb-2">
              Delete inquiry?
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              This will permanently delete this inquiry, all uploaded files, and
              associated tutoring sessions. This cannot be undone.
            </p>
            {deleteError && (
              <p className="text-sm text-red-400 mb-3">
                Failed to delete. Please try again.
              </p>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteError(false);
                }}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary border border-bg-elevated rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm bg-accent hover:bg-accent-light text-bg-base rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by unit, teacher, or topic..."
          className="w-full bg-bg-base border border-bg-elevated rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
        />
      </div>

      {/* Subject filter tabs */}
      {visibleSubjects.length > 2 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {visibleSubjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setActiveSubject(subject)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                activeSubject === subject
                  ? "bg-accent text-bg-base font-medium"
                  : "bg-bg-elevated text-text-secondary hover:text-text-primary"
              }`}
            >
              {subjectLabel(subject)}
            </button>
          ))}
        </div>
      )}

      {/* Inquiry list */}
      {filtered.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-text-muted">
            {search || activeSubject !== "ALL"
              ? "No matching inquiries found."
              : "No uploads yet."}
          </p>
          {!search && activeSubject === "ALL" && (
            <Link
              href="/app/upload"
              className="text-accent text-sm mt-2 inline-block"
            >
              Upload coursework to get started
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inq) => (
            <div key={inq.id} className="card group relative">
              <Link href={`/app/inquiry/${inq.id}`} className="block p-5">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">
                      {subjectLabel(inq.subject)}
                    </span>
                    <h3 className="font-display font-semibold text-base mt-2 text-text-primary">
                      {inq.unitName}
                    </h3>
                    <p className="text-sm text-text-muted">{inq.teacherName}</p>
                    {inq.description && (
                      <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                        {inq.description}
                      </p>
                    )}
                    {inq.files.length > 0 && (
                      <p className="text-xs text-text-muted mt-2">
                        {inq.files.length} file{inq.files.length !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-xs text-text-muted">
                      {inq._count.sessions} session
                      {inq._count.sessions !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setDeleteTarget(inq.id);
                }}
                className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 focus:opacity-100 text-text-muted hover:text-red-400 transition-all p-1.5 rounded-lg hover:bg-bg-elevated"
                aria-label="Delete inquiry"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
