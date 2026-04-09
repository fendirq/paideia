import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { HomeContent } from "@/components/home-content";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!session.user.role) redirect("/onboarding");
  if (session.user.role === "TEACHER") redirect("/app/teacher");

  const enrollments = await db.classEnrollment.findMany({
    where: { studentId: session.user.id },
    include: {
      class: {
        include: {
          teacher: { select: { name: true } },
          _count: { select: { enrollments: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const enrolledClasses = enrollments.map((e) => ({
    id: e.class.id,
    name: e.class.name,
    subject: e.class.subject,
    period: e.class.period,
    teacherName: e.class.teacher?.name ?? null,
    studentCount: e.class._count.enrollments,
  }));

  return <HomeContent userName={session.user.name} enrolledClasses={enrolledClasses} />;
}
