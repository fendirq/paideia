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
      <div className="fixed inset-0 bg-bg-base/55 z-0" />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <SignupForm />
      </main>
    </div>
  );
}
