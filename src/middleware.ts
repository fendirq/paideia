import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If user is authenticated but on login page, redirect to app
    if (req.nextUrl.pathname === "/login" && req.nextauth.token) {
      return NextResponse.redirect(new URL("/app", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;

        // Allow login page for everyone
        if (pathname === "/login") return true;

        // Protect /app/* and /onboarding routes
        if (pathname.startsWith("/app") || pathname.startsWith("/onboarding")) {
          return !!token;
        }

        // Allow everything else (API routes, static assets)
        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|hero-bg.mp4).*)",
  ],
};
