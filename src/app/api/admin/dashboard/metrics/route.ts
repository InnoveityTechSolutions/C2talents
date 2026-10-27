import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
      db.collegeProfile.count({
        where: {
          isDeleted: false,
          status: { not: "DELETED" },
        },
      }),
      db.collegeProfile.count({
        where: {
          isDeleted: false,
          status: { in: ["DRAFT", "DATA_SUBMITTED", "SUBMITTED"] },
        },
      }),
      db.collegeProfile.count({
        where: {
          isDeleted: false,
          status: "PUBLISHED",
        },
      }),
      db.category.count(),
      db.course.count({ where: { isDeleted: false } }),
      db.newsArticle.count(),
      db.user.count(),
      db.enquiryLead.count(),
      db.lead.count(),
      db.review.count(),
    ]);

    const totalUsersAndLeads = usersCount + enquiryLeadsCount + studentLeadsCount;

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        metrics: {
          totalColleges,
          pendingColleges,
          publishedColleges,
          categories: categoriesCount,
          courses: coursesCount,
          news: newsCount,
          usersAndLeads: totalUsersAndLeads,
          reviews: reviewsCount,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (err: any) {
    console.error("Dashboard Metrics API Error:", err?.message || err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch metrics from database: " + (err?.message || "Unknown error"),
        metrics: null,
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  }
}

