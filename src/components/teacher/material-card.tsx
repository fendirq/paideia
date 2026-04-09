"use client";

import { useState } from "react";
import type { MaterialData } from "@/app/app/teacher/class/[id]/page";

interface MaterialCardProps {
  material: MaterialData;
  classId: string;
  onDeleted: () => void;
}

export function MaterialCard({ material, classId, onDeleted }: MaterialCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this material?")) return;
    setDeleting(true);
    setDeleteError(false);
    try {
      const res = await fetch(`/api/teacher/classes/${classId}/materials/${material.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onDeleted();
      } else {
        setDeleteError(true);
        setDeleting(false);
      }
    } catch {
      setDeleteError(true);
      setDeleting(false);
    }
  }

  const dueLabel = material.dueDate
    ? new Date(material.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
    : null;

  return (
    <div className="bg-[rgba(35,28,20,0.40)] border border-[rgba(168,152,128,0.10)] rounded-[12px] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-semibold text-[14px] text-text-primary truncate">
              {material.title}
            </h3>
            {dueLabel && (
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-display">
                Due {dueLabel}
              </span>
            )}
          </div>
          <p className="text-[12px] text-text-secondary line-clamp-2">{material.description}</p>
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="shrink-0 text-[11px] text-text-muted hover:text-red-400 transition-colors disabled:opacity-50"
        >
          {deleting ? "..." : "Delete"}
        </button>
      </div>

      {material.files.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2.5">
          {material.files.map((f) => (
            <span key={f.id} className="flex items-center gap-1 px-2 py-1 rounded-md bg-[rgba(168,152,128,0.08)] text-[11px] text-text-muted">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              {f.fileName}
            </span>
          ))}
        </div>
      )}

      {deleteError && (
        <p className="text-red-400 text-[11px] mt-2">Failed to delete. Try again.</p>
      )}

      <div className="flex items-center gap-3 mt-2.5 text-[11px] text-text-muted">
        <span>{material._count.sessions} thread{material._count.sessions !== 1 ? "s" : ""}</span>
        <span>{material.files.length} file{material.files.length !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
}
