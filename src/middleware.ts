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

        // Waitlist page is always public
        if (pathname === "/waitlist") return true;

        // Login/signup require waitlist access (if WAITLIST_CODE is configured)
        if (pathname === "/login" || pathname === "/signup") {
          if (process.env.WAITLIST_CODE) {
            const waitlistCookie = req.cookies.get("waitlist_access");
            if (waitlistCookie?.value !== "granted") {
              return false; // redirects to pages.signIn ("/")
            }
          }
          return true;
        }

        // Admin routes require ADMIN role
        if (pathname.startsWith("/app/admin")) {
          return token?.role === "ADMIN";
        }

        // Teacher routes require TEACHER or ADMIN role
        if (pathname.startsWith("/app/teacher")) {
          return token?.role === "TEACHER" || token?.role === "ADMIN";
        }

        // Student routes require STUDENT role (or ADMIN)
        if (pathname.startsWith("/app/classes")) {
          return token?.role === "STUDENT" || token?.role === "ADMIN";
        }

        // Portal routes use their own PIN-based access system (cookie checked in middleware above)
        if (pathname.startsWith("/portal") || pathname.startsWith("/api/portal")) {
          return true;
        }

        // Protect /app/*, /onboarding routes
        if (
          pathname.startsWith("/app") ||
          pathname.startsWith("/onboarding")
        ) {
          return !!token;
        }

        // Allow everything else (API routes, static assets)
        return true;
      },
    },
    pages: {
      signIn: "/waitlist",
    },
  }
);

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|hero-bg.mp4).*)",
  ],
};
