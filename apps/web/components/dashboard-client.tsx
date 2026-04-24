"use client";

import {
  AuthLoading,
  Authenticated,
  Unauthenticated,
  useConvexAuth,
} from "convex/react";
import styles from "./dashboard-client.module.css";

export function DashboardClient() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className={styles.panel}>
      <p className={styles.label}>Convex auth bridge</p>
      <h2 className={styles.title}>Authentication state from Convex</h2>
      <div className={styles.grid}>
        <div className={styles.metric}>
          <span>Status</span>
          <strong>
            {isLoading
              ? "Loading"
              : isAuthenticated
                ? "Authenticated"
                : "Unauthenticated"}
          </strong>
        </div>
        <div className={styles.metric}>
          <span>Provider</span>
          <strong>Clerk via ConvexProviderWithClerk</strong>
        </div>
      </div>
      <AuthLoading>
        <p className={styles.copy}>
          Convex is still validating the current Clerk session.
        </p>
      </AuthLoading>
      <Authenticated>
        <p className={styles.copy}>
          Clerk and Convex are both wired. Once the Clerk Convex integration is
          activated and `convex/auth.config.ts` is synced, protected Convex
          functions can trust `ctx.auth.getUserIdentity()`.
        </p>
      </Authenticated>
      <Unauthenticated>
        <p className={styles.copy}>
          The frontend can render, but Convex does not currently see an
          authenticated user. This is expected until you sign in and finish the
          Clerk-to-Convex setup values.
        </p>
      </Unauthenticated>
    </div>
  );
}
