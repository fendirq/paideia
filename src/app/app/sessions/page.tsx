import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SessionCard } from "@/components/session-card";
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

const MAX_VISIBLE = 4;

export default async function SessionsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const sessions = await db.tutoringSession.findMany({
    where: { userId: session.user.id },
    include: {
      inquiry: {
        select: { id: true, subject: true, unitName: true, teacherName: true },
      },
      _count: { select: { messages: true } },
    },
    orderBy: { startedAt: "desc" },
  });

  // Group by inquiry
  const grouped = new Map<
    string,
    {
      inquiryId: string;
      subject: string;
      unitName: string;
      teacherName: string;
      sessions: typeof sessions;
    }
  >();

  for (const s of sessions) {
    const key = s.inquiryId;
    if (!grouped.has(key)) {
      grouped.set(key, {
        inquiryId: s.inquiry.id,
        subject: s.inquiry.subject,
        unitName: s.inquiry.unitName,
        teacherName: s.inquiry.teacherName,
        sessions: [],
      });
    }
    grouped.get(key)!.sessions.push(s);
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-bg-inner">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-display font-bold mb-1">Sessions</h1>
        <p className="text-text-secondary text-sm mb-8">
          Your tutoring conversations, organized by class.
        </p>

        {sessions.length === 0 ? (
          <div className="bg-bg-surface/50 border border-white/[0.04] rounded-xl p-12 text-center">
            <p className="text-text-muted mb-3">No sessions yet.</p>
            <Link href="/app/upload" className="text-accent text-sm hover:text-accent-light transition-colors">
              Upload coursework to get started
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {Array.from(grouped.values()).map((group) => {
              const color = SUBJECT_COLORS[group.subject] ?? SUBJECT_COLORS.OTHER;
              const visible = group.sessions.slice(0, MAX_VISIBLE);
              const hasMore = group.sessions.length > MAX_VISIBLE;

              return (
                <section key={group.inquiryId}>
                  {/* Class header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <h2 className="font-display font-semibold text-lg">
                      {group.unitName}
                    </h2>
                    <span className="text-text-muted text-sm">
                      {group.teacherName}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.04] text-text-muted border border-white/[0.06] ml-auto">
                      {group.sessions.length}
                    </span>
                  </div>

                  {/* Session cards grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {visible.map((s) => (
                      <SessionCard
                        key={s.id}
                        id={s.id}
                        unitName={s.inquiry.unitName}
                        subject={s.inquiry.subject}
                        messageCount={s._count.messages}
                        status={s.status}
                        startedAt={s.startedAt.toISOString()}
                      />
                    ))}
                  </div>

                  {hasMore && (
                    <div className="mt-3 text-right">
                      <Link
                        href={`/app/inquiry/${group.inquiryId}`}
                        className="text-sm text-accent hover:text-accent-light transition-colors"
                      >
                        See more &rarr;
                      </Link>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
