import type { SerializedDoc } from "./schema";

export function createEmptyDocument(): SerializedDoc {
  return {
    type: "doc",
    content: [{ type: "paragraph" }],
  };
}

export function serializeDocument(doc: SerializedDoc) {
  return JSON.stringify(doc);
}

export function parseDocument(json: string): SerializedDoc {
  const parsed = JSON.parse(json) as SerializedDoc;
  if (parsed?.type !== "doc" || !Array.isArray(parsed.content)) {
    return createEmptyDocument();
  }
  return parsed;
}

export function countCharacters(doc: SerializedDoc): number {
  let count = 0;
  for (const block of doc.content ?? []) {
    for (const inline of block.content ?? []) {
      if (typeof inline.text === "string") count += inline.text.length;
    }
  }
  return count;
}
