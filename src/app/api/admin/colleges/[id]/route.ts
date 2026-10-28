import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { upsertCollegeCourses } from "@/lib/courses/courseDeduplication";
import { normalizeAndDeduplicateContactNumbers } from "@/lib/ai/contactNormalizer";

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

async function findTargetCollege(idOrSlug: string) {
  if (!idOrSlug) return null;
  let college = await db.collegeProfile.findUnique({
    where: { id: idOrSlug },
  }).catch(() => null);

  if (!college) {
    college = await db.collegeProfile.findFirst({
      where: {
        OR: [
          { slug: idOrSlug },
          { slug: idOrSlug.toLowerCase() },
          { name: idOrSlug },
        ],
      },
    }).catch(() => null);
  }

  if (!college) {
    const cleanTarget = idOrSlug.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleanTarget.length >= 3) {
      const all = await db.collegeProfile.findMany({ select: { id: true, name: true, slug: true } });
      const matched = all.find((c) => {
        const normName = c.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const normSlug = (c.slug || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        return (
          normName === cleanTarget ||
          normSlug === cleanTarget ||
          (cleanTarget.length > 5 && normName.includes(cleanTarget))
        );
      });
      if (matched) {
        college = await db.collegeProfile.findUnique({ where: { id: matched.id } });
      }
    }
  }

  return college;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const target = await findTargetCollege(id);
    if (!target) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }

    const college = await db.collegeProfile.findUnique({
      where: { id: target.id },
      include: {
        courses: true,
        placements: true,
        galleryImages: true,
        reviews: true,
        content: true,
      },
    });

    return NextResponse.json({ success: true, college });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    let targetCollege = await findTargetCollege(id);
    if (!targetCollege) {
      const collegeName = body.name || id;
      const collegeSlug = body.slug || id.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const newUser = await db.user.create({
        data: {
          email: `college_${Date.now()}_${Math.floor(Math.random() * 10000)}@c2talents.com`,
          passwordHash: "hashed_pass_placeholder",
          role: "COLLEGE",
        },
      });
      targetCollege = await db.collegeProfile.create({
        data: {
          userId: newUser.id,
          name: collegeName,
          slug: collegeSlug,
          description: body.description || "",
          location: body.location || "Tamil Nadu",
          type: body.type || "Private",
          status: "PUBLISHED",
          feesPerYear: safeFloat(body.feesPerYear, 0) ?? 0,
          avgPackage: safeFloat(body.avgPackage, 0) ?? 0,
          highestPackage: safeFloat(body.highestPackage, 0) ?? 0,
          image: body.image || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
        },
      });
    }

    const targetId = targetCollege.id;

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
      placements: incomingPlacements,
    } = body;

    const contactRes = normalizeAndDeduplicateContactNumbers(phone, mobile);

    const categoriesStr = Array.isArray(categories) ? categories.join(", ") : categories || "";
    const facilitiesStr = Array.isArray(facilities) ? facilities.join(", ") : facilities || "";

    // Delete existing gallery, placements, and reviews to re-create clean state (courses are safely upserted without destructive deletion)
    await db.$transaction([
      db.galleryImage.deleteMany({ where: { collegeId: targetId } }),
      db.placementOutcome.deleteMany({ where: { collegeId: targetId } }),
      db.review.deleteMany({ where: { collegeId: targetId } }),
    ]);

    // Safely upsert courses using stable identity (collegeId + normalized title)
    // Preserves existing course IDs, applications, and leads while preventing duplicate inserts
    if (Array.isArray(courses)) {
      await upsertCollegeCourses(targetId, courses);
    }

    const updatedCollege = await db.collegeProfile.update({
      where: { id: targetId },
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
        phone: contactRes.phone || "",
        mobile: contactRes.mobile || "",
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
        feesPerYear: safeFloat(feesPerYear, 0) ?? 0,
        courseWiseFees,
        hostelFees: safeFloat(hostelFees),
        transportFees: safeFloat(transportFees),
        scholarshipDetails,
        educationLoanDetails,
        facilities: facilitiesStr,
        avgPackage: safeFloat(avgPackage, 0) ?? 0,
        highestPackage: safeFloat(highestPackage, 0) ?? 0,
        placementPercentage: safeFloat(placementPercentage, null),
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
          create: Array.isArray(incomingPlacements) && incomingPlacements.length > 0
            ? incomingPlacements
                .filter((p: any) => p && (p.year || p.placedStudents || p.highestCtc))
                .map((p: any) => ({
                  year: safeInt(p.year, new Date().getFullYear()) ?? new Date().getFullYear(),
                  eligibleStudents: safeInt(p.eligibleStudents, 0) ?? 0,
                  placedStudents: safeInt(p.placedStudents, 0) ?? 0,
                  highestCtc: safeFloat(p.highestCtc, 0) ?? 0,
                  averageCtc: safeFloat(p.averageCtc, 0) ?? 0,
                  topRecruiters: p.topRecruiters || topRecruiters || "",
                }))
            : [],
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
        content: {
          upsert: {
            create: {
              overview: body.collegeContent?.overview || body.overview || null,
              about: body.collegeContent?.about || body.about || body.collegeAbout || null,
              history: body.collegeContent?.history || body.history || null,
              highlights: body.collegeContent?.highlights || body.highlights || body.whyChoose || null,
              whyChoose: body.collegeContent?.whyChoose || body.whyChoose || null,
              campusLife: body.collegeContent?.campusLife || body.campusLife || null,
              facilitiesDescription: body.collegeContent?.facilitiesDescription || body.facilitiesDescription || null,
              placementOverview: body.collegeContent?.placementOverview || body.placementOverview || null,
              topRecruiters: body.collegeContent?.topRecruiters || body.topRecruiters || null,
              admissionGuide: body.collegeContent?.admissionGuide || body.admissionGuide || body.admissionProcess || null,
              eligibility: body.collegeContent?.eligibility || body.eligibility || body.admissionEligibility || null,
              hostelLife: body.collegeContent?.hostelLife || body.hostelLife || null,
              scholarships: body.collegeContent?.scholarships || body.scholarships || body.scholarshipDetails || null,
              research: body.collegeContent?.research || body.research || null,
              studentActivities: body.collegeContent?.studentActivities || body.studentActivities || null,
              faq: body.collegeContent?.faq || body.faq || null,
              seoArticle: body.collegeContent?.seoArticle || body.seoArticle || null,
              contentStatus: "PUBLISHED",
            },
            update: {
              overview: body.collegeContent?.overview || body.overview || null,
              about: body.collegeContent?.about || body.about || body.collegeAbout || null,
              history: body.collegeContent?.history || body.history || null,
              highlights: body.collegeContent?.highlights || body.highlights || body.whyChoose || null,
              whyChoose: body.collegeContent?.whyChoose || body.whyChoose || null,
              campusLife: body.collegeContent?.campusLife || body.campusLife || null,
              facilitiesDescription: body.collegeContent?.facilitiesDescription || body.facilitiesDescription || null,
              placementOverview: body.collegeContent?.placementOverview || body.placementOverview || null,
              topRecruiters: body.collegeContent?.topRecruiters || body.topRecruiters || null,
              admissionGuide: body.collegeContent?.admissionGuide || body.admissionGuide || body.admissionProcess || null,
              eligibility: body.collegeContent?.eligibility || body.eligibility || body.admissionEligibility || null,
              hostelLife: body.collegeContent?.hostelLife || body.hostelLife || null,
              scholarships: body.collegeContent?.scholarships || body.scholarships || body.scholarshipDetails || null,
              research: body.collegeContent?.research || body.research || null,
              studentActivities: body.collegeContent?.studentActivities || body.studentActivities || null,
              faq: body.collegeContent?.faq || body.faq || null,
              seoArticle: body.collegeContent?.seoArticle || body.seoArticle || null,
              contentStatus: "PUBLISHED",
            }
          }
        },
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

    return NextResponse.json(
      { success: true, college: updatedCollege },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" } }
    );
  } catch (err: any) {
    console.error("PUT admin college error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { createAuditLog } from "@/lib/audit";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const college = await findTargetCollege(id);
    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }
    const targetId = college.id;

    // Clean up related sub-records and soft-delete profile with status DELETED and released website/email
    await db.$transaction([
      db.course.deleteMany({ where: { collegeId: targetId } }),
      db.galleryImage.deleteMany({ where: { collegeId: targetId } }),
      db.placementOutcome.deleteMany({ where: { collegeId: targetId } }),
      db.collegeContent.deleteMany({ where: { collegeId: targetId } }),
      db.collegeProfile.update({
        where: { id: targetId },
        data: {
          isDeleted: true,
          status: "DELETED",
          deletedAt: new Date(),
          website: college.website ? `${college.website}#deleted-${targetId.slice(0, 6)}` : null,
          email: college.email ? `deleted_${targetId.slice(0, 6)}_${college.email}` : null,
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
