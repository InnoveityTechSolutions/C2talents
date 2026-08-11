import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

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
      db.collegeProfile.findFirst({
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, city: true, createdAt: true, status: true },
      }).catch(() => null),
      db.user.findFirst({
        orderBy: { createdAt: "desc" },
        select: { id: true, email: true, role: true, name: true, createdAt: true },
      }).catch(() => null),
      db.newsArticle.findFirst({
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, category: true, createdAt: true },
      }).catch(() => null),
      db.course.findFirst({
        orderBy: { createdAt: "desc" },
        include: { college: { select: { name: true } } },
      }).catch(() => null),
      db.review.findFirst({
        orderBy: { createdAt: "desc" },
        include: { college: { select: { name: true } } },
      }).catch(() => null),
      db.enquiryLead.findFirst({
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, phone: true, createdAt: true },
      }).catch(() => null),
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
    console.error("Recent Activity API Notice:", err.message);
    return NextResponse.json({
      success: true,
      activities: {
        latestCollege: null,
        latestUser: null,
        latestNews: null,
        latestCourse: null,
        latestReview: null,
        latestLead: null,
      },
    });
  }
}
