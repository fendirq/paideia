import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ChatContainer } from "@/components/chat-container";
import { SocraticBanner } from "@/components/socratic-banner";
import Link from "next/link";

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
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-bg-inner">
      <div className="border-b border-white/[0.08] px-6 py-3 flex items-center gap-4">
        <Link
          href={`/app/class/${tutoringSession.inquiryId}`}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-display font-semibold truncate">
            {tutoringSession.inquiry.unitName}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-text-muted">
              {subjectLabel} &middot; {tutoringSession.inquiry.teacherName}
            </p>
            <SocraticBanner
              subject={tutoringSession.inquiry.subject}
              helpType={tutoringSession.helpType}
            />
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatContainer
          sessionId={id}
          initialMessages={initialMessages}
          inquiry={{
            subject: tutoringSession.inquiry.subject,
            unitName: tutoringSession.inquiry.unitName,
            teacherName: tutoringSession.inquiry.teacherName,
            description: tutoringSession.inquiry.description,
          }}
          helpType={tutoringSession.helpType}
        />
      </div>
    </div>
  );
}
