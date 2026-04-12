export interface SseParserState {
  buffer: string;
}

export function createSseParserState(): SseParserState {
  return { buffer: "" };
}

export function extractSseDataMessages(state: SseParserState, chunk: string): string[] {
  state.buffer += chunk;
  const frames = state.buffer.split(/\r?\n\r?\n/);
  state.buffer = frames.pop() ?? "";

  return frames.flatMap((frame) =>
    frame
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data: "))
      .map((line) => line.slice(6))
  );
}

export function flushSseDataMessages(state: SseParserState): string[] {
  const leftover = state.buffer.trim();
  state.buffer = "";

  if (!leftover) return [];

  return leftover
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data: "))
    .map((line) => line.slice(6));
}
