import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/navbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  if (!session.user.role) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen">
      <Navbar
        userName={session.user.name ?? undefined}
        userImage={session.user.image ?? undefined}
      />
      <main className="pt-14">{children}</main>
    </div>
  );
}
