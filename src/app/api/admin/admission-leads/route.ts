import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const status = searchParams.get("status") || "ALL";
    const collegeId = searchParams.get("collegeId") || "";

    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (collegeId) {
      where.collegeId = collegeId;
    }

    if (query) {
      where.OR = [
        { applicationId: { contains: query } },
        { firstName: { contains: query } },
        { lastName: { contains: query } },
        { email: { contains: query } },
        { mobileNumber: { contains: query } },
        { city: { contains: query } },
      ];
    }

    const leads = await db.admissionLead.findMany({
      where,
      include: {
        college: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            feesPerYear: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const counts = {
      all: await db.admissionLead.count(),
      new: await db.admissionLead.count({ where: { status: "NEW" } }),
      underReview: await db.admissionLead.count({ where: { status: "UNDER_REVIEW" } }),
      documentsPending: await db.admissionLead.count({ where: { status: "DOCUMENTS_PENDING" } }),
      verified: await db.admissionLead.count({ where: { status: "VERIFIED" } }),
      approved: await db.admissionLead.count({ where: { status: "APPROVED" } }),
      rejected: await db.admissionLead.count({ where: { status: "REJECTED" } }),
      admissionConfirmed: await db.admissionLead.count({ where: { status: "ADMISSION_CONFIRMED" } }),
    };

    return NextResponse.json({
      success: true,
      leads,
      counts,
    });
  } catch (error: any) {
    console.error("[ADMIN ADMISSION LEADS LIST ERROR]:", error);
    return NextResponse.json({ error: "Failed to fetch admission leads." }, { status: 500 });
  }
}
