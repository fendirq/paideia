import { db } from "./db";
import { extractText, isExtractableType } from "./extract-text";
import { chunkText } from "./chunker";
import { generateEmbeddings } from "./embeddings";

export async function processFile(
  fileId: string,
  fileUrl: string,
  mimeType: string,
  inquiryId: string
): Promise<void> {
  // Skip non-extractable files (images — OCR support coming later)
  if (!isExtractableType(mimeType)) {
    return;
  }

  // 1. Fetch file content from Vercel Blob (private store requires token)
  const response = await fetch(fileUrl, {
    headers: {
      Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 2. Extract text
  const rawText = await extractText(buffer, mimeType);
  if (!rawText) return;

  // Update file record with extracted text
  await db.file.update({
    where: { id: fileId },
    data: { extractedText: rawText },
  });

  // 3. Chunk text
  const chunks = chunkText(rawText);
  if (chunks.length === 0) return;

  // 4. Generate embeddings for all chunks
  const embeddings = await generateEmbeddings(chunks.map((c) => c.content));

  // 5. Store chunks + embeddings in pgvector via raw SQL
  // Prisma can't insert Unsupported("vector") types directly
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = embeddings[i];
    const vectorStr = `[${embedding.join(",")}]`;

    await db.$executeRawUnsafe(
      `INSERT INTO "TextChunk" (id, "fileId", "inquiryId", content, embedding, "chunkIndex", "createdAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4::vector(1024), $5, NOW())`,
      fileId,
      inquiryId,
      chunk.content,
      vectorStr,
      chunk.index
    );
  }
}

export async function processInquiryFiles(inquiryId: string): Promise<void> {
  const files = await db.file.findMany({
    where: { inquiryId },
  });

  for (const file of files) {
    await processFile(file.id, file.fileUrl, file.fileType, inquiryId);
  }
}
