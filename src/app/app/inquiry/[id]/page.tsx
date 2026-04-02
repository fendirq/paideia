import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function InquiryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;

  const inquiry = await db.inquiry.findUnique({
    where: { id },
    include: {
      files: { select: { id: true, fileName: true, fileType: true } },
      sessions: {
        select: {
          id: true,
          status: true,
          startedAt: true,
          _count: { select: { messages: true } },
        },
        orderBy: { startedAt: "desc" },
      },
      _count: { select: { chunks: true } },
    },
  });

  if (!inquiry || inquiry.userId !== session.user.id) redirect("/app");

  const subjectLabel =
    inquiry.subject.charAt(0) + inquiry.subject.slice(1).toLowerCase();

  return (
    <div className="p-8 max-w-3xl">
      <Link
        href="/app/library"
        className="text-sm text-text-muted hover:text-text-primary transition-colors inline-flex items-center gap-1 mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        Back to Library
      </Link>

      <div className="mb-6">
        <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">
          {subjectLabel}
        </span>
        <h1 className="text-2xl font-display font-bold mt-2">
          {inquiry.unitName}
        </h1>
        <p className="text-text-muted text-sm">{inquiry.teacherName}</p>
      </div>

      {inquiry.description && (
        <div className="card p-5 mb-6">
          <h2 className="text-sm font-semibold text-text-secondary mb-2">
            What you&apos;re working on
          </h2>
          <p className="text-text-primary text-sm leading-relaxed">
            {inquiry.description}
          </p>
        </div>
      )}

      {/* Files */}
      <div className="card p-5 mb-6">
        <h2 className="text-sm font-semibold text-text-secondary mb-3">
          Uploaded Files
        </h2>
        {inquiry.files.length === 0 ? (
          <p className="text-sm text-text-muted">No files uploaded.</p>
        ) : (
          <div className="space-y-2">
            {inquiry.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 text-sm text-text-primary"
              >
                <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <span className="truncate">{file.fileName}</span>
                <span className="text-xs text-text-muted shrink-0">
                  {file.fileType.split("/").pop()?.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
        {inquiry._count.chunks > 0 && (
          <p className="text-xs text-text-muted mt-3 pt-3 border-t border-bg-elevated">
            {inquiry._count.chunks} text chunk{inquiry._count.chunks !== 1 ? "s" : ""} indexed for tutoring
          </p>
        )}
      </div>

      {/* Sessions */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text-secondary">
            Tutoring Sessions
          </h2>
          <Link
            href={`/app/sessions/new?inquiry=${inquiry.id}`}
            className="text-sm text-accent hover:text-accent-light transition-colors"
          >
            + New session
          </Link>
        </div>
        {inquiry.sessions.length === 0 ? (
          <p className="text-sm text-text-muted">No sessions yet.</p>
        ) : (
          <div className="space-y-2">
            {inquiry.sessions.map((s) => (
              <Link
                key={s.id}
                href={`/app/sessions/${s.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-bg-elevated/50 transition-colors"
              >
                <div>
                  <p className="text-sm text-text-primary">
                    {new Date(s.startedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-text-muted">
                    {s._count.messages} message{s._count.messages !== 1 ? "s" : ""}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    s.status === "ACTIVE"
                      ? "text-accent bg-accent/10"
                      : "text-text-muted bg-bg-elevated"
                  }`}
                >
                  {s.status === "ACTIVE" ? "Active" : "Completed"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Start session CTA */}
      <Link
        href={`/app/sessions/new?inquiry=${inquiry.id}`}
        className="btn-primary inline-block text-center w-full"
      >
        Start Tutoring Session
      </Link>
    </div>
  );
}
