import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { extractText, isExtractableType, resolveMimeType } from "@/lib/extract-text";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large. Maximum 10MB." }, { status: 400 });
  }

  const mimeType = resolveMimeType(file.type, file.name);

  if (!isExtractableType(mimeType, file.name)) {
    return NextResponse.json(
      { error: "Unsupported file type. Use PDF or DOCX." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const text = await extractText(buffer, mimeType);
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return NextResponse.json({ text, wordCount });
}
