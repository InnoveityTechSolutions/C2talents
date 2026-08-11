import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const [requests, totalCount, pendingCount, approvedCount, rejectedCount, submittedCount, publishedCount] =
      await Promise.all([
        db.collegeRegistrationRequest.findMany({
          where,
          orderBy: { createdAt: "desc" },
        }),
        db.collegeRegistrationRequest.count(),
        db.collegeRegistrationRequest.count({ where: { status: "PENDING" } }),
        db.collegeRegistrationRequest.count({ where: { status: "APPROVED" } }),
        db.collegeRegistrationRequest.count({ where: { status: "REJECTED" } }),
        db.collegeRegistrationRequest.count({ where: { status: "DATA_SUBMITTED" } }),
        db.collegeRegistrationRequest.count({ where: { status: "PUBLISHED" } }),
      ]);

    return NextResponse.json({
      success: true,
      stats: {
        total: totalCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        submitted: submittedCount,
        published: publishedCount,
      },
      requests,
    });
  } catch (err: any) {
    console.error("[GET /api/admin/registration-requests Error]:", err);
    return NextResponse.json(
      { error: "Failed to fetch registration requests: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
