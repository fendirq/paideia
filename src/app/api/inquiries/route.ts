import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { processInquiryFiles } from "@/lib/rag-pipeline";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { subject, teacherName, unitName, description, files } = body;

  if (!subject || !teacherName || !unitName || !description) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (!files || !Array.isArray(files) || files.length === 0) {
    return NextResponse.json(
      { error: "At least one file is required" },
      { status: 400 }
    );
  }

  if (files.length > 5) {
    return NextResponse.json(
      { error: "Maximum 5 files per inquiry" },
      { status: 400 }
    );
  }

  const inquiry = await db.inquiry.create({
    data: {
      userId: session.user.id,
      subject,
      teacherName,
      unitName,
      description,
      files: {
        create: files.map(
          (f: { url: string; fileName: string; fileType: string }) => ({
            fileName: f.fileName,
            fileUrl: f.url,
            fileType: f.fileType,
          })
        ),
      },
    },
    include: { files: true },
  });

  // Trigger RAG pipeline — process synchronously for now
  try {
    await processInquiryFiles(inquiry.id);
  } catch (error) {
    console.error("RAG pipeline error:", error);
    // Don't fail the inquiry creation — RAG can be retried
  }

  return NextResponse.json(inquiry, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inquiries = await db.inquiry.findMany({
    where: { userId: session.user.id },
    include: {
      files: { select: { id: true, fileName: true, fileType: true } },
      _count: { select: { sessions: true, chunks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(inquiries);
}
