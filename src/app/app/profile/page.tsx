import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ProfileForm } from "@/components/profile-form";
import { BackButton } from "@/components/back-button";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      school: true,
      grade: true,
      role: true,
      subjectsTaught: true,
      level2PaidAt: true,
      stripeCustomerId: true,
      passwordHash: true,
      createdAt: true,
      enrollments: {
        select: { class: { select: { id: true, name: true, subject: true } } },
      },
      teacherClasses: {
        select: { id: true, name: true, subject: true, _count: { select: { enrollments: true } } },
      },
    },
  });

  if (!user) redirect("/login");

  const backHref = user.role === "TEACHER" ? "/app/teacher" : "/app";

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 mt-4 mb-8 bg-[rgba(40,32,24,0.55)] backdrop-blur-2xl border border-[rgba(168,152,128,0.15)] rounded-[20px]">
      <BackButton href={backHref} />
      <h1 className="font-serif text-[34px] text-text-primary mb-2">Profile</h1>
      <p className="text-[15px] text-text-secondary mb-8">Manage your account settings.</p>

      <ProfileForm
        initialData={{
          name: user.name || "",
          email: user.email,
          phone: user.phone || "",
          school: user.school || "",
          grade: user.grade || "",
          role: user.role,
          subjectsTaught: user.subjectsTaught,
          hasSubscription: !!user.level2PaidAt,
          hasBillingPortal: !!user.stripeCustomerId,
          hasPassword: !!user.passwordHash,
          createdAt: user.createdAt.toISOString(),
        }}
        enrolledClasses={user.enrollments.map((e) => ({
          id: e.class.id,
          name: e.class.name,
          subject: e.class.subject,
        }))}
        teacherClasses={user.teacherClasses.map((c) => ({
          id: c.id,
          name: c.name,
          subject: c.subject,
          studentCount: c._count.enrollments,
        }))}
      />
    </div>
  );
}
