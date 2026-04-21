import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/app");

  // Paideia is live — unauthenticated visitors go straight to signup.
  // The /waitlist page still exists for anyone with a direct link (and
  // for admin review of historical signups), but it is no longer the
  // default entry point. To re-gate new signups behind a waitlist,
  // revert this redirect and restore the proxy.ts check.
  redirect("/signup");
}
