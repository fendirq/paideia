import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function InquiryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;

  const inquiry = await db.inquiry.findUnique({ where: { id } });
  if (!inquiry || inquiry.userId !== session.user.id) redirect("/app");

  // Skip inquiry detail — go straight to chat
  redirect(`/app/sessions/new?inquiry=${id}`);
}
