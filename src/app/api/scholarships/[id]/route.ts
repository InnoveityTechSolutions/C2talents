import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const scholarship = await db.scholarship.findUnique({
      where: { id },
    });

    if (!scholarship) {
      return NextResponse.json(
        { message: "Scholarship not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    let computedStatus = scholarship.status || "OPEN";
    if (scholarship.deadlineDate) {
      const diffDays = Math.ceil((scholarship.deadlineDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
      if (diffDays < 0) {
        computedStatus = "CLOSED";
      } else if (diffDays <= 15) {
        computedStatus = "CLOSING_SOON";
      }
    }

    return NextResponse.json({
      ...scholarship,
      computedStatus,
    });
  } catch (error) {
    console.error("Failed to fetch scholarship details:", error);
    return NextResponse.json(
      { message: "Failed to load scholarship details" },
      { status: 500 }
    );
  }
}
