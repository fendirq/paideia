import { Prisma } from "@/generated/prisma/client";
import { db } from "./db";
import { extractText, isExtractableType, resolveMimeType } from "./extract-text";
import { chunkText } from "./chunker";
import { generateEmbeddings } from "./embeddings";
import {
  detectAndPersistStructureForFile,
  detectAndPersistStructureForMaterialFile,
} from "./material-structure-persist";

function isBlobUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname.endsWith(".public.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export async function processFile(
  fileId: string,
  fileUrl: string,
  mimeType: string,
  fileName: string,
  inquiryId: string
): Promise<void> {
  const resolvedMime = resolveMimeType(mimeType, fileName);
  // Skip non-extractable files (images — OCR support coming later)
  if (!isExtractableType(resolvedMime, fileName)) {
    return;
  }

  // Skip if already processed
  const existingChunks = await db.$queryRaw<{ count: string }[]>(
    Prisma.sql`SELECT COUNT(*)::text as count FROM "TextChunk" WHERE "fileId" = ${fileId} LIMIT 1`
  );
  if (Number(existingChunks[0].count) > 0) return;

  // Validate URL is a Vercel Blob URL before sending auth token
  if (!isBlobUrl(fileUrl)) {
    throw new Error(`Refusing to fetch non-Blob URL: ${fileUrl}`);
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
  const rawText = await extractText(buffer, resolvedMime);
  if (!rawText) return;

  // Update file record with extracted text
  await db.file.update({
    where: { id: fileId },
    data: { extractedText: rawText },
  });

  // 3. Chunk text
  const chunks = chunkText(rawText);

  // 4. Run embedding + structure detection concurrently. Both are
  // network-bound and independent; Promise.all keeps total upload
  // latency at max(embed, detect) instead of sum. Structure
  // detection self-handles failure (logs, writes { kind: "unknown" }
  // or no-op when gated off) — safe to never await separately.
  const [embeddings] = await Promise.all([
    chunks.length > 0
      ? generateEmbeddings(chunks.map((c) => c.content))
      : Promise.resolve([] as number[][]),
    detectAndPersistStructureForFile(fileId, rawText),
  ]);

  if (chunks.length === 0) return;

  // 5. Store chunks + embeddings in pgvector via raw SQL
  // Prisma can't insert Unsupported("vector") types directly
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = embeddings[i];
    if (!embedding.every((v) => Number.isFinite(v))) {
      console.error(`Invalid embedding values for chunk ${i}, skipping`);
      continue;
    }
    const vectorStr = `[${embedding.join(",")}]`;

    await db.$executeRawUnsafe(
      `INSERT INTO "TextChunk" (id, "fileId", "inquiryId", content, embedding, "chunkIndex", "createdAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4::vector(1024), $5, NOW())
       ON CONFLICT DO NOTHING`,
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
    await processFile(file.id, file.fileUrl, file.fileType, file.fileName, inquiryId);
  }
}

// ─── Material file processing (teacher-uploaded class materials) ───

export async function processMaterialFile(
  fileId: string,
  fileUrl: string,
  mimeType: string,
  fileName: string,
  materialId: string
): Promise<void> {
  if (!isExtractableType(mimeType, fileName)) {
    return;
  }

  // Skip if already processed
  const existingMatChunks = await db.$queryRaw<{ count: string }[]>(
    Prisma.sql`SELECT COUNT(*)::text as count FROM "MaterialChunk" WHERE "fileId" = ${fileId} LIMIT 1`
  );
  if (Number(existingMatChunks[0].count) > 0) return;

  if (!isBlobUrl(fileUrl)) {
    throw new Error(`Refusing to fetch non-Blob URL: ${fileUrl}`);
  }

  const response = await fetch(fileUrl, {
    headers: {
      Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch material file: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const resolvedMime = resolveMimeType(mimeType, fileName);
  const rawText = await extractText(buffer, resolvedMime);
  if (!rawText) return;

  // Update file record with extracted text
  await db.classMaterialFile.update({
    where: { id: fileId },
    data: { extractedText: rawText },
  });

  const chunks = chunkText(rawText);

  // Parallelize embedding + structure detection — same pattern as
  // processFile above.
  const [embeddings] = await Promise.all([
    chunks.length > 0
      ? generateEmbeddings(chunks.map((c) => c.content))
      : Promise.resolve([] as number[][]),
    detectAndPersistStructureForMaterialFile(fileId, rawText),
  ]);

  if (chunks.length === 0) return;

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = embeddings[i];
    if (!embedding.every((v) => Number.isFinite(v))) {
      console.error(`Invalid embedding values for material chunk ${i}, skipping`);
      continue;
    }
    const vectorStr = `[${embedding.join(",")}]`;

    await db.$executeRawUnsafe(
      `INSERT INTO "MaterialChunk" (id, "fileId", "materialId", content, embedding, "chunkIndex", "createdAt")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4::vector(1024), $5, NOW())
       ON CONFLICT DO NOTHING`,
      fileId,
      materialId,
      chunk.content,
      vectorStr,
      chunk.index
    );
  }
}

export async function processMaterialFiles(materialId: string): Promise<void> {
  const files = await db.classMaterialFile.findMany({
    where: { materialId },
  });

  for (const file of files) {
    await processMaterialFile(
      file.id,
      file.fileUrl,
      file.fileType,
      file.fileName,
      materialId
    );
  }
}
