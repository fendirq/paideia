import { describe, expect, it } from "vitest";
import { createEmptyDocument, serializeDocument } from "@/lib/editor/serialize";

describe("document editor serialization", () => {
  it("creates a stable empty document", () => {
    expect(serializeDocument(createEmptyDocument())).toContain('"type":"doc"');
  });
});
