"use client";

interface StudentRow {
  id: string;
  name: string | null;
  email: string;
  grade: string | null;
  sessionCount: number;
  totalDuration: number;
  totalMessages: number;
  lastActive: string | null;
}

interface StudentTableProps {
  students: StudentRow[];
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hrs}h ${remainingMins}m`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Never";
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function StudentTable({ students }: StudentTableProps) {
  if (students.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted text-[14px]">
        No students enrolled yet. Share the join code to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-left text-text-muted border-b border-[rgba(168,152,128,0.12)]">
            <th className="pb-3 font-display font-medium">Student</th>
            <th className="pb-3 font-display font-medium">Grade</th>
            <th className="pb-3 font-display font-medium text-right">Sessions</th>
            <th className="pb-3 font-display font-medium text-right">Time</th>
            <th className="pb-3 font-display font-medium text-right">Messages</th>
            <th className="pb-3 font-display font-medium text-right">Last Active</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(168,152,128,0.12)]">
          {students.map((s) => (
            <tr key={s.id} className="text-text-secondary">
              <td className="py-3">
                <div>
                  <p className="text-text-primary font-medium">{s.name || "Unnamed"}</p>
                  <p className="text-[11px] text-text-muted">{s.email}</p>
                </div>
              </td>
              <td className="py-3">{s.grade || "—"}</td>
              <td className="py-3 text-right">{s.sessionCount}</td>
              <td className="py-3 text-right">{formatDuration(s.totalDuration)}</td>
              <td className="py-3 text-right">{s.totalMessages}</td>
              <td className="py-3 text-right">{formatDate(s.lastActive)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
