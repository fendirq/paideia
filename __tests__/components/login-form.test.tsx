import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/login-form";

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

describe("LoginForm", () => {
  it("renders the email/password sign-in form by default", () => {
    render(<LoginForm />);

    expect(
      screen.getByRole("button", { name: /^sign in$/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
    expect(screen.getByText(/use passcode/i)).toBeInTheDocument();
  });

  it("renders labeled email and password fields", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it("switches into passcode mode", async () => {
    const user = userEvent.setup();

    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /use passcode/i }));

    expect(screen.getByPlaceholderText(/passcode/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enter/i })).toBeInTheDocument();
  });
});
