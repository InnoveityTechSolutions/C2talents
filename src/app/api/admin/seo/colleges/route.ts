import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const filter = searchParams.get("filter") || "all"; // all, optimized, missing_desc, missing_title, needs_review
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "25")));
    const skip = (page - 1) * limit;

    const where: any = {
      isDeleted: false,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { city: { contains: search } },
        { state: { contains: search } },
        { category: { contains: search } },
      ];
    }

    if (filter === "missing_title") {
      where.OR = [{ seoTitle: null }, { seoTitle: "" }];
    } else if (filter === "missing_desc") {
      where.OR = [{ seoDescription: null }, { seoDescription: "" }];
    } else if (filter === "missing_keywords") {
      where.OR = [{ metaKeywords: null }, { metaKeywords: "" }];
    } else if (filter === "optimized") {
      where.AND = [
        { seoTitle: { not: null } },
        { seoTitle: { not: "" } },
        { seoDescription: { not: null } },
        { seoDescription: { not: "" } },
      ];
    }

    const [total, colleges] = await Promise.all([
      db.collegeProfile.count({ where }),
      db.collegeProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          state: true,
          category: true,
          seoTitle: true,
          seoDescription: true,
          metaKeywords: true,
          updatedAt: true,
          content: {
            select: {
              id: true,
              seoArticle: true,
              overview: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      colleges,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch college SEO data" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, seoTitle, seoDescription, metaKeywords, slug, seoArticle } = body;

    if (!id) {
      return NextResponse.json({ error: "College ID is required" }, { status: 400 });
    }

    // If slug changed, verify uniqueness
    let validSlug: string | undefined = undefined;
    if (slug) {
      const cleanSlug = slug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const existingSlug = await db.collegeProfile.findFirst({
        where: {
          id: { not: id },
          slug: cleanSlug,
        },
      });

      if (existingSlug) {
        return NextResponse.json(
          { error: `URL Slug "${cleanSlug}" is already taken by another college.` },
          { status: 400 }
        );
      }
      validSlug = cleanSlug;
    }

    const updateData: any = {
      seoTitle: seoTitle?.trim() || null,
      seoDescription: seoDescription?.trim() || null,
      metaKeywords: metaKeywords?.trim() || null,
    };

    if (validSlug) {
      updateData.slug = validSlug;
    }

    const college = await db.collegeProfile.update({
      where: { id },
      data: updateData,
    });

    // Update or Upsert SEO Article in CollegeContent
    if (typeof seoArticle !== "undefined") {
      await db.collegeContent.upsert({
        where: { collegeId: id },
        create: {
          collegeId: id,
          seoArticle: seoArticle?.trim() || null,
        },
        update: {
          seoArticle: seoArticle?.trim() || null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "SEO metadata saved successfully!",
      college,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save SEO metadata" }, { status: 500 });
  }
}
