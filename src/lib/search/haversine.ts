/**
 * Calculate the great-circle distance between two points on the Earth's surface
 * using the Haversine formula.
 *
 * @param lat1 Latitude of point 1 (degrees)
 * @param lon1 Longitude of point 1 (degrees)
 * @param lat2 Latitude of point 2 (degrees)
 * @param lon2 Longitude of point 2 (degrees)
 * @returns Distance in kilometers
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return parseFloat(distance.toFixed(1));
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Format distance in kilometers to human readable secondary label
 * Example: 2.4 -> "2.4 km away", 0.8 -> "800 m away"
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m away`;
  }
  return `${km.toFixed(1)} km away`;
}

// Known City Geocodes for fallback query intent mapping when user mentions city names in distance query
export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  chennai: { lat: 13.0827, lng: 80.2707 },
  coimbatore: { lat: 11.0168, lng: 76.9558 },
  vellore: { lat: 12.9165, lng: 79.1325 },
  madurai: { lat: 9.9252, lng: 78.1198 },
  trichy: { lat: 10.7905, lng: 78.7047 },
  tiruchirappalli: { lat: 10.7905, lng: 78.7047 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  delhi: { lat: 28.6139, lng: 77.2090 },
  noida: { lat: 28.5355, lng: 77.3910 },
  gurugram: { lat: 28.4595, lng: 77.0266 },
  thanjavur: { lat: 10.787, lng: 79.1378 },
  salem: { lat: 11.6643, lng: 78.146 },
  tirunelveli: { lat: 8.7139, lng: 77.7567 },
  erode: { lat: 11.341, lng: 77.7172 },
  kanchipuram: { lat: 12.8342, lng: 79.7036 },
  namakkal: { lat: 11.2189, lng: 78.1674 },
  dindigul: { lat: 10.3673, lng: 77.9803 },
  thoothukudi: { lat: 8.7642, lng: 78.1348 },
  tuticorin: { lat: 8.7642, lng: 78.1348 },
  karur: { lat: 10.9601, lng: 78.0766 },
  pune: { lat: 18.5204, lng: 73.8567 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  thiruvananthapuram: { lat: 8.5241, lng: 76.9366 },
  trivandrum: { lat: 8.5241, lng: 76.9366 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  cochin: { lat: 9.9312, lng: 76.2673 },
};

/**
 * Helper to get latitude & longitude for a college.
 * Uses exact coordinates if set on the record, or falls back to city/location lookup.
 */
export function getCollegeCoordinates(c: {
  latitude?: number | null;
  longitude?: number | null;
  city?: string | null;
  location?: string | null;
  district?: string | null;
  address?: string | null;
}): { lat: number; lng: number } | null {
  if (
    typeof c.latitude === "number" &&
    typeof c.longitude === "number" &&
    !isNaN(c.latitude) &&
    !isNaN(c.longitude) &&
    c.latitude !== 0 &&
    c.longitude !== 0
  ) {
    return { lat: c.latitude, lng: c.longitude };
  }

  const combinedText = `${c.city || ""} ${c.location || ""} ${c.district || ""} ${c.address || ""}`.toLowerCase();
  for (const [cityName, coords] of Object.entries(CITY_COORDINATES)) {
    if (combinedText.includes(cityName)) {
      return coords;
    }
  }

  return null;
}

