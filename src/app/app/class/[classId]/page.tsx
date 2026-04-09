import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SUBJECT_LABELS, SUBJECT_COLORS } from "@/lib/subject-constants";
import { BackButton } from "@/components/back-button";
import Link from "next/link";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { classId } = await params;

  const inquiry = await db.inquiry.findUnique({
    where: { id: classId },
    include: {
      sessions: {
        include: {
          _count: { select: { messages: true } },
        },
        orderBy: { startedAt: "desc" },
      },
    },
  });

  if (!inquiry || inquiry.userId !== session.user.id) {
    redirect("/app");
  }

  const label = SUBJECT_LABELS[inquiry.subject] ?? "Other";
  const color = SUBJECT_COLORS[inquiry.subject] ?? SUBJECT_COLORS.OTHER;
  const totalMessages = inquiry.sessions.reduce(
    (sum, s) => sum + s._count.messages,
    0
  );

  // Find common struggles from helpType field
  const helpTopics = inquiry.sessions
    .map((s) => s.helpType)
    .filter((h): h is string => !!h);

  // Calculate time spent (rough: ~2 min per message exchange)
  const estimatedMinutes = totalMessages * 1;

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 mt-4 mb-8 bg-[rgba(40,32,24,0.55)] backdrop-blur-2xl border border-[rgba(168,152,128,0.15)] rounded-[20px]">
      <BackButton href="/app" />

      {/* Class header */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-[24px] text-text-primary">
            {inquiry.unitName}
          </h1>
          <p className="text-[14px] text-text-muted">
            {label} · {inquiry.teacherName}
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[14px] px-4 py-3">
          <p className="text-[22px] font-display font-semibold text-text-primary">
            {inquiry.sessions.length}
          </p>
          <p className="text-[12px] text-text-muted">Sessions</p>
        </div>
        <div className="bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[14px] px-4 py-3">
          <p className="text-[22px] font-display font-semibold text-text-primary">
            {totalMessages}
          </p>
          <p className="text-[12px] text-text-muted">Messages</p>
        </div>
        <div className="bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[14px] px-4 py-3">
          <p className="text-[22px] font-display font-semibold text-text-primary">
            {estimatedMinutes < 60
              ? `${estimatedMinutes}m`
              : `${Math.round(estimatedMinutes / 60)}h`}
          </p>
          <p className="text-[12px] text-text-muted">Time Spent</p>
        </div>
      </div>

      {/* Sessions list */}
      <div>
        <div className="flex flex-col items-center mb-8">
          <Link
            href={`/app/start/${classId}`}
            className="flex flex-col items-center gap-3 group"
          >
            <div className="w-14 h-14 rounded-full bg-accent border-2 border-accent-light flex items-center justify-center shadow-[0_0_20px_rgba(168,152,128,0.25)] group-hover:bg-accent-light transition-colors">
              <svg className="w-7 h-7 text-[#281c14]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="bg-[rgba(40,32,24,0.50)] backdrop-blur-xl border border-[rgba(168,152,128,0.20)] rounded-full px-6 py-2 text-[13px] font-medium text-text-primary hover:bg-[rgba(168,152,128,0.18)] transition-colors">
              Start New Chat
            </span>
          </Link>
        </div>

        <h2 className="font-display font-semibold text-[16px] text-text-primary mb-4">
          Past Sessions
        </h2>

        {inquiry.sessions.length === 0 ? (
          <div className="bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[14px] p-8 text-center">
            <p className="text-text-muted text-[14px] mb-4">No sessions yet.</p>
            <Link
              href={`/app/start/${classId}`}
              className="inline-block bg-accent border-2 border-accent-light rounded-full px-6 py-2.5 text-[13px] font-medium text-[#281c14] shadow-[0_0_20px_rgba(168,152,128,0.25)] hover:bg-accent-light transition-colors"
            >
              Start New Chat
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {inquiry.sessions.map((s, i) => {
              const date = new Date(s.startedAt);
              const timeAgo = getTimeAgo(date);
              return (
                <Link
                  key={s.id}
                  href={`/app/sessions/${s.id}`}
                  className="group flex items-center gap-4 bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[14px] px-4 py-3.5 hover:border-[rgba(168,152,128,0.15)] transition-all"
                >
                  <span className="w-7 h-7 rounded-full bg-bg-elevated flex items-center justify-center text-[12px] font-mono text-text-muted flex-shrink-0">
                    {inquiry.sessions.length - i}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-text-primary truncate">
                      {s.helpType ?? `Session ${inquiry.sessions.length - i}`}
                    </p>
                    <p className="text-[12px] text-text-muted">
                      {s._count.messages} messages · {timeAgo}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
