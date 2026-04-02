const TOGETHER_CHAT_URL = "https://api.together.xyz/v1/chat/completions";
const DEFAULT_MODEL = "deepseek-ai/DeepSeek-R1";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export function getModel(): string {
  return process.env.TOGETHER_CHAT_MODEL || DEFAULT_MODEL;
}

export async function streamChatCompletion(
  messages: ChatMessage[]
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) throw new Error("TOGETHER_API_KEY is not set");

  const response = await fetch(TOGETHER_CHAT_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: getModel(),
      messages,
      stream: true,
      max_tokens: 2048,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Together.ai chat error: ${response.status} ${error}`);
  }

  return response.body!;
}

// Strip DeepSeek R1 <think>...</think> reasoning tags from output (closed and unclosed)
function stripThinkingTags(text: string): string {
  return text
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .replace(/<think>[\s\S]*$/g, "")
    .trim();
}

export function parseActionsFromResponse(fullText: string): {
  message: string;
  suggestedActions: string[];
} {
  let cleaned = stripThinkingTags(fullText);

  const separator = "---ACTIONS---";
  const idx = cleaned.lastIndexOf(separator);
  if (idx === -1) {
    return { message: cleaned.trim(), suggestedActions: [] };
  }

  const message = cleaned.slice(0, idx).trim();
  const actionsText = cleaned.slice(idx + separator.length).trim();
  const suggestedActions = actionsText
    .split("\n")
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .filter((line) => line.length > 0 && line !== "I still don't understand")
    .slice(0, 3);

  return { message, suggestedActions };
}
