import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  getUnnotifiedReviewItems,
  markItemsAsNotified,
} from "@/lib/ai/researchJobQueue";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Unnotified research queue items
    const unnotifiedItems = getUnnotifiedReviewItems();

    // 2. Count of total pending review colleges in database
    const [pendingRequestsCount, pendingDraftCollegesCount] = await Promise.all([
      db.collegeRegistrationRequest.count({
        where: {
          status: { in: ["DATA_SUBMITTED", "NEEDS_REVISION"] },
        },
      }),
      db.collegeProfile.count({
        where: {
          isDeleted: false,
          status: { in: ["DRAFT", "DATA_SUBMITTED"] },
        },
      }),
    ]);

    const totalPendingCount = pendingRequestsCount + pendingDraftCollegesCount;

    // 3. Fetch recent 10 review-ready submitted requests for in-app notification dropdown
    const recentPendingRequests = await db.collegeRegistrationRequest.findMany({
      where: {
        status: { in: ["DATA_SUBMITTED", "NEEDS_REVISION"] },
      },
      select: {
        id: true,
        collegeName: true,
        location: true,
        website: true,
        status: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    });

    const recentPendingDrafts = recentPendingRequests.map((r) => ({
      id: r.id,
      collegeName: r.collegeName,
      location: r.location,
      status: r.status,
      reviewUrl: `/manager/submitted-colleges?reviewId=${r.id}`,
      updatedAt: r.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      unnotifiedItems,
      totalPendingCount,
      recentPendingDrafts,
    });
  } catch (err: any) {
    console.error("[RESEARCH NOTIFICATIONS API ERROR]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const itemIds = Array.isArray(body.itemIds) ? body.itemIds : [];

    if (itemIds.length > 0) {
      markItemsAsNotified(itemIds);
    }

    return NextResponse.json({ success: true, acknowledged: itemIds.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
