export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md space-y-6 text-center">
        <h1 className="text-4xl font-bold">Paideia</h1>
        <p className="text-text-secondary">
          Design system verification — fonts, colors, and components.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="btn-primary">Primary</button>
          <button className="btn-secondary">Secondary</button>
        </div>
        <div className="card p-6">
          <p className="text-text-muted text-sm">Card component</p>
        </div>
      </div>
    </main>
  );
}
