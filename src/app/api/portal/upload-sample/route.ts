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

  // Reject samples with too little signal. The style-analysis
  // fingerprint prompt asks the model to extract 10-15 signature
  // words, a voice pattern, and structural habits — a sub-150-word
  // sample forces it to hallucinate to fill the schema.
  const MIN_WORDS = 150;
  if (wordCount < MIN_WORDS) {
    return NextResponse.json(
      {
        error: `This sample only has ${wordCount} word${wordCount === 1 ? "" : "s"}. Samples need at least ${MIN_WORDS} words for the style analysis to work.`,
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ text, wordCount });
}
