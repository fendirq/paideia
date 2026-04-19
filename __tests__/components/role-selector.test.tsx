import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoleSelector } from "@/components/role-selector";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// RoleSelector now uses `useSession().update()` to force a JWT
// refresh after /api/onboarding. Stub out next-auth/react so the
// component mounts without a real SessionProvider context.
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: null,
    status: "unauthenticated" as const,
    update: vi.fn(async () => null),
  }),
}));

describe("RoleSelector", () => {
  it("renders student and teacher options", () => {
    render(<RoleSelector />);
    expect(
      screen.getByRole("button", { name: /student/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /teacher/i })
    ).toBeInTheDocument();
  });
});
