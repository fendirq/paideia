import { describe, expect, it } from "vitest";
import { canAccessWritingPortal, normalizeCapabilities } from "@/lib/portal-access";

describe("canAccessWritingPortal", () => {
  it("allows a student capability set", () => {
    expect(canAccessWritingPortal(["student", "writing_portal"])).toBe(true);
  });

  it("blocks a teacher-only capability set", () => {
    expect(canAccessWritingPortal(["teacher"])).toBe(false);
  });
});

describe("normalizeCapabilities", () => {
  it("deduplicates and sorts capabilities", () => {
    expect(normalizeCapabilities(["writing_portal", "student", "student"])).toEqual([
      "student",
      "writing_portal",
    ]);
  });
});
