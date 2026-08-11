import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST: Bulk Activate, Deactivate, or Delete Header Images
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ids, action } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Please select at least one header image." }, { status: 400 });
    }

    if (action === "ACTIVATE") {
      await db.headerImage.updateMany({
        where: { id: { in: ids } },
        data: { isActive: true },
      });
      return NextResponse.json({
        success: true,
        message: `${ids.length} header image(s) activated successfully.`,
      });
    }

    if (action === "DEACTIVATE") {
      await db.headerImage.updateMany({
        where: { id: { in: ids } },
        data: { isActive: false },
      });
      return NextResponse.json({
        success: true,
        message: `${ids.length} header image(s) deactivated successfully.`,
      });
    }

    if (action === "DELETE") {
      await db.headerImage.deleteMany({
        where: { id: { in: ids } },
      });
      return NextResponse.json({
        success: true,
        message: `${ids.length} header image(s) deleted successfully.`,
      });
    }

    return NextResponse.json({ error: "Invalid bulk action." }, { status: 400 });
  } catch (err: any) {
    console.error("[POST /api/admin/header-images/bulk Error]:", err);
    return NextResponse.json(
      { error: "Failed to perform bulk action: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
