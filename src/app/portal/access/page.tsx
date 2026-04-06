import { PinInput } from "@/components/portal/PinInput";

export default function PortalAccessPage() {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center px-6">
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl font-bold tracking-[0.12em] text-text-primary mb-2">
          PAIDEIA
        </h1>
        <p className="text-text-muted text-sm">Enter access code</p>
      </div>
      <PinInput />
    </div>
  );
}
