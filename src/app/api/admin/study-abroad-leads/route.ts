import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status") || "ALL";
    const query = searchParams.get("query") || "";

    const whereClause: any = {};

    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    if (query) {
      whereClause.OR = [
        { studentName: { contains: query } },
        { email: { contains: query } },
        { phone: { contains: query } },
        { selectedCountry: { contains: query } },
        { preferredCourse: { contains: query } }
      ];
    }

    const leads = await prisma.studyAbroadLead.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            email: true,
            name: true,
            student: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const counts = {
      ALL: await prisma.studyAbroadLead.count(),
      NEW: await prisma.studyAbroadLead.count({ where: { status: "NEW" } }),
      CONTACTED: await prisma.studyAbroadLead.count({ where: { status: "CONTACTED" } }),
      QUALIFIED: await prisma.studyAbroadLead.count({ where: { status: "QUALIFIED" } }),
      "FOLLOW-UP": await prisma.studyAbroadLead.count({ where: { status: "FOLLOW-UP" } }),
      CONVERTED: await prisma.studyAbroadLead.count({ where: { status: "CONVERTED" } }),
      CLOSED: await prisma.studyAbroadLead.count({ where: { status: "CLOSED" } })
    };

    return NextResponse.json({ success: true, leads, counts });
  } catch (error: any) {
    console.error("Error fetching admin study abroad leads:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch study abroad leads" },
      { status: 500 }
    );
  }
}
