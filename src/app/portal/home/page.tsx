import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PortalHome } from "@/components/portal/PortalHome";

export default async function PortalHomePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = session.user.id;

  const [classes, profile] = await Promise.all([
    db.portalClass.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, subject: true },
    }),
    db.writingProfile.findUnique({
      where: { userId },
      select: { id: true },
    }),
  ]);

  return (
    <PortalHome
      userName={session.user.name}
      initialClasses={classes}
      hasProfile={!!profile}
    />
  );
}
