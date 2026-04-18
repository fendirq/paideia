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
        token.roleCheckedAt = Date.now();
      }
      // Refresh role from DB: immediately if null (onboarding), otherwise every 5 min
      const ROLE_REFRESH_MS = 5 * 60 * 1000;
      const neverFetched = token.roleCheckedAt === undefined;
      const stale = !neverFetched && Date.now() - token.roleCheckedAt! > ROLE_REFRESH_MS;
      const roleIsNull = token.role === null || token.role === undefined;
      if (token.userId && (neverFetched || stale || roleIsNull)) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.userId as string },
            select: { role: true },
          });
          token.role = dbUser?.role ?? null;
          token.roleCheckedAt = Date.now();
        } catch (err) {
          // A transient DB failure (connection pool exhausted on cold
          // start, brief Neon outage, etc.) must not cascade into a
          // global 401 by blanking the role. Keep whatever role was
          // already on the token and retry on the next JWT refresh.
          // On the very first JWT refresh (neverFetched && no prior
          // role) we have nothing to keep — in that case surfacing the
          // error is the right call since the token is unusable.
          console.error("auth.jwt: role refresh from DB failed", {
            userId: token.userId,
            neverFetched,
            roleIsNull,
            err,
          });
          if (neverFetched) throw err;
          if (roleIsNull) {
            // Null-role recovery: applying the full 5-min cooldown
            // would keep the middleware rejecting /app/classes and
            // /app/teacher even after the DB recovers. Use a 10s
            // cooldown instead — still caps DB amplification during
            // a sustained outage, but recovers fast once the DB is
            // back.
            token.roleCheckedAt = Date.now() - (ROLE_REFRESH_MS - 10_000);
          } else {
            // Stale-role refresh failure: the existing role is still
            // valid; full 5-min cooldown prevents log-flood and DB
            // amplification during a transient hiccup.
            token.roleCheckedAt = Date.now();
          }
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
