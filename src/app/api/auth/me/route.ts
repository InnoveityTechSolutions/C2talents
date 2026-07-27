import { NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";
import { db } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "edumatch_ai_premium_secret_key_2026";

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  profileId: string | null;
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized. Missing token." },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    
    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Fetch user details
    const user = await db.user.findUnique({
      where: { id: decoded.id },
      include: {
        student: true,
        college: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 401 }
      );
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Session verification error:", error);
    return NextResponse.json(
      { message: "Session expired or invalid token" },
      { status: 401 }
    );
  }
}
