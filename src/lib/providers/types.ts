export interface LLMMessage {
  prompt: string;
  system: string;
  maxTokens: number;
  temperature?: number;
  timeoutMs: number;
  stageLabel: string;
  /**
   * Hint: request extended internal reasoning when the model supports it.
   * Each provider decides how to honor this — Anthropic emits an adaptive
   * thinking block with display="omitted" on Opus/Sonnet 4.6; Gemini 3.x
   * sets thinkingBudget = -1 (automatic). When thinking is active, both
   * providers suppress the temperature parameter (provider APIs require
   * this for deterministic reasoning output). Providers that don't
   * support extended reasoning ignore the flag.
   */
  thinking?: boolean;
}

export interface LLMResponse {
  text: string;
  model: string;
}

export type LLMProviderName = "anthropic" | "gemini";

export interface LLMProvider {
  readonly name: LLMProviderName;
  createLevel2Message(input: LLMMessage): Promise<LLMResponse>;
}
