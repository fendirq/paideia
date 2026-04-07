import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
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

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
