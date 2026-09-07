import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = req.nextUrl.searchParams;
    const selectedCourse = searchParams.get("course") || "";

    const country = await prisma.studyAbroadCountry.findUnique({
      where: { slug: slug.toLowerCase() }
    });

    if (!country) {
      return NextResponse.json(
        { success: false, error: "Study abroad country not found" },
        { status: 404 }
      );
    }

    // Parse JSON stored fields safely
    let parsedWhyStudy = {};
    let parsedPopularCourses: string[] = [];
    let parsedCostBreakdown = {};
    let parsedAdmissionRequirements = {};
    let parsedIntakes: any[] = [];
    let parsedVisaGuide = {};
    let parsedScholarships: any[] = [];

    try { parsedWhyStudy = JSON.parse(country.whyStudy || "{}"); } catch (e) {}
    try { parsedPopularCourses = JSON.parse(country.popularCourses || "[]"); } catch (e) {}
    try { parsedCostBreakdown = JSON.parse(country.costBreakdown || "{}"); } catch (e) {}
    try { parsedAdmissionRequirements = JSON.parse(country.admissionRequirements || "{}"); } catch (e) {}
    try { parsedIntakes = JSON.parse(country.intakes || "[]"); } catch (e) {}
    try { parsedVisaGuide = JSON.parse(country.visaGuide || "{}"); } catch (e) {}
    try { parsedScholarships = JSON.parse(country.scholarships || "[]"); } catch (e) {}

    // Query real CollegeProfile database records matching the country
    const countrySlug = country.slug.toLowerCase();
    const countryCode = country.code.toUpperCase();
    const countryName = country.name;

    const collegeWhere: any = {
      isDeleted: false,
      OR: [
        { location: { contains: countryCode } },
        { location: { contains: countryName } },
        { location: { contains: country.code } },
        { slug: { contains: `-${countrySlug}` } },
        { state: { contains: countryCode } },
        { state: { contains: countryName } },
        { description: { contains: countryName } }
      ]
    };

    if (selectedCourse) {
      collegeWhere.courses = {
        some: {
          title: { contains: selectedCourse },
          isDeleted: false
        }
      };
    }

    const universities = await prisma.collegeProfile.findMany({
      where: collegeWhere,
      select: {
        id: true,
        name: true,
        slug: true,
        location: true,
        logo: true,
        image: true,
        rating: true,
        nirfRank: true,
        feesPerYear: true,
        type: true,
        courses: {
          select: {
            id: true,
            title: true,
            feesPerYear: true,
            duration: true
          },
          take: 4
        }
      },
      orderBy: { nirfRank: "asc" },
      take: 12
    });

    return NextResponse.json({
      success: true,
      country: {
        ...country,
        whyStudy: parsedWhyStudy,
        popularCourses: parsedPopularCourses,
        costBreakdown: parsedCostBreakdown,
        admissionRequirements: parsedAdmissionRequirements,
        intakes: parsedIntakes,
        visaGuide: parsedVisaGuide,
        scholarships: parsedScholarships
      },
      universities
    });
  } catch (error: any) {
    console.error("Error fetching country detail:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch country detail" },
      { status: 500 }
    );
  }
}
