import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const EXTRACTORS: Record<string, (buffer: Buffer) => Promise<string>> = {
  "application/pdf": extractPdf,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    extractDocx,
  "application/msword": extractDocx,
};
// `resolveMimeType` upgrades a bare `application/octet-stream` to the
// right extractor via file extension. Files that arrive as
// octet-stream AND have no recognizable extension are rejected by
// `isExtractableType` — previously this fell through to extractPdf
// and silently produced garbled text for a .doc-without-extension
// upload.

// Extension-based fallback when MIME type is generic
const EXT_MAP: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
};

export function resolveMimeType(mimeType: string, fileName: string): string {
  // If the MIME type is already specific, use it
  if (mimeType !== "application/octet-stream" && mimeType in EXTRACTORS) {
    return mimeType;
  }
  // Fall back to extension
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return EXT_MAP[ext] ?? mimeType;
}

async function extractPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  await parser.destroy();
  return result.text.trim();
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

export async function extractText(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const extractor = EXTRACTORS[mimeType];
  if (!extractor) {
    throw new Error(`Unsupported file type for text extraction: ${mimeType}`);
  }
  return extractor(buffer);
}

export function isExtractableType(mimeType: string, fileName?: string): boolean {
  if (mimeType in EXTRACTORS) return true;
  if (fileName) {
    const resolved = resolveMimeType(mimeType, fileName);
    return resolved in EXTRACTORS;
  }
  return false;
}
