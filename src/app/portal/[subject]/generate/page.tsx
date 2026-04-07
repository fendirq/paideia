import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hasLevel2Access } from "@/lib/payment";
import { GeneratePage } from "@/components/portal/GeneratePage";

export default async function GenerateRoute({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { subject } = await params;

  const [profile, hasLevel2] = await Promise.all([
    db.writingProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    }),
    hasLevel2Access(session.user.id, session.user.role),
  ]);

  if (!profile) redirect("/portal/aggregate");

  return <GeneratePage subject={subject} hasLevel2={hasLevel2} />;
}
