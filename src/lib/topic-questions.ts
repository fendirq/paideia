import { chatCompletion } from "./gemini-chat";
import { db } from "./db";

const MAX_QUESTIONS = 3;
const MAX_CHARS_PER_CHUNK = 1500;
const MAX_CHUNKS = 3;

/**
 * Generate short Socratic opener questions tailored to the uploaded
 * file content. One question per chunk, each an *open* question the
 * tutor can use to begin a dialogue — NOT a statement, NOT a prompt
 * to answer the student's assignment for them.
 *
 * Returns an empty array on any failure (empty chunks, provider
 * error, malformed response). The caller falls back to the generic
 * per-subject welcome actions in that case.
 */
export async function generateTopicQuestions(
  inquiryId: string,
  subject: string,
): Promise<string[]> {
  const chunks = await db.textChunk.findMany({
    where: { inquiryId },
    orderBy: { chunkIndex: "asc" },
    take: MAX_CHUNKS,
    select: { content: true },
  });

  if (chunks.length === 0) return [];

  const excerpts = chunks
    .map((c, i) => `[Excerpt ${i + 1}]:\n${c.content.slice(0, MAX_CHARS_PER_CHUNK)}`)
    .join("\n\n");

  const system = `You are a Socratic tutor preparing opener questions for a student who just uploaded coursework. You will NOT answer their work. You will generate exactly ${MAX_QUESTIONS} short, open-ended questions — each rooted in a specific detail from the excerpts — that invite the student to explain their thinking, justify a claim, or clarify an ambiguity.

Rules:
- Each question MUST reference a specific phrase, number, name, or claim from the excerpts.
- Each question must be answerable in 2-4 sentences by the student.
- Never include answers, hints, or the student's expected conclusion.
- Do not start with "Can you...", "Could you...", or "Would you..." — go straight to the content.
- Keep each question under 120 characters.
- Output ONLY the ${MAX_QUESTIONS} questions, one per line, no numbering, no preamble.`;

  const user = `Subject: ${subject}

${excerpts}

Generate ${MAX_QUESTIONS} Socratic opener questions now.`;

  let raw: string;
  try {
    raw = await chatCompletion([
      { role: "system", content: system },
      { role: "user", content: user },
    ]);
  } catch (err) {
    console.warn("topic-questions: generation failed", {
      inquiryId,
      subject,
      err: err instanceof Error ? err.message : String(err),
    });
    return [];
  }

  const questions = raw
    .split("\n")
    .map((line) => line.trim())
    .map((line) => line.replace(/^[-*\d.)\s]+/, "").trim())
    .filter((line) => line.length > 0 && line.length <= 200)
    .slice(0, MAX_QUESTIONS);

  if (questions.length === 0) {
    console.warn("topic-questions: model returned no usable questions", {
      inquiryId,
      preview: raw.slice(0, 200),
    });
  }

  return questions;
}

/**
 * Fetch cached questions for an inquiry, generating + persisting on
 * first access. Subsequent calls return the cached array without
 * touching Gemini. Safe to call concurrently — the worst case is two
 * overlapping generations, with the second overwrite harmless.
 */
export async function getOrGenerateTopicQuestions(
  inquiryId: string,
  subject: string,
): Promise<string[]> {
  const inquiry = await db.inquiry.findUnique({
    where: { id: inquiryId },
    select: { topicQuestions: true },
  });
  if (!inquiry) return [];
  if (inquiry.topicQuestions.length > 0) return inquiry.topicQuestions;

  const generated = await generateTopicQuestions(inquiryId, subject);
  if (generated.length === 0) return [];

  await db.inquiry
    .update({
      where: { id: inquiryId },
      data: { topicQuestions: generated },
    })
    .catch((err) => {
      console.warn("topic-questions: cache write failed", {
        inquiryId,
        err: err instanceof Error ? err.message : String(err),
      });
    });

  return generated;
}
