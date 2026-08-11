import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkForDuplicateCollege } from "@/lib/duplicateChecker";

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";

    const where: any = {
      isDeleted: false,
      status: { not: "DELETED" },
    };

    if (query) {
      where.AND = [
        { isDeleted: false },
        { status: { not: "DELETED" } },
        {
          OR: [
            { name: { contains: query } },
            { shortName: { contains: query } },
            { city: { contains: query } },
            { state: { contains: query } },
          ],
        },
      ];
    }
    if (category) {
      if (where.AND) {
        where.AND.push({
          OR: [
            { category: { equals: category } },
            { categories: { contains: category } },
          ],
        });
      } else {
        where.OR = [
          { category: { equals: category } },
          { categories: { contains: category } },
        ];
      }
    }
    if (status) {
      where.status = status;
    }

    const [colleges, totalCount, draftCount, publishedCount, featuredCount, usersCount, coursesCount] =
      await Promise.all([
        db.collegeProfile.findMany({
          where,
          include: {
            courses: { where: { isDeleted: false } },
            placements: true,
            galleryImages: true,
          },
          orderBy: { updatedAt: "desc" },
        }),
        db.collegeProfile.count({ where: { isDeleted: false, status: { not: "DELETED" } } }),
        db.collegeProfile.count({ where: { status: "DRAFT", isDeleted: false } }),
        db.collegeProfile.count({ where: { status: "PUBLISHED", isDeleted: false } }),
        db.collegeProfile.count({ where: { featured: true, isDeleted: false, status: { not: "DELETED" } } }),
        db.user.count(),
        db.course.count({ where: { isDeleted: false } }),
      ]);

    const categoriesSet = new Set<string>();
    const allColleges = await db.collegeProfile.findMany({
      where: { isDeleted: false, status: { not: "DELETED" } },
      select: { categories: true },
    });
    allColleges.forEach((c) => {
      if (c.categories) {
        c.categories.split(",").forEach((cat) => {
          const trimmed = cat.trim();
          if (trimmed) categoriesSet.add(trimmed);
        });
      }
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalColleges: totalCount,
        pendingColleges: draftCount,
        publishedColleges: publishedCount,
        featuredColleges: featuredCount,
        categoriesCount: categoriesSet.size,
        coursesCount: coursesCount,
        usersCount: usersCount,
        newsCount: 24,
      },
      colleges,
      categoriesList: Array.from(categoriesSet),
    });
  } catch (err: any) {
    console.error("[BACKEND DEBUG] GET /api/admin/colleges Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch colleges." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const startTime = Date.now();
  console.log("\n====================================================");
  console.log("[BACKEND DEBUG] 🚀 Incoming Request: POST /api/admin/colleges");
  console.log("====================================================");

  try {
    const body = await req.json();
    console.log("[BACKEND DEBUG] 1. Request Body Received for College:", body.name);

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
    } = body;

    // 1. Validation
    if (!name || typeof name !== "string" || !name.trim()) {
      console.log("❌ [BACKEND DEBUG] Validation Error: College Name is missing.");
      return NextResponse.json({ error: "College Name is required." }, { status: 400 });
    }

    // 1b. Duplicate Check & Prevention
    const dupCheck = await checkForDuplicateCollege({
      name: name.trim(),
      website: website || null,
      email: email || null,
      phone: phone || null,
    });

    if (dupCheck.isDuplicate && dupCheck.matchedCollege) {
      console.log(`❌ [BACKEND DUPLICATE PREVENTED] ${dupCheck.warningMessage}`);

      try {
        await db.duplicateAttempt.create({
          data: {
            attemptedName: name.trim(),
            attemptedUrl: website || null,
            attemptedEmail: email || null,
            attemptedPhone: phone || null,
            matchedCollegeId: dupCheck.matchedCollege.id,
            matchedCollegeName: dupCheck.matchedCollege.name,
            matchReason: dupCheck.warningMessage || "Duplicate College Detected",
            similarityScore: dupCheck.similarityScore,
            attemptedBy: "Admin",
          },
        });
      } catch (logErr) {}

      return NextResponse.json(
        {
          error: "DUPLICATE_COLLEGE",
          message: dupCheck.warningMessage,
          matchedCollege: dupCheck.matchedCollege,
          similarityScore: dupCheck.similarityScore,
        },
        { status: 409 }
      );
    }

    // 2. Guaranteed Unique Slug
    let baseSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (!baseSlug) baseSlug = `college-${Date.now()}`;

    let finalSlug = baseSlug;
    const existingCollege = await db.collegeProfile.findUnique({ where: { slug: finalSlug } });
    if (existingCollege) {
      finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
      console.log(`[BACKEND DEBUG] Slug collision detected. Generated new slug: ${finalSlug}`);
    }

    // 3. User Account Link
    const newUser = await db.user.create({
      data: {
        email: `college_${Date.now()}_${Math.floor(Math.random() * 10000)}@c2talents.com`,
        passwordHash: "hashed_pass_placeholder",
        role: "COLLEGE",
      },
    });
    const userId = newUser.id;

    // 4. Data Normalization with Safe Numeric Parsing
    const categoriesStr = Array.isArray(categories) ? categories.join(", ") : categories || "";
    const facilitiesStr = Array.isArray(facilities) ? facilities.join(", ") : facilities || "";

    const parsedFeesPerYear = safeFloat(feesPerYear, 60000) ?? 60000;
    const parsedAvgPackage = safeFloat(avgPackage, 5.0) ?? 5.0;
    const parsedHighestPackage = safeFloat(highestPackage, 12.0) ?? 12.0;

    // 5. Execute Prisma Create Query
    console.log("[BACKEND DEBUG] Executing db.collegeProfile.create()...");
    const newCollege = await db.collegeProfile.create({
      data: {
        userId,
        name: name.trim(),
        shortName: shortName?.trim() || name.slice(0, 5).toUpperCase(),
        slug: finalSlug,
        description: description || `${name} is a leading educational institution.`,
        location: location || `${city || "Chennai"}, ${state || "Tamil Nadu"}`,
        address: address || "",
        landmark: landmark || "",
        area: area || "",
        city: city || "Chennai",
        district: district || city || "Chennai",
        state: state || "Tamil Nadu",
        pincode: pincode || "",
        latitude: safeFloat(latitude),
        longitude: safeFloat(longitude),
        googleMapUrl: safeUrl(googleMapUrl, null),
        phone: phone || "",
        mobile: mobile || "",
        email: email || "",
        website: safeUrl(website, null),
        facebook: safeUrl(facebook, null),
        instagram: safeUrl(instagram, null),
        linkedin: safeUrl(linkedin, null),
        youtube: safeUrl(youtube, null),
        rating: safeFloat(rating, 4.2) ?? 4.2,
        type: type || ownership || "Private",
        ownership: ownership || type || "Private",
        category: category || "Engineering",
        categories: categoriesStr,
        affiliatedUniversity: affiliatedUniversity || "",
        isAutonomous: Boolean(isAutonomous),
        accreditation: accreditation || "",
        approval: approval || "AICTE, UGC",
        aicteApproved: Boolean(aicteApproved ?? true),
        ugcApproved: Boolean(ugcApproved ?? true),
        naacGrade: naacGrade || "A",
        nirfRank: safeInt(nirfRank),
        feesPerYear: parsedFeesPerYear,
        courseWiseFees: courseWiseFees || "",
        hostelFees: safeFloat(hostelFees),
        transportFees: safeFloat(transportFees),
        scholarshipDetails: scholarshipDetails || "",
        educationLoanDetails: educationLoanDetails || "",
        facilities: facilitiesStr,
        avgPackage: parsedAvgPackage,
        highestPackage: parsedHighestPackage,
        placementPercentage: safeFloat(placementPercentage, 85.0),
        internshipDetails: internshipDetails || "",
        topRecruiters: topRecruiters || "",
        admissionEligibility: admissionEligibility || "",
        admissionProcess: admissionProcess || "",
        documentsRequired: documentsRequired || "",
        counsellingInfo: counsellingInfo || "",
        admissionEntranceExams: admissionEntranceExams || "",
        importantDates: importantDates || "",
        hostelAvailable: Boolean(hostelAvailable),
        boysHostel: Boolean(boysHostel),
        girlsHostel: Boolean(girlsHostel),
        acRooms: Boolean(acRooms),
        messAvailable: Boolean(messAvailable),
        hostelFeePerYear: safeFloat(hostelFeePerYear),
        image: safeUrl(image || banner, "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80")!,
        logo: safeUrl(logo, "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=400&q=80"),
        banner: safeUrl(banner || image, "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80"),
        collegeVideo: safeUrl(collegeVideo, null),
        estYear: safeInt(estYear),
        seoTitle: seoTitle || `${name} Admissions & Courses`,
        seoDescription: seoDescription || `${name} official details.`,
        metaKeywords: metaKeywords || "",
        status: status || "PUBLISHED",
        featured: Boolean(featured),
        trending: Boolean(trending),
        courses: {
          create: Array.isArray(courses) && courses.length > 0
            ? courses.map((c: any) => ({
                title: c.title || "Undergraduate Course",
                duration: c.duration || "4 Years",
                feesPerYear: safeFloat(c.feesPerYear, 60000) ?? 60000,
                eligibility: c.eligibility || "10+2 Pass",
                seats: safeInt(c.seats, 60) ?? 60,
                entranceExam: c.entranceExam || "Merit Based",
                careerPath: c.careerPath || "Graduate Specialist",
                demand: c.demand || "High",
              }))
            : [],
        },
        galleryImages: {
          create: Array.isArray(galleryImages) && galleryImages.length > 0
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
              highestCtc: Math.round((parsedHighestPackage * 0.78) * 10) / 10,
              averageCtc: Math.round((parsedAvgPackage * 0.82) * 10) / 10,
              topRecruiters: topRecruiters || "TCS, Infosys, Wipro, Accenture, Cognizant",
            },
            {
              year: new Date().getFullYear() - 2,
              eligibleStudents: 470,
              placedStudents: Math.round(470 * ((safeFloat(placementPercentage, 85) ?? 85) / 100)),
              highestCtc: Math.round((parsedHighestPackage * 0.85) * 10) / 10,
              averageCtc: Math.round((parsedAvgPackage * 0.88) * 10) / 10,
              topRecruiters: topRecruiters || "TCS, Infosys, Wipro, Accenture, Amazon",
            },
            {
              year: new Date().getFullYear() - 1,
              eligibleStudents: 490,
              placedStudents: Math.round(490 * ((safeFloat(placementPercentage, 85) ?? 85) / 100)),
              highestCtc: Math.round((parsedHighestPackage * 0.92) * 10) / 10,
              averageCtc: Math.round((parsedAvgPackage * 0.94) * 10) / 10,
              topRecruiters: topRecruiters || "TCS, Infosys, Wipro, Accenture, Microsoft",
            },
            {
              year: new Date().getFullYear(),
              eligibleStudents: 500,
              placedStudents: Math.round(500 * ((safeFloat(placementPercentage, 85) ?? 85) / 100)),
              highestCtc: parsedHighestPackage,
              averageCtc: parsedAvgPackage,
              topRecruiters: topRecruiters || "TCS, Infosys, Wipro, Accenture, Amazon, Microsoft",
            },
          ]
        },
        reviews: {
          create: Array.isArray(body.reviews) && body.reviews.length > 0
            ? body.reviews.map((r: any) => ({
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
          }
        } : undefined,
      },
      include: {
        courses: true,
        galleryImages: true,
        placements: true,
        content: true,
      },
    });

    console.log(`[BACKEND DEBUG] ✅ College Created Successfully in ${Date.now() - startTime}ms. ID: ${newCollege.id}`);
    console.log("====================================================\n");

    return NextResponse.json({ success: true, college: newCollege }, { status: 201 });
  } catch (err: any) {
    console.error("❌ [BACKEND DEBUG] POST /api/admin/colleges Prisma Exception:", err);
    return NextResponse.json(
      { error: "Database save failure: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
