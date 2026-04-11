import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ClassDetail } from "@/components/portal/ClassDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClassDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;

  const portalClass = await db.portalClass.findUnique({
    where: { id },
    select: { id: true, name: true, subject: true, userId: true },
  });

  if (!portalClass || portalClass.userId !== session.user.id) {
    notFound();
  }

  const essays = await db.generatedEssay.findMany({
    where: { portalClassId: id, userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      assignment: true,
      level: true,
      wordCount: true,
      createdAt: true,
    },
    take: 50,
  });

  return (
    <ClassDetail
      classId={portalClass.id}
      className={portalClass.name}
      subject={portalClass.subject}
      essays={essays.map((e) => ({
        ...e,
        createdAt: e.createdAt.toISOString(),
      }))}
    />
  );
}
