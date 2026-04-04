import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put } from "@vercel/blob";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/png",
  "image/jpeg",
  "image/heic",
]);

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `File type not allowed: ${file.type}` },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File exceeds 25MB limit" },
      { status: 400 }
    );
  }

  // Sanitize filename: strip path separators and dangerous characters
  const rawName = file.name;
  const extIdx = rawName.lastIndexOf(".");
  const ext = extIdx > 0 ? rawName.slice(extIdx).toLowerCase().replace(/[^a-z0-9.]/g, "") : "";
  const base = rawName.slice(0, extIdx > 0 ? extIdx : rawName.length)
    .replace(/[^\w\s.-]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 100) || "file";
  const safeName = base + ext;

  const blob = await put(`uploads/${Date.now()}-${safeName}`, file, {
    access: "private",
  });

  return NextResponse.json({
    url: blob.url,
    fileName: safeName,
    fileType: file.type,
  });
}
