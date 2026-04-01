import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: string | null;
  }
}
