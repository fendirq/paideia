import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ChatContainer } from "@/components/chat-container";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;

  const tutoringSession = await db.tutoringSession.findUnique({
    where: { id },
    include: {
      inquiry: {
        select: { subject: true, unitName: true, teacherName: true, description: true },
      },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!tutoringSession || tutoringSession.userId !== session.user.id) {
    redirect("/app");
  }

  const initialMessages = tutoringSession.messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    suggestedActions: m.suggestedActions,
  }));

  const subjectLabel =
    tutoringSession.inquiry.subject.charAt(0) +
    tutoringSession.inquiry.subject.slice(1).toLowerCase();

  return (
    <div className="flex flex-col h-full overflow-hidden bg-bg-surface">
      <div className="border-b border-bg-elevated px-6 py-4 flex items-center gap-4">
        <a
          href="/app"
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </a>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-display font-semibold truncate">
            {tutoringSession.inquiry.unitName}
          </h1>
          <p className="text-sm text-text-muted">
            {subjectLabel} &middot; {tutoringSession.inquiry.teacherName}
          </p>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatContainer
          sessionId={id}
          initialMessages={initialMessages}
          inquiry={{
            subject: subjectLabel,
            unitName: tutoringSession.inquiry.unitName,
            teacherName: tutoringSession.inquiry.teacherName,
            description: tutoringSession.inquiry.description,
          }}
        />
      </div>
    </div>
  );
}
