import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { LibraryView } from "@/components/library-view";

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const inquiries = await db.inquiry.findMany({
    where: { userId: session.user.id },
    include: {
      files: { select: { fileName: true } },
      _count: { select: { sessions: true, chunks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-3xl font-display font-bold mb-2">Library</h1>
      <p className="text-text-secondary mb-6">
        Your uploaded coursework and study materials.
      </p>
      <LibraryView
        inquiries={JSON.parse(JSON.stringify(inquiries))}
      />
    </div>
  );
}
