import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { SUBJECT_COLORS, SUBJECT_LABELS } from "@/lib/subject-constants";
import { BackButton } from "@/components/back-button";

export default async function StartPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const classes = await db.inquiry.findMany({
    where: {
      userId: session.user.id,
      teacherNotes: "add-class",
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 mt-4 mb-8 bg-[rgba(40,32,24,0.55)] backdrop-blur-2xl border border-[rgba(168,152,128,0.15)] rounded-[20px]">
      <BackButton href="/app" />
      <h1 className="font-serif text-[34px] text-text-primary mb-2">
        Start a Session
      </h1>
      <p className="text-[15px] text-text-secondary mb-8">
        Pick a class to study.
      </p>

      {classes.length === 0 ? (
        <div className="bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[16px] p-12 text-center">
          <p className="text-text-muted mb-3">No classes yet.</p>
          <Link href="/app" className="text-accent text-sm hover:text-accent-light transition-colors">
            Go to Home to add a class
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((cls) => {
            const color = SUBJECT_COLORS[cls.subject] ?? SUBJECT_COLORS.OTHER;
            const label = SUBJECT_LABELS[cls.subject] ?? "Other";
            return (
              <Link
                key={cls.id}
                href={`/app/start/${cls.id}`}
                className="group flex items-center gap-4 bg-bg-inner border border-[rgba(168,152,128,0.12)] rounded-[16px] px-5 py-4 hover:-translate-y-0.5 hover:border-[rgba(168,152,128,0.15)] transition-all"
                style={{ transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-[15px] text-text-primary">
                    {cls.unitName}
                  </h3>
                  <p className="text-[12px] text-text-muted">
                    {label} · {cls.teacherName}
                  </p>
                </div>
                <svg className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
