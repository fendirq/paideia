import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "../../../../components/auth-shell";

export default function AuthPage() {
  return (
    <AuthShell
      label="Auth"
      title="Enter Paideia through a single auth gateway."
      body="Clerk's current SignIn component can handle a unified sign-in or sign-up flow, so we can keep this surface on one clean `/auth` path."
    >
      <SignIn
        path="/auth"
        routing="path"
        withSignUp
        fallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
      />
    </AuthShell>
  );
}
