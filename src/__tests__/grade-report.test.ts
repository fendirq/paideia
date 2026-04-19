// @vitest-environment node
import { describe, expect, it } from "vitest";
import { formatProviderSlot, type GradeReport } from "../../scripts/qa-lib/grade-report.ts";

describe("formatProviderSlot", () => {
  it("formats a fully populated provider slot", () => {
    const report: GradeReport = {
      fixture: "fixture",
      timestamp: "2026-04-18T00:00:00.000Z",
      provider: {
        level1: { name: "together", model: "deepseek-ai/DeepSeek-V3" },
        level2: { name: "gemini", model: "gemini-3.1-pro-preview" },
        judge: { name: "gemini", model: "gemini-3.1-pro-preview" },
      },
      generations: [],
    };

    expect(formatProviderSlot(report, "level2")).toBe("gemini/gemini-3.1-pro-preview");
  });

  it("returns a safe fallback when provider metadata is absent", () => {
    expect(formatProviderSlot({}, "level2")).toBe("unknown");
  });

  it("fills missing provider fields with unknown", () => {
    expect(
      formatProviderSlot(
        {
          provider: {
            level1: { name: "together", model: "deepseek-ai/DeepSeek-V3" },
            level2: { name: "gemini", model: "" },
            judge: { name: "gemini", model: "gemini-3.1-pro-preview" },
          },
        },
        "level2",
      ),
    ).toBe("gemini/unknown");
  });
});
