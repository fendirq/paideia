// @vitest-environment node
import { beforeEach, afterEach, describe, expect, it } from "vitest";
import {
  buildPortalToken,
  verifyPortalToken,
  validatePortalCode,
} from "../lib/portal-auth";

const ORIGINAL_SECRET = process.env.NEXTAUTH_SECRET;
const ORIGINAL_PREVIOUS = process.env.NEXTAUTH_SECRET_PREVIOUS;
const ORIGINAL_PORTAL_CODE = process.env.PORTAL_ACCESS_CODE;

beforeEach(() => {
  process.env.NEXTAUTH_SECRET = "test-primary-secret-32-chars-long";
  delete process.env.NEXTAUTH_SECRET_PREVIOUS;
  process.env.PORTAL_ACCESS_CODE = "1234";
});

afterEach(() => {
  process.env.NEXTAUTH_SECRET = ORIGINAL_SECRET;
  if (ORIGINAL_PREVIOUS === undefined) delete process.env.NEXTAUTH_SECRET_PREVIOUS;
  else process.env.NEXTAUTH_SECRET_PREVIOUS = ORIGINAL_PREVIOUS;
  process.env.PORTAL_ACCESS_CODE = ORIGINAL_PORTAL_CODE;
});

describe("portal token signing", () => {
  it("a freshly signed token verifies", () => {
    const token = buildPortalToken();
    expect(verifyPortalToken(token)).toBe(true);
  });

  it("rejects the old literal 'granted' cookie value", () => {
    expect(verifyPortalToken("granted")).toBe(false);
  });

  it("rejects undefined, empty, and whitespace", () => {
    expect(verifyPortalToken(undefined)).toBe(false);
    expect(verifyPortalToken("")).toBe(false);
    expect(verifyPortalToken(" ")).toBe(false);
  });

  it("rejects malformed tokens", () => {
    expect(verifyPortalToken("nodotsseparator")).toBe(false);
    expect(verifyPortalToken(".onlyadot")).toBe(false);
    expect(verifyPortalToken("trailingdot.")).toBe(false);
    expect(verifyPortalToken("notanumber.deadbeef")).toBe(false);
  });

  it("rejects a valid-format token signed by a different secret", () => {
    const token = buildPortalToken();
    process.env.NEXTAUTH_SECRET = "different-secret-also-32-chars-x";
    expect(verifyPortalToken(token)).toBe(false);
  });

  it("rejects expired tokens (>7 days old)", () => {
    const eightDaysMs = 8 * 24 * 60 * 60 * 1000;
    const pastTimestamp = Date.now() - eightDaysMs;
    // Forge a token with the real signature but an expired timestamp.
    // This exercises the expiry branch without altering the secret.
    const { createHmac } = require("crypto");
    const hmac = createHmac("sha256", process.env.NEXTAUTH_SECRET!);
    hmac.update(`portal-access|${pastTimestamp}`);
    const expired = `${pastTimestamp}.${hmac.digest("hex")}`;
    expect(verifyPortalToken(expired)).toBe(false);
  });

  it("accepts tokens signed by NEXTAUTH_SECRET_PREVIOUS during rotation", () => {
    process.env.NEXTAUTH_SECRET = "new-primary-secret-32-chars-long";
    process.env.NEXTAUTH_SECRET_PREVIOUS = "test-primary-secret-32-chars-long";
    const { createHmac } = require("crypto");
    const ts = Date.now().toString();
    const hmac = createHmac("sha256", "test-primary-secret-32-chars-long");
    hmac.update(`portal-access|${ts}`);
    const oldToken = `${ts}.${hmac.digest("hex")}`;
    expect(verifyPortalToken(oldToken)).toBe(true);
  });

  it("rejects tokens when NEXTAUTH_SECRET is missing", () => {
    const token = buildPortalToken();
    delete process.env.NEXTAUTH_SECRET;
    expect(() => verifyPortalToken(token)).toThrow(/NEXTAUTH_SECRET is required/);
  });

  it("rejects tokens whose signature is all zeros", () => {
    const ts = Date.now().toString();
    const zeroSig = "0".repeat(64);
    expect(verifyPortalToken(`${ts}.${zeroSig}`)).toBe(false);
  });
});

describe("validatePortalCode (pre-existing behavior)", () => {
  it("accepts the expected code", () => {
    expect(validatePortalCode("1234")).toBe(true);
  });
  it("rejects incorrect codes", () => {
    expect(validatePortalCode("0000")).toBe(false);
  });
  it("rejects empty or wrong-type input", () => {
    expect(validatePortalCode("")).toBe(false);
    // @ts-expect-error — deliberately probing the type guard
    expect(validatePortalCode(null)).toBe(false);
  });
});
