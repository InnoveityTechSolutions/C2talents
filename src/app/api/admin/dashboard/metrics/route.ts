import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const [
      totalColleges,
      pendingColleges,
      publishedColleges,
      categoriesCount,
      coursesCount,
      newsCount,
      usersCount,
      enquiryLeadsCount,
      studentLeadsCount,
      reviewsCount,
    ] = await Promise.all([
      prisma.collegeProfile.count(),
      prisma.collegeProfile.count({ where: { status: "DRAFT" } }),
      prisma.collegeProfile.count({ where: { status: "PUBLISHED" } }),
      prisma.category.count(),
      prisma.course.count(),
      prisma.newsArticle.count(),
      prisma.user.count(),
      prisma.enquiryLead.count(),
      prisma.lead.count(),
      prisma.review.count(),
    ]);

    const totalUsersAndLeads = usersCount + enquiryLeadsCount + studentLeadsCount;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics: {
        totalColleges,
        pendingColleges,
        publishedColleges,
        categories: categoriesCount || 7,
        courses: coursesCount,
        news: newsCount,
        usersAndLeads: totalUsersAndLeads,
        reviews: reviewsCount,
      },
    });
  } catch (err: any) {
    console.error("Dashboard Metrics API Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch live database metrics." },
      { status: 500 }
    );
  }
}
