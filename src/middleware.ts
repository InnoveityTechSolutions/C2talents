import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // STRICT SECURITY RULE: Only admin_token grants access to Admin Manager routes
  const adminToken = req.cookies.get("admin_token")?.value;

  const isManagerRoute = pathname.startsWith("/manager") || pathname.startsWith("/admin");
  const isManagerLoginPage = pathname === "/manager/login" || pathname === "/admin/login";

  // Allow static assets, public registration, college portal & auth API endpoints without interference
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/register-college") ||
    pathname.startsWith("/college-portal") ||
    pathname.startsWith("/api/college-registration") ||
    pathname.startsWith("/api/college-portal") ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/admin/auth/login") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 1. Root /manager or /admin -> redirect to dashboard if adminToken exists, else login
  if (pathname === "/manager" || pathname === "/admin") {
    if (adminToken) {
      return NextResponse.redirect(new URL("/manager/dashboard", req.url));
    } else {
      return NextResponse.redirect(new URL("/manager/login", req.url));
    }
  }

  // 2. Protect any /manager/* or /admin/* routes (Require admin_token ONLY)
  if (isManagerRoute && !isManagerLoginPage) {
    if (!adminToken) {
      console.log(`[SECURITY] Non-admin access block for '${pathname}'. Redirecting to /manager/login`);
      return NextResponse.redirect(new URL("/manager/login", req.url));
    }
  }

  // 3. If authenticated admin visits /manager/login -> Redirect to /manager/dashboard
  if (isManagerLoginPage && adminToken) {
    return NextResponse.redirect(new URL("/manager/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/manager/:path*",
    "/admin/:path*",
  ],
};
