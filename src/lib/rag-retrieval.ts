import { Prisma } from "@/generated/prisma/client";
import { db } from "./db";
import { generateSingleEmbedding } from "./embeddings";

interface RetrievedChunk {
  id: string;
  content: string;
  similarity: number;
}

// ─── Inquiry-based (TextChunk) ───

async function retrieveByEmbedding(
  query: string,
  inquiryId: string,
  topK: number
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await generateSingleEmbedding(query);
  const vectorStr = `[${queryEmbedding.join(",")}]`;

  const rows = await db.$queryRaw<RetrievedChunk[]>(Prisma.sql`
    WITH q AS (SELECT ${vectorStr}::vector(1024) AS qvec)
    SELECT t.id, t.content, COALESCE(1 - (t.embedding <=> q.qvec), 0) as similarity
    FROM "TextChunk" t, q
    WHERE t."inquiryId" = ${inquiryId}
    ORDER BY t.embedding <=> q.qvec
    LIMIT ${topK}
  `);
  return rows.map((r) => ({ ...r, similarity: Number(r.similarity) || 0 }));
}

async function retrieveByIndex(
  inquiryId: string,
  limit: number
): Promise<RetrievedChunk[]> {
  const chunks = await db.textChunk.findMany({
    where: { inquiryId },
    orderBy: { chunkIndex: "asc" },
    take: limit,
    select: { id: true, content: true },
  });

  return chunks.map((c, i) => ({
    id: c.id,
    content: c.content,
    similarity: 1 - i * 0.05,
  }));
}

// ─── Material-based (MaterialChunk) ───

async function retrieveMaterialByEmbedding(
  query: string,
  materialId: string,
  topK: number
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await generateSingleEmbedding(query);
  const vectorStr = `[${queryEmbedding.join(",")}]`;

  const rows = await db.$queryRaw<RetrievedChunk[]>(Prisma.sql`
    WITH q AS (SELECT ${vectorStr}::vector(1024) AS qvec)
    SELECT t.id, t.content, COALESCE(1 - (t.embedding <=> q.qvec), 0) as similarity
    FROM "MaterialChunk" t, q
    WHERE t."materialId" = ${materialId}
    ORDER BY t.embedding <=> q.qvec
    LIMIT ${topK}
  `);
  return rows.map((r) => ({ ...r, similarity: Number(r.similarity) || 0 }));
}

async function retrieveMaterialByIndex(
  materialId: string,
  limit: number
): Promise<RetrievedChunk[]> {
  const chunks = await db.$queryRaw<{ id: string; content: string }[]>(
    Prisma.sql`
      SELECT id, content FROM "MaterialChunk"
      WHERE "materialId" = ${materialId}
      ORDER BY "chunkIndex" ASC
      LIMIT ${limit}
    `
  );

  return chunks.map((c, i) => ({
    id: c.id,
    content: c.content,
    similarity: 1 - i * 0.05,
  }));
}

// ─── Public API ───

export async function retrieveRelevantChunks(
  query: string,
  sourceId: string,
  topK: number = 6,
  source: "inquiry" | "material" = "inquiry"
): Promise<RetrievedChunk[]> {
  if (!sourceId) return [];

  if (source === "material") {
    try {
      return await retrieveMaterialByEmbedding(query, sourceId, topK);
    } catch (e) {
      console.error("Material embedding search failed, using index fallback:", e);
      return retrieveMaterialByIndex(sourceId, topK);
    }
  }

  try {
    return await retrieveByEmbedding(query, sourceId, topK);
  } catch (e) {
    console.error("Embedding search failed, using direct retrieval:", e);
    return retrieveByIndex(sourceId, topK);
  }
}
