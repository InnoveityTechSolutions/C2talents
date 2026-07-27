import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, categories });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, description } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const category = await prisma.category.create({
      data: { name, slug, description },
    });

    return NextResponse.json({ success: true, category });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create category" }, { status: 500 });
  }
}
