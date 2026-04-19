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
          // Always stamp `roleCheckedAt` on a successful DB call, even
          // when the DB returned null. Without this stamp, pre-
          // onboarding requests would keep `neverFetched=true` and
          // hit the DB on every request (amplification during a
          // burst). The 10s NULL_ROLE_RETRY_MS cadence is short
          // enough that onboarding still works: RoleSelector submits
          // the form then calls /api/auth/session, by which point the
          // user has spent more than 10s filling the form so the
          // cooldown has already elapsed and the refresh proceeds.
          token.roleCheckedAt = Date.now();
        } catch (err) {
          console.error("auth.jwt: role refresh from DB failed", {
            userId: token.userId,
            neverFetched,
            roleIsNull,
            err,
          });
          // Only throw when we have nothing to preserve — i.e. this
          // is the very first refresh on this token AND the token
          // has no cached role. Sessions minted before this deploy
          // (no `roleCheckedAt` field, but `role` populated from
          // sign-in) must NOT be logged out by a transient DB
          // hiccup. In every other case keep the cached role and
          // stamp the cooldown so the next request within the
          // cooldown window skips this branch.
          if (neverFetched && roleIsNull) throw err;
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
