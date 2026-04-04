import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/app");

  return (
    <div className="min-h-screen relative">
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Scrim */}
      <div className="fixed inset-0 bg-bg-base/50 z-0" />

      {/* Content */}
      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-8 py-5">
          <h1 className="font-display font-bold text-base tracking-[0.1em]">
            PAIDEIA
          </h1>
          <Link
            href="/login"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign in
          </Link>
        </nav>

        {/* Hero */}
        <section className="flex flex-col items-center justify-center text-center px-6 pt-32 pb-40">
          <p className="text-sm font-medium text-accent tracking-wide uppercase mb-4">
            Built for Drew School
          </p>
          <h2 className="text-5xl md:text-6xl font-display font-bold leading-tight max-w-2xl">
            Your AI tutor that teaches you{" "}
            <span className="text-accent">how</span> to think.
          </h2>
          <p className="text-lg text-text-secondary mt-6 max-w-lg leading-relaxed">
            Upload your coursework. Paideia reads it, then guides you through
            problems step-by-step — never giving answers, always helping you
            find them.
          </p>
          <div className="mt-10">
            <Link
              href="/login"
              className="bg-accent border-2 border-accent-light rounded-full px-8 py-3 text-base font-medium text-white shadow-[0_0_20px_rgba(74,157,91,0.3)] hover:bg-accent-light transition-colors"
            >
              Get Started
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="bg-bg-base/60 backdrop-blur-sm py-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-display font-bold text-center mb-12">
              How it works
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <h4 className="font-display font-semibold mb-2">Upload</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Drop in your homework, study guides, or practice sets. Paideia
                  extracts and understands the content.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                  </svg>
                </div>
                <h4 className="font-display font-semibold mb-2">Learn</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Paideia asks guiding questions, gives you checkpoints, and
                  walks you through step-by-step.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a23.838 23.838 0 0 0-1.012 5.434c0 .016.006.033.006.05 0 .026-.006.05-.006.076a48.64 48.64 0 0 1 7.5 4.15 1.125 1.125 0 0 0 1.152-.003 48.649 48.649 0 0 1 7.5-4.146c0-.027-.006-.051-.006-.076 0-.018.005-.035.006-.052a23.834 23.834 0 0 0-1.012-5.434m-15.482 0c.636-.27 1.294-.502 1.972-.694a47.964 47.964 0 0 1 11.538 0c.68.193 1.339.424 1.972.694" />
                  </svg>
                </div>
                <h4 className="font-display font-semibold mb-2">Grow</h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Build real understanding — not just answers. The Socratic
                  method helps knowledge stick.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-bg-base/60 backdrop-blur-sm border-t border-white/[0.04] py-8 px-6 text-center">
          <p className="text-sm text-text-muted">
            Paideia — A Drew School Senior Project
          </p>
        </footer>
      </div>
    </div>
  );
}
