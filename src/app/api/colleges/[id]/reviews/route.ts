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

    const { rating, content, studentName, course } = await req.json();

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

    let studentId: string | null = null;
    let reviewerName = studentName?.trim() || "Verified Student";

    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        if (decoded && decoded.profileId) {
          const student = await db.studentProfile.findUnique({
            where: { id: decoded.profileId },
          });
          if (student) {
            studentId = student.id;
            reviewerName = student.name || reviewerName;
          }
        }
      } catch {
        // Continue as guest review if token is invalid
      }
    }

    // Create the review
    const review = await db.review.create({
      data: {
        collegeId,
        studentId,
        studentName: reviewerName,
        course: course || "Student Review",
        rating: ratingVal,
        content,
        isVerified: true,
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
