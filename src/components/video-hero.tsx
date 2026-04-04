interface VideoHeroProps {
  userName?: string | null;
}

export function VideoHero({ userName }: VideoHeroProps) {
  const displayName = userName?.split(" ")[0] ?? "there";

  return (
    <div
      className="relative overflow-hidden"
      style={{
        height: "340px",
        background: [
          "radial-gradient(ellipse at 30% 80%, rgba(74,157,91,0.12) 0%, transparent 50%)",
          "radial-gradient(ellipse at 70% 20%, rgba(91,155,213,0.05) 0%, transparent 50%)",
          "linear-gradient(180deg, #1a1915 0%, #22211e 100%)",
        ].join(", "),
      }}
    >
      <div className="absolute inset-0 flex items-end">
        <div className="max-w-4xl mx-auto px-6 pb-12 w-full">
          <h1 className="font-serif text-[42px] leading-[1.15] text-text-primary mb-3">
            Welcome back, {displayName}.
          </h1>
          <p className="text-[15px] text-text-secondary leading-relaxed max-w-md">
            Pick up where you left off, or start a new study session.
          </p>
        </div>
      </div>
    </div>
  );
}
