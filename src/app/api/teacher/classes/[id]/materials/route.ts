import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { processMaterialFiles } from "@/lib/rag-pipeline";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const classWhere = session.user.role === "ADMIN" ? { id } : { id, teacherId: session.user.id };
  const cls = await db.class.findUnique({
    where: classWhere,
    select: { id: true },
  });

  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const materials = await db.classMaterial.findMany({
    where: { classId: id },
    include: {
      files: { select: { id: true, fileName: true, fileType: true } },
      _count: { select: { sessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(materials);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const postClassWhere = session.user.role === "ADMIN" ? { id } : { id, teacherId: session.user.id };
  const cls2 = await db.class.findUnique({
    where: postClassWhere,
    select: { id: true },
  });

  if (!cls2) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const { title, description, dueDate, files } = await req.json();

  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (title.trim().length > 200) {
    return NextResponse.json({ error: "Title too long" }, { status: 400 });
  }
  if (!description || typeof description !== "string" || !description.trim()) {
    return NextResponse.json({ error: "Description is required" }, { status: 400 });
  }
  if (description.trim().length > 2000) {
    return NextResponse.json({ error: "Description too long" }, { status: 400 });
  }

  // Validate dueDate
  let parsedDueDate: Date | null = null;
  if (dueDate != null) {
    parsedDueDate = new Date(dueDate);
    if (isNaN(parsedDueDate.getTime())) {
      return NextResponse.json({ error: "Invalid due date" }, { status: 400 });
    }
  }

  // Validate file records
  const validatedFiles: { fileName: string; fileUrl: string; fileType: string }[] = [];
  if (Array.isArray(files)) {
    if (files.length > 20) {
      return NextResponse.json({ error: "Too many files (max 20)" }, { status: 400 });
    }
    for (const f of files) {
      if (!f.fileName || typeof f.fileName !== "string" || !f.fileUrl || typeof f.fileUrl !== "string") {
        return NextResponse.json({ error: "Invalid file data" }, { status: 400 });
      }
      try {
        const url = new URL(f.fileUrl);
        if (url.protocol !== "https:") {
          return NextResponse.json({ error: "Invalid file URL" }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: "Invalid file URL" }, { status: 400 });
      }
      validatedFiles.push({
        fileName: f.fileName.slice(0, 255),
        fileUrl: f.fileUrl,
        fileType: typeof f.fileType === "string" ? f.fileType.slice(0, 100) : "application/octet-stream",
      });
    }
  }

  const material = await db.classMaterial.create({
    data: {
      classId: id,
      title: title.trim(),
      description: description.trim(),
      dueDate: parsedDueDate,
      files: validatedFiles.length > 0
        ? { create: validatedFiles }
        : undefined,
    },
    include: {
      files: { select: { id: true, fileName: true, fileType: true } },
      _count: { select: { sessions: true } },
    },
  });

  // Trigger RAG processing in background (non-blocking)
  if (material.files.length > 0) {
    processMaterialFiles(material.id).catch((e) =>
      console.error("Material RAG processing failed:", e)
    );
  }

  return NextResponse.json(material, { status: 201 });
}
