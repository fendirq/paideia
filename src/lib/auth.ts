import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import { validatePasscode } from "./passcode";
import bcrypt from "bcrypt";

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
          }
          return {
            id: adminUser.id,
            name: "Admin",
            email: adminEmail,
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
      }
      // Always refresh role from DB to pick up changes (e.g. after onboarding or admin updates)
      if (token.userId) {
        const dbUser = await db.user.findUnique({
          where: { id: token.userId },
          select: { role: true },
        });
        token.role = dbUser?.role ?? null;
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
