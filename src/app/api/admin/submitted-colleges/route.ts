import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function unwrapVerificationData(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(unwrapVerificationData);
  if ("value" in obj && typeof obj.value !== "undefined" && ("confidenceScore" in obj || "verificationStatus" in obj || "sourceUrl" in obj || "confidence" in obj)) {
    return unwrapVerificationData(obj.value);
  }
  const res: any = {};
  for (const [k, v] of Object.entries(obj)) {
    res[k] = unwrapVerificationData(v);
  }
  return res;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {
      status: { in: ["DATA_SUBMITTED", "NEEDS_REVISION", "PUBLISHED"] },
    };

    if (status && status !== "ALL") {
      where.status = status;
    }

    const requests = await db.collegeRegistrationRequest.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    const parsedList = requests.map((reqItem) => {
      let data = null;
      if (reqItem.submittedData) {
        try {
          data = unwrapVerificationData(JSON.parse(reqItem.submittedData));
        } catch (e) {}
      }
      return {
        ...reqItem,
        submittedDataParsed: data,
      };
    });

    return NextResponse.json({
      success: true,
      colleges: parsedList,
      count: parsedList.length,
    });
  } catch (err: any) {
    console.error("[GET /api/admin/submitted-colleges Error]:", err);
    return NextResponse.json(
      { error: "Failed to fetch submitted colleges: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
