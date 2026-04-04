import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { VALID_HELP_TYPES } from "@/lib/help-types";

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ inquiry?: string; helpType?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { inquiry: inquiryId, helpType: rawHelpType } = await searchParams;
  const helpType = rawHelpType && VALID_HELP_TYPES.has(rawHelpType) ? rawHelpType : null;
  if (!inquiryId) redirect("/app");

  const inquiry = await db.inquiry.findUnique({ where: { id: inquiryId } });
  if (!inquiry || inquiry.userId !== session.user.id) redirect("/app");

  // Reuse an active session with the same inquiry + helpType to avoid duplicates on refresh
  const existing = await db.tutoringSession.findFirst({
    where: {
      userId: session.user.id,
      inquiryId,
      helpType,
      status: "ACTIVE",
    },
    orderBy: { startedAt: "desc" },
  });

  if (existing) {
    redirect(`/app/sessions/${existing.id}`);
  }

  const tutoringSession = await db.tutoringSession.create({
    data: {
      userId: session.user.id,
      inquiryId,
      helpType,
    },
  });

  redirect(`/app/sessions/${tutoringSession.id}`);
}
