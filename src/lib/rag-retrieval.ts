import { Prisma } from "@/generated/prisma/client";
import { db } from "./db";
import { generateSingleEmbedding } from "./embeddings";

interface RetrievedChunk {
  id: string;
  content: string;
  similarity: number;
}

// Embedding-based similarity search (preferred when API is available)
async function retrieveByEmbedding(
  query: string,
  inquiryId: string,
  topK: number
): Promise<RetrievedChunk[]> {
  const queryEmbedding = await generateSingleEmbedding(query);
  const vectorStr = `[${queryEmbedding.join(",")}]`;

  return db.$queryRaw<RetrievedChunk[]>(Prisma.sql`
    SELECT id, content, 1 - (embedding <=> ${vectorStr}::vector(1024)) as similarity
    FROM "TextChunk"
    WHERE "inquiryId" = ${inquiryId}
    ORDER BY embedding <=> ${vectorStr}::vector(1024)
    LIMIT ${topK}
  `);
}

// Direct DB fallback — retrieves chunks by index order (no embeddings needed)
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
    similarity: 1 - i * 0.05, // synthetic score for ordering
  }));
}

export async function retrieveRelevantChunks(
  query: string,
  inquiryId: string,
  topK: number = 6
): Promise<RetrievedChunk[]> {
  // Try embedding-based search first, fall back to direct DB query
  try {
    return await retrieveByEmbedding(query, inquiryId, topK);
  } catch (e) {
    console.error("Embedding search failed, using direct retrieval:", e);
    return retrieveByIndex(inquiryId, topK);
  }
}
