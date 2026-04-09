import { PinInput } from "@/components/portal/PinInput";

export default function PortalAccessPage() {
  return (
    <div className="fixed inset-0 z-10">
      {/* Video background (own copy — layout video doesn't reliably show through) */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Centered glass panel */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="bg-[rgba(40,32,24,0.55)] backdrop-blur-2xl border border-[rgba(168,152,128,0.15)] rounded-2xl p-10 text-center shadow-2xl">
          <h1 className="font-display text-2xl font-bold tracking-[0.12em] text-text-primary mb-2">
            PAIDEIA
          </h1>
          <p className="text-text-muted text-sm mb-8">Enter access code</p>
          <PinInput />
        </div>
      </div>
    </div>
  );
}
