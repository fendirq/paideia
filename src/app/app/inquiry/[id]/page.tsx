import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { FileCabinet } from "@/components/file-cabinet";
import { validateStructure, type MaterialStructure } from "@/lib/material-structure";

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
          structure: true,
          structureKind: true,
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { chunks: true } },
    },
  });

  if (!inquiry || inquiry.userId !== session.user.id) redirect("/app");

  // First non-unknown validated structure across the inquiry's files.
  // Mirrors the selection logic in src/app/api/sessions/[id]/chat/route.ts
  // so the menu and the tutor both see the same structure.
  let structure: MaterialStructure | null = null;
  for (const f of inquiry.files) {
    if (!f.structure) continue;
    const parsed = validateStructure(f.structure);
    if (parsed && parsed.kind !== "unknown") {
      structure = parsed;
      break;
    }
  }

  return (
    <FileCabinet
      files={inquiry.files.map((f) => ({
        id: f.id,
        fileName: f.fileName,
        fileType: f.fileType,
        extractedText: f.extractedText,
        createdAt: f.createdAt.toISOString(),
      }))}
      inquiryId={inquiry.id}
      unitName={inquiry.unitName}
      teacherName={inquiry.teacherName}
      subject={inquiry.subject}
      description={inquiry.description}
      chunkCount={inquiry._count.chunks}
      teacherNotes={inquiry.teacherNotes}
      isTeacher={session.user.role === "TEACHER"}
      structure={structure}
    />
  );
}
