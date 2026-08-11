import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const content = await db.collegeContent.findUnique({
      where: { collegeId: id },
    });

    return NextResponse.json({ success: true, content });
  } catch (err: any) {
    console.error("GET college content error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const {
      overview,
      about,
      history,
      highlights,
      whyChoose,
      campusLife,
      facilitiesDescription,
      placementOverview,
      topRecruiters,
      admissionGuide,
      eligibility,
      hostelLife,
      scholarships,
      research,
      studentActivities,
      faq,
      seoArticle,
      contentStatus,
    } = body;

    // Verify college profile exists
    const college = await db.collegeProfile.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    // Upsert ONLY CollegeContent - Never mutate CollegeProfile
    const updatedContent = await db.collegeContent.upsert({
      where: { collegeId: id },
      create: {
        collegeId: id,
        overview,
        about,
        history,
        highlights,
        whyChoose,
        campusLife,
        facilitiesDescription,
        placementOverview,
        topRecruiters,
        admissionGuide,
        eligibility,
        hostelLife,
        scholarships,
        research,
        studentActivities,
        faq,
        seoArticle,
        contentStatus: contentStatus || "DRAFT",
      },
      update: {
        overview,
        about,
        history,
        highlights,
        whyChoose,
        campusLife,
        facilitiesDescription,
        placementOverview,
        topRecruiters,
        admissionGuide,
        eligibility,
        hostelLife,
        scholarships,
        research,
        studentActivities,
        faq,
        seoArticle,
        contentStatus: contentStatus || "DRAFT",
      },
    });

    // Write audit trail entry
    await createAuditLog({
      action: "UPDATE",
      entity: "CollegeProfile",
      entityId: id,
      details: `Updated CollegeContent for "${college.name}" (Status: ${contentStatus || "DRAFT"})`,
      scriptName: "PUT /api/admin/colleges/[id]/content",
      rowsAffected: 1,
    });

    return NextResponse.json({
      success: true,
      message: "College content saved successfully.",
      content: updatedContent,
    });
  } catch (err: any) {
    console.error("PUT college content error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
