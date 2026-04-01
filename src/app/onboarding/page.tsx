import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { RoleSelector } from "@/components/role-selector";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.id === "guest") redirect("/app");
  if (session.user.role) redirect("/app");

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <RoleSelector />
    </main>
  );
}
