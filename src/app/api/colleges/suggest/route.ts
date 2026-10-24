import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseSearchIntentAI } from "@/lib/search/aiSearchParser";
import { calculateHaversineDistance, formatDistance, getCollegeCoordinates } from "@/lib/search/haversine";
import { detectCourseFromQuery, getPrismaCourseRelationalFilter, isCollegeOfferingCourse } from "@/lib/courses/courseNormalizer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || searchParams.get("search") || "").trim();
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const userLat = latParam ? parseFloat(latParam) : null;
  const userLng = lngParam ? parseFloat(lngParam) : null;

  if (!q) {
    return NextResponse.json({
      query: "",
      locations: [],
      colleges: [],
      categories: [],
    });
  }

  try {
    const parsed = await parseSearchIntentAI(q);
    const location = parsed.location;
    const isNearMeQuery = /\b(near\s+by|nearby|near\s+me|near|closest|nearest)\b/i.test(q);
    const targetCourse = detectCourseFromQuery(q);

    const where: any = {
      status: { not: "DRAFT" },
      isDeleted: false,
    };

    const andConditions: any[] = [];

    // STRICT COURSE FILTERING
    if (targetCourse) {
      andConditions.push(getPrismaCourseRelationalFilter(targetCourse));
    } else if (parsed.domains && parsed.domains.length > 0) {
      const domainOrFilters: any[] = [];
      parsed.domains.forEach((dom) => {
        if (dom === "ARTS" || dom === "SCIENCE") {
          domainOrFilters.push(
            { name: { contains: "Arts" } },
            { name: { contains: "Science" } },
            { categories: { contains: "Arts" } },
            { categories: { contains: "Science" } }
          );
        } else if (dom === "ENGINEERING") {
          domainOrFilters.push(
            { name: { contains: "Engineering" } },
            { name: { contains: "Technology" } },
            { shortName: { contains: "IIT" } },
            { shortName: { contains: "NIT" } },
            { shortName: { contains: "PSG" } }
          );
        } else if (dom === "DENTAL") {
          domainOrFilters.push({ name: { contains: "Dental" } });
        } else if (dom === "PHYSIOTHERAPY") {
          domainOrFilters.push({ name: { contains: "Physiotherapy" } });
        } else if (dom === "MEDICAL") {
          domainOrFilters.push({ name: { contains: "Medical" } });
        } else if (dom === "LAW") {
          domainOrFilters.push({ name: { contains: "Law" } });
        }
      });
      if (domainOrFilters.length > 0) andConditions.push({ OR: domainOrFilters });
    }

    // HARD LOCATION FILTER
    if (location) {
      const locTrim = location.trim();
      andConditions.push({
        OR: [
          { city: { contains: locTrim } },
          { location: { contains: locTrim } },
          { district: { contains: locTrim } },
          { address: { contains: locTrim } },
        ],
      });
    }

    // Keyword matching whenever search text is provided
    if (q && !isNearMeQuery) {
      andConditions.push({
        OR: [
          { name: { contains: q } },
          { shortName: { contains: q } },
          { city: { contains: q } },
          { location: { contains: q } },
          { district: { contains: q } },
        ],
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const rawColleges = await db.collegeProfile.findMany({
      where,
      select: {
        id: true,
        name: true,
        shortName: true,
        city: true,
        location: true,
        district: true,
        address: true,
        category: true,
        ownership: true,
        type: true,
        naacGrade: true,
        rating: true,
        nirfRank: true,
        image: true,
        latitude: true,
        longitude: true,
        isAutonomous: true,
        courses: { where: { isDeleted: false }, select: { title: true } },
      },
      take: 50,
    });

    // Apply strict exclusion & location validation with direct name match safeguard
    const filtered = rawColleges.filter((c) => {
      const nameL = c.name.toLowerCase();
      const shortNameL = (c.shortName || "").toLowerCase();
      const qLower = q.toLowerCase();

      // If college directly matches search query by name or shortName, always keep it!
      if (nameL.includes(qLower) || shortNameL.includes(qLower)) {
        return true;
      }

      // STRICT ZERO-TOLERANCE COURSE VALIDATION
      if (targetCourse && !isCollegeOfferingCourse(c as any, targetCourse)) {
        return false;
      }

      const cityL = (c.city || "").toLowerCase();
      const locL = (c.location || "").toLowerCase();
      const distL = ((c as any).district || "").toLowerCase();
      const addrL = ((c as any).address || "").toLowerCase();

      if (location) {
        const targetL = location.toLowerCase().trim();
        if (!cityL.includes(targetL) && !locL.includes(targetL) && !distL.includes(targetL) && !addrL.includes(targetL) && !nameL.includes(targetL)) {
          return false;
        }
      }

      if (parsed.domains && parsed.domains.length > 0) {
        if (parsed.domains.includes("ARTS") || parsed.domains.includes("SCIENCE")) {
          if (
            /engineering|technology|dental|physiotherapy|nursing|pharmacy|paramedical|physical education/i.test(nameL) &&
            !/arts|humanities|fine arts|liberal arts/i.test(nameL)
          ) {
            return false;
          }
        } else if (parsed.domains.includes("ENGINEERING")) {
          if (/dental|physiotherapy|nursing|pharmacy|b\.ed|physical education/i.test(nameL)) return false;
        }
      }
      return true;
    });

    const collegeResults = filtered.map((c) => {
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
        id: c.id,
        name: c.name,
        shortName: c.shortName,
        city: c.city,
        location: c.location,
        category: c.category,
        ownership: c.ownership,
        type: c.type,
        naacGrade: c.naacGrade,
        rating: c.rating,
        nirfRank: c.nirfRank,
        image: c.image,
        latitude: c.latitude,
        longitude: c.longitude,
        isAutonomous: c.isAutonomous,
        courses: c.courses,
        distance,
        distanceText,
      };
    });

    // Sort by name relevance first, then rating
    collegeResults.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const qLower = q.toLowerCase();

      const aExact = aName === qLower || (a.shortName && a.shortName.toLowerCase() === qLower) ? 1 : 0;
      const bExact = bName === qLower || (b.shortName && b.shortName.toLowerCase() === qLower) ? 1 : 0;
      if (bExact !== aExact) return bExact - aExact;

      const aStarts = aName.startsWith(qLower) ? 1 : 0;
      const bStarts = bName.startsWith(qLower) ? 1 : 0;
      if (bStarts !== aStarts) return bStarts - aStarts;

      return (b.rating || 0) - (a.rating || 0);
    });

    if (isNearMeQuery || parsed.nearbyRequested) {
      collegeResults.sort((a, b) => {
        if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
        return (b.rating || 0) - (a.rating || 0);
      });
    } else if (parsed.rankingRequested) {
      collegeResults.sort((a, b) => {
        const rankA = a.nirfRank ?? 9999;
        const rankB = b.nirfRank ?? 9999;
        if (rankA !== rankB) return rankA - rankB;
        return (b.rating || 0) - (a.rating || 0);
      });
    }

    const rawLocations = await db.collegeProfile.findMany({
      where: {
        status: { not: "DRAFT" },
        isDeleted: false,
        OR: [
          { city: { contains: q } },
          { district: { contains: q } },
          { location: { contains: q } },
        ],
      },
      select: { city: true, district: true, state: true },
      distinct: ["city"],
      take: 5,
    });

    const locations = rawLocations
      .map((l) => l.city)
      .filter((city): city is string => Boolean(city && city.trim().length > 0));

    const categories: string[] = [];
    if (isNearMeQuery || parsed.nearbyRequested) {
      categories.push("Colleges Near Me");
      categories.push("Nearby Engineering Colleges");
      categories.push("Top Rated Colleges Near Me");
    } else {
      const matchedCategory = parsed.domains[0] ? parsed.domains[0].charAt(0) + parsed.domains[0].slice(1).toLowerCase() : "Colleges";
      const matchedLocation = location || (locations[0] ? locations[0] : null);

      if (matchedLocation) {
        categories.push(`Best Colleges in ${matchedLocation}`);
      }
      if (parsed.ownership) {
        categories.push(`${parsed.ownership} Colleges in ${matchedLocation || "Tamil Nadu"}`);
      }
    }

    return NextResponse.json({
      query: q,
      locations,
      colleges: collegeResults.slice(0, 6),
      categories: Array.from(new Set(categories)).slice(0, 3),
      parsed,
    });
  } catch (error) {
    console.error("Error generating search suggestions:", error);
    return NextResponse.json({
      query: q,
      locations: [],
      colleges: [],
      categories: [],
    });
  }
}
