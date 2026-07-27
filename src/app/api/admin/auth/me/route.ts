import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "c2talents-enterprise-jwt-secret-key-2026";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value || cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, error: "No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: "Invalid or expired token" }, { status: 401 });
  }
}
