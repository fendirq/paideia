import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name?.split(" ")[0] ?? "Guest";
  const isGuest = session?.user?.id === "guest";

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Welcome back, {name}</h1>
      <p className="text-text-secondary mb-8">
        {isGuest
          ? "You're browsing as a guest. Sign in with your Drew email for the full experience."
          : "Ready to learn something new today?"}
      </p>

      <div className="grid grid-cols-2 gap-4">
        {!isGuest && (
          <a
            href="/app/upload"
            className="card p-6 hover:border-accent transition-colors"
          >
            <h3 className="font-display font-semibold mb-1">
              Upload New Work
            </h3>
            <p className="text-text-secondary text-sm">
              Submit coursework and start a tutoring session.
            </p>
          </a>
        )}
        <a
          href="/app/library"
          className="card p-6 hover:border-accent transition-colors"
        >
          <h3 className="font-display font-semibold mb-1">Browse Library</h3>
          <p className="text-text-secondary text-sm">
            Explore resources by subject, teacher, and unit.
          </p>
        </a>
      </div>
    </div>
  );
}
