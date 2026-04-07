import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasLevel2Access } from "@/lib/payment";
import { UpgradePage } from "@/components/portal/UpgradePage";

export default async function UpgradeRoute() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const hasPaid = await hasLevel2Access(session.user.id, session.user.role);

  return (
    <Suspense fallback={null}>
      <UpgradePage hasPaid={hasPaid} />
    </Suspense>
  );
}
