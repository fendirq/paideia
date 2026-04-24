import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "../../components/dashboard-client";
import styles from "./page.module.css";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/auth");
  }

  const hasConvexUrl = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.topline}>
            <p className={styles.label}>Protected workspace</p>
            <UserButton />
          </div>
          <h1 className={styles.title}>
            Authentication is now wired into the rebuild.
          </h1>
          <p className={styles.copy}>
            This route is protected by Clerk routing middleware, authenticated
            on the server with `auth()`, and ready to bridge into Convex for
            backend checks.
          </p>
        </section>

        {hasConvexUrl ? (
          <DashboardClient />
        ) : (
          <section className={styles.setupNote}>
            Add `NEXT_PUBLIC_CONVEX_URL` to `apps/web/.env.local` so the
            frontend can connect to the existing Convex deployment from this
            package.
          </section>
        )}
      </main>
    </div>
  );
}
