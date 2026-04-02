# Upload System & RAG Pipeline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the file upload system (Vercel Blob), text extraction pipeline (PDF/DOCX), text chunking, embedding generation (Together.ai), and pgvector storage — enabling RAG-powered tutoring sessions.

**Architecture:** Files upload to Vercel Blob via `/api/upload`. Inquiry creation at `/api/inquiries` triggers the RAG pipeline: extract text from each file, chunk into ~500-token segments with overlap, generate embeddings via Together.ai's bge-large-en-v1.5 (1024 dims), and store chunks + vectors in pgvector. The upload form UI provides drag-and-drop with validation.

**Tech Stack:** @vercel/blob, pdf-parse, mammoth, Together.ai Embeddings API, pgvector, Prisma raw SQL for vector operations

---

## Prerequisites (User Setup)

Before execution, the user needs to provide two API keys:

1. **Together.ai API Key** — Sign up at together.ai, go to Settings > API Keys, create a key. Add as `TOGETHER_API_KEY` in `.env.local`.

2. **Vercel Blob Token** — Create a Vercel project, add a Blob store (Storage > Create > Blob), copy the `BLOB_READ_WRITE_TOKEN`. Add to `.env.local`.

---

### Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install production dependencies**

```bash
npm install @vercel/blob pdf-parse mammoth
```

- [ ] **Step 2: Install dev dependencies for types**

```bash
npm install -D @types/pdf-parse
```

- [ ] **Step 3: Verify installation**

Run: `npm ls @vercel/blob pdf-parse mammoth`
Expected: All three packages listed without errors

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add upload and text extraction dependencies"
```

---

### Task 2: Schema Migration — Vector Dimensions

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_update_vector_dimensions/migration.sql`

Together.ai's bge-large-en-v1.5 produces 1024-dimensional embeddings. The current schema uses `vector(1536)`.

- [ ] **Step 1: Update schema.prisma**

Change line 103 in `prisma/schema.prisma`:
```prisma
embedding  Unsupported("vector(1024)")
```

- [ ] **Step 2: Run migration**

```bash
npx prisma migrate dev --name update_vector_dimensions
```

Expected: Migration applied successfully, client regenerated.

- [ ] **Step 3: Verify generated client**

Check that `src/generated/prisma/` was regenerated without errors.

- [ ] **Step 4: Commit**

```bash
git add prisma/ src/generated/
git commit -m "feat: update vector dimensions to 1024 for bge-large-en-v1.5"
```

---

### Task 3: Text Extraction Utility

**Files:**
- Create: `src/lib/extract-text.ts`

- [ ] **Step 1: Create the text extraction module**

```typescript
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export type SupportedFileType =
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/msword";

const EXTRACTORS: Record<string, (buffer: Buffer) => Promise<string>> = {
  "application/pdf": extractPdf,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": extractDocx,
  "application/msword": extractDocx,
};

async function extractPdf(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors related to extract-text.ts

- [ ] **Step 3: Commit**

```bash
git add src/lib/extract-text.ts
git commit -m "feat: add PDF and DOCX text extraction utility"
```

---

### Task 4: Text Chunking Utility

**Files:**
- Create: `src/lib/chunker.ts`

- [ ] **Step 1: Create the chunking module**

Approximation: 1 token ~ 4 characters. 500 tokens ~ 2000 chars, 100 token overlap ~ 400 chars.

```typescript
export interface TextChunk {
  content: string;
  index: number;
}

const CHUNK_SIZE = 2000; // ~500 tokens
const CHUNK_OVERLAP = 400; // ~100 tokens

export function chunkText(text: string): TextChunk[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length === 0) return [];

  // If text fits in one chunk, return it directly
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

    start = end - CHUNK_OVERLAP;
    index++;
  }

  return chunks;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/chunker.ts
git commit -m "feat: add text chunking utility with overlap"
```

---

### Task 5: Embedding Utility

**Files:**
- Create: `src/lib/embeddings.ts`

- [ ] **Step 1: Create the embedding module**

Uses Together.ai's OpenAI-compatible API with bge-large-en-v1.5 (1024 dimensions).

```typescript
const TOGETHER_API_URL = "https://api.together.xyz/v1/embeddings";
const EMBEDDING_MODEL = "BAAI/bge-large-en-v1.5";

export async function generateEmbeddings(
  texts: string[]
): Promise<number[][]> {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    throw new Error("TOGETHER_API_KEY is not set");
  }

  // Together.ai has a batch limit — process in chunks of 32
  const batchSize = 32;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await fetch(TOGETHER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: batch,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Together.ai embedding API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const embeddings = data.data
      .sort((a: { index: number }, b: { index: number }) => a.index - b.index)
      .map((item: { embedding: number[] }) => item.embedding);
    allEmbeddings.push(...embeddings);
  }

  return allEmbeddings;
}

export async function generateSingleEmbedding(
  text: string
): Promise<number[]> {
  const [embedding] = await generateEmbeddings([text]);
  return embedding;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/embeddings.ts
git commit -m "feat: add Together.ai embedding generation utility"
```

---

### Task 6: RAG Pipeline Orchestrator

**Files:**
- Create: `src/lib/rag-pipeline.ts`

This module orchestrates the full pipeline: fetch file from Vercel Blob → extract text → chunk → embed → store in pgvector.

- [ ] **Step 1: Create the RAG pipeline module**

```typescript
import { db } from "./db";
import { extractText, isExtractableType } from "./extract-text";
import { chunkText } from "./chunker";
import { generateEmbeddings } from "./embeddings";

export async function processFile(fileId: string, fileUrl: string, mimeType: string, inquiryId: string): Promise<void> {
  // Skip non-extractable files (images for now)
  if (!isExtractableType(mimeType)) {
    return;
  }

  // 1. Fetch file content from Vercel Blob
  const response = await fetch(fileUrl);
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
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = embeddings[i];
    const vectorStr = `[${embedding.join(",")}]`;

    await db.$executeRaw`
      INSERT INTO "TextChunk" (id, "fileId", "inquiryId", content, embedding, "chunkIndex", "createdAt")
      VALUES (
        gen_random_uuid()::text,
        ${fileId},
        ${inquiryId},
        ${chunk.content},
        ${vectorStr}::vector(1024),
        ${chunk.index},
        NOW()
      )
    `;
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/rag-pipeline.ts
git commit -m "feat: add RAG pipeline orchestrator (extract, chunk, embed, store)"
```

---

### Task 7: File Upload API Route

**Files:**
- Create: `src/app/api/upload/route.ts`

Handles individual file uploads to Vercel Blob. Returns the blob URL for the client to include when creating an inquiry.

- [ ] **Step 1: Create the upload route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put } from "@vercel/blob";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "image/png",
  "image/jpeg",
  "image/heic",
]);

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.id === "guest") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `File type not allowed: ${file.type}` },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File exceeds 25MB limit" },
      { status: 400 }
    );
  }

  const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  return NextResponse.json({
    url: blob.url,
    fileName: file.name,
    fileType: file.type,
  });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/api/upload/route.ts
git commit -m "feat: add file upload API route (Vercel Blob)"
```

---

### Task 8: Inquiry API Routes

**Files:**
- Create: `src/app/api/inquiries/route.ts`
- Create: `src/app/api/inquiries/[id]/route.ts`

POST creates an inquiry with file records and triggers RAG processing. GET lists the user's inquiries.

- [ ] **Step 1: Create the inquiry list/create route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { processInquiryFiles } from "@/lib/rag-pipeline";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.id === "guest") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { subject, teacherName, unitName, description, files } = body;

  // Validate required fields
  if (!subject || !teacherName || !unitName || !description) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  if (!files || !Array.isArray(files) || files.length === 0) {
    return NextResponse.json(
      { error: "At least one file is required" },
      { status: 400 }
    );
  }

  if (files.length > 5) {
    return NextResponse.json(
      { error: "Maximum 5 files per inquiry" },
      { status: 400 }
    );
  }

  // Create inquiry with files in a transaction
  const inquiry = await db.inquiry.create({
    data: {
      userId: session.user.id,
      subject,
      teacherName,
      unitName,
      description,
      files: {
        create: files.map(
          (f: { url: string; fileName: string; fileType: string }) => ({
            fileName: f.fileName,
            fileUrl: f.url,
            fileType: f.fileType,
          })
        ),
      },
    },
    include: { files: true },
  });

  // Trigger RAG pipeline (runs in background — don't await in production,
  // but for now we process synchronously for simplicity)
  try {
    await processInquiryFiles(inquiry.id);
  } catch (error) {
    console.error("RAG pipeline error:", error);
    // Don't fail the inquiry creation — RAG processing can be retried
  }

  return NextResponse.json(inquiry, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.id === "guest") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inquiries = await db.inquiry.findMany({
    where: { userId: session.user.id },
    include: {
      files: { select: { id: true, fileName: true, fileType: true } },
      _count: { select: { sessions: true, chunks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(inquiries);
}
```

- [ ] **Step 2: Create the inquiry detail route**

Create `src/app/api/inquiries/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.id === "guest") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const inquiry = await db.inquiry.findUnique({
    where: { id },
    include: {
      files: true,
      sessions: {
        select: {
          id: true,
          status: true,
          startedAt: true,
          endedAt: true,
          rating: true,
        },
        orderBy: { startedAt: "desc" },
      },
      _count: { select: { chunks: true } },
    },
  });

  if (!inquiry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Users can only see their own inquiries
  if (inquiry.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(inquiry);
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/app/api/inquiries/
git commit -m "feat: add inquiry CRUD API routes with RAG pipeline trigger"
```

---

### Task 9: Upload Form Component

**Files:**
- Create: `src/components/upload-form.tsx`

Client component with drag-and-drop file area, form fields per spec, file validation, and progressive upload.

- [ ] **Step 1: Create the upload form**

```tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const SUBJECTS = [
  { value: "MATHEMATICS", label: "Mathematics" },
  { value: "ENGLISH", label: "English" },
  { value: "HISTORY", label: "History" },
  { value: "SCIENCE", label: "Science" },
  { value: "MANDARIN", label: "Mandarin" },
  { value: "HUMANITIES", label: "Humanities" },
  { value: "OTHER", label: "Other" },
];

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc", ".png", ".jpg", ".jpeg", ".heic"];
const MAX_FILES = 5;
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB

interface UploadedFile {
  file: File;
  url?: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export function UploadForm({ userRole }: { userRole: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [subject, setSubject] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [unitName, setUnitName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const isTeacher = userRole === "TEACHER";

  const validateFile = useCallback(
    (file: File): string | null => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return `${file.name}: unsupported file type`;
      }
      if (file.size > MAX_FILE_SIZE) {
        return `${file.name}: exceeds 25MB limit`;
      }
      const totalSize = files.reduce((sum, f) => sum + f.file.size, 0) + file.size;
      if (totalSize > MAX_TOTAL_SIZE) {
        return "Total file size exceeds 100MB limit";
      }
      return null;
    },
    [files]
  );

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const incoming = Array.from(newFiles);
      if (files.length + incoming.length > MAX_FILES) {
        setError(`Maximum ${MAX_FILES} files allowed`);
        return;
      }
      setError("");
      const valid: UploadedFile[] = [];
      for (const file of incoming) {
        const err = validateFile(file);
        if (err) {
          setError(err);
          return;
        }
        valid.push({ file, status: "pending" });
      }
      setFiles((prev) => [...prev, ...valid]);
    },
    [files.length, validateFile]
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const uploadFile = async (uploadedFile: UploadedFile, index: number): Promise<{ url: string; fileName: string; fileType: string } | null> => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, status: "uploading" as const } : f))
    );

    const formData = new FormData();
    formData.append("file", uploadedFile.file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setFiles((prev) =>
          prev.map((f, i) =>
            i === index ? { ...f, status: "error" as const, error: data.error } : f
          )
        );
        return null;
      }

      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: "done" as const, url: data.url } : f
        )
      );
      return data;
    } catch {
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: "error" as const, error: "Upload failed" } : f
        )
      );
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !teacherName || !unitName || !description || files.length === 0) {
      setError("Please fill in all fields and add at least one file");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // 1. Upload all files to Vercel Blob
      const uploadResults = await Promise.all(
        files.map((f, i) => uploadFile(f, i))
      );

      const successfulUploads = uploadResults.filter(Boolean);
      if (successfulUploads.length === 0) {
        setError("All file uploads failed");
        setSubmitting(false);
        return;
      }

      // 2. Create the inquiry
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          teacherName,
          unitName,
          description,
          files: successfulUploads,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create inquiry");
        setSubmitting(false);
        return;
      }

      const inquiry = await res.json();
      router.push(`/app/inquiry/${inquiry.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Subject
        </label>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full bg-bg-surface border border-bg-elevated rounded-lg px-3 py-2.5 text-text-primary focus:outline-none focus:border-accent"
        >
          <option value="">Select a subject</option>
          {SUBJECTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Teacher Name */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Teacher Name
        </label>
        <input
          type="text"
          value={teacherName}
          onChange={(e) => setTeacherName(e.target.value)}
          placeholder="e.g. Ms. Johnson"
          className="w-full bg-bg-surface border border-bg-elevated rounded-lg px-3 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
      </div>

      {/* Unit Name */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Unit / Topic
        </label>
        <input
          type="text"
          value={unitName}
          onChange={(e) => setUnitName(e.target.value)}
          placeholder="e.g. Integration by Parts"
          className="w-full bg-bg-surface border border-bg-elevated rounded-lg px-3 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {isTeacher ? "Course / Class" : "What are you struggling with?"}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder={
            isTeacher
              ? "Describe the course or class this material is for..."
              : "Describe what you're having trouble with..."
          }
          className="w-full bg-bg-surface border border-bg-elevated rounded-lg px-3 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent resize-none"
        />
      </div>

      {/* File Upload Area */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Files ({files.length}/{MAX_FILES})
        </label>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-accent bg-accent/5"
              : "border-bg-elevated hover:border-text-muted"
          }`}
        >
          <svg
            className="w-8 h-8 mx-auto mb-2 text-text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
            />
          </svg>
          <p className="text-text-secondary text-sm">
            Drag & drop files here, or click to browse
          </p>
          <p className="text-text-muted text-xs mt-1">
            PDF, DOCX, DOC, PNG, JPG, HEIC — Max 25MB each
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.heic"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
            className="hidden"
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-3 space-y-2">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-bg-surface rounded-lg px-3 py-2 border border-bg-elevated"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm text-text-primary truncate">
                    {f.file.name}
                  </span>
                  <span className="text-xs text-text-muted flex-shrink-0">
                    {formatSize(f.file.size)}
                  </span>
                  {f.status === "uploading" && (
                    <span className="text-xs text-accent">Uploading...</span>
                  )}
                  {f.status === "done" && (
                    <span className="text-xs text-accent-light">Done</span>
                  )}
                  {f.status === "error" && (
                    <span className="text-xs text-red-400">{f.error}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-text-muted hover:text-text-primary ml-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || files.length === 0}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Processing..." : isTeacher ? "Upload Materials" : "Submit & Start Tutoring"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/upload-form.tsx
git commit -m "feat: add upload form with drag-and-drop and file validation"
```

---

### Task 10: Upload Page

**Files:**
- Create: `src/app/app/upload/page.tsx`

Server component that checks session, passes role to the upload form.

- [ ] **Step 1: Create the upload page**

```tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UploadForm } from "@/components/upload-form";

export default async function UploadPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.id === "guest") {
    redirect("/app");
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Upload New Work</h1>
      <p className="text-text-secondary mb-8">
        {session.user.role === "TEACHER"
          ? "Share course materials for your students to study."
          : "Upload your coursework and describe what you need help with."}
      </p>
      <UploadForm userRole={session.user.role ?? "STUDENT"} />
    </div>
  );
}
```

- [ ] **Step 2: Verify build compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/app/app/upload/page.tsx
git commit -m "feat: add upload page with role-based UX"
```

---

### Task 11: Inquiry Detail Page (Placeholder)

**Files:**
- Create: `src/app/app/inquiry/[id]/page.tsx`

The upload form redirects here after submission. For now, show inquiry details and a "Start Tutoring Session" button (chat will be built in Plan 3).

- [ ] **Step 1: Create the inquiry detail page**

```tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function InquiryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.id === "guest") {
    redirect("/app");
  }

  const { id } = await params;

  const inquiry = await db.inquiry.findUnique({
    where: { id },
    include: {
      files: true,
      _count: { select: { chunks: true, sessions: true } },
    },
  });

  if (!inquiry || inquiry.userId !== session.user.id) {
    redirect("/app");
  }

  const subjectLabel = inquiry.subject.charAt(0) + inquiry.subject.slice(1).toLowerCase();

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded">
          {subjectLabel}
        </span>
        <h1 className="text-3xl font-bold mt-2">{inquiry.unitName}</h1>
        <p className="text-text-secondary mt-1">
          {inquiry.teacherName}
        </p>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-display font-semibold mb-2">Description</h2>
        <p className="text-text-secondary">{inquiry.description}</p>
      </div>

      <div className="card p-6 mb-6">
        <h2 className="font-display font-semibold mb-3">
          Files ({inquiry.files.length})
        </h2>
        <div className="space-y-2">
          {inquiry.files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between bg-bg-elevated/50 rounded-lg px-3 py-2"
            >
              <span className="text-sm text-text-primary">{file.fileName}</span>
              <a
                href={file.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent hover:text-accent-light"
              >
                View
              </a>
            </div>
          ))}
        </div>
        {inquiry._count.chunks > 0 && (
          <p className="text-xs text-text-muted mt-3">
            {inquiry._count.chunks} text chunks processed for AI tutoring
          </p>
        )}
      </div>

      <a
        href={`/app/sessions/new?inquiry=${inquiry.id}`}
        className="btn-primary inline-block text-center"
      >
        Start Tutoring Session
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Verify dev server**

Run: `npm run dev`
Navigate to `/app/upload` — form should render. Verify all fields display correctly.

- [ ] **Step 4: Commit**

```bash
git add src/app/app/inquiry/
git commit -m "feat: add inquiry detail page with file list and session link"
```
