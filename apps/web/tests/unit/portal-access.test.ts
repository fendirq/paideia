import { describe, expect, it } from "vitest";
import { canAccessWritingPortal } from "@/lib/portal-access";

describe("canAccessWritingPortal", () => {
  it("allows a student capability set", () => {
    expect(canAccessWritingPortal(["student", "writing_portal"])).toBe(true);
  });

  it("blocks a teacher-only capability set", () => {
    expect(canAccessWritingPortal(["teacher"])).toBe(false);
  });
});
