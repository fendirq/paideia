import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";
import { validatePasscode } from "./passcode";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as NextAuthOptions["adapter"],
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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
          // Ensure admin user exists in DB for full access
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
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email ?? "";
        if (!email.endsWith("@drewschool.org")) {
          return "/login?error=drew-only";
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role ?? null;
      }
      // For Google users, refresh role from DB (set during onboarding)
      if (token.userId && !token.role) {
        const dbUser = await db.user.findUnique({
          where: { id: token.userId },
          select: { role: true },
        });
        if (dbUser?.role) {
          token.role = dbUser.role;
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
    signIn: "/login",
    error: "/login",
  },
};
