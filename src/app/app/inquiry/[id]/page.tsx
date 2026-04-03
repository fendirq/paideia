import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { FileCabinet } from "@/components/file-cabinet";

export default async function InquiryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;

  const inquiry = await db.inquiry.findUnique({
    where: { id },
    include: {
      files: {
        select: {
          id: true,
          fileName: true,
          fileType: true,
          extractedText: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { chunks: true } },
    },
  });

  if (!inquiry || inquiry.userId !== session.user.id) redirect("/app");

  const subjectLabel =
    inquiry.subject.charAt(0) + inquiry.subject.slice(1).toLowerCase();

  return (
    <FileCabinet
      files={inquiry.files.map((f) => ({
        ...f,
        createdAt: f.createdAt.toISOString(),
      }))}
      inquiryId={inquiry.id}
      unitName={inquiry.unitName}
      teacherName={inquiry.teacherName}
      subject={subjectLabel}
      description={inquiry.description}
      chunkCount={inquiry._count.chunks}
    />
  );
}
