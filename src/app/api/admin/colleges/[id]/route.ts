import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    const categoriesStr = Array.isArray(categories) ? categories.join(", ") : categories || "";
    const facilitiesStr = Array.isArray(facilities) ? facilities.join(", ") : facilities || "";

    // Delete existing courses and gallery to re-create clean state
    await db.$transaction([
      db.course.deleteMany({ where: { collegeId: id } }),
      db.galleryImage.deleteMany({ where: { collegeId: id } }),
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
        googleMapUrl,
        phone,
        mobile,
        email,
        website,
        facebook,
        instagram,
        linkedin,
        youtube,
        rating: safeFloat(rating, 4.0) ?? 4.0,
        type,
        ownership,
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
        image: image || banner || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
        logo,
        banner,
        collegeVideo,
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
            ? galleryImages.map((g: any) => ({
                url: typeof g === "string" ? g : g.url,
                altText: typeof g === "object" ? g.altText : `${name} image`,
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

    return NextResponse.json({ success: true, college: updatedCollege });
  } catch (err: any) {
    console.error("PUT admin college error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.collegeProfile.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "College deleted successfully." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
