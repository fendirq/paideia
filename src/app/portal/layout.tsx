import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/navbar";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 h-screen w-full z-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
      </div>
      <Navbar
        userName={session.user.name ?? undefined}
        userImage={session.user.image ?? undefined}
        userRole={session.user.role}
      />
      <main className="relative z-10 pt-14">{children}</main>
    </div>
  );
}
