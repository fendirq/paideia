import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { UploadForm } from "@/components/upload-form";

export default async function UploadPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const existingClasses = await db.inquiry.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      subject: true,
      teacherName: true,
      unitName: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="p-8">
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
      />
    </div>
  );
}
