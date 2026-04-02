import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const inquiries = await db.inquiry.findMany({
    where: { userId: session.user.id },
    include: {
      files: { select: { fileName: true } },
      _count: { select: { sessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">Library</h1>
      <p className="text-text-secondary mb-8">
        Your uploaded coursework and study materials.
      </p>

      {inquiries.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-text-muted">No uploads yet.</p>
          <a
            href="/app/upload"
            className="text-accent text-sm mt-2 inline-block"
          >
            Upload coursework to get started
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => {
            const subjectLabel =
              inq.subject.charAt(0) + inq.subject.slice(1).toLowerCase();
            return (
              <div key={inq.id} className="card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">
                      {subjectLabel}
                    </span>
                    <h3 className="font-display font-semibold text-base mt-2">
                      {inq.unitName}
                    </h3>
                    <p className="text-sm text-text-muted">{inq.teacherName}</p>
                    {inq.files.length > 0 && (
                      <p className="text-xs text-text-muted mt-2">
                        {inq.files.map((f) => f.fileName).join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-xs text-text-muted">
                      {inq._count.sessions} session
                      {inq._count.sessions !== 1 ? "s" : ""}
                    </p>
                    <a
                      href={`/app/sessions/new?inquiry=${inq.id}`}
                      className="text-sm text-accent hover:text-accent-light mt-2 inline-block"
                    >
                      Start session
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
