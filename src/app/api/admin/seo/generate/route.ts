import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateSeo } from "@/lib/ai/pipeline/generation/seo";

export async function POST(req: Request) {
  try {
    const { collegeId } = await req.json();

    if (!collegeId) {
      return NextResponse.json({ error: "College ID is required" }, { status: 400 });
    }

    const college = await db.collegeProfile.findUnique({
      where: { id: collegeId },
      include: {
        courses: true,
        content: true,
      },
    });

    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    // Prepare pipeline context data
    const pipelineData: any = {
      collegeName: college.name,
      officialUrl: college.website || `https://${college.slug || "college"}.edu.in`,
      location: college.city || college.location,
      category: college.category || "Higher Education",
      verifiedData: {
        feesPerYear: college.feesPerYear,
        avgPackage: college.avgPackage,
        highestPackage: college.highestPackage,
        courses: college.courses?.map((c) => c.title) || [],
        overview: college.content?.overview || college.description,
      },
      websiteText: [
        college.name,
        college.description,
        college.city,
        college.state,
        college.category,
        college.content?.overview || "",
        college.content?.about || "",
        college.courses?.map((c) => `${c.title} ${c.eligibility || ""}`).join(" ") || "",
      ].join("\n\n"),
    };

    const aiSeo = await generateSeo(pipelineData);

    const safeTitle =
      aiSeo?.seoTitle ||
      `${college.name}, ${college.city || "Tamil Nadu"} - Courses, Admissions, Placements & Fees`;
    const safeDesc =
      aiSeo?.seoDescription ||
      `${college.name} offers accredited higher education programs in ${college.city || "India"}. Check course eligibility, cutoff rankings, placement outcomes, and fee structures.`;
    const safeKeywords =
      aiSeo?.metaKeywords ||
      `${college.name}, ${college.name} admissions, ${college.name} courses, ${college.city || "Chennai"} colleges, fee structure, placements`;
    const safeArticle =
      aiSeo?.seoArticle ||
      college.content?.seoArticle ||
      college.content?.overview ||
      college.description;

    // Save to Database
    await db.collegeProfile.update({
      where: { id: collegeId },
      data: {
        seoTitle: safeTitle,
        seoDescription: safeDesc,
        metaKeywords: safeKeywords,
      },
    });

    await db.collegeContent.upsert({
      where: { collegeId },
      create: {
        collegeId,
        seoArticle: safeArticle,
      },
      update: {
        seoArticle: safeArticle,
      },
    });

    return NextResponse.json({
      success: true,
      seo: {
        seoTitle: safeTitle,
        seoDescription: safeDesc,
        metaKeywords: safeKeywords,
        seoArticle: safeArticle,
      },
      message: `AI generated and updated SEO for ${college.name}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to generate AI SEO metadata" },
      { status: 500 }
    );
  }
}
