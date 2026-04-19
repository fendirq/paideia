// Smoke-test the Gemini tutor chat module. Instantiates the real
// client with whatever env is loaded (via node --env-file=.env.local)
// and runs one non-streaming + one streaming call. Useful to catch
// model-ID / API-key / SDK-shape drift before exercising the full
// tutor route in the browser.
//
// Run: node --env-file=.env.local --experimental-strip-types \
//        --disable-warning=MODULE_TYPELESS_PACKAGE_JSON \
//        scripts/verify-gemini-chat.ts
import { chatCompletion, getChatModel, streamChatCompletion } from "../src/lib/gemini-chat.ts";

async function main(): Promise<void> {
  console.log("Gemini chat model:", getChatModel());
  console.log("GEMINI_API_KEY length:", process.env.GEMINI_API_KEY?.length);

  console.log("\n--- non-streaming ---");
  const summary = await chatCompletion([
    { role: "system", content: "You are a concise tutor. Reply in exactly one sentence." },
    { role: "user", content: "What is 2 + 2?" },
  ]);
  console.log("Response:", JSON.stringify(summary));

  console.log("\n--- streaming ---");
  const stream = await streamChatCompletion([
    { role: "system", content: "You are a Socratic tutor. Reply in exactly 2 sentences — one question, one hint." },
    { role: "user", content: "How do I structure a 5-paragraph essay?" },
  ]);
  const decoder = new TextDecoder();
  let accumulated = "";
  let chunkCount = 0;
  for await (const chunk of stream as unknown as AsyncIterable<Uint8Array>) {
    const text = decoder.decode(chunk);
    chunkCount += 1;
    for (const line of text.split("\n")) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6);
      if (data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data) as { choices?: [{ delta?: { content?: string } }] };
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) accumulated += delta;
      } catch {
        /* skip */
      }
    }
  }
  console.log(`Chunks received: ${chunkCount}`);
  console.log("Accumulated:", JSON.stringify(accumulated));

  if (!summary.trim() || !accumulated.trim()) {
    console.error("FAILED: empty response");
    process.exit(1);
  }
  console.log("\n✅ Both calls returned non-empty text.");
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
