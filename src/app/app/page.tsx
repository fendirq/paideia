import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { VideoHero } from "@/components/video-hero";
import { ClassGrid } from "@/components/class-grid";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const classes = await db.inquiry.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { sessions: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="-mt-14">
      <VideoHero />
      <ClassGrid classes={classes} />
    </div>
  );
}
