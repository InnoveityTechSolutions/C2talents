import { NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { ApplicationStatus } from "@prisma/client";

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
        { message: "Access denied. Student account only." },
        { status: 403 }
      );
    }

    const applications = await db.application.findMany({
      where: { studentId: decoded.profileId },
      include: {
        college: true,
        course: true,
      },
      orderBy: { appliedAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error: any) {
    console.error("Failed to load applications:", error);
    return NextResponse.json(
      { message: "Failed to load application history" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in." },
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
        { message: "Access denied. Student applications only." },
        { status: 403 }
      );
    }

    const { collegeId, courseId } = await req.json();

    if (!collegeId || !courseId) {
      return NextResponse.json(
        { message: "College ID and Course ID are required" },
        { status: 400 }
      );
    }

    // Verify course belongs to college
    const course = await db.course.findFirst({
      where: { id: courseId, collegeId },
    });

    if (!course) {
      return NextResponse.json(
        { message: "The specified course is not offered at this college" },
        { status: 400 }
      );
    }

    // Check if application already exists
    const existing = await db.application.findFirst({
      where: {
        studentId: decoded.profileId,
        collegeId,
        courseId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: "You have already submitted an application for this course" },
        { status: 400 }
      );
    }

    // Create application
    const application = await db.application.create({
      data: {
        studentId: decoded.profileId,
        collegeId,
        courseId,
        status: ApplicationStatus.SUBMITTED,
      },
      include: {
        college: true,
        course: true,
      },
    });

    // Also register a Lead for counseling follow-up
    await db.lead.create({
      data: {
        studentId: decoded.profileId,
        collegeId,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    console.error("Failed to submit application:", error);
    return NextResponse.json(
      { message: "Failed to submit application" },
      { status: 500 }
    );
  }
}
