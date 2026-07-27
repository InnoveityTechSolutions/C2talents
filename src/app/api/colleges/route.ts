import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || ""; // Government, Private, Govt-Aided
    const stream = searchParams.get("stream") || "";
    const location = searchParams.get("location") || "";
    const maxFees = searchParams.get("maxFees") ? parseFloat(searchParams.get("maxFees")!) : null;
    const minAveragePackage = searchParams.get("minAveragePackage") ? parseFloat(searchParams.get("minAveragePackage")!) : null;

    // Build Prisma query filters
    const where: any = {
      status: { not: "DRAFT" },
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { location: { contains: search } },
        { city: { contains: search } },
        { categories: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (stream) {
      let keywords: string[] = [];
      const streamLower = stream.toLowerCase();
      if (streamLower === "engineering" || streamLower === "btech") {
        keywords = ["b.tech", "engineering", "b.e."];
      } else if (streamLower === "management" || streamLower === "mba") {
        keywords = ["mba", "management", "business", "administration"];
      } else if (streamLower === "medical" || streamLower === "mbbs" || streamLower === "neet") {
        keywords = ["mbbs", "medicine", "doctor", "md", "clinical"];
      } else if (streamLower === "arts") {
        keywords = ["arts", "b.a.", "m.a.", "b.sc", "bachelor of science"];
      } else if (streamLower === "commerce") {
        keywords = ["commerce", "b.com", "m.com", "accounting"];
      } else if (streamLower === "law") {
        keywords = ["law", "ll.b", "ll.m", "legal"];
      }

      if (keywords.length > 0) {
        where.courses = {
          some: {
            OR: keywords.map(kw => ({
              title: { contains: kw }
            }))
          }
        };
      }
    }

    if (location) {
      where.location = { contains: location };
    }

    if (maxFees !== null) {
      where.feesPerYear = { lte: maxFees };
    }

    if (minAveragePackage !== null) {
      where.avgPackage = { gte: minAveragePackage };
    }

    const colleges = await db.collegeProfile.findMany({
      where,
      include: {
        courses: true,
        placements: true,
        reviews: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { nirfRank: "asc" }, // Default rank sorting
    });

    return NextResponse.json(colleges);
  } catch (error: any) {
    console.error("Failed to fetch colleges:", error);
    return NextResponse.json(
      { message: "Failed to load colleges data" },
      { status: 500 }
    );
  }
}
