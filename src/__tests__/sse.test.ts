import { describe, expect, it } from "vitest";
import {
  createSseParserState,
  extractSseDataMessages,
  flushSseDataMessages,
} from "@/lib/sse";

describe("SSE parser", () => {
  it("reassembles split SSE frames without dropping content", () => {
    const state = createSseParserState();

    const firstPass = extractSseDataMessages(state, 'data: {"content":"Hel');
    const secondPass = extractSseDataMessages(state, 'lo"}\n\n');

    expect(firstPass).toEqual([]);
    expect(secondPass).toEqual(['{"content":"Hello"}']);
  });

  it("handles multiple events and a trailing DONE frame", () => {
    const state = createSseParserState();

    const chunkMessages = extractSseDataMessages(
      state,
      'data: {"content":"A"}\n\ndata: {"content":"B"}\n\ndata: [DONE]'
    );
    const flushedMessages = flushSseDataMessages(state);

    expect(chunkMessages).toEqual(['{"content":"A"}', '{"content":"B"}']);
    expect(flushedMessages).toEqual(["[DONE]"]);
  });
});
