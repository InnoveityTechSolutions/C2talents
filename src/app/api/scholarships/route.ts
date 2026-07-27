import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || ""; // Government, Private

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { provider: { contains: search } },
        { eligibility: { contains: search } },
      ];
    }

    if (type) {
      where.type = type;
    }

    const scholarships = await db.scholarship.findMany({
      where,
      orderBy: { deadline: "asc" },
    });

    return NextResponse.json(scholarships);
  } catch (error: any) {
    console.error("Failed to fetch scholarships:", error);
    return NextResponse.json(
      { message: "Failed to load scholarships list" },
      { status: 500 }
    );
  }
}
