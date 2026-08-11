import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { seedScholarships } from "../../../../prisma/seed-scholarships";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const scholarshipType = searchParams.get("scholarshipType");
    const search = searchParams.get("search");
    const course = searchParams.get("course");
    const state = searchParams.get("state");
    const status = searchParams.get("status");

    // Auto seed if database table is empty
    const totalCount = await db.scholarship.count();
    if (totalCount === 0) {
      await seedScholarships();
    }

    const where: any = {
      isPublished: true,
    };

    if (category && category !== "all") {
      if (category === "central") {
        where.category = "Central Government";
      } else if (category === "state") {
        where.category = "State Government";
      } else if (category === "private") {
        where.category = "Private";
      } else {
        where.category = { contains: category };
      }
    }

    if (scholarshipType && scholarshipType !== "all") {
      where.scholarshipType = { contains: scholarshipType };
    }

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { provider: { contains: q } },
        { eligibleCourses: { contains: q } },
        { eligibleStates: { contains: q } },
        { scholarshipType: { contains: q } },
        { category: { contains: q } },
        { description: { contains: q } },
      ];
    }

    if (course && course !== "all") {
      where.eligibleCourses = { contains: course };
    }

    if (state && state !== "all") {
      where.eligibleStates = { contains: state };
    }

    const scholarships = await db.scholarship.findMany({
      where,
      orderBy: [
        { isFeatured: "desc" },
        { createdAt: "desc" },
      ],
    });

    // Compute real-time automatic status based on deadlineDate
    const now = new Date();
    const formatted = scholarships.map((s) => {
      let computedStatus = s.status || "OPEN";
      if (s.deadlineDate) {
        const diffDays = Math.ceil((s.deadlineDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        if (diffDays < 0) {
          computedStatus = "CLOSED";
        } else if (diffDays <= 15) {
          computedStatus = "CLOSING_SOON";
        }
      }
      return {
        ...s,
        computedStatus,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Failed to fetch scholarships:", error);
    return NextResponse.json(
      { message: "Failed to load scholarships list" },
      { status: 500 }
    );
  }
}
