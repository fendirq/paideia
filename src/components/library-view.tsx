"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SUBJECT_COLORS, SUBJECT_LABELS } from "@/lib/subject-constants";

const SUBJECT_INITIALS: Record<string, string> = {
  MATHEMATICS: "M",
  ENGLISH: "E",
  HISTORY: "H",
  SCIENCE: "S",
  MANDARIN: "C",
  HUMANITIES: "Hu",
  OTHER: "O",
};

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

  const subjectsWithData = new Set(inquiries.map((i) => i.subject));
  const visibleSubjects = (
    ["MATHEMATICS", "ENGLISH", "HISTORY", "SCIENCE", "MANDARIN", "HUMANITIES", "OTHER"] as const
  ).filter((s) => subjectsWithData.has(s));

  return (
    <>
      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          isDeleting={isDeleting}
          deleteError={deleteError}
          onCancel={() => {
            setDeleteTarget(null);
            setDeleteError(false);
          }}
          onConfirm={confirmDelete}
        />
      )}

      {/* Search bar */}
      <div className="mb-5">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by unit, teacher, or topic..."
          className="w-full bg-[rgba(35,28,20,0.50)] border border-[rgba(168,152,128,0.15)] rounded-[12px] px-4 py-3 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
        />
      </div>

      {/* Subject filter pills */}
      {visibleSubjects.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveSubject("ALL")}
            className={`px-4 py-[7px] rounded-[20px] font-display text-[13px] font-medium transition-all border ${
              activeSubject === "ALL"
                ? "border-accent bg-accent/[0.08] text-text-primary"
                : "border-[rgba(168,152,128,0.15)] bg-bg-surface text-text-secondary hover:border-[rgba(168,152,128,0.30)]"
            }`}
          >
            All
          </button>
          {visibleSubjects.map((subj) => {
            const color = SUBJECT_COLORS[subj] ?? SUBJECT_COLORS.OTHER;
            const label = SUBJECT_LABELS[subj] ?? subj;
            return (
              <button
                key={subj}
                onClick={() => setActiveSubject(subj)}
                className={`flex items-center gap-[7px] px-4 py-[7px] rounded-[20px] font-display text-[13px] font-medium transition-all border ${
                  activeSubject === subj
                    ? "border-accent bg-accent/[0.08] text-text-primary"
                    : "border-[rgba(168,152,128,0.15)] bg-bg-surface text-text-secondary hover:border-[rgba(168,152,128,0.30)]"
                }`}
              >
                <span
                  className="w-[7px] h-[7px] rounded-full"
                  style={{ background: color }}
                />
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className="bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[16px] p-12 text-center">
          <p className="text-text-muted text-[14px]">
            {search || activeSubject !== "ALL"
              ? "No matching inquiries found."
              : "No uploads yet."}
          </p>
          {!search && activeSubject === "ALL" && (
            <Link
              href="/app/upload"
              className="text-accent text-[13px] mt-2 inline-block"
            >
              Upload coursework to get started
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map((inq) => {
            const color = SUBJECT_COLORS[inq.subject] ?? SUBJECT_COLORS.OTHER;
            const label = SUBJECT_LABELS[inq.subject] ?? "Other";
            const initial = SUBJECT_INITIALS[inq.subject] ?? SUBJECT_INITIALS.OTHER;
            return (
              <div key={inq.id} className="group relative">
                <Link
                  href={`/app/inquiry/${inq.id}`}
                  className="block bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[16px] overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.2)] hover:border-[rgba(168,152,128,0.15)]"
                  style={{
                    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {/* Subject color banner */}
                  <div
                    className="h-[5px] w-full"
                    style={{ backgroundColor: color }}
                  />
                  <div className="p-5">
                    <span
                      className="w-9 h-9 rounded-[10px] flex items-center justify-center font-display font-bold text-[14px] mb-3"
                      style={{ backgroundColor: `${color}18`, color }}
                    >
                      {initial}
                    </span>
                    <h3 className="font-display font-semibold text-[15px] text-text-primary mb-1 truncate">
                      {inq.unitName}
                    </h3>
                    <p className="text-[12px] text-text-muted mb-4">
                      {label} · {inq.teacherName}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-text-muted">
                      <span>
                        {inq.files.length} file
                        {inq.files.length !== 1 ? "s" : ""}
                      </span>
                      <span>
                        {inq._count.sessions} session
                        {inq._count.sessions !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => setDeleteTarget(inq.id)}
                  className="absolute right-3 top-[17px] opacity-0 group-hover:opacity-100 focus:opacity-100 text-text-muted hover:text-red-400 transition-all p-1.5 rounded-[8px] hover:bg-bg-elevated"
                  aria-label="Delete inquiry"
                >
                  <svg
                    className="w-3.5 h-3.5"
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
            );
          })}
        </div>
      )}
    </>
  );
}

function DeleteModal({
  isDeleting,
  deleteError,
  onCancel,
  onConfirm,
}: {
  isDeleting: boolean;
  deleteError: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-[rgba(30,25,20,0.60)]"
        aria-hidden="true"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        className="relative bg-bg-surface border border-[rgba(168,152,128,0.15)] rounded-[20px] p-6 w-full max-w-sm shadow-xl"
      >
        <h3 id="delete-dialog-title" className="text-[16px] font-display font-semibold text-text-primary mb-2">
          Delete inquiry?
        </h3>
        <p className="text-[13px] text-text-secondary mb-6 leading-relaxed">
          This will permanently delete this inquiry, all uploaded files, and
          associated tutoring sessions. This cannot be undone.
        </p>
        {deleteError && (
          <p className="text-[13px] text-red-400 mb-3">
            Failed to delete. Please try again.
          </p>
        )}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2.5 text-[13px] text-text-secondary hover:text-text-primary border border-[rgba(168,152,128,0.15)] rounded-[10px] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2.5 text-[13px] bg-red-500/80 hover:bg-red-500 text-white rounded-[10px] transition-colors disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
