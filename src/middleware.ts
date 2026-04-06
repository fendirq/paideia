import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // If user is authenticated but on login page, redirect to app
    if (pathname === "/login" && req.nextauth.token) {
      return NextResponse.redirect(new URL("/app", req.url));
    }

    // Portal routes (pages + API, except access/verify) require portal_access cookie
    const isPortalRoute = pathname.startsWith("/portal") || pathname.startsWith("/api/portal");
    const isPortalEntry = pathname === "/portal/access" || pathname === "/api/portal/verify-code";
    if (isPortalRoute && !isPortalEntry) {
      const portalCookie = req.cookies.get("portal_access");
      if (portalCookie?.value !== "granted") {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Portal access required" }, { status: 403 });
        }
        return NextResponse.redirect(new URL("/portal/access", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;

        // Allow login page for everyone
        if (pathname === "/login") return true;

        // Protect /app/*, /onboarding, and /portal/* routes
        if (
          pathname.startsWith("/app") ||
          pathname.startsWith("/onboarding") ||
          pathname.startsWith("/portal")
        ) {
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
