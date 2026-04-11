import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { hasLevel2Access } from "@/lib/payment";
import { AggregateWizard } from "@/components/portal/AggregateWizard";

export default async function AggregatePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const hasLevel2 = await hasLevel2Access(session.user.id, session.user.role);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-start justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <Suspense fallback={null}>
          <AggregateWizard hasLevel2={hasLevel2} />
        </Suspense>
      </div>
    </div>
  );
}
