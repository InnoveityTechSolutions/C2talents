import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, categories });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, description, slug: customSlug } = await req.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const slug = (customSlug?.trim() || trimmedName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check if category already exists
    const existing = await db.category.findFirst({
      where: {
        OR: [{ name: trimmedName }, { slug }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Category with name "${trimmedName}" or slug "${slug}" already exists.` },
        { status: 400 }
      );
    }

    const category = await db.category.create({
      data: {
        name: trimmedName,
        slug,
        description: description?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create category" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, slug: customSlug, description } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
    }
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const trimmedName = name.trim();
    const slug = (customSlug?.trim() || trimmedName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check uniqueness excluding current record
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

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch (_) {}
    }

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
