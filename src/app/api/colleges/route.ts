import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseSearchIntentAI, generateMatchReasons, StructuredSearchIntent } from "@/lib/search/aiSearchParser";
import { calculateHaversineDistance, formatDistance, getCollegeCoordinates, CITY_COORDINATES } from "@/lib/search/haversine";
import { detectCourseFromQuery, getPrismaCourseRelationalFilter, isCollegeOfferingCourse } from "@/lib/courses/courseNormalizer";
import {
  generateSearchVariants,
  extractCleanTokens,
  matchesCollegeSearch,
  buildPrismaCollegeSearchConditions,
} from "@/lib/search/searchNormalizer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const STOP_WORDS = new Set([
  "college", "colleges", "institute", "institutes", "institution", "institutions",
  "university", "universities", "campus", "school", "schools", "of", "in", "at",
  "near", "nearby", "me", "the", "and", "for", "with", "all", "best", "top", "good",
  "fees", "fee", "low", "cheap", "ranking", "rankings"
]);

function extractSearchTokens(raw: string): string[] {
  if (!raw) return [];
  return raw
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // 1. Raw Query Parameters
  const rawSearch = searchParams.get("search") || searchParams.get("q") || "";
  const searchInput = rawSearch.trim();
  const searchTokens = extractSearchTokens(searchInput);

  const explicitCourse = (searchParams.get("course") || searchParams.get("program") || "").trim();
  const explicitCategory = (searchParams.get("category") || searchParams.get("stream") || "").trim();
  const explicitOwnership = (searchParams.get("ownership") || searchParams.get("type") || "").trim();
  const explicitLocation = (searchParams.get("location") || "").trim();
  const explicitNaac = (searchParams.get("naacGrade") || "").trim();
  const explicitMaxFees = searchParams.get("maxFees") ? parseFloat(searchParams.get("maxFees")!) : null;
  const minAvgPackage = searchParams.get("minAveragePackage") ? parseFloat(searchParams.get("minAveragePackage")!) : null;

  // Strict Course Normalization & Detection
  const targetCourse = detectCourseFromQuery(explicitCourse) || detectCourseFromQuery(searchInput);

  // Lat / Lng parameters (from browser geolocation)
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  let userLat = latParam ? parseFloat(latParam) : null;
  let userLng = lngParam ? parseFloat(lngParam) : null;

  // 2. Parse Search Query Intent via AI / NLP Parser Engine
  const parsedIntent = await parseSearchIntentAI(searchInput);

  const location = explicitLocation || parsedIntent.location;

  // Server Debug Logging Requirement #29
  console.log("\n==================================================");
  console.log(`USER QUERY: "${searchInput}"`);
  console.log(`PARSED INTENT: ${parsedIntent.intent}`);
  console.log(`DOMAINS: ${parsedIntent.domains.join(", ") || "ALL_CATEGORIES"}`);
  console.log(`LOCATION: ${location || "ANY_LOCATION"}`);
  console.log(`HOSTEL: ${parsedIntent.hasHostel} | PLACEMENT: ${parsedIntent.hasGoodPlacements}`);
  console.log(`COMPARE TARGETS: ${parsedIntent.compareColleges.join(" vs ") || "NONE"}`);
  console.log(`NEARBY REQUESTED: ${parsedIntent.nearbyRequested}`);
  console.log(`SORT METHOD: ${parsedIntent.sort}`);
  console.log("==================================================\n");

  // Geolocation fallback ONLY if "near me" is requested or explicitly lat/lng provided
  if (parsedIntent.nearbyRequested && (userLat === null || userLng === null) && location) {
    const locLower = location.toLowerCase();
    if (CITY_COORDINATES[locLower]) {
      userLat = CITY_COORDINATES[locLower].lat;
      userLng = CITY_COORDINATES[locLower].lng;
    }
  }

  const category = explicitCategory;
  const ownership = explicitOwnership || parsedIntent.ownership;
  const naacGrade = explicitNaac || parsedIntent.naacGrade;
  const maxFees = explicitMaxFees !== null ? explicitMaxFees : parsedIntent.maxFees;

  try {
    const where: any = {
      status: { not: "DRAFT" },
      isDeleted: false,
    };

    const andConditions: any[] = [];

    // KEYWORD SEARCH FILTER (College Name, ShortName, Slug, City, Location)
    if (searchInput) {
      const searchConditions = buildPrismaCollegeSearchConditions(searchInput);
      if (searchConditions.length > 0) {
        andConditions.push(...searchConditions);
      }
    }

    // COMPARISON INTENT SEARCH ("VIT vs SSN")
    if (parsedIntent.intent === "COMPARE" && parsedIntent.compareColleges.length > 0) {
      const compareOrFilters = parsedIntent.compareColleges.map((target) => ({
        OR: [
          { name: { contains: target } },
          { shortName: { contains: target } },
          { slug: { contains: target } },
        ],
      }));
      andConditions.push({ OR: compareOrFilters });
    }

    // EXPLICIT LOCATION FILTER (Only when location is specified explicitly, or when searchInput is not already handling location)
    const effectiveLocation = explicitLocation || (!searchInput ? location : null);
    if (effectiveLocation && parsedIntent.intent !== "COMPARE") {
      const locTrim = effectiveLocation.trim();
      andConditions.push({
        OR: [
          { city: { contains: locTrim } },
          { location: { contains: locTrim } },
          { district: { contains: locTrim } },
        ],
      });
    }

    // STRICT COURSE FILTERING (Prisma Relational Course Check)
    if (targetCourse) {
      andConditions.push(getPrismaCourseRelationalFilter(targetCourse));
    } else if (parsedIntent.domains && parsedIntent.domains.length > 0 && parsedIntent.intent !== "COMPARE") {
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
        } else if (dom === "DENTAL") {
          domainOrFilters.push({ name: { contains: "Dental" } });
        } else if (dom === "PHYSIOTHERAPY") {
          domainOrFilters.push({ name: { contains: "Physiotherapy" } });
        } else if (dom === "MEDICAL") {
          domainOrFilters.push(
            { name: { contains: "Medical" } },
            { name: { contains: "Medicine" } },
            { courses: { some: { title: { contains: "MBBS" } } } }
          );
        } else if (dom === "MANAGEMENT") {
          domainOrFilters.push(
            { name: { contains: "Management" } },
            { name: { contains: "Business" } }
          );
        } else if (dom === "LAW") {
          domainOrFilters.push(
            { name: { contains: "Law" } },
            { name: { contains: "Legal" } }
          );
        } else if (dom === "COMMERCE") {
          domainOrFilters.push({ name: { contains: "Commerce" } });
        } else if (dom === "PHARMACY") {
          domainOrFilters.push({ name: { contains: "Pharmacy" } });
        } else if (dom === "NURSING") {
          domainOrFilters.push({ name: { contains: "Nursing" } });
        }
      });

      if (domainOrFilters.length > 0) {
        // If user typed a search term, also allow the direct name match
        if (searchInput) {
          domainOrFilters.push(
            { name: { contains: searchInput } },
            { shortName: { contains: searchInput } }
          );
        }
        andConditions.push({ OR: domainOrFilters });
      }
    } else if (category && !targetCourse) {
      if (searchInput) {
        andConditions.push({
          OR: [
            { category: { contains: category } },
            { categories: { contains: category } },
            { name: { contains: searchInput } },
            { shortName: { contains: searchInput } },
          ],
        });
      } else {
        andConditions.push({
          OR: [
            { category: { contains: category } },
            { categories: { contains: category } },
            { name: { contains: category } },
          ],
        });
      }
    }

    // Ownership Filter
    if (ownership) {
      const ownLower = ownership.toLowerCase();
      if (ownLower.includes("govt") || ownLower.includes("government")) {
        andConditions.push({
          OR: [
            { ownership: { equals: "Government" } },
            { type: { equals: "Government" } },
            { ownership: { contains: "Govt" } },
            { type: { contains: "Govt" } },
            { name: { contains: "Government" } },
            { name: { contains: "Govt" } },
          ],
        });
      } else if (ownLower.includes("private")) {
        andConditions.push({
          OR: [
            { ownership: { equals: "Private" } },
            { type: { equals: "Private" } },
            { ownership: { contains: "Private" } },
          ],
        });
      } else if (ownLower.includes("autonomous")) {
        andConditions.push({
          OR: [
            { isAutonomous: true },
            { ownership: { contains: "Autonomous" } },
            { categories: { contains: "Autonomous" } },
            { name: { contains: "Autonomous" } },
          ],
        });
      } else {
        andConditions.push({
          OR: [
            { ownership: { contains: ownership } },
            { type: { contains: ownership } },
          ],
        });
      }
    }

    // NAAC Filter
    if (naacGrade) {
      if (naacGrade === "ANY") {
        andConditions.push({
          AND: [
            { naacGrade: { not: null } },
            { naacGrade: { not: "Not Accredited" } },
            { naacGrade: { not: "" } },
          ],
        });
      } else {
        andConditions.push({
          OR: [
            { naacGrade: { equals: naacGrade } },
            { naacGrade: { contains: naacGrade } },
            { accreditation: { contains: naacGrade } },
          ],
        });
      }
    }

    // Max Fees Filter
    if (maxFees !== null) {
      where.feesPerYear = { lte: maxFees };
    }

    // Min Avg Package Filter
    if (minAvgPackage !== null || parsedIntent.hasGoodPlacements) {
      where.avgPackage = { gte: minAvgPackage !== null ? minAvgPackage : 4.0 };
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    // Fetch colleges from REAL Database
    let dbColleges = await db.collegeProfile.findMany({
      where,
      include: {
        courses: { where: { isDeleted: false } },
        reviews: { take: 5, orderBy: { createdAt: "desc" } },
      },
      orderBy: { updatedAt: "desc" },
    });

    // 3. HARD COURSE, LOCATION & DOMAIN RELEVANCE CHECK BEFORE DISPLAY
    const filteredColleges = dbColleges.filter((c) => {
      const nameL = (c.name || "").toLowerCase();
      const shortNameL = (c.shortName || "").toLowerCase();
      const locL = (c.location || "").toLowerCase();
      const cityL = (c.city || "").toLowerCase();
      const distL = (c.district || "").toLowerCase();
      const addrL = (c.address || "").toLowerCase();
      const queryLower = (searchInput || "").toLowerCase().trim();

      // Search Query Validation: college MUST match search query if provided
      if (searchInput && !matchesCollegeSearch(c, searchInput)) {
        return false;
      }

      // ZERO-TOLERANCE COURSE VALIDATION
      if (targetCourse && !isCollegeOfferingCourse(c, targetCourse)) {
        return false;
      }

      // HARD LOCATION VALIDATION
      if (location && parsedIntent.intent !== "COMPARE") {
        const targetLocL = location.toLowerCase().trim();
        const matchesLocation =
          cityL.includes(targetLocL) ||
          locL.includes(targetLocL) ||
          distL.includes(targetLocL) ||
          addrL.includes(targetLocL) ||
          nameL.includes(targetLocL);

        if (!matchesLocation) {
          return false;
        }
      }

      // HARD DOMAIN VALIDATION (ONLY if domain specified and not comparing)
      if (parsedIntent.domains && parsedIntent.domains.length > 0 && parsedIntent.intent !== "COMPARE") {
        const hasBaBscCourse = c.courses.some((crt) =>
          /\bb\.?a\b|\bb\.?sc\b|\bbsc\b|\bba\b|\bm\.?sc\b|\bma\b/i.test(crt.title)
        );

        if (parsedIntent.domains.includes("ARTS") || parsedIntent.domains.includes("SCIENCE")) {
          if (
            /engineering|technology|dental|physiotherapy|nursing|pharmacy|paramedical|physical education/i.test(nameL) &&
            !/arts|humanities|fine arts|liberal arts/i.test(nameL) &&
            !hasBaBscCourse
          ) {
            return false;
          }
          if (/medical|hospital/i.test(nameL) && !/arts|science/i.test(nameL) && !hasBaBscCourse) {
            return false;
          }
        } else if (parsedIntent.domains.includes("ENGINEERING")) {
          if (/dental|physiotherapy|nursing|pharmacy|b\.ed|physical education/i.test(nameL)) return false;
          if (/medical|hospital/i.test(nameL) && !/engineering|technology/i.test(nameL)) return false;
        } else if (parsedIntent.domains.includes("DENTAL")) {
          if (!nameL.includes("dental")) return false;
        } else if (parsedIntent.domains.includes("PHYSIOTHERAPY")) {
          if (!nameL.includes("physiotherapy")) return false;
        } else if (parsedIntent.domains.includes("MEDICAL")) {
          if (/engineering|technology|dental|physiotherapy/i.test(nameL) && !nameL.includes("medical")) return false;
        } else if (parsedIntent.domains.includes("LAW")) {
          if (!nameL.includes("law") && !nameL.includes("legal") && !nameL.includes("juridical")) return false;
        }
      }

      return true;
    });

    // 4. Deterministic Ranking & Text Relevance Calculation
    const processedResults = filteredColleges.map((c) => {
      let distance: number | null = null;
      let distanceText: string | null = null;

      if (userLat !== null && userLng !== null) {
        const coords = getCollegeCoordinates(c);
        if (coords) {
          distance = calculateHaversineDistance(userLat, userLng, coords.lat, coords.lng);
          distanceText = formatDistance(distance);
        }
      }

      // Multi-Signal Deterministic Best/Ranking Score
      let rankingScore = 0;
      if (c.nirfRank) rankingScore += Math.max(0, 250 - c.nirfRank);
      if (c.naacGrade === "A++") rankingScore += 100;
      else if (c.naacGrade === "A+") rankingScore += 75;
      else if (c.naacGrade === "A") rankingScore += 50;

      rankingScore += (c.rating || 0) * 20;
      if (c.avgPackage) rankingScore += c.avgPackage * 5;
      if (c.isAutonomous) rankingScore += 30;

      // Text Relevance Score when user has typed a search term
      let textMatchScore = 0;
      if (searchInput) {
        const queryLower = searchInput.toLowerCase().trim();
        const nameL = (c.name || "").toLowerCase();
        const shortNameL = (c.shortName || "").toLowerCase();
        const cityL = (c.city || "").toLowerCase();
        const locL = (c.location || "").toLowerCase();
        const distL = (c.district || "").toLowerCase();
        const addrL = (c.address || "").toLowerCase();
        const affilL = (c.affiliatedUniversity || "").toLowerCase();
        const catL = (c.category || "").toLowerCase();
        const catsL = (c.categories || "").toLowerCase();

        if (matchesCollegeSearch(c, searchInput)) {
          textMatchScore += 40000;
        }

        // Exact match on college name or shortName
        if (nameL === queryLower || shortNameL === queryLower) {
          textMatchScore += 100000;
        }
        // Exact city/district match (e.g. searching "Chennai" or "Madurai")
        else if (cityL === queryLower || distL === queryLower || locL === queryLower) {
          textMatchScore += 80000;
        }
        // Prefix match on college name or shortName
        else if (nameL.startsWith(queryLower) || shortNameL.startsWith(queryLower)) {
          textMatchScore += 60000;
        }
        // Word boundary match
        else if (new RegExp(`\\b${queryLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(nameL)) {
          textMatchScore += 40000;
        }
        // Full substring match on college name
        else if (nameL.includes(queryLower)) {
          textMatchScore += 30000;
        }
        else if (shortNameL.includes(queryLower)) {
          textMatchScore += 25000;
        }
        // Substring match on location/city/district/address
        else if (cityL.includes(queryLower) || locL.includes(queryLower) || distL.includes(queryLower) || addrL.includes(queryLower)) {
          textMatchScore += 25000;
        }
        else if (affilL.includes(queryLower)) {
          textMatchScore += 20000;
        }

        // Token matching for multi-word or compound queries
        if (searchTokens.length > 0) {
          let matchedCount = 0;
          searchTokens.forEach((tok) => {
            const hasNameMatch = tok.length <= 2
              ? new RegExp(`\\b${tok.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'i').test(nameL) || shortNameL === tok
              : nameL.includes(tok) || shortNameL.includes(tok);
            const hasLocMatch = cityL.includes(tok) || locL.includes(tok) || distL.includes(tok) || addrL.includes(tok);
            const hasOtherMatch = affilL.includes(tok) || catL.includes(tok) || catsL.includes(tok) ||
              c.courses.some((crt) => (crt.title || "").toLowerCase().includes(tok));

            if (hasNameMatch) {
              textMatchScore += 8000;
              matchedCount++;
            } else if (hasLocMatch) {
              textMatchScore += 6000;
              matchedCount++;
            } else if (hasOtherMatch) {
              textMatchScore += 4000;
              matchedCount++;
            }
          });
          if (matchedCount === searchTokens.length && searchTokens.length > 1) {
            textMatchScore += 20000;
          }
        }
      }

      // Generate "Why This Matches" reasons list
      const matchReasons = generateMatchReasons(c, parsedIntent);

      return {
        ...c,
        distance,
        distanceText,
        rankingScore,
        textMatchScore,
        matchReasons,
      };
    });

    // 5. Apply Radius Filter if explicitly requested
    let finalResults = processedResults;
    if (parsedIntent.radiusKm !== null && parsedIntent.nearbyRequested) {
      finalResults = processedResults.filter((c) => {
        if (c.distance === null) return true;
        return c.distance <= parsedIntent.radiusKm!;
      });
    }

    // 6. When a specific keyword query is made, filter out items that had 0 text relevance
    if (searchInput && searchTokens.length > 0 && parsedIntent.intent === "GENERAL_SEARCH") {
      finalResults = finalResults.filter((c) => (c as any).textMatchScore > 0);
    }

    // 7. Priority Sorting:
    // Text search relevance FIRST, then Distance (if near me requested), then NIRF/NAAC Ranking
    finalResults.sort((a, b) => {
      if (searchInput) {
        const textDiff = ((b as any).textMatchScore || 0) - ((a as any).textMatchScore || 0);
        if (textDiff !== 0) return textDiff;
      }
      if (parsedIntent.nearbyRequested && a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      return b.rankingScore - a.rankingScore;
    });

    return NextResponse.json(finalResults, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Database query failure in /api/colleges:", error?.message || error);
    return NextResponse.json(
      { error: "Search is temporarily unavailable. Please try again.", results: [] },
      { status: 500 }
    );
  }
}
