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

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id: collegeId } = params;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Authentication required to submit reviews" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      return NextResponse.json({ message: "Invalid or expired session" }, { status: 401 });
    }

    if (decoded.role !== "STUDENT" || !decoded.profileId) {
      return NextResponse.json(
        { message: "Only registered students can submit college reviews" },
        { status: 403 }
      );
    }

    const { rating, content } = await req.json();

    if (!rating || !content) {
      return NextResponse.json(
        { message: "Rating and review content are required" },
        { status: 400 }
      );
    }

    const ratingVal = parseFloat(rating);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return NextResponse.json(
        { message: "Rating must be a number between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if the student exists
    const student = await db.studentProfile.findUnique({
      where: { id: decoded.profileId },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student profile not found" },
        { status: 404 }
      );
    }

    // Create the review
    const review = await db.review.create({
      data: {
        collegeId,
        studentId: student.id,
        rating: ratingVal,
        content,
        isVerified: true, // Auto-verify student reviews since they are logged in
      },
    });

    // Update college average rating
    const allReviews = await db.review.findMany({
      where: { collegeId },
      select: { rating: true },
    });

    if (allReviews.length > 0) {
      const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
      await db.collegeProfile.update({
        where: { id: collegeId },
        data: { rating: parseFloat(avgRating.toFixed(1)) },
      });
    }

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    console.error("Failed to submit review:", error);
    return NextResponse.json(
      { message: "An error occurred while saving your review" },
      { status: 500 }
    );
  }
}
