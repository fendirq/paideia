import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SearchPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-bg-inner">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-display font-bold mb-1">Search</h1>
        <p className="text-text-secondary text-sm mb-8">
          Search across your sessions and files.
        </p>
        <div className="bg-bg-surface/50 border border-white/[0.04] rounded-xl p-12 text-center">
          <p className="text-text-muted">Search coming soon.</p>
        </div>
      </div>
    </div>
  );
}
