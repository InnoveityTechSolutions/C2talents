import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || "c2talents-enterprise-jwt-secret-key-2026";
const ALLOWED_ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"];

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: "Access denied. Private Admin Panel requires admin authentication." },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    if (!decoded || !decoded.role || !ALLOWED_ADMIN_ROLES.includes(decoded.role)) {
      console.warn(`[ADMIN AUTH SECURITY]: Non-admin role '${decoded?.role}' blocked from admin endpoint.`);
      return NextResponse.json(
        { authenticated: false, error: "Forbidden: Admin privileges required." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name || (decoded.role === "SUPER_ADMIN" ? "Super Administrator" : "System Administrator"),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { authenticated: false, error: "Invalid or expired admin session token." },
      { status: 401 }
    );
  }
}
