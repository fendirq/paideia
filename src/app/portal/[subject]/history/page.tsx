import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HistoryPage } from "@/components/portal/HistoryPage";

export default async function HistoryRoute({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { subject } = await params;

  return <HistoryPage subject={subject} />;
}
