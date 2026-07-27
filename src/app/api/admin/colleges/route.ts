import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { checkForDuplicateCollege } from "@/lib/duplicateChecker";

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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (query) {
      where.OR = [
        { name: { contains: query } },
        { shortName: { contains: query } },
        { city: { contains: query } },
        { state: { contains: query } },
      ];
    }
    if (category) {
      where.categories = { contains: category };
    }
    if (status) {
      where.status = status;
    }

    const [colleges, totalCount, draftCount, publishedCount, featuredCount, usersCount, coursesCount] =
      await Promise.all([
        db.collegeProfile.findMany({
          where,
          include: {
            courses: true,
            placements: true,
            galleryImages: true,
          },
          orderBy: { updatedAt: "desc" },
        }),
        db.collegeProfile.count(),
        db.collegeProfile.count({ where: { status: "DRAFT" } }),
        db.collegeProfile.count({ where: { status: "PUBLISHED" } }),
        db.collegeProfile.count({ where: { featured: true } }),
        db.user.count(),
        db.course.count(),
      ]);

    const categoriesSet = new Set<string>();
    const allColleges = await db.collegeProfile.findMany({ select: { categories: true } });
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
        googleMapUrl: googleMapUrl || "",
        phone: phone || "",
        mobile: mobile || "",
        email: email || "",
        website: website || "",
        facebook: facebook || "",
        instagram: instagram || "",
        linkedin: linkedin || "",
        youtube: youtube || "",
        rating: safeFloat(rating, 4.2) ?? 4.2,
        type: type || "Private",
        ownership: ownership || "Private",
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
        image: image || banner || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
        logo: logo || "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=400&q=80",
        banner: banner || image || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
        collegeVideo: collegeVideo || "",
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
            ? galleryImages.map((g: any) => ({
                url: typeof g === "string" ? g : g.url,
                altText: typeof g === "object" ? g.altText : `${name} campus`,
                caption: typeof g === "object" ? g.caption : "Campus view",
                tags: typeof g === "object" ? g.tags : "campus",
              }))
            : [],
        },
      },
      include: {
        courses: true,
        galleryImages: true,
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
