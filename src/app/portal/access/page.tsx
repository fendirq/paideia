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
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-px bg-accent/40" />
              <h1 className="font-display font-bold text-xl tracking-[0.25em] text-text-primary">
                PAIDEIA
              </h1>
              <div className="w-8 h-px bg-accent/40" />
            </div>
            <p className="text-text-muted/60 text-[11px] tracking-[0.2em] font-display">EST. 2026</p>
          </div>
          <p className="text-text-muted text-sm mb-8">Enter access code</p>
          <PinInput />
        </div>
      </div>
    </div>
  );
}
