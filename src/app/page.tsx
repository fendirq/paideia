import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/app");

  // Paideia is live — unauthenticated visitors land on /login.
  // Login form has the "Create account" link for new users, so
  // landing on login first keeps the returning-user path primary
  // without hiding signup. The /waitlist page still exists for
  // anyone with a direct link and for admin review of historical
  // signups, but it's no longer a user-facing entry point.
  redirect("/login");
}
