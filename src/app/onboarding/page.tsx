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
      <div className="fixed inset-0 bg-bg-base/55 z-0" />

    <main className="relative z-10 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg flex flex-col items-center gap-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-px bg-accent/40" />
              <h2 className="font-display font-bold text-xl tracking-[0.25em] text-text-primary">
                PAIDEIA
              </h2>
              <div className="w-8 h-px bg-accent/40" />
            </div>
            <p className="text-text-muted/60 text-[11px] tracking-[0.2em] font-display">EST. 2026</p>
          </div>
          <h1 className="font-serif text-[34px] leading-[1.2] text-text-primary text-center">
            How will you use Paideia?
          </h1>
        </div>

        <RoleSelector />
      </div>
    </main>
    </div>
  );
}
