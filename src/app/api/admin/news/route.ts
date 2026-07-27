import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const articles = await prisma.newsArticle.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, articles });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch news articles" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { title, content, category, author } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString().slice(-4);

    const article = await prisma.newsArticle.create({
      data: { title, slug, content, category: category || "Admissions", author: author || "Super Admin" },
    });

    return NextResponse.json({ success: true, article });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to publish news article" }, { status: 500 });
  }
}
