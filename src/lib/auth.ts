import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { validatePasscode } from "./passcode";
import bcrypt from "bcrypt";

export async function ensurePasscodeAdminUser() {
  const adminEmail = "admin@paideia.local";
  let adminUser = await db.user.findUnique({
    where: { email: adminEmail },
  });
  if (!adminUser) {
    adminUser = await db.user.create({
      data: {
        email: adminEmail,
        name: "Admin",
        role: "ADMIN",
      },
    });
  } else if (adminUser.role !== "ADMIN") {
    adminUser = await db.user.update({
      where: { id: adminUser.id },
      data: { role: "ADMIN" },
    });
  }
  return adminUser;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
    CredentialsProvider({
      id: "passcode",
      name: "Passcode",
      credentials: {
        passcode: { label: "Passcode", type: "password" },
      },
      async authorize(credentials) {
        if (
          typeof credentials?.passcode === "string" &&
          validatePasscode(credentials.passcode)
        ) {
          const adminUser = await ensurePasscodeAdminUser();
          return {
            id: adminUser.id,
            name: "Admin",
            email: "admin@paideia.local",
            role: "ADMIN",
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role ?? null;
        // Only stamp `roleCheckedAt` when we actually have a role.
        // Onboarding issues a JWT with role=null and RoleSelector
        // then calls /api/auth/session immediately after /api/onboarding
        // to pick up the new DB role. Stamping here when role=null
        // would trip the NULL_ROLE_RETRY_MS cooldown below and leave
        // the user stuck on the null role for 10s — long enough to
        // bounce /app → /onboarding on the very next request.
        if (token.role !== null) {
          token.roleCheckedAt = Date.now();
        }
      }
      // Refresh role from DB. Two cadences:
      //   - Role populated and stale: 5-min refresh window — the role
      //     is valid, we just want to pick up admin/role changes.
      //   - Role null (post-onboarding, legacy token, or prior
      //     refresh returned null): retry at 10-second intervals so
      //     the user recovers role access quickly without hammering
      //     the DB.
      // Any refresh attempt — success or failure — stamps
      // `roleCheckedAt`, so the cooldown applies uniformly and a
      // brief DB outage can't turn into per-request DB amplification.
      const ROLE_REFRESH_MS = 5 * 60 * 1000;
      const NULL_ROLE_RETRY_MS = 10_000;
      const roleIsNull = token.role === null || token.role === undefined;
      const cooldownMs = roleIsNull ? NULL_ROLE_RETRY_MS : ROLE_REFRESH_MS;
      const neverFetched = token.roleCheckedAt === undefined;
      const cooledDown = !neverFetched && Date.now() - token.roleCheckedAt! >= cooldownMs;
      if (token.userId && (neverFetched || cooledDown)) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.userId as string },
            select: { role: true },
          });
          token.role = dbUser?.role ?? null;
          // Only stamp the cooldown once we've actually observed a
          // populated role. If the DB still returns null (user has
          // signed up but hasn't completed onboarding yet), leaving
          // `roleCheckedAt` unset keeps `neverFetched=true` so the
          // very next JWT callback re-runs the query. This is what
          // makes the onboarding handoff work: RoleSelector calls
          // /api/auth/session immediately after /api/onboarding, and
          // we need that session refresh to pick up the newly-saved
          // role rather than honor the 10s null-role cooldown.
          if (token.role !== null) {
            token.roleCheckedAt = Date.now();
          }
        } catch (err) {
          console.error("auth.jwt: role refresh from DB failed", {
            userId: token.userId,
            neverFetched,
            roleIsNull,
            err,
          });
          // On the very first JWT refresh (neverFetched && no prior
          // role) we have nothing to keep — surface the error so the
          // token is re-issued. Otherwise keep the cached role and
          // stamp the cooldown so the next request in the cooldown
          // window skips this branch entirely.
          if (neverFetched) throw err;
          token.roleCheckedAt = Date.now();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId ?? "";
        session.user.role = token.role ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/login",
  },
};
