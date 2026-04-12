import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { StatCard } from "@/components/stat-card";
import { ActivityChart } from "@/components/activity-chart";
import { DonutChart } from "@/components/donut-chart";
import { ExamCountdown } from "@/components/exam-countdown";
import { StudyQueue } from "@/components/study-queue";
import { BackButton } from "@/components/back-button";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = session.user.id;
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [
    sessionsThisWeek,
    sessionsLastWeek,
    totalSessions,
    exams,
    studyItems,
  ] = await Promise.all([
    db.tutoringSession.count({
      where: { userId, startedAt: { gte: weekAgo } },
    }),
    db.tutoringSession.count({
      where: { userId, startedAt: { gte: twoWeeksAgo, lt: weekAgo } },
    }),
    db.tutoringSession.findMany({
      where: { userId },
      select: { startedAt: true, inquiry: { select: { subject: true, unitName: true } } },
    }),
    db.exam.findMany({
      where: {
        inquiry: { userId },
        date: { gte: now },
      },
      include: {
        inquiry: { select: { unitName: true } },
      },
      orderBy: { date: "asc" },
      take: 5,
    }),
    db.studyItem.findMany({
      where: { inquiry: { userId } },
      include: {
        inquiry: { select: { unitName: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  // Compute stats
  const sessionsTrend = sessionsThisWeek - sessionsLastWeek;

  // Compute streak from totalSessions (all dates in UTC)
  const uniqueDays = new Set(
    totalSessions.map((s) => s.startedAt.toISOString().split("T")[0])
  );
  let streak = 0;
  const todayUTC = new Date().toISOString().split("T")[0];
  const hasSessionToday = uniqueDays.has(todayUTC);
  // If no session today, start counting from yesterday so partial days don't break streak
  const startOffset = hasSessionToday ? 0 : 1;
  for (let i = startOffset; i < 365; i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    if (uniqueDays.has(d.toISOString().split("T")[0])) {
      streak++;
    } else {
      break;
    }
  }

  // Message count
  const messageCount = await db.message.count({
    where: { session: { userId } },
  });

  // Donut data
  const subjectCounts = new Map<string, number>();
  for (const s of totalSessions) {
    const subj = s.inquiry?.subject ?? "Unknown";
    subjectCounts.set(subj, (subjectCounts.get(subj) ?? 0) + 1);
  }
  const donutSegments = Array.from(subjectCounts.entries()).map(
    ([subject, count]) => ({
      subject,
      label: subject.charAt(0) + subject.slice(1).toLowerCase(),
      count,
    })
  );

  // Weekly activity data (Mon-Sun) — derived from totalSessions
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const activityMap = new Map<number, number>();
  for (const s of totalSessions.filter((s) => s.startedAt >= weekAgo)) {
    const day = s.startedAt.getDay();
    const adjusted = day === 0 ? 6 : day - 1; // Mon=0, Sun=6
    activityMap.set(adjusted, (activityMap.get(adjusted) ?? 0) + 1);
  }
  const activityData = dayNames.map((day, i) => ({
    day,
    count: activityMap.get(i) ?? 0,
  }));

  // Exam countdown
  const examItems = exams.map((e) => {
    const diff = Math.ceil(
      (e.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return {
      id: e.id,
      name: e.name,
      className: e.inquiry.unitName,
      daysRemaining: diff,
      readiness: 0,
    };
  });

  // Study queue
  const queueItems = studyItems.map((item) => ({
    id: item.id,
    topic: item.topic,
    chapter: item.chapter,
    className: item.inquiry.unitName,
    status: item.status as "NEW" | "REVIEW" | "PRACTICED",
    completed: item.status === "PRACTICED",
  }));

  const uniqueSubjects = new Set(totalSessions.map((s) => s.inquiry?.subject ?? "Unknown"));

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 mt-4 mb-8 bg-[rgba(40,32,24,0.55)] backdrop-blur-2xl border border-[rgba(168,152,128,0.15)] rounded-[20px]">
      <BackButton href="/app" />
      <h1 className="font-serif text-[34px] text-text-primary mb-2">
        Analytics
      </h1>
      <p className="text-[15px] text-text-secondary mb-8">
        Track your study habits and upcoming goals.
      </p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          value={sessionsThisWeek}
          label="Sessions"
          trend={sessionsTrend > 0 ? sessionsTrend : undefined}
        />
        <StatCard value={streak} label="Day streak" />
        <StatCard value={messageCount} label="Messages" />
        <StatCard value={uniqueSubjects.size} label="Subjects" />
      </div>

      {/* Activity + Donut side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ActivityChart data={activityData} />
        <DonutChart segments={donutSegments} total={totalSessions.length} />
      </div>

      {/* Exams */}
      <div className="mb-6">
        <ExamCountdown exams={examItems} />
      </div>

      {/* Study queue */}
      <StudyQueue items={queueItems} />
    </div>
  );
}
