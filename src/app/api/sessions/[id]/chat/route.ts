import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { retrieveRelevantChunks } from "@/lib/rag-retrieval";
import { buildSystemPrompt } from "@/lib/system-prompt";
import {
  streamChatCompletion,
  parseActionsFromResponse,
} from "@/lib/together-chat";
import { filterResponseBySubject } from "@/lib/content-filter";

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
      inquiry: true,
      messages: { orderBy: { createdAt: "asc" }, take: 20 },
    },
  });

  if (!tutoringSession || tutoringSession.userId !== session.user.id) {
    return new Response("Not found", { status: 404 });
  }

  // Retrieve RAG context (graceful fallback if embedding API is down)
  let ragChunks: { id: string; content: string; similarity: number }[] = [];
  try {
    ragChunks = await retrieveRelevantChunks(
      message,
      tutoringSession.inquiryId
    );
  } catch (e) {
    console.error("RAG retrieval failed, continuing without context:", e);
  }

  // Build system prompt with Socratic instructions + RAG context
  const systemPrompt = buildSystemPrompt({
    subject: tutoringSession.inquiry.subject,
    unitName: tutoringSession.inquiry.unitName,
    teacherName: tutoringSession.inquiry.teacherName,
    description: tutoringSession.inquiry.description,
    ragChunks,
    helpType: tutoringSession.helpType,
  });

  // Build messages array from already-fetched history + new message
  // (user message not yet in DB, so no duplicate risk)
  const chatMessages = [
    { role: "system" as const, content: systemPrompt },
    ...tutoringSession.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: message },
  ];

  // Save user message to DB now (after building chatMessages to avoid duplication)
  await db.message.create({
    data: {
      sessionId: id,
      role: "user",
      content: message,
    },
  });

  // Stream response from Together.ai
  const upstreamBody = await streamChatCompletion(chatMessages);

  // Transform stream: forward to client + collect full text for DB save
  let fullResponse = "";
  let assistantSaved = false;

  const saveAssistantMessage = async () => {
    if (assistantSaved || !fullResponse) return;
    assistantSaved = true;
    const filtered = filterResponseBySubject(
      fullResponse,
      tutoringSession.inquiry.subject
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
