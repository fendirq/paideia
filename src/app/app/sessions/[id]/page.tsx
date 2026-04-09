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
      material: {
        select: {
          title: true,
          description: true,
          class: { select: { name: true, subject: true, teacher: { select: { name: true } } } },
        },
      },
      messages: { orderBy: { createdAt: "desc" }, take: 100 },
    },
  });

  if (!tutoringSession || tutoringSession.userId !== session.user.id) {
    redirect("/app");
  }

  // Messages fetched desc for efficient "last N" — reverse to chronological
  const initialMessages = [...tutoringSession.messages].reverse().map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    suggestedActions: m.suggestedActions,
  }));

  // Derive context from inquiry OR material
  const mat = tutoringSession.material;
  const subject = tutoringSession.inquiry?.subject ?? mat?.class?.subject ?? "Unknown";
  const unitName = tutoringSession.inquiry?.unitName ?? mat?.title ?? "Unknown";
  const teacherName = tutoringSession.inquiry?.teacherName ?? mat?.class?.teacher?.name ?? "Unknown";
  const description = tutoringSession.inquiry?.description ?? mat?.description ?? "";

  const subjectLabel = subject.charAt(0) + subject.slice(1).toLowerCase();

  const backHref = tutoringSession.materialId && tutoringSession.classId
    ? `/app/enrolled/${tutoringSession.classId}`
    : tutoringSession.inquiryId
      ? `/app/start/${tutoringSession.inquiryId}`
      : "/app";

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-bg-inner">
      <div className="border-b border-[rgba(168,152,128,0.15)] px-6 py-3 flex items-center gap-4">
        <Link
          href={backHref}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-display font-semibold truncate">
            {unitName}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-text-muted">
              {subjectLabel} &middot; {teacherName}
            </p>
            <SocraticBanner
              subject={subject}
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
            subject,
            unitName,
            teacherName,
            description,
          }}
          helpType={tutoringSession.helpType}
        />
      </div>
    </div>
  );
}
