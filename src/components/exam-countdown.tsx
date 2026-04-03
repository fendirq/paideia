interface ExamItem {
  id: string;
  name: string;
  className: string;
  daysRemaining: number;
  readiness: number;
}

interface ExamCountdownProps {
  exams: ExamItem[];
}

export function ExamCountdown({ exams }: ExamCountdownProps) {
  return (
    <div className="bg-bg-surface/50 border border-white/[0.04] rounded-xl p-6">
      <h3 className="font-display font-semibold text-[15px] mb-5">
        Upcoming Exams
      </h3>

      {exams.length === 0 ? (
        <p className="text-sm text-text-muted py-4">No upcoming exams.</p>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => {
            const urgencyColor =
              exam.daysRemaining < 3
                ? "#ef4444"
                : exam.daysRemaining < 7
                  ? "#e8a838"
                  : "#4a9d5b";

            return (
              <div key={exam.id} className="flex items-center gap-4">
                <div className="text-center shrink-0 w-12">
                  <p
                    className="font-display font-bold text-2xl"
                    style={{ color: urgencyColor }}
                  >
                    {exam.daysRemaining}
                  </p>
                  <p className="text-[10px] text-text-muted uppercase">days</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {exam.name}
                  </p>
                  <p className="text-xs text-text-muted">{exam.className}</p>
                  {/* Readiness bar */}
                  <div className="mt-1.5 h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                    <div
                      className="h-full rounded-full bg-accent transition-all"
                      style={{ width: `${exam.readiness}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-text-muted shrink-0">
                  {exam.readiness}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
