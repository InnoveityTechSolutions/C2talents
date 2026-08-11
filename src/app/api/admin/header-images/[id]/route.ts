import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const dynamic = "force-dynamic";

// PUT: Update Header Image Details or Status
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;
    const body = await req.json();
    const { title, description, altText, imageUrl, displayOrder, isActive } = body;

    const existing = await db.headerImage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Header image record not found." }, { status: 404 });
    }

    const updateData: any = {};

    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (altText !== undefined) updateData.altText = altText.trim();
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl.trim();
    if (displayOrder !== undefined) updateData.displayOrder = parseInt(String(displayOrder), 10) || 0;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await db.headerImage.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      image: updated,
      message: "Header image details updated successfully.",
    });
  } catch (err: any) {
    console.error("[PUT /api/admin/header-images/[id] Error]:", err);
    return NextResponse.json(
      { error: "Failed to update header image: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}

// DELETE: Remove Header Image Record and Local File
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const { id } = params;

    const existing = await db.headerImage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Header image record not found." }, { status: 404 });
    }

    // If local file, attempt to delete from disk
    if (existing.imageUrl.startsWith("/uploads/header-images/")) {
      try {
        const filePath = join(process.cwd(), "public", existing.imageUrl);
        if (existsSync(filePath)) {
          await unlink(filePath);
        }
      } catch (fileErr) {
        console.warn("Could not delete image file from disk:", fileErr);
      }
    }

    await db.headerImage.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `Header image "${existing.title}" deleted successfully.`,
    });
  } catch (err: any) {
    console.error("[DELETE /api/admin/header-images/[id] Error]:", err);
    return NextResponse.json(
      { error: "Failed to delete header image: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
