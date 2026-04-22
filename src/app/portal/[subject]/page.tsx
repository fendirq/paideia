import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const ESSAY_SUBJECTS = ["history", "english", "humanities"];
const JOKE_SUBJECTS = ["mathematics", "science", "mandarin"];

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await params;
  const lower = subject.toLowerCase();

  // Essay-eligible subjects → redirect to generate (with profile check)
  if (ESSAY_SUBJECTS.includes(lower)) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const profile = await db.writingProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!profile) redirect("/portal/aggregate");
    redirect(`/portal/${lower}/generate`);
  }

  // Joke subjects
  if (JOKE_SUBJECTS.includes(lower)) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
        <div className="text-center glass p-12 max-w-md">
          <p className="text-2xl mb-2">😐</p>
          <p className="text-text-primary font-display text-lg font-semibold mb-2">
            Not this one.
          </p>
          <p className="text-text-secondary text-sm">
            Paideia writes essays. Try your AI chatbot of choice for this one.
          </p>
        </div>
      </div>
    );
  }

  redirect("/portal/home");
}
