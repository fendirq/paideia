export interface TextChunk {
  content: string;
  index: number;
}

const CHUNK_SIZE = 2000; // ~500 tokens
const CHUNK_OVERLAP = 400; // ~100 tokens

export function chunkText(text: string): TextChunk[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length === 0) return [];

  if (cleaned.length <= CHUNK_SIZE) {
    return [{ content: cleaned, index: 0 }];
  }

  const chunks: TextChunk[] = [];
  let start = 0;
  let index = 0;

  while (start < cleaned.length) {
    let end = start + CHUNK_SIZE;

    // Try to break at a sentence boundary
    if (end < cleaned.length) {
      const slice = cleaned.slice(start, end);
      const lastPeriod = slice.lastIndexOf(". ");
      const lastNewline = slice.lastIndexOf("\n");
      const breakPoint = Math.max(lastPeriod, lastNewline);
      if (breakPoint > CHUNK_SIZE * 0.5) {
        end = start + breakPoint + 1;
      }
    }

    chunks.push({
      content: cleaned.slice(start, Math.min(end, cleaned.length)).trim(),
      index,
    });

    const nextStart = end - CHUNK_OVERLAP;
    if (nextStart <= start) break;
    start = nextStart;
    index++;
  }

  return chunks;
}
