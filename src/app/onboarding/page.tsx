import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { RoleSelector } from "@/components/role-selector";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role === "TEACHER") redirect("/app/teacher");
  if (session.user.role) redirect("/app");

  return (
    <div className="min-h-screen relative">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-bg-base/50 z-0" />

    <main className="relative z-10 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg flex flex-col items-center gap-8">
        <div className="text-center space-y-4">
          <h2 className="font-display font-bold text-base tracking-[0.1em]">
            PAIDEIA
          </h2>
          <h1 className="font-serif text-[34px] leading-[1.2] text-text-primary">
            How will you use Paideia?
          </h1>
        </div>

        <RoleSelector />
      </div>
    </main>
    </div>
  );
}
