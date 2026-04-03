"use client";

import { useState } from "react";

interface StudyQueueItem {
  id: string;
  topic: string;
  chapter: string | null;
  className: string;
  status: "NEW" | "REVIEW" | "PRACTICED";
  completed: boolean;
}

interface StudyQueueProps {
  items: StudyQueueItem[];
}

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  NEW: { bg: "bg-[#5b9bd5]/[0.12]", text: "text-[#5b9bd5]", label: "New" },
  REVIEW: {
    bg: "bg-[#e8a838]/[0.12]",
    text: "text-[#e8a838]",
    label: "Review",
  },
  PRACTICED: {
    bg: "bg-accent/[0.12]",
    text: "text-accent-light",
    label: "Practiced",
  },
};

export function StudyQueue({ items: initialItems }: StudyQueueProps) {
  const [items, setItems] = useState(initialItems);

  const toggleComplete = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newStatus = item.completed ? item.status : "PRACTICED";
    const newCompleted = !item.completed;

    // Optimistic update
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, completed: newCompleted } : i
      )
    );

    try {
      const res = await fetch(`/api/study-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newCompleted ? "PRACTICED" : "REVIEW" }),
      });
      if (!res.ok) {
        // Revert on failure
        setItems((prev) =>
          prev.map((i) =>
            i.id === id ? { ...i, completed: item.completed } : i
          )
        );
      }
    } catch {
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, completed: item.completed } : i
        )
      );
    }
  };

  return (
    <div className="bg-bg-inner border border-white/[0.04] rounded-[14px] p-6">
      <h3 className="font-display text-[13px] font-semibold mb-5">
        To Study
      </h3>

      {items.length === 0 ? (
        <p className="text-[13px] text-text-muted py-4">
          No study items yet. Upload coursework to generate your study plan.
        </p>
      ) : (
        <div className="space-y-1">
          {items.map((item) => {
            const style = STATUS_STYLES[item.status];
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 py-2.5 px-2 rounded-[8px] hover:bg-bg-surface/30 transition-colors"
              >
                <button
                  onClick={() => toggleComplete(item.id)}
                  className={`w-[20px] h-[20px] rounded-[6px] border-2 shrink-0 flex items-center justify-center transition-colors ${
                    item.completed
                      ? "bg-accent border-accent"
                      : "border-text-muted/40 hover:border-accent/60"
                  }`}
                >
                  {item.completed && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 12.75 6 6 9-13.5"
                      />
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[13px] font-display font-medium ${
                      item.completed
                        ? "line-through text-text-muted"
                        : "text-text-primary"
                    }`}
                  >
                    {item.topic}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {item.className}
                    {item.chapter ? ` \u00B7 ${item.chapter}` : ""}
                  </p>
                </div>

                <span
                  className={`text-[10px] px-2.5 py-1 rounded-[6px] font-display font-medium ${style.bg} ${style.text}`}
                >
                  {style.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
