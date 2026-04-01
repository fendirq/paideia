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
          return {
            id: "guest",
            name: "Guest",
            email: "guest@paideia.local",
            role: "GUEST",
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
      if (token.userId && token.userId !== "guest" && !token.role) {
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
