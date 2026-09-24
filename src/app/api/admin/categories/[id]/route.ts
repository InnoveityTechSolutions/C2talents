import { NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    const { name, slug: customSlug, description } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const slug = (customSlug?.trim() || trimmedName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existing = await db.category.findFirst({
      where: {
        id: { not: id },
        OR: [{ name: trimmedName }, { slug }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Another category with name "${trimmedName}" or slug "${slug}" already exists.` },
        { status: 400 }
      );
    }

    const category = await db.category.update({
      where: { id },
      data: {
        name: trimmedName,
        slug,
        description: description?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }

    await db.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete category" }, { status: 500 });
  }
}
