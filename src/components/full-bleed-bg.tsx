export function FullBleedBg() {
  return (
    <>
      {/* Gradient orbs */}
      <div className="fixed inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background: [
              "radial-gradient(ellipse at 20% 50%, rgba(74,157,91,0.10) 0%, transparent 50%)",
              "radial-gradient(ellipse at 80% 20%, rgba(91,155,213,0.06) 0%, transparent 50%)",
              "radial-gradient(ellipse at 60% 80%, rgba(232,168,56,0.05) 0%, transparent 50%)",
              "linear-gradient(180deg, #1a1915 0%, #22211e 100%)",
            ].join(", "),
          }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: [
              "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)",
              "linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
            ].join(", "),
            backgroundSize: "60px 60px",
          }}
        />
      </div>
    </>
  );
}
