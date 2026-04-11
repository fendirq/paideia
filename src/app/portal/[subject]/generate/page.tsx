import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";

const VALID_SUBJECTS = new Set(["history", "english", "humanities"]);
import { hasLevel2Access } from "@/lib/payment";
import { GeneratePage } from "@/components/portal/GeneratePage";

export default async function GenerateRoute({
  params,
  searchParams,
}: {
  params: Promise<{ subject: string }>;
  searchParams: Promise<{ classId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [{ subject }, query] = await Promise.all([params, searchParams]);

  if (!VALID_SUBJECTS.has(subject)) notFound();

  const [profile, hasLevel2] = await Promise.all([
    db.writingProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    }),
    hasLevel2Access(session.user.id, session.user.role),
  ]);

  if (!profile) redirect("/portal/aggregate");

  if (query.classId) {
    const cls = await db.portalClass.findUnique({
      where: { id: query.classId },
      select: { userId: true },
    });
    if (!cls || cls.userId !== session.user.id) notFound();
  }

  return <GeneratePage subject={subject} hasLevel2={hasLevel2} classId={query.classId} />;
}
