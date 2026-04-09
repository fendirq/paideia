import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { AdminDashboard } from "@/components/admin-dashboard";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/app");

  const [waitlistEntries, users] = await Promise.all([
    db.waitlistEntry.findMany({ orderBy: { createdAt: "desc" } }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <AdminDashboard
      waitlistEntries={waitlistEntries.map((e) => ({
        id: e.id,
        email: e.email,
        createdAt: e.createdAt.toISOString(),
      }))}
      users={users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
      }))}
    />
  );
}
