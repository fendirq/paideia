import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UploadForm } from "@/components/upload-form";

export default async function UploadPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/app");
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">Upload New Work</h1>
      <p className="text-text-secondary mb-8">
        {session.user.role === "TEACHER"
          ? "Share course materials for your students to study."
          : "Upload your coursework and describe what you need help with."}
      </p>
      <UploadForm userRole={session.user.role ?? "STUDENT"} />
    </div>
  );
}
