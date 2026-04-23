export type SerializedDoc = {
  type: "doc";
  content: Array<{
    type: string;
    attrs?: Record<string, unknown>;
    content?: Array<{ type: string; text?: string; marks?: Array<{ type: string }> }>;
  }>;
};
