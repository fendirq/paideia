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
    <div className="max-w-4xl mx-auto px-6 py-8">
      <h1 className="font-serif text-[34px] text-text-primary mb-2">
        Library
      </h1>
      <p className="text-[15px] text-text-secondary mb-8">
        Your uploaded coursework and study materials.
      </p>
      <LibraryView inquiries={JSON.parse(JSON.stringify(inquiries))} />
    </div>
  );
}
