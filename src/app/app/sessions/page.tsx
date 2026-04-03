import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SessionsList } from "./sessions-list";

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

  const serialized = sessions.map((s) => ({
    id: s.id,
    inquiryId: s.inquiryId,
    subject: s.inquiry.subject,
    unitName: s.inquiry.unitName,
    teacherName: s.inquiry.teacherName,
    messageCount: s._count.messages,
    startedAt: s.startedAt.toISOString(),
  }));

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="font-serif text-[34px] text-text-primary mb-2">
        Your sessions
      </h1>
      <p className="text-[15px] text-text-secondary mb-8">
        {sessions.length} session{sessions.length !== 1 ? "s" : ""} across your
        classes.
      </p>

      <SessionsList sessions={serialized} />
    </div>
  );
}
