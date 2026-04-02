import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { db } from "@/lib/db";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const isAdmin = session.user.role === "ADMIN";

  // Non-admin users without a role go to onboarding
  if (!isAdmin && !session.user.role) {
    redirect("/onboarding");
  }

  // Fetch recent sessions for sidebar
  const recentSessions = await db.tutoringSession.findMany({
    where: { userId: session.user.id },
    include: {
      inquiry: { select: { unitName: true, teacherName: true } },
    },
    orderBy: { startedAt: "desc" },
    take: 15,
  });

  const sessions = recentSessions.map((s) => ({
    id: s.id,
    unitName: s.inquiry.unitName,
    teacherName: s.inquiry.teacherName,
    status: s.status,
  }));

  return (
    <AppShell
      userName={session.user.name ?? undefined}
      userRole={session.user.role}
      recentSessions={sessions}
    >
      {children}
    </AppShell>
  );
}
