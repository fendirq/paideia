import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BackButton } from "@/components/back-button";

export default async function SearchPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-4xl mx-auto px-6 py-8 mt-4 mb-8 bg-[rgba(40,32,24,0.55)] backdrop-blur-2xl border border-[rgba(168,152,128,0.15)] rounded-[20px]">
        <BackButton href="/app" />
        <h1 className="font-serif text-[34px] leading-[1.2] text-text-primary mb-1">Search</h1>
        <p className="text-text-secondary text-sm mb-8">
          Search across your sessions and files.
        </p>
        <div className="bg-[rgba(35,28,20,0.50)] border border-[rgba(168,152,128,0.12)] rounded-xl p-12 text-center">
          <p className="text-text-muted">Search coming soon.</p>
        </div>
      </div>
    </div>
  );
}
