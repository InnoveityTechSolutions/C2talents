import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Calculates geographic distance in kilometers using the Haversine formula
 */
function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const targetId = decodeURIComponent(id || "").trim();

    if (!targetId) {
      return NextResponse.json({ message: "Invalid college ID" }, { status: 400 });
    }

    // 1. Fetch current target college
    const targetCollege = await db.collegeProfile.findFirst({
      where: {
        OR: [
          { id: targetId },
          { slug: targetId },
          { slug: targetId.toLowerCase() },
          { name: targetId },
        ],
      },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        city: true,
        location: true,
      },
    });

    if (!targetCollege) {
      return NextResponse.json({ message: "College not found" }, { status: 404 });
    }

    const { latitude: tLat, longitude: tLng } = targetCollege;

    // Validate coordinates of current college
    if (
      tLat === null ||
      tLng === null ||
      isNaN(tLat) ||
      isNaN(tLng) ||
      tLat < -90 ||
      tLat > 90 ||
      tLng < -180 ||
      tLng > 180
    ) {
      return NextResponse.json([]);
    }

    // 2. Fetch all other active candidate colleges with valid coordinates
    const candidates = await db.collegeProfile.findMany({
      where: {
        status: { not: "DRAFT" },
        isDeleted: false,
        id: { not: targetCollege.id },
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        name: true,
        shortName: true,
        slug: true,
        location: true,
        city: true,
        state: true,
        latitude: true,
        longitude: true,
        image: true,
        logo: true,
        type: true,
        category: true,
        rating: true,
        naacGrade: true,
        nirfRank: true,
        feesPerYear: true,
      },
    });

    // 3. Filter valid candidate coordinates & calculate Haversine distance
    const collegesWithDistance = candidates
      .filter((c) => {
        return (
          c.latitude !== null &&
          c.longitude !== null &&
          !isNaN(c.latitude) &&
          !isNaN(c.longitude) &&
          c.latitude >= -90 &&
          c.latitude <= 90 &&
          c.longitude >= -180 &&
          c.longitude <= 180
        );
      })
      .map((c) => {
        const distKm = calculateHaversineDistanceKm(
          tLat,
          tLng,
          c.latitude!,
          c.longitude!
        );
        const roundedDist = Math.round(distKm * 10) / 10;
        return {
          id: c.id,
          name: c.name,
          shortName: c.shortName,
          slug: c.slug,
          location: c.location,
          city: c.city || c.location.split(",")[0]?.trim() || "Location",
          state: c.state,
          image: c.image,
          logo: c.logo || c.image,
          type: c.type,
          category: c.category,
          rating: c.rating,
          naacGrade: c.naacGrade,
          nirfRank: c.nirfRank,
          feesPerYear: c.feesPerYear,
          distanceValue: distKm,
          distanceKm: roundedDist,
          distanceText: `${roundedDist} km away`,
        };
      })
      // 4. Sort strictly ascending by distance
      .sort((a, b) => a.distanceValue - b.distanceValue)
      // 5. Limit to top 8 genuinely nearest colleges
      .slice(0, 8);

    return NextResponse.json(collegesWithDistance);
  } catch (error: any) {
    console.error("Failed to calculate nearby colleges:", error);
    return NextResponse.json(
      { message: "Failed to load nearby colleges" },
      { status: 500 }
    );
  }
}
