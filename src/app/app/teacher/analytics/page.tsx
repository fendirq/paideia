import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { StatCard } from "@/components/stat-card";
import { ActivityChart } from "@/components/activity-chart";
import { DonutChart } from "@/components/donut-chart";
import { BackButton } from "@/components/back-button";

export default async function TeacherAnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") redirect("/app");

  const teacherId = session.user.id;
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get all classes for this teacher
  const classes = await db.class.findMany({
    where: { teacherId },
    select: { id: true, name: true, subject: true },
  });

  const classIds = classes.map((c) => c.id);

  // Short-circuit if teacher has no classes yet
  const sessions = classIds.length > 0
    ? await db.tutoringSession.findMany({
        where: { classId: { in: classIds } },
        select: {
          startedAt: true,
          duration: true,
          classId: true,
          inquiry: { select: { subject: true } },
          _count: { select: { messages: true } },
        },
      })
    : [];

  const totalStudents = classIds.length > 0
    ? await db.classEnrollment.count({ where: { classId: { in: classIds } } })
    : 0;

  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration ?? 0), 0);
  const totalMessages = sessions.reduce((sum, s) => sum + s._count.messages, 0);

  // Sessions this week
  const sessionsThisWeek = sessions.filter((s) => s.startedAt >= weekAgo).length;

  // Subject distribution
  const subjectCounts = new Map<string, number>();
  for (const s of sessions) {
    const subj = s.inquiry?.subject ?? "Unknown";
    subjectCounts.set(subj, (subjectCounts.get(subj) ?? 0) + 1);
  }
  const donutSegments = Array.from(subjectCounts.entries()).map(([subject, count]) => ({
    subject,
    label: subject.charAt(0) + subject.slice(1).toLowerCase(),
    count,
  }));

  // Weekly activity
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const activityMap = new Map<number, number>();
  for (const s of sessions.filter((s) => s.startedAt >= weekAgo)) {
    const day = s.startedAt.getDay();
    const adjusted = day === 0 ? 6 : day - 1;
    activityMap.set(adjusted, (activityMap.get(adjusted) ?? 0) + 1);
  }
  const activityData = dayNames.map((day, i) => ({
    day,
    count: activityMap.get(i) ?? 0,
  }));

  // Per-class stats
  const classSessionCounts = new Map<string, number>();
  for (const s of sessions) {
    if (s.classId) {
      classSessionCounts.set(s.classId, (classSessionCounts.get(s.classId) ?? 0) + 1);
    }
  }
  const maxClassSessions = Math.max(...Array.from(classSessionCounts.values()), 1);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 mt-4 mb-8 bg-[rgba(40,32,24,0.55)] backdrop-blur-2xl border border-[rgba(168,152,128,0.15)] rounded-[20px]">
      <BackButton href="/app/teacher" />
      <h1 className="font-serif text-[34px] text-text-primary mb-2">Analytics</h1>
      <p className="text-[15px] text-text-secondary mb-8">
        Student engagement across all your classes.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard value={sessionsThisWeek} label="Sessions this week" />
        <StatCard value={totalStudents} label="Total students" />
        <StatCard value={Math.round(totalDuration / 60)} label="Total mins" />
        <StatCard value={totalMessages} label="Messages" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ActivityChart data={activityData} />
        <DonutChart segments={donutSegments} total={sessions.length} />
      </div>

      {/* Per-class breakdown */}
      <div className="bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[14px] p-5">
        <h2 className="font-display font-semibold text-[15px] text-text-primary mb-4">
          Sessions by Class
        </h2>
        {classes.length === 0 ? (
          <p className="text-text-muted text-[14px]">No classes yet.</p>
        ) : (
          <div className="space-y-2">
            {classes.map((c) => {
              const count = classSessionCounts.get(c.id) ?? 0;
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-[13px] text-text-secondary w-40 truncate">{c.name}</span>
                  <div className="flex-1 h-6 bg-bg-surface/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent/40 rounded-full transition-all"
                      style={{ width: `${(count / maxClassSessions) * 100}%` }}
                    />
                  </div>
                  <span className="text-[12px] text-text-muted w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
