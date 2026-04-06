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
  const { subject, teacherName, unitName, description, files, source } = body;

  if (!subject || !teacherName || !unitName || !description) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const VALID_SUBJECTS = new Set(["MATHEMATICS", "ENGLISH", "HISTORY", "SCIENCE", "MANDARIN", "HUMANITIES", "OTHER"]);
  if (!VALID_SUBJECTS.has(subject)) {
    return NextResponse.json(
      { error: "Invalid subject" },
      { status: 400 }
    );
  }

  if (typeof teacherName !== "string" || teacherName.length > 100 ||
      typeof unitName !== "string" || unitName.length > 100 ||
      typeof description !== "string" || description.length > 2000) {
    return NextResponse.json(
      { error: "Field length exceeded" },
      { status: 400 }
    );
  }

  if (files && !Array.isArray(files)) {
    return NextResponse.json(
      { error: "Files must be an array" },
      { status: 400 }
    );
  }

  if (files && files.length > 5) {
    return NextResponse.json(
      { error: "Maximum 5 files per inquiry" },
      { status: 400 }
    );
  }

  const fileData = Array.isArray(files) && files.length > 0
    ? files.map((f: { url: string; fileName: string; fileType: string }) => ({
        fileName: f.fileName,
        fileUrl: f.url,
        fileType: f.fileType,
      }))
    : [];

  const inquiry = await db.inquiry.create({
    data: {
      userId: session.user.id,
      subject,
      teacherName,
      unitName,
      description,
      ...(source === "add-class" && { teacherNotes: "add-class" }),
      ...(fileData.length > 0 && { files: { create: fileData } }),
    },
    include: { files: true },
  });

  // Trigger RAG pipeline if files were uploaded
  if (fileData.length > 0) {
    try {
      await processInquiryFiles(inquiry.id);
    } catch (error) {
      console.error("RAG pipeline error:", error);
    }
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
