import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function SessionsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const sessions = await db.tutoringSession.findMany({
    where: { userId: session.user.id },
    include: {
      inquiry: {
        select: { subject: true, unitName: true, teacherName: true },
      },
      _count: { select: { messages: true } },
    },
    orderBy: { startedAt: "desc" },
  });

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Tutoring Sessions</h1>
      <p className="text-text-secondary mb-8">
        Your past and active tutoring sessions.
      </p>

      {sessions.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-text-muted">No sessions yet.</p>
          <a
            href="/app/upload"
            className="text-accent text-sm mt-2 inline-block"
          >
            Upload coursework to start
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => {
            const subjectLabel =
              s.inquiry.subject.charAt(0) +
              s.inquiry.subject.slice(1).toLowerCase();
            return (
              <a
                key={s.id}
                href={`/app/sessions/${s.id}`}
                className="card p-4 block hover:border-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-sm">
                      {s.inquiry.unitName}
                    </h3>
                    <p className="text-xs text-text-muted">
                      {subjectLabel} &middot; {s.inquiry.teacherName} &middot;{" "}
                      {s._count.messages} messages
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        s.status === "ACTIVE"
                          ? "bg-accent/10 text-accent"
                          : "bg-bg-elevated text-text-muted"
                      }`}
                    >
                      {s.status === "ACTIVE" ? "Active" : "Completed"}
                    </span>
                    <p className="text-xs text-text-muted mt-1">
                      {new Date(s.startedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
