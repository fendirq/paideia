import Link from "next/link";

const SUBJECT_COLORS: Record<string, string> = {
  MATHEMATICS: "#5b9bd5",
  ENGLISH: "#c57bdb",
  HISTORY: "#e8a838",
  SCIENCE: "#4a9d5b",
  MANDARIN: "#e87838",
  HUMANITIES: "#d4a574",
  OTHER: "#a39e98",
};

interface SessionCardProps {
  id: string;
  unitName: string;
  subject: string;
  messageCount: number;
  status: string;
  startedAt: string;
  chapter?: string;
}

export function SessionCard({
  id,
  unitName,
  subject,
  messageCount,
  status,
  startedAt,
  chapter,
}: SessionCardProps) {
  const color = SUBJECT_COLORS[subject] ?? SUBJECT_COLORS.OTHER;

  return (
    <Link
      href={`/app/sessions/${id}`}
      className="group block bg-bg-surface/50 border border-white/[0.04] rounded-xl overflow-hidden hover:border-white/[0.08] hover:-translate-y-px transition-all"
    >
      {/* Subject color bar */}
      <div className="h-[3px]" style={{ backgroundColor: color }} />

      <div className="p-4">
        <h3 className="font-display font-semibold text-sm text-text-primary mb-1 truncate">
          {unitName}
        </h3>
        <p className="text-xs text-text-muted">
          {chapter ? `${chapter} · ` : ""}
          {messageCount} message{messageCount !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center justify-between mt-3">
          {status === "ACTIVE" ? (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent/[0.12] text-accent-light border border-accent/20">
              Active
            </span>
          ) : (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.04] text-text-muted border border-white/[0.06]">
              Completed
            </span>
          )}
          <span className="text-xs text-text-muted">
            {new Date(startedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}
