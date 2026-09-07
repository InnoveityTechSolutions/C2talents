import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseSearchIntentAI, StructuredSearchIntent } from "@/lib/search/aiSearchParser";
import { calculateHaversineDistance, formatDistance, getCollegeCoordinates, CITY_COORDINATES } from "@/lib/search/haversine";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || searchParams.get("search") || "").trim();
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  let userLat = latParam ? parseFloat(latParam) : null;
  let userLng = lngParam ? parseFloat(lngParam) : null;

  if (!q) {
    return NextResponse.json({
      intent: null,
      colleges: [],
      courses: [],
      scholarships: [],
      news: [],
      locations: [],
      counts: { colleges: 0, courses: 0, scholarships: 0, news: 0 },
    });
  }

  // 1. AI Intent Analysis Layer
  const parsedIntent = await parseSearchIntentAI(q);

  // Fallback lat/lng from location if user location missing
  if ((userLat === null || userLng === null) && parsedIntent.location) {
    const locLower = parsedIntent.location.toLowerCase();
    if (CITY_COORDINATES[locLower]) {
      userLat = CITY_COORDINATES[locLower].lat;
      userLng = CITY_COORDINATES[locLower].lng;
    }
  }

  // Server Intent Logging Requirement #13 & Debug
  console.log("\n==================================================");
  console.log(`USER QUERY: "${q}"`);
  console.log("PARSED INTENT:", parsedIntent.intent);
  console.log("TARGET SCOPE:", parsedIntent.targetScope);
  console.log("DOMAINS:", parsedIntent.domains.join(", ") || "NONE");
  console.log("LOCATION:", parsedIntent.location || "NONE");
  console.log("NEARBY:", parsedIntent.nearbyRequested);
  console.log("SORT:", parsedIntent.sort);
  console.log("==================================================\n");

  try {
    // 2. Fetch Colleges with Domain Candidate Filtering & Strict Exclusion
    const collegeWhere: any = {
      status: { not: "DRAFT" },
      isDeleted: false,
    };
    const andConditions: any[] = [];

    // Filter by parsed domains (Support Multi-Domain queries e.g. ["ARTS", "SCIENCE"])
    if (parsedIntent.domains && parsedIntent.domains.length > 0) {
      const domainOrFilters: any[] = [];

      parsedIntent.domains.forEach((dom) => {
        if (dom === "ARTS" || dom === "SCIENCE") {
          domainOrFilters.push(
            { name: { contains: "Arts" } },
            { name: { contains: "Science" } },
            { name: { contains: "Liberal Arts" } },
            { name: { contains: "Humanities" } },
            { categories: { contains: "Arts" } },
            { categories: { contains: "Science" } },
            { courses: { some: { title: { contains: "B.A" } } } },
            { courses: { some: { title: { contains: "B.Sc" } } } },
            { courses: { some: { title: { contains: "BSc" } } } },
            { courses: { some: { title: { contains: "BA" } } } }
          );
        } else if (dom === "ENGINEERING") {
          domainOrFilters.push(
            { name: { contains: "Engineering" } },
            { name: { contains: "Technology" } },
            { shortName: { contains: "IIT" } },
            { shortName: { contains: "NIT" } },
            { shortName: { contains: "PSG" } },
            { shortName: { contains: "CIT" } },
            { categories: { contains: "Engineering" } }
          );
        } else if (dom === "MEDICAL") {
          domainOrFilters.push(
            { name: { contains: "Medical" } },
            { name: { contains: "Medicine" } },
            { courses: { some: { title: { contains: "MBBS" } } } }
          );
        } else if (dom === "DENTAL") {
          domainOrFilters.push({ name: { contains: "Dental" } });
        } else if (dom === "PHYSIOTHERAPY") {
          domainOrFilters.push({ name: { contains: "Physiotherapy" } });
        } else if (dom === "LAW") {
          domainOrFilters.push(
            { name: { contains: "Law" } },
            { name: { contains: "Legal" } }
          );
        } else if (dom === "MANAGEMENT") {
          domainOrFilters.push(
            { name: { contains: "Management" } },
            { name: { contains: "Business" } }
          );
        }
      });

      if (domainOrFilters.length > 0) {
        andConditions.push({ OR: domainOrFilters });
      }
    }

    if (parsedIntent.location) {
      const locTrim = parsedIntent.location.trim();
      andConditions.push({
        OR: [
          { location: { contains: locTrim } },
          { city: { contains: locTrim } },
          { district: { contains: locTrim } },
          { state: { contains: locTrim } },
        ],
      });
    }

    if (parsedIntent.ownership) {
      andConditions.push({
        OR: [
          { ownership: { contains: parsedIntent.ownership } },
          { type: { contains: parsedIntent.ownership } },
        ],
      });
    }

    if (parsedIntent.naacGrade && parsedIntent.naacGrade !== "ANY") {
      andConditions.push({ naacGrade: { contains: parsedIntent.naacGrade } });
    }

    if (andConditions.length > 0) collegeWhere.AND = andConditions;

    const dbColleges = await db.collegeProfile.findMany({
      where: collegeWhere,
      include: {
        courses: { take: 10 },
      },
      take: 100,
    });

    // STRICT MULTI-DOMAIN EXCLUSION STEP
    const filteredColleges = dbColleges.filter((c) => {
      const nameL = c.name.toLowerCase();
      const hasArtsScience =
        /arts|science|humanities|liberal arts/i.test(nameL) ||
        c.courses.some((crt) => /b\.?a\b|b\.?sc\b|bsc\b|ba\b|m\.?sc\b|ma\b/i.test(crt.title));

      if (parsedIntent.domains.includes("ARTS") || parsedIntent.domains.includes("SCIENCE")) {
        // Must NOT return Engineering, Dental, Medical, Physiotherapy colleges unless explicitly Arts/Science!
        if (
          /engineering|technology|dental|physiotherapy|nursing|pharmacy|paramedical|siddha|ayurveda|homeopathy|law|physical education/i.test(
            nameL
          ) &&
          !hasArtsScience
        ) {
          return false;
        }
        if (/medical|hospital/i.test(nameL) && !hasArtsScience) {
          return false;
        }
      } else if (parsedIntent.domains.includes("ENGINEERING")) {
        if (/dental|physiotherapy|nursing|pharmacy|paramedical|ayurveda|siddha|homeopathy|b\.ed|physical education/i.test(nameL)) {
          return false;
        }
        if (/medical|hospital/i.test(nameL) && !/engineering|technology/i.test(nameL)) {
          return false;
        }
      } else if (parsedIntent.domains.includes("DENTAL")) {
        if (!nameL.includes("dental")) return false;
      } else if (parsedIntent.domains.includes("PHYSIOTHERAPY")) {
        if (!nameL.includes("physiotherapy")) return false;
      } else if (parsedIntent.domains.includes("MEDICAL")) {
        if (/engineering|technology|dental|physiotherapy/i.test(nameL) && !nameL.includes("medical")) return false;
      }

      return true;
    });

    const processedColleges = filteredColleges.map((c) => {
      let distance: number | null = null;
      let distanceText: string | null = null;
      if (userLat !== null && userLng !== null) {
        const coords = getCollegeCoordinates(c);
        if (coords) {
          distance = calculateHaversineDistance(userLat, userLng, coords.lat, coords.lng);
          distanceText = formatDistance(distance);
        }
      }
      return {
        ...c,
        distance,
        distanceText,
      };
    });

    // Sort colleges based on intent
    processedColleges.sort((a, b) => {
      if (parsedIntent.nearbyRequested && a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      if (parsedIntent.rankingRequested) {
        const rankA = a.nirfRank ?? 9999;
        const rankB = b.nirfRank ?? 9999;
        if (rankA !== rankB) return rankA - rankB;
        return (b.rating || 0) - (a.rating || 0);
      }
      return (b.rating || 0) - (a.rating || 0);
    });

    // 3. Fetch Courses (Course Scope Search)
    const dbCourses = await db.course.findMany({
      where: {
        isDeleted: false,
        OR: [
          { title: { contains: q } },
          { careerPath: { contains: q } },
          { entranceExam: { contains: q } },
        ],
      },
      include: {
        college: {
          select: { id: true, name: true, location: true, city: true, rating: true, image: true },
        },
      },
      take: 10,
    });

    // 4. Fetch Scholarships (Scholarship Scope Search)
    const dbScholarships = await db.scholarship.findMany({
      where: {
        isPublished: true,
        OR: [
          { name: { contains: q } },
          { provider: { contains: q } },
          { eligibleCourses: { contains: q } },
          { category: { contains: q } },
        ],
      },
      take: 6,
    });

    // 5. Fetch News Articles (News Scope Search)
    const dbNews = await db.newsArticle.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: q } },
          { content: { contains: q } },
          { category: { contains: q } },
        ],
      },
      take: 6,
    });

    return NextResponse.json({
      query: q,
      parsedIntent,
      colleges: processedColleges,
      courses: dbCourses,
      scholarships: dbScholarships,
      news: dbNews,
      counts: {
        colleges: processedColleges.length,
        courses: dbCourses.length,
        scholarships: dbScholarships.length,
        news: dbNews.length,
      },
    });
  } catch (error: any) {
    console.error("Global search API error:", error);
    return NextResponse.json(
      { error: "Global search temporarily unavailable.", colleges: [], courses: [], scholarships: [], news: [] },
      { status: 500 }
    );
  }
}
