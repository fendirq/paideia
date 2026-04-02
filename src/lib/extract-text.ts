import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const EXTRACTORS: Record<string, (buffer: Buffer) => Promise<string>> = {
  "application/pdf": extractPdf,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    extractDocx,
  "application/msword": extractDocx,
};

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

export function isExtractableType(mimeType: string): boolean {
  return mimeType in EXTRACTORS;
}
