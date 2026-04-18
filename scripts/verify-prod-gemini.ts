// Smoke-test the production Gemini env: instantiate the real provider
// with the real API key, make one tiny call, print model + text.
//
// Run: node --env-file=.env.production.local --experimental-strip-types \
//        --disable-warning=MODULE_TYPELESS_PACKAGE_JSON \
//        scripts/verify-prod-gemini.ts
import { getProvider, resolveProviderName } from "../src/lib/providers/index.ts";

async function main(): Promise<void> {
  const rawProvider = process.env.LEVEL2_PROVIDER;
  const rawKey = process.env.GEMINI_API_KEY;
  console.log("LEVEL2_PROVIDER (raw):", JSON.stringify(rawProvider));
  console.log("GEMINI_API_KEY length:", rawKey?.length, "ends with newline?", rawKey?.endsWith("\n"));
  console.log("ANTHROPIC_API_KEY present:", Boolean(process.env.ANTHROPIC_API_KEY));
  console.log("Resolved provider:", resolveProviderName());

  const provider = getProvider();
  const res = await provider.createLevel2Message({
    system: "You are a terse assistant. Reply in exactly five words.",
    prompt: "Say hello from Gemini.",
    maxTokens: 64,
    thinking: false,
    temperature: 0.3,
    stageLabel: "smoke",
    timeoutMs: 60_000,
  });
  console.log("---");
  console.log("Model:", res.model);
  console.log("Text:", JSON.stringify(res.text));
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
