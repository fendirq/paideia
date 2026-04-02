import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function NewSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ inquiry?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { inquiry: inquiryId } = await searchParams;
  if (!inquiryId) redirect("/app");

  const inquiry = await db.inquiry.findUnique({ where: { id: inquiryId } });
  if (!inquiry || inquiry.userId !== session.user.id) redirect("/app");

  // Create new tutoring session
  const tutoringSession = await db.tutoringSession.create({
    data: {
      userId: session.user.id,
      inquiryId,
    },
  });

  redirect(`/app/sessions/${tutoringSession.id}`);
}
