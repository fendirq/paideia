import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalHome } from "@/components/portal/PortalHome";

export default async function PortalHomePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [classes, profile] = await Promise.all([
    db.inquiry.findMany({
      where: { userId: session.user.id, teacherNotes: "add-class" },
      orderBy: { updatedAt: "desc" },
      select: { id: true, unitName: true, subject: true },
    }),
    db.writingProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    }),
  ]);

  return (
    <PortalHome
      userName={session.user.name}
      classes={classes.map((c) => ({
        id: c.id,
        name: c.unitName,
        subject: c.subject,
      }))}
      hasProfile={!!profile}
    />
  );
}
