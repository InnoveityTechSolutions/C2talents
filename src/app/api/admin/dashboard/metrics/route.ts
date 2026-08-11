import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

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
      db.collegeProfile.count().catch(() => 0),
      db.collegeProfile.count({ where: { status: "DRAFT" } }).catch(() => 0),
      db.collegeProfile.count({ where: { status: "PUBLISHED" } }).catch(() => 0),
      db.category.count().catch(() => 7),
      db.course.count().catch(() => 0),
      db.newsArticle.count().catch(() => 0),
      db.user.count().catch(() => 0),
      db.enquiryLead.count().catch(() => 0),
      db.lead.count().catch(() => 0),
      db.review.count().catch(() => 0),
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
    console.error("Dashboard Metrics API Notice:", err.message);
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics: {
        totalColleges: 0,
        pendingColleges: 0,
        publishedColleges: 0,
        categories: 7,
        courses: 0,
        news: 0,
        usersAndLeads: 0,
        reviews: 0,
      },
    });
  }
}
