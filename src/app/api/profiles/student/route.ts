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

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      return NextResponse.json({ message: "Invalid session" }, { status: 401 });
    }

    if (decoded.role !== "STUDENT" || !decoded.profileId) {
      return NextResponse.json(
        { message: "Access denied. Student profile only." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      location,
      board12th,
      score12th,
      stream12th,
      entranceExamName,
      entranceExamScore,
      budgetLimit,
      hostelPreference,
      specializationPreference,
      expectedPackage,
    } = body;

    const updatedProfile = await db.studentProfile.update({
      where: { id: decoded.profileId },
      data: {
        name,
        location,
        board12th,
        score12th: score12th ? parseFloat(score12th) : undefined,
        stream12th,
        entranceExamName,
        entranceExamScore: entranceExamScore ? parseFloat(entranceExamScore) : undefined,
        budgetLimit: budgetLimit ? parseFloat(budgetLimit) : undefined,
        hostelPreference: hostelPreference === true || hostelPreference === "true",
        specializationPreference,
        expectedPackage: expectedPackage ? parseFloat(expectedPackage) : undefined,
      },
    });

    return NextResponse.json(updatedProfile);
  } catch (error: any) {
    console.error("Failed to update student profile:", error);
    return NextResponse.json(
      { message: "An error occurred while updating the profile" },
      { status: 500 }
    );
  }
}
