import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: collegeIdOrSlug } = await params;

    // Find college by ID or slug
    const college = await db.collegeProfile.findFirst({
      where: {
        OR: [
          { id: collegeIdOrSlug },
          { slug: collegeIdOrSlug },
        ],
        isDeleted: false,
      },
      select: { id: true, name: true },
    });

    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    // Fetch courses strictly belonging to this college
    const courses = await db.course.findMany({
      where: {
        collegeId: college.id,
        isDeleted: false,
      },
      select: {
        id: true,
        title: true,
        duration: true,
        feesPerYear: true,
        eligibility: true,
        seats: true,
        entranceExam: true,
      },
      orderBy: { title: "asc" },
    });

    return NextResponse.json({
      success: true,
      college: { id: college.id, name: college.name },
      courses,
    });
  } catch (error: any) {
    console.error("Error fetching college courses:", error);
    return NextResponse.json({ error: "Failed to fetch courses for this college" }, { status: 500 });
  }
}
