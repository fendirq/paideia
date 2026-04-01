import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const isGuest = session.user.id === "guest";

  // Non-guest users without a role go to onboarding
  if (!isGuest && !session.user.role) {
    redirect("/onboarding");
  }

  return (
    <AppShell
      userName={session.user.name ?? undefined}
      userRole={isGuest ? "GUEST" : session.user.role}
    >
      {children}
    </AppShell>
  );
}
