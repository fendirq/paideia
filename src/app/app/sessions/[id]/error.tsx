"use client";

export default function SessionError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <h2 className="text-xl font-display font-semibold text-text-primary mb-2">
        Something went wrong
      </h2>
      <p className="text-sm text-text-muted mb-6">
        We couldn&apos;t load this session. Please try again.
      </p>
      <button
        onClick={reset}
        className="bg-accent hover:bg-accent-light text-white font-display text-sm font-medium rounded-xl px-5 py-2.5 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
