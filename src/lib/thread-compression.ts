import { db } from "@/lib/db";
import { chatCompletion } from "@/lib/gemini-chat";

const COMPRESSION_THRESHOLD = 30;
const RECENT_MESSAGES_KEEP = 10;

interface MessageRecord {
  role: string;
  content: string;
}

/**
 * Build the chat history for the LLM, compressing old messages into a summary
 * when the thread is long. Returns messages ready for the LLM context window.
 */
export function buildCompressedHistory(
  allMessages: MessageRecord[],
  summary: string | null
): { role: "user" | "assistant" | "system"; content: string }[] {
  // Short thread — use all messages directly
  if (allMessages.length <= COMPRESSION_THRESHOLD && !summary) {
    return allMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
  }

  // Long thread or existing summary — use recent messages only
  // Summary is injected into the system prompt by the caller, not as a separate message
  const recent = allMessages.slice(-RECENT_MESSAGES_KEEP);

  return recent.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
}

/**
 * Return a summary context string to append to the system prompt, or empty string.
 */
export function getSummaryContext(
  messageCount: number,
  summary: string | null
): string {
  if (summary) {
    return `\n\n## Conversation Summary\nThe following summarizes earlier parts of this tutoring conversation:\n${summary}`;
  }
  if (messageCount > COMPRESSION_THRESHOLD) {
    return "\n\n## Note\nEarlier conversation history has been omitted. A summary will be available shortly.";
  }
  return "";
}

/**
 * Check if a session needs compression and generate a summary if so.
 * Called after saving the assistant response. Runs in the background —
 * failures are logged but don't affect the user.
 */
export async function maybeCompressThread(sessionId: string): Promise<void> {
  const session = await db.tutoringSession.findUnique({
    where: { id: sessionId },
    select: {
      summary: true,
      _count: { select: { messages: true } },
    },
  });

  if (!session) return;

  const totalMessages = session._count.messages;

  // Only compress when we cross the threshold and don't have a recent summary
  // Re-compress every 20 messages after initial compression
  const shouldCompress =
    totalMessages >= COMPRESSION_THRESHOLD &&
    (session.summary === null || totalMessages % 20 === 0);

  if (!shouldCompress) return;

  // Fetch messages to summarize (everything except the last RECENT_MESSAGES_KEEP)
  const messagesToSummarize = await db.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: "asc" },
    take: Math.max(0, totalMessages - RECENT_MESSAGES_KEEP),
    select: { role: true, content: true },
  });

  if (messagesToSummarize.length < 10) return;

  const transcript = messagesToSummarize
    .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
    .join("\n\n");

  const summaryText = await chatCompletion([
    {
      role: "system",
      content:
        "You are a concise summarizer. Summarize the following tutoring conversation, preserving: (1) the topic being studied, (2) key concepts covered, (3) where the student struggled, (4) what was resolved, (5) current progress. Keep it under 300 words.",
    },
    { role: "user", content: transcript },
  ]);

  if (summaryText) {
    await db.tutoringSession.update({
      where: { id: sessionId },
      data: { summary: summaryText },
    });
  }
}
