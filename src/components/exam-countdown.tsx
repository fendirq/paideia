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
    <div className="bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[14px] p-6">
      <h3 className="font-display text-[13px] font-semibold mb-5">
        Upcoming Exams
      </h3>

      {exams.length === 0 ? (
        <p className="text-[13px] text-text-muted py-4">No upcoming exams.</p>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => {
            const urgencyColor =
              exam.daysRemaining < 3
                ? "#ef4444"
                : exam.daysRemaining < 7
                  ? "#e8a838"
                  : "#7a9a6b";

            return (
              <div key={exam.id} className="flex items-center gap-4">
                <div
                  className="text-center shrink-0 w-12 py-2 rounded-[8px]"
                  style={{
                    backgroundColor: `${urgencyColor}15`,
                  }}
                >
                  <p
                    className="font-display font-bold text-[20px]"
                    style={{ color: urgencyColor }}
                  >
                    {exam.daysRemaining}
                  </p>
                  <p className="text-[9px] text-text-muted uppercase tracking-wider">
                    days
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-display font-semibold text-text-primary truncate">
                    {exam.name}
                  </p>
                  <p className="text-[11px] text-text-muted">{exam.className}</p>
                  <div className="mt-1.5 h-[4px] rounded-full bg-bg-elevated overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${exam.readiness}%`,
                        backgroundColor: urgencyColor,
                      }}
                    />
                  </div>
                </div>
                <span className="text-[11px] text-text-muted shrink-0 font-display">
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
