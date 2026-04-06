import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { HomeContent } from "@/components/home-content";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const allInquiries = await db.inquiry.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  // Only show classes created via the "Add a Class" form
  const classes = allInquiries
    .filter((c) => c.teacherNotes === "add-class")
    .map((c) => ({
      id: c.id,
      name: c.unitName,
    }));

  return <HomeContent userName={session.user.name} existingClasses={classes} />;
}
