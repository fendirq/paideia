import { beforeEach, describe, expect, it, vi } from "vitest";

const findUnique = vi.fn();
const create = vi.fn();
const update = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    user: {
      findUnique,
      create,
      update,
    },
  },
}));

vi.mock("@/lib/passcode", () => ({
  validatePasscode: vi.fn(() => true),
}));

vi.mock("bcrypt", () => ({
  default: {
    compare: vi.fn(),
  },
}));

describe("passcode auth provider", () => {
  beforeEach(() => {
    findUnique.mockReset();
    create.mockReset();
    update.mockReset();
  });

  it("creates an admin user when one does not exist", async () => {
    findUnique.mockResolvedValue(null);
    create.mockResolvedValue({ id: "admin-id", role: "ADMIN" });

    const { ensurePasscodeAdminUser } = await import("@/lib/auth");
    const result = await ensurePasscodeAdminUser();

    expect(create).toHaveBeenCalled();
    expect(result).toMatchObject({ id: "admin-id", role: "ADMIN" });
  });

  it("restores the admin role if the stored admin user was downgraded", async () => {
    findUnique.mockResolvedValue({ id: "admin-id", role: "STUDENT" });
    update.mockResolvedValue({ id: "admin-id", role: "ADMIN" });

    const { ensurePasscodeAdminUser } = await import("@/lib/auth");
    const result = await ensurePasscodeAdminUser();

    expect(update).toHaveBeenCalledWith({
      where: { id: "admin-id" },
      data: { role: "ADMIN" },
    });
    expect(result).toMatchObject({ id: "admin-id", role: "ADMIN" });
  });
});
