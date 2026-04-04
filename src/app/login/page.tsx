import { LoginForm } from "@/components/login-form";
import { FullBleedBg } from "@/components/full-bleed-bg";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <FullBleedBg />
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="text-center space-y-4">
          <h2 className="font-display text-[13px] font-semibold tracking-[3px] uppercase text-accent">
            PAIDEIA
          </h2>
          <h1 className="font-serif text-[38px] leading-[1.2] text-text-primary">
            Your Socratic tutor,
            <br />
            <em className="text-text-secondary">always ready.</em>
          </h1>
          <p className="text-[15px] text-text-secondary max-w-sm mx-auto leading-relaxed">
            AI-powered learning for Drew School students and faculty.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
