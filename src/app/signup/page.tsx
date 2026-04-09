import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/signup-form";

export default async function SignupPage() {
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

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
        <h1 className="font-display font-bold text-base tracking-[0.1em] mb-10">
          PAIDEIA
        </h1>

        <div className="w-full max-w-sm bg-[rgba(40,32,24,0.55)] backdrop-blur-[20px] border border-[rgba(168,152,128,0.15)] rounded-[20px] p-8">
          <h2 className="font-display font-semibold text-lg text-text-primary text-center mb-6">
            Create Account
          </h2>
          <SignupForm />
        </div>
      </main>
    </div>
  );
}
