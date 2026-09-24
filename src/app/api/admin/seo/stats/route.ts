import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const totalColleges = await db.collegeProfile.count({
      where: { isDeleted: false },
    });

    const colleges = await db.collegeProfile.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        slug: true,
        seoTitle: true,
        seoDescription: true,
        metaKeywords: true,
        content: {
          select: {
            seoArticle: true,
          },
        },
      },
    });

    let withSeoTitle = 0;
    let withSeoDescription = 0;
    let withMetaKeywords = 0;
    let withSeoArticle = 0;
    let fullyOptimized = 0;

    colleges.forEach((c) => {
      const hasTitle = Boolean(c.seoTitle && c.seoTitle.trim().length > 10);
      const hasDesc = Boolean(c.seoDescription && c.seoDescription.trim().length > 30);
      const hasKeywords = Boolean(c.metaKeywords && c.metaKeywords.trim().length > 5);
      const hasArticle = Boolean(c.content?.seoArticle && c.content.seoArticle.trim().length > 100);

      if (hasTitle) withSeoTitle++;
      if (hasDesc) withSeoDescription++;
      if (hasKeywords) withMetaKeywords++;
      if (hasArticle) withSeoArticle++;

      if (hasTitle && hasDesc && hasKeywords) {
        fullyOptimized++;
      }
    });

    const healthScore =
      totalColleges > 0
        ? Math.round(
            ((withSeoTitle + withSeoDescription + withMetaKeywords + withSeoArticle) /
              (totalColleges * 4)) *
              100
          )
        : 100;

    return NextResponse.json({
      success: true,
      stats: {
        totalColleges,
        withSeoTitle,
        withSeoDescription,
        withMetaKeywords,
        withSeoArticle,
        fullyOptimized,
        needsAttention: totalColleges - fullyOptimized,
        healthScore,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch SEO stats" }, { status: 500 });
  }
}
