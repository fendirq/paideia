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

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  NEW: { bg: "bg-[#5b9bd5]/[0.12]", text: "text-[#5b9bd5]", label: "New" },
  REVIEW: { bg: "bg-[#e8a838]/[0.12]", text: "text-[#e8a838]", label: "Review" },
  PRACTICED: { bg: "bg-accent/[0.12]", text: "text-accent-light", label: "Practiced" },
};

export function StudyQueue({ items: initialItems }: StudyQueueProps) {
  const [items, setItems] = useState(initialItems);

  const toggleComplete = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  return (
    <div className="bg-bg-surface/50 border border-white/[0.04] rounded-xl p-6">
      <h3 className="font-display font-semibold text-[15px] mb-5">
        To Study
      </h3>

      {items.length === 0 ? (
        <p className="text-sm text-text-muted py-4">
          No study items yet. Upload coursework to generate your study plan.
        </p>
      ) : (
        <div className="space-y-1">
          {items.map((item) => {
            const style = STATUS_STYLES[item.status];
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-bg-elevated/30 transition-colors"
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleComplete(item.id)}
                  className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                    item.completed
                      ? "bg-accent border-accent"
                      : "border-text-muted/40 hover:border-accent/60"
                  }`}
                >
                  {item.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      item.completed
                        ? "line-through text-text-muted"
                        : "text-text-primary"
                    }`}
                  >
                    {item.topic}
                  </p>
                  <p className="text-xs text-text-muted">
                    {item.className}
                    {item.chapter ? ` · ${item.chapter}` : ""}
                  </p>
                </div>

                {/* Status badge */}
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${style.bg} ${style.text}`}
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
