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
  description?: string;
}

export function SessionCard({
  id,
  unitName,
  subject,
  messageCount,
  startedAt,
  description,
}: SessionCardProps) {
  const color = SUBJECT_COLORS[subject] ?? SUBJECT_COLORS.OTHER;

  return (
    <Link
      href={`/app/sessions/${id}`}
      className="group flex items-center gap-4 px-4 py-3.5 rounded-[12px] border border-transparent hover:bg-bg-surface/50 hover:border-white/[0.04] transition-all"
    >
      <span
        className="w-[8px] h-[8px] rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-display text-[14px] font-semibold text-text-primary truncate">
          {unitName}
        </h3>
        {description && (
          <p className="text-[12px] text-text-muted truncate mt-0.5">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 text-[12px] text-text-muted">
        <span>
          {messageCount} msg{messageCount !== 1 ? "s" : ""}
        </span>
        <span>
          {new Date(startedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
        <svg
          className="w-4 h-4 text-text-muted/50 group-hover:text-text-secondary transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m8.25 4.5 7.5 7.5-7.5 7.5"
          />
        </svg>
      </div>
    </Link>
  );
}
