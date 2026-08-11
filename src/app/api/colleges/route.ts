import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const ownership = searchParams.get("ownership") || "";
    const type = searchParams.get("type") || ""; // Backward compatibility for ownership
    const stream = searchParams.get("stream") || ""; // Legacy stream parameter mapping
    const location = searchParams.get("location") || "";
    const maxFees = searchParams.get("maxFees") ? parseFloat(searchParams.get("maxFees")!) : null;
    const minAveragePackage = searchParams.get("minAveragePackage") ? parseFloat(searchParams.get("minAveragePackage")!) : null;

    // Build Prisma query filters
    const where: any = {
      status: { not: "DRAFT" },
      isDeleted: false,
    };

    if (search) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { shortName: { contains: q } },
        { slug: { contains: q } },
        { location: { contains: q } },
        { city: { contains: q } },
        { district: { contains: q } },
        { state: { contains: q } },
        { category: { contains: q } },
        { ownership: { contains: q } },
        { type: { contains: q } },
        { categories: { contains: q } },
        { description: { contains: q } },
        { courses: { some: { title: { contains: q } } } },
      ];
    }

    // 1. Explicit Category Filter
    const targetCategory = category || (stream ? stream : "");
    if (targetCategory) {
      const catLower = targetCategory.toLowerCase();
      if (catLower === "engineering" || catLower === "btech") {
        where.category = "Engineering";
      } else if (catLower === "medical" || catLower === "mbbs") {
        where.category = "Medical";
      } else if (catLower === "arts" || catLower === "arts & science" || catLower === "arts and science") {
        where.category = "Arts & Science";
      } else if (catLower === "commerce") {
        where.category = "Commerce";
      } else if (catLower === "law") {
        where.category = "Law";
      } else if (catLower === "management" || catLower === "mba") {
        where.category = "Management";
      } else if (catLower === "polytechnic") {
        where.category = "Polytechnic";
      } else {
        where.category = { contains: targetCategory };
      }
    }

    // 2. Explicit Ownership Filter
    const targetOwnership = ownership || type;
    if (targetOwnership) {
      where.OR = [
        { ownership: { equals: targetOwnership } },
        { type: { equals: targetOwnership } },
      ];
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
      orderBy: { nirfRank: "asc" },
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
