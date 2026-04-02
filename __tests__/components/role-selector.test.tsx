import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoleSelector } from "@/components/role-selector";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe("RoleSelector", () => {
  it("renders student and teacher options", () => {
    render(<RoleSelector />);
    expect(
      screen.getByRole("button", { name: /i'm a student/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /i'm a teacher/i })
    ).toBeInTheDocument();
  });
});
