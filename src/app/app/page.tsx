import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { VideoHero } from "@/components/video-hero";
import { ClassGrid } from "@/components/class-grid";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const rawClasses = await db.inquiry.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { sessions: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const classes = rawClasses.map((c) => ({
    id: c.id,
    subject: c.subject,
    unitName: c.unitName,
    teacherName: c.teacherName,
    updatedAt: c.updatedAt.toISOString(),
    _count: c._count,
  }));

  return (
    <div>
      <VideoHero userName={session.user.name} />
      <ClassGrid classes={classes} />
    </div>
  );
}
