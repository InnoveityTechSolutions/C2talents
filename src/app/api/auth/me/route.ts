import { NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "c2talents-enterprise-jwt-secret-key-2026";

interface JwtPayload {
  userId?: string;
  id?: string;
  email: string;
  role: string;
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    let token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      const cookieHeader = req.headers.get("cookie");
      if (cookieHeader) {
        const match = cookieHeader.match(/(?:token|admin_token)=([^;]+)/);
        if (match) token = match[1];
      }
    }

    if (!token) {
      return NextResponse.json({ message: "Unauthorized. Missing token." }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const targetUserId = decoded.userId || decoded.id;

    if (!targetUserId) {
      return NextResponse.json({ message: "Invalid token payload" }, { status: 401 });
    }

    let user = null;
    try {
      user = await db.user.findUnique({
        where: { id: targetUserId },
        include: {
          student: true,
          college: true,
        },
      });
    } catch (dbErr: any) {
      console.warn("[AUTH ME DB NOTICE]: Database unavailable, using token payload fallback:", dbErr?.message || dbErr);
    }

    if (!user) {
      // Fallback user object constructed from decoded JWT token payload
      user = {
        id: targetUserId,
        email: decoded.email,
        role: decoded.role || "STUDENT",
        name: (decoded as any).name || decoded.email.split("@")[0],
        student: null,
        college: null,
      } as any;
    }

    return NextResponse.json({
      ...user,
      token,
    });
  } catch (error: any) {
    return NextResponse.json({ message: "Session expired or invalid token" }, { status: 401 });
  }
}
