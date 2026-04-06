import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SUBJECT_LABELS, SUBJECT_COLORS } from "@/lib/subject-constants";
import { SessionSetupForm } from "./session-setup-form";
import { BackButton } from "@/components/back-button";

export default async function SessionSetupPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { classId } = await params;

  const inquiry = await db.inquiry.findUnique({
    where: { id: classId },
  });

  if (!inquiry || inquiry.userId !== session.user.id) {
    redirect("/app/start");
  }

  const label = SUBJECT_LABELS[inquiry.subject] ?? "Other";
  const color = SUBJECT_COLORS[inquiry.subject] ?? SUBJECT_COLORS.OTHER;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 mt-4 mb-8 bg-black/40 backdrop-blur-2xl border border-white/[0.08] rounded-[20px]">
      <BackButton href="/app/start" />

      {/* Class header */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
        </div>
        <div>
          <h1 className="font-display font-semibold text-[20px] text-text-primary">
            {inquiry.unitName}
          </h1>
          <p className="text-[13px] text-text-muted">
            {label} · {inquiry.teacherName}
          </p>
        </div>
      </div>

      <SessionSetupForm classId={classId} />
    </div>
  );
}
