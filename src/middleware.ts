import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("admin_token")?.value || req.cookies.get("token")?.value;

  const isManagerRoute = pathname.startsWith("/manager") || pathname.startsWith("/admin");
  const isManagerLoginPage = pathname === "/manager/login" || pathname === "/admin/login" || pathname === "/login";

  // Allow static assets & public API routes without interference
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/admin/auth/login") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 1. If visiting /manager root directly -> redirect to /manager/dashboard if authenticated, else /manager/login
  if (pathname === "/manager" || pathname === "/admin") {
    if (token) {
      return NextResponse.redirect(new URL("/manager/dashboard", req.url));
    } else {
      return NextResponse.redirect(new URL("/manager/login", req.url));
    }
  }

  // 2. Protect any /manager/* or /admin/* routes
  if (isManagerRoute && !isManagerLoginPage) {
    if (!token) {
      console.log(`[MIDDLEWARE] Unauthenticated access attempt to '${pathname}'. Redirecting to /manager/login`);
      return NextResponse.redirect(new URL("/manager/login", req.url));
    }
  }

  // 3. If already authenticated and visiting /manager/login -> Redirect to /manager/dashboard
  if (isManagerLoginPage && token) {
    console.log(`[MIDDLEWARE] Already authenticated. Redirecting from '${pathname}' to /manager/dashboard`);
    return NextResponse.redirect(new URL("/manager/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/manager/:path*",
    "/admin/:path*",
    "/login",
  ],
};
