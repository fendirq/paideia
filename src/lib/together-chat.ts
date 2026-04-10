export { parseActionsFromResponse } from "./parse-actions";

const TOGETHER_CHAT_URL = "https://api.together.xyz/v1/chat/completions";
const DEFAULT_MODEL = "moonshotai/Kimi-K2.5";

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
    const errorBody = await response.text();
    console.error(`Together.ai API error: ${response.status}`, errorBody);
    throw new Error(`Together.ai API error: ${response.status}`);
  }

  if (!response.body) {
    throw new Error("Together.ai returned no response body");
  }

  return response.body;
}

export async function chatCompletion(
  messages: ChatMessage[]
): Promise<string> {
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
      stream: false,
      max_tokens: 1024,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Together.ai API error: ${response.status}`, errorBody);
    throw new Error(`Together.ai API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}
