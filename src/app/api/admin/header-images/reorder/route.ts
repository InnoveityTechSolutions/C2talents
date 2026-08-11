import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// PUT: Bulk Reorder Display Positions
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { items } = body; // Array of { id: string, displayOrder: number }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid items array for reordering." }, { status: 400 });
    }

    const updates = items.map((item) =>
      db.headerImage.update({
        where: { id: item.id },
        data: { displayOrder: parseInt(String(item.displayOrder), 10) || 0 },
      })
    );

    await db.$transaction(updates);

    return NextResponse.json({
      success: true,
      message: "Header image display order reordered successfully.",
    });
  } catch (err: any) {
    console.error("[PUT /api/admin/header-images/reorder Error]:", err);
    return NextResponse.json(
      { error: "Failed to reorder header images: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
