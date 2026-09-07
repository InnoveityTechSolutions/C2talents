import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseSearchIntentAI } from "@/lib/search/aiSearchParser";
import { calculateHaversineDistance, formatDistance, getCollegeCoordinates } from "@/lib/search/haversine";

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

    const where: any = {
      status: { not: "DRAFT" },
      isDeleted: false,
    };

    const andConditions: any[] = [];

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

    if (parsed.domains && parsed.domains.length > 0) {
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

    // Keyword matching ONLY if not a generic "near me" phrase query
    if (q && !isNearMeQuery && !location && parsed.domains.length === 0) {
      andConditions.push({
        OR: [
          { name: { contains: q } },
          { shortName: { contains: q } },
          { city: { contains: q } },
          { location: { contains: q } },
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
      },
      take: 20,
    });

    // Apply strict exclusion & location validation
    const filtered = rawColleges.filter((c) => {
      const nameL = c.name.toLowerCase();
      const cityL = (c.city || "").toLowerCase();
      const locL = (c.location || "").toLowerCase();

      if (location) {
        const targetL = location.toLowerCase().trim();
        if (!cityL.includes(targetL) && !locL.includes(targetL) && !nameL.includes(targetL)) {
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
        ...c,
        distance,
        distanceText,
      };
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
