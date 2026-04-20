import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { retrieveRelevantChunks } from "@/lib/rag-retrieval";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { streamChatCompletion } from "@/lib/gemini-chat";
import { parseActionsFromResponse } from "@/lib/parse-actions";
import { filterResponseBySubject } from "@/lib/content-filter";
import { buildCompressedHistory, getSummaryContext, maybeCompressThread } from "@/lib/thread-compression";
import { validateStructure, type MaterialStructure } from "@/lib/material-structure";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const { message } = await req.json();

  if (!message || typeof message !== "string" || message.length > 2000) {
    return new Response("Invalid message", { status: 400 });
  }

  // Fetch session and message history BEFORE saving the new user message
  const tutoringSession = await db.tutoringSession.findUnique({
    where: { id },
    include: {
      inquiry: {
        include: {
          files: {
            select: { structure: true, structureKind: true },
            orderBy: { createdAt: "asc" },
          },
        },
      },
      material: {
        select: {
          title: true,
          description: true,
          class: { select: { subject: true, teacher: { select: { name: true } } } },
          files: {
            select: { structure: true, structureKind: true },
            orderBy: { createdAt: "asc" },
          },
        },
      },
      messages: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });

  if (!tutoringSession || tutoringSession.userId !== session.user.id) {
    return new Response("Not found", { status: 404 });
  }

  // Derive context from inquiry OR material
  const mat = tutoringSession.material;
  const subject = tutoringSession.inquiry?.subject ?? mat?.class?.subject ?? "";
  const unitName = tutoringSession.inquiry?.unitName ?? mat?.title ?? "";
  const teacherName = tutoringSession.inquiry?.teacherName ?? mat?.class?.teacher?.name ?? "";
  const description = tutoringSession.inquiry?.description ?? mat?.description ?? "";

  // Retrieve RAG context (graceful fallback if embedding API is down)
  const ragSource = tutoringSession.materialId ? "material" : "inquiry";
  const ragSourceId = tutoringSession.materialId ?? tutoringSession.inquiryId ?? "";
  let ragChunks: { id: string; content: string; similarity: number }[] = [];
  try {
    ragChunks = await retrieveRelevantChunks(message, ragSourceId, 6, ragSource);
  } catch (e) {
    console.error("RAG retrieval failed, continuing without context:", e);
  }

  // Pick the first non-null structure across the session's uploaded
  // files. Most sessions have a single file; multi-file is an edge
  // case we handle by taking the first (chronologically) that the
  // classifier was able to shape. Silent fallback to null when no
  // file has structure populated — upstream `buildSystemPrompt`
  // then omits the Material Structure block entirely.
  const sessionFiles = tutoringSession.materialId
    ? (mat?.files ?? [])
    : (tutoringSession.inquiry?.files ?? []);
  let structure: MaterialStructure | null = null;
  for (const f of sessionFiles) {
    if (!f.structure) continue;
    const parsed = validateStructure(f.structure);
    if (parsed && parsed.kind !== "unknown") {
      structure = parsed;
      break;
    }
  }

  // Build system prompt with Socratic instructions + RAG context
  const systemPrompt = buildSystemPrompt({
    subject,
    unitName,
    teacherName,
    description,
    ragChunks,
    helpType: tutoringSession.helpType,
    structure,
  });

  // Append conversation summary to system prompt (avoids second system message)
  const summaryCtx = getSummaryContext(
    tutoringSession.messages.length,
    tutoringSession.summary
  );
  const fullSystemPrompt = systemPrompt + summaryCtx;

  // Build messages array with compression for long threads
  // Messages fetched in desc order for efficient "last N" query — reverse to chronological
  const messagesAsc = [...tutoringSession.messages].reverse();
  const history = buildCompressedHistory(messagesAsc, tutoringSession.summary);
  const chatMessages = [
    { role: "system" as const, content: fullSystemPrompt },
    ...history,
    { role: "user" as const, content: message },
  ];

  // Save user message to DB now (after building chatMessages to avoid duplication)
  const userMsg = await db.message.create({
    data: {
      sessionId: id,
      role: "user",
      content: message,
    },
  });

  // Stream response from Gemini (see src/lib/gemini-chat.ts for
  // primary-with-fallback model selection).
  let upstreamBody: ReadableStream<Uint8Array>;
  try {
    upstreamBody = await streamChatCompletion(chatMessages);
  } catch (e) {
    // Clean up orphaned user message so history stays consistent
    await db.message.delete({ where: { id: userMsg.id } }).catch(() => {});
    console.error("LLM stream failed:", e);
    return new Response("AI service unavailable", { status: 503 });
  }

  // Transform stream: forward to client + collect full text for DB save
  let fullResponse = "";
  let assistantSaved = false;

  const saveAssistantMessage = async () => {
    if (assistantSaved || !fullResponse) return;
    assistantSaved = true;
    const filtered = filterResponseBySubject(
      fullResponse,
      subject
    );
    const { message: aiMessage, suggestedActions } =
      parseActionsFromResponse(filtered);
    await db.message.create({
      data: {
        sessionId: id,
        role: "assistant",
        content: aiMessage,
        suggestedActions,
      },
    });

    // Trigger compression in background (non-blocking)
    maybeCompressThread(id).catch((e) =>
      console.error("Thread compression failed:", e)
    );
  };

  const transform = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      controller.enqueue(chunk);

      const text = new TextDecoder().decode(chunk);
      const lines = text.split("\n").filter((l) => l.startsWith("data: "));
      for (const line of lines) {
        const data = line.slice(6);
        if (data === "[DONE]") continue;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) fullResponse += delta;
        } catch {
          // skip parse errors
        }
      }
    },
    async flush() {
      await saveAssistantMessage();
    },
  });

  const stream = upstreamBody.pipeThrough(transform);

  const response = new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });

  return response;
}
