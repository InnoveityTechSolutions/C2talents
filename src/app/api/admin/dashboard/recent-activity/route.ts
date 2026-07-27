import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [
      latestCollege,
      latestUser,
      latestNews,
      latestCourse,
      latestReview,
      latestLead,
    ] = await Promise.all([
      prisma.collegeProfile.findFirst({
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, city: true, createdAt: true, status: true },
      }),
      prisma.user.findFirst({
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true, role: true, name: true, createdAt: true },
      }),
      prisma.newsArticle.findFirst({
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, category: true, createdAt: true },
      }),
      prisma.course.findFirst({
        orderBy: { createdAt: "desc" },
        include: { college: { select: { name: true } } },
      }),
      prisma.review.findFirst({
        orderBy: { createdAt: "desc" },
        include: { college: { select: { name: true } } },
      }),
      prisma.enquiryLead.findFirst({
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, phone: true, createdAt: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      activities: {
        latestCollege,
        latestUser,
        latestNews,
        latestCourse,
        latestReview,
        latestLead,
      },
    });
  } catch (err: any) {
    console.error("Recent Activity API Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch live recent activity." },
      { status: 500 }
    );
  }
}
