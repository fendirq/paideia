import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UploadForm } from "@/components/upload-form";
import { BackButton } from "@/components/back-button";

export default async function UploadPage({
  searchParams,
}: {
  searchParams: Promise<{ class?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { class: preselectedClassId } = await searchParams;

  const existingClasses = await db.inquiry.findMany({
    where: { userId: session.user.id, teacherNotes: "add-class" },
    select: {
      id: true,
      subject: true,
      teacherName: true,
      unitName: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 mt-4 mb-8 bg-[rgba(40,32,24,0.55)] backdrop-blur-2xl border border-[rgba(168,152,128,0.15)] rounded-[20px]">
      <BackButton href="/app" />
      <h1 className="font-serif text-[34px] text-text-primary mb-2">
        Upload coursework
      </h1>
      <p className="text-[15px] text-text-secondary mb-8">
        {session.user.role === "TEACHER"
          ? "Share course materials for your students to study."
          : "Add files and describe what you need help with."}
      </p>
      <UploadForm
        userRole={session.user.role ?? "STUDENT"}
        existingClasses={existingClasses}
        preselectedClassId={preselectedClassId}
      />
    </div>
  );
}
