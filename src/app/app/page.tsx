import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const name = session.user?.name?.split(" ")[0] ?? "User";
  const role = session.user?.role;
  const userId = session.user.id;

  const [inquiryCount, sessionCount, recentSessions] = await Promise.all([
    db.inquiry.count({ where: { userId } }),
    db.tutoringSession.count({ where: { userId } }),
    db.tutoringSession.findMany({
      where: { userId },
      include: {
        inquiry: { select: { subject: true, unitName: true, teacherName: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { startedAt: "desc" },
      take: 5,
    }),
  ]);

  const subjectLabel = (s: string) =>
    s.charAt(0) + s.slice(1).toLowerCase();

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-display font-bold mb-1">
        Welcome back, {name}
      </h1>
      <p className="text-text-secondary mb-8">
        {role === "TEACHER"
          ? "Manage your classes and track student progress."
          : "Ready to learn something new today?"}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <p className="text-2xl font-display font-bold">{inquiryCount}</p>
          <p className="text-sm text-text-muted mt-1">
            {inquiryCount === 1 ? "Subject" : "Subjects"}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-2xl font-display font-bold">{sessionCount}</p>
          <p className="text-sm text-text-muted mt-1">
            {sessionCount === 1 ? "Session" : "Sessions"}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-2xl font-display font-bold">
            {recentSessions.reduce((sum, s) => sum + s._count.messages, 0)}
          </p>
          <p className="text-sm text-text-muted mt-1">Messages</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link
          href="/app/upload"
          className="card p-5 hover:border-accent transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <h3 className="font-display font-semibold">Upload New Work</h3>
          </div>
          <p className="text-text-secondary text-sm">
            Submit coursework and start a tutoring session.
          </p>
        </Link>
        <Link
          href="/app/library"
          className="card p-5 hover:border-accent transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 className="font-display font-semibold">Browse Library</h3>
          </div>
          <p className="text-text-secondary text-sm">
            Explore your resources by subject, teacher, and unit.
          </p>
        </Link>
      </div>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold">
              Recent Sessions
            </h2>
            <Link
              href="/app/sessions"
              className="text-sm text-accent hover:text-accent-light transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {recentSessions.map((s) => (
              <Link
                key={s.id}
                href={`/app/sessions/${s.id}`}
                className="card p-4 flex items-center justify-between hover:border-accent/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded shrink-0">
                    {subjectLabel(s.inquiry.subject)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {s.inquiry.unitName}
                    </p>
                    <p className="text-xs text-text-muted">
                      {s.inquiry.teacherName}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-xs text-text-muted">
                    {s._count.messages} msg{s._count.messages !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-text-muted">
                    {new Date(s.startedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recentSessions.length === 0 && (
        <div className="card p-8 text-center">
          <p className="text-text-muted mb-2">No sessions yet.</p>
          <Link href="/app/upload" className="text-accent text-sm">
            Upload coursework to get started
          </Link>
        </div>
      )}
    </div>
  );
}
