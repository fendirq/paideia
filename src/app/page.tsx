import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WaitlistForm } from "@/components/waitlist-form";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/app");

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

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="bg-white/[0.06] backdrop-blur-[20px] border border-white/[0.08] rounded-2xl px-6 py-6 w-full max-w-xs text-center space-y-4">
          <h1 className="font-display font-bold text-lg tracking-[0.12em]">
            PAIDEIA
          </h1>
          <Suspense fallback={null}>
            <WaitlistForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
