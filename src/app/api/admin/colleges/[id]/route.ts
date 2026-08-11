import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function safeFloat(val: any, defaultVal: number | null = null): number | null {
  if (val === null || val === undefined || val === "") return defaultVal;
  const parsed = typeof val === "number" ? val : parseFloat(String(val).replace(/[^0-9.-]/g, ""));
  return isNaN(parsed) ? defaultVal : parsed;
}

function safeInt(val: any, defaultVal: number | null = null): number | null {
  if (val === null || val === undefined || val === "") return defaultVal;
  const parsed = typeof val === "number" ? val : parseInt(String(val).replace(/[^0-9-]/g, ""), 10);
  return isNaN(parsed) ? defaultVal : parsed;
}

function safeUrl(rawUrl: any, defaultFallback: string | null = null, maxLen = 190): string | null {
  if (!rawUrl || typeof rawUrl !== "string") return defaultFallback;
  const trimmed = rawUrl.trim();
  if (!trimmed) return defaultFallback;
  if (trimmed.startsWith("data:image/")) {
    return defaultFallback || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80";
  }
  if (trimmed.length > maxLen) {
    return trimmed.slice(0, maxLen);
  }
  return trimmed;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const college = await db.collegeProfile.findUnique({
      where: { id },
      include: {
        courses: true,
        placements: true,
        galleryImages: true,
        reviews: true,
        content: true,
      },
    });

    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, college });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const {
      name,
      shortName,
      slug,
      description,
      location,
      address,
      landmark,
      area,
      city,
      district,
      state,
      pincode,
      latitude,
      longitude,
      googleMapUrl,
      phone,
      mobile,
      email,
      website,
      facebook,
      instagram,
      linkedin,
      youtube,
      rating,
      type,
      ownership,
      category,
      categories,
      affiliatedUniversity,
      isAutonomous,
      accreditation,
      approval,
      aicteApproved,
      ugcApproved,
      naacGrade,
      nirfRank,
      feesPerYear,
      courseWiseFees,
      hostelFees,
      transportFees,
      scholarshipDetails,
      educationLoanDetails,
      facilities,
      avgPackage,
      highestPackage,
      placementPercentage,
      internshipDetails,
      topRecruiters,
      admissionEligibility,
      admissionProcess,
      documentsRequired,
      counsellingInfo,
      admissionEntranceExams,
      importantDates,
      hostelAvailable,
      boysHostel,
      girlsHostel,
      acRooms,
      messAvailable,
      hostelFeePerYear,
      image,
      logo,
      banner,
      collegeVideo,
      estYear,
      seoTitle,
      seoDescription,
      metaKeywords,
      status,
      featured,
      trending,
      courses,
      galleryImages,
      reviews,
    } = body;

    const categoriesStr = Array.isArray(categories) ? categories.join(", ") : categories || "";
    const facilitiesStr = Array.isArray(facilities) ? facilities.join(", ") : facilities || "";

    // Delete existing courses, gallery, placements, and reviews to re-create clean state
    await db.$transaction([
      db.course.deleteMany({ where: { collegeId: id } }),
      db.galleryImage.deleteMany({ where: { collegeId: id } }),
      db.placementOutcome.deleteMany({ where: { collegeId: id } }),
      db.review.deleteMany({ where: { collegeId: id } }),
    ]);

    const updatedCollege = await db.collegeProfile.update({
      where: { id },
      data: {
        name,
        shortName,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        description,
        location: location || `${city || "Chennai"}, ${state || "Tamil Nadu"}`,
        address,
        landmark,
        area,
        city,
        district,
        state,
        pincode,
        latitude: safeFloat(latitude),
        longitude: safeFloat(longitude),
        phone,
        mobile,
        email,
        facebook,
        instagram,
        linkedin,
        youtube,
        rating: safeFloat(rating, 4.0) ?? 4.0,
        type: type || ownership || "Private",
        ownership: ownership || type || "Private",
        category: category || "Engineering",
        categories: categoriesStr,
        affiliatedUniversity,
        isAutonomous: Boolean(isAutonomous),
        accreditation,
        approval,
        aicteApproved: Boolean(aicteApproved),
        ugcApproved: Boolean(ugcApproved),
        naacGrade,
        nirfRank: safeInt(nirfRank),
        feesPerYear: safeFloat(feesPerYear, 50000) ?? 50000,
        courseWiseFees,
        hostelFees: safeFloat(hostelFees),
        transportFees: safeFloat(transportFees),
        scholarshipDetails,
        educationLoanDetails,
        facilities: facilitiesStr,
        avgPackage: safeFloat(avgPackage, 4.5) ?? 4.5,
        highestPackage: safeFloat(highestPackage, 12.0) ?? 12.0,
        placementPercentage: safeFloat(placementPercentage, 80.0),
        internshipDetails,
        topRecruiters,
        admissionEligibility,
        admissionProcess,
        documentsRequired,
        counsellingInfo,
        admissionEntranceExams,
        importantDates,
        hostelAvailable: Boolean(hostelAvailable),
        boysHostel: Boolean(boysHostel),
        girlsHostel: Boolean(girlsHostel),
        acRooms: Boolean(acRooms),
        messAvailable: Boolean(messAvailable),
        hostelFeePerYear: safeFloat(hostelFeePerYear),
        image: safeUrl(image || banner, "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80")!,
        logo: safeUrl(logo, null),
        banner: safeUrl(banner, null),
        collegeVideo: safeUrl(collegeVideo, null),
        googleMapUrl: safeUrl(googleMapUrl, null),
        website: safeUrl(website, null),
        estYear: safeInt(estYear),
        seoTitle,
        seoDescription,
        metaKeywords,
        status: status || "PUBLISHED",
        featured: Boolean(featured),
        trending: Boolean(trending),
        courses: {
          create: Array.isArray(courses)
            ? courses.map((c: any) => ({
                title: c.title || "Course",
                duration: c.duration || "3 Years",
                feesPerYear: safeFloat(c.feesPerYear, 50000) ?? 50000,
                eligibility: c.eligibility || "Standard 10+2",
                seats: safeInt(c.seats, 60) ?? 60,
                entranceExam: c.entranceExam || "Merit",
                careerPath: c.careerPath || "Career Track",
                demand: c.demand || "High",
              }))
            : [],
        },
        galleryImages: {
          create: Array.isArray(galleryImages)
            ? galleryImages
                .map((g: any) => {
                  const rawUrl = typeof g === "string" ? g : g?.url;
                  const clean = safeUrl(rawUrl, "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80");
                  if (!clean) return null;
                  return {
                    url: clean,
                    altText: (typeof g === "object" && g?.altText ? String(g.altText) : `${name} image`).slice(0, 100),
                    caption: (typeof g === "object" && g?.caption ? String(g.caption) : "Campus view").slice(0, 100),
                    tags: (typeof g === "object" && g?.tags ? String(g.tags) : "campus").slice(0, 50),
                  };
                })
                .filter(Boolean) as any[]
            : [],
        },
        placements: {
          create: [
            {
              year: new Date().getFullYear() - 3,
              eligibleStudents: 450,
              placedStudents: Math.round(450 * ((safeFloat(placementPercentage, 85) ?? 85) / 100)),
              highestCtc: Math.round(((safeFloat(highestPackage, 12.0) ?? 12.0) * 0.78) * 10) / 10,
              averageCtc: Math.round(((safeFloat(avgPackage, 4.5) ?? 4.5) * 0.82) * 10) / 10,
              topRecruiters: topRecruiters || "TCS, Infosys, Wipro, Accenture, Cognizant",
            },
            {
              year: new Date().getFullYear() - 2,
              eligibleStudents: 470,
              placedStudents: Math.round(470 * ((safeFloat(placementPercentage, 85) ?? 85) / 100)),
              highestCtc: Math.round(((safeFloat(highestPackage, 12.0) ?? 12.0) * 0.85) * 10) / 10,
              averageCtc: Math.round(((safeFloat(avgPackage, 4.5) ?? 4.5) * 0.88) * 10) / 10,
              topRecruiters: topRecruiters || "TCS, Infosys, Wipro, Accenture, Amazon",
            },
            {
              year: new Date().getFullYear() - 1,
              eligibleStudents: 490,
              placedStudents: Math.round(490 * ((safeFloat(placementPercentage, 85) ?? 85) / 100)),
              highestCtc: Math.round(((safeFloat(highestPackage, 12.0) ?? 12.0) * 0.92) * 10) / 10,
              averageCtc: Math.round(((safeFloat(avgPackage, 4.5) ?? 4.5) * 0.94) * 10) / 10,
              topRecruiters: topRecruiters || "TCS, Infosys, Wipro, Accenture, Microsoft",
            },
            {
              year: new Date().getFullYear(),
              eligibleStudents: 500,
              placedStudents: Math.round(500 * ((safeFloat(placementPercentage, 85) ?? 85) / 100)),
              highestCtc: safeFloat(highestPackage, 12.0) ?? 12.0,
              averageCtc: safeFloat(avgPackage, 4.5) ?? 4.5,
              topRecruiters: topRecruiters || "TCS, Infosys, Wipro, Accenture, Amazon, Microsoft",
            },
          ]
        },
        reviews: {
          create: Array.isArray(reviews)
            ? reviews.map((r: any) => ({
                studentName: r.studentName || "Verified Student",
                course: r.course || "Undergraduate Program",
                batchYear: safeInt(r.batchYear, 2024) ?? 2024,
                title: r.title || "Overall Excellent Campus Experience",
                rating: safeFloat(r.rating, 4.5) ?? 4.5,
                academicRating: safeFloat(r.academicRating, 4.5) ?? 4.5,
                infrastructureRating: safeFloat(r.infrastructureRating, 4.2) ?? 4.2,
                placementRating: safeFloat(r.placementRating, 4.4) ?? 4.4,
                campusRating: safeFloat(r.campusRating, 4.3) ?? 4.3,
                valueForMoneyRating: safeFloat(r.valueForMoneyRating, 4.5) ?? 4.5,
                likes: r.likes || "Great faculty, modern digital library, well-equipped labs, and active student clubs.",
                dislikes: r.dislikes || "Campus hostel food quality could be improved.",
                content: r.content || "Overall a wonderful institution with excellent career opportunities.",
                isVerified: r.isVerified ?? true,
              }))
            : [],
        },
        content: body.collegeContent ? {
          upsert: {
            create: {
              overview: body.collegeContent.overview || null,
              about: body.collegeContent.about || null,
              history: body.collegeContent.history || null,
              highlights: body.collegeContent.highlights || null,
              whyChoose: body.collegeContent.whyChoose || null,
              campusLife: body.collegeContent.campusLife || null,
              facilitiesDescription: body.collegeContent.facilitiesDescription || null,
              placementOverview: body.collegeContent.placementOverview || null,
              topRecruiters: body.collegeContent.topRecruiters || null,
              admissionGuide: body.collegeContent.admissionGuide || null,
              eligibility: body.collegeContent.eligibility || null,
              hostelLife: body.collegeContent.hostelLife || null,
              scholarships: body.collegeContent.scholarships || null,
              research: body.collegeContent.research || null,
              studentActivities: body.collegeContent.studentActivities || null,
              faq: body.collegeContent.faq || null,
              seoArticle: body.collegeContent.seoArticle || null,
              contentStatus: "PUBLISHED",
            },
            update: {
              overview: body.collegeContent.overview || null,
              about: body.collegeContent.about || null,
              history: body.collegeContent.history || null,
              highlights: body.collegeContent.highlights || null,
              whyChoose: body.collegeContent.whyChoose || null,
              campusLife: body.collegeContent.campusLife || null,
              facilitiesDescription: body.collegeContent.facilitiesDescription || null,
              placementOverview: body.collegeContent.placementOverview || null,
              topRecruiters: body.collegeContent.topRecruiters || null,
              admissionGuide: body.collegeContent.admissionGuide || null,
              eligibility: body.collegeContent.eligibility || null,
              hostelLife: body.collegeContent.hostelLife || null,
              scholarships: body.collegeContent.scholarships || null,
              research: body.collegeContent.research || null,
              studentActivities: body.collegeContent.studentActivities || null,
              faq: body.collegeContent.faq || null,
              seoArticle: body.collegeContent.seoArticle || null,
              contentStatus: "PUBLISHED",
            }
          }
        } : undefined,
      },
      include: {
        courses: true,
        galleryImages: true,
        placements: true,
        reviews: true,
        content: true,
      },
    });

    try {
      revalidatePath("/admin/colleges");
      revalidatePath("/manager/colleges");
      revalidatePath("/colleges");
      revalidatePath(`/colleges/${updatedCollege.slug}`);
      revalidatePath(`/admin/colleges/${id}/edit`);
      revalidatePath(`/manager/colleges/${id}/edit`);
    } catch (cacheErr) {}

    return NextResponse.json({ success: true, college: updatedCollege });
  } catch (err: any) {
    console.error("PUT admin college error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { createAuditLog } from "@/lib/audit";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const college = await db.collegeProfile.findUnique({ where: { id } });
    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    // Clean up related sub-records and soft-delete profile with status DELETED and released website/email
    await db.$transaction([
      db.course.deleteMany({ where: { collegeId: id } }),
      db.galleryImage.deleteMany({ where: { collegeId: id } }),
      db.placementOutcome.deleteMany({ where: { collegeId: id } }),
      db.collegeContent.deleteMany({ where: { collegeId: id } }),
      db.collegeProfile.update({
        where: { id },
        data: {
          isDeleted: true,
          status: "DELETED",
          deletedAt: new Date(),
          website: college.website ? `${college.website}#deleted-${id.slice(0, 6)}` : null,
          email: college.email ? `deleted_${id.slice(0, 6)}_${college.email}` : null,
        },
      }),
    ]);

    // Write audit log
    await createAuditLog({
      action: "SOFT_DELETE",
      entity: "CollegeProfile",
      entityId: id,
      details: `Soft deleted college "${college.name}" (ID: ${id})`,
      scriptName: "DELETE /api/admin/colleges/[id]",
      rowsAffected: 1,
    });

    return NextResponse.json({ success: true, message: `College "${college.name}" deleted successfully.` });
  } catch (err: any) {
    console.error("DELETE college error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
