import Link from "next/link";
import { SUBJECT_COLORS, SUBJECT_LABELS } from "@/lib/subject-constants";

interface ClassItem {
  id: string;
  subject: string;
  unitName: string;
  teacherName: string;
  updatedAt: string;
  _count: { sessions: number };
}

interface ClassGridProps {
  classes: ClassItem[];
}

export function ClassGrid({ classes }: ClassGridProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h2 className="font-display text-[11px] font-semibold tracking-[1.5px] uppercase text-text-muted mb-5">
        YOUR CLASSES
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {classes.map((cls) => {
          const color = SUBJECT_COLORS[cls.subject] ?? SUBJECT_COLORS.OTHER;
          const label = SUBJECT_LABELS[cls.subject] ?? "Other";
          return (
            <Link
              key={cls.id}
              href={`/app/inquiry/${cls.id}`}
              className="group relative bg-bg-inner border border-white/[0.04] rounded-[16px] overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.2)] hover:border-white/[0.08]"
              style={{ transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
              {/* Subject accent bar */}
              <div
                className="h-[3px] w-full"
                style={{ backgroundColor: color }}
              />
              <div className="p-5">
                <h3 className="font-display font-semibold text-[15px] text-text-primary mb-1">
                  {cls.unitName}
                </h3>
                <p className="text-text-secondary text-[13px] mb-4">
                  {label} · {cls.teacherName}
                </p>
                <div className="flex items-center gap-4 text-[12px] text-text-muted">
                  <span>
                    {cls._count.sessions} session
                    {cls._count.sessions !== 1 ? "s" : ""}
                  </span>
                  <span>
                    Last active{" "}
                    {new Date(cls.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {classes.length === 0 && (
        <div className="bg-bg-inner border border-white/[0.04] rounded-[16px] p-12 text-center">
          <p className="text-text-muted mb-3">No classes yet.</p>
          <Link
            href="/app/upload"
            className="text-accent text-sm hover:text-accent-light transition-colors"
          >
            Upload coursework to get started
          </Link>
        </div>
      )}
    </div>
  );
}
