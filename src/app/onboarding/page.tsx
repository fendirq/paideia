import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { RoleSelector } from "@/components/role-selector";
import { FullBleedBg } from "@/components/full-bleed-bg";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.id === "guest") redirect("/app");
  if (session.user.role) redirect("/app");

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <FullBleedBg />
      <div className="w-full max-w-lg flex flex-col items-center gap-8">
        <div className="text-center space-y-4">
          <h2 className="font-display text-[13px] font-semibold tracking-[3px] uppercase text-accent">
            PAIDEIA
          </h2>
          <h1 className="font-serif text-[34px] leading-[1.2] text-text-primary">
            How will you use Paideia?
          </h1>
        </div>

        <RoleSelector />
      </div>
    </main>
  );
}
