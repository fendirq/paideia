import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ClassFolders } from "./class-folders";
import { BackButton } from "@/components/back-button";

export default async function SessionsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // Only fetch classes created via Add a Class
  const rawClasses = await db.inquiry.findMany({
    where: {
      userId: session.user.id,
      teacherNotes: "add-class",
    },
    include: {
      sessions: {
        include: { _count: { select: { messages: true } } },
        orderBy: { startedAt: "desc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const classes = rawClasses.map((c) => ({
    id: c.id,
    subject: c.subject,
    unitName: c.unitName,
    teacherName: c.teacherName,
    sessions: c.sessions.map((s) => ({
      id: s.id,
      messageCount: s._count.messages,
      startedAt: s.startedAt.toISOString(),
      status: s.status,
    })),
  }));

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 mt-4 mb-8 bg-[rgba(40,32,24,0.55)] backdrop-blur-2xl border border-[rgba(168,152,128,0.15)] rounded-[20px]">
      <BackButton href="/app" />
      <h1 className="font-serif text-[34px] text-text-primary mb-2">
        Your Classes
      </h1>
      <p className="text-[15px] text-text-secondary mb-8">
        {classes.length} class{classes.length !== 1 ? "es" : ""} ·{" "}
        {classes.reduce((sum, c) => sum + c.sessions.length, 0)} total sessions
      </p>

      <ClassFolders classes={classes} />
    </div>
  );
}
