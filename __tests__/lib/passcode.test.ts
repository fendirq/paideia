import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { validatePasscode } from "@/lib/passcode";

describe("validatePasscode", () => {
  const originalPasscode = process.env.ADMIN_PASSCODE;

  beforeEach(() => {
    process.env.ADMIN_PASSCODE = "082600";
  });

  afterEach(() => {
    if (originalPasscode === undefined) {
      delete process.env.ADMIN_PASSCODE;
      return;
    }
    process.env.ADMIN_PASSCODE = originalPasscode;
  });

  it("accepts the correct passcode", () => {
    expect(validatePasscode("082600")).toBe(true);
  });

  it("rejects an incorrect passcode", () => {
    expect(validatePasscode("000000")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(validatePasscode("")).toBe(false);
  });

  it("rejects null/undefined", () => {
    expect(validatePasscode(null as unknown as string)).toBe(false);
    expect(validatePasscode(undefined as unknown as string)).toBe(false);
  });

  it("rejects passcode with extra whitespace", () => {
    expect(validatePasscode(" 082600 ")).toBe(false);
  });
});
