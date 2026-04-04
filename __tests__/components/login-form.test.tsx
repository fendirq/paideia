import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/login-form";

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

describe("LoginForm", () => {
  it("renders Google sign-in button", () => {
    render(<LoginForm />);
    expect(
      screen.getByRole("button", { name: /sign in with google/i })
    ).toBeInTheDocument();
  });

  it("renders passcode input", () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText(/passcode/i)).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<LoginForm />);
    expect(
      screen.getByRole("button", { name: /enter/i })
    ).toBeInTheDocument();
  });
});
