import { db } from "../src/lib/db";

// City default coordinates
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  mumbai: { lat: 19.0760, lng: 72.8777 },
  powai: { lat: 19.1200, lng: 72.9050 },
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
  thanjavur: { lat: 10.7870, lng: 79.1378 },
  salem: { lat: 11.6643, lng: 78.1460 },
  tirunelveli: { lat: 8.7139, lng: 77.7567 },
  erode: { lat: 11.3410, lng: 77.7172 },
  pune: { lat: 18.5204, lng: 73.8567 },
  hyderabad: { lat: 17.3850, lng: 78.4867 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  cambridge: { lat: 42.3736, lng: -71.1097 },
  boston: { lat: 42.3601, lng: -71.0589 },
  stanford: { lat: 37.4275, lng: -122.1697 },
  oxford: { lat: 51.7520, lng: -1.2577 },
  london: { lat: 51.5074, lng: -0.1278 },
};

// Known famous college exact coordinates
const SPECIFIC_COLLEGE_COORDS: Record<string, { lat: number; lng: number }> = {
  "iit bombay": { lat: 19.1334, lng: 72.9133 },
  "institute of chemical technology": { lat: 19.0222, lng: 72.8561 },
  "ict mumbai": { lat: 19.0222, lng: 72.8561 },
  "mumbai university": { lat: 19.0728, lng: 72.8552 },
  "university of mumbai": { lat: 19.0728, lng: 72.8552 },
  "nmims": { lat: 19.1032, lng: 72.8373 },
  "sp jain": { lat: 19.1234, lng: 72.8361 },
  "tifr": { lat: 18.9070, lng: 72.8123 },
  "tata institute of fundamental research": { lat: 18.9070, lng: 72.8123 },
  "iim mumbai": { lat: 19.1342, lng: 72.9056 },
  "anna university": { lat: 13.0102, lng: 80.2355 },
  "iit madras": { lat: 12.9915, lng: 80.2337 },
  "loyola college": { lat: 13.0624, lng: 80.2343 },
  "madras christian college": { lat: 12.9224, lng: 80.1232 },
  "srm institute": { lat: 12.8231, lng: 80.0444 },
  "ssn college": { lat: 12.7513, lng: 80.1970 },
  "vit vellore": { lat: 12.9692, lng: 79.1559 },
  "psg college": { lat: 11.0247, lng: 77.0027 },
  "coimbatore institute of technology": { lat: 11.0289, lng: 77.0270 },
  "nit trichy": { lat: 10.7601, lng: 78.8147 },
  "thiagarajar college of engineering": { lat: 9.8821, lng: 78.0815 },
  "iisc bangalore": { lat: 13.0184, lng: 77.5671 },
  "iim bangalore": { lat: 12.8948, lng: 77.6015 },
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

async function main() {
  console.log("📍 Seeding latitude and longitude coordinates for all colleges...");

  const colleges = await db.collegeProfile.findMany({
    select: { id: true, name: true, location: true, city: true, latitude: true, longitude: true },
  });

  let updatedCount = 0;

  for (const c of colleges) {
    const nameLower = c.name.toLowerCase();
    const locLower = (c.location || "").toLowerCase();
    const cityLower = (c.city || "").toLowerCase();

    // Check specific match
    let match = Object.entries(SPECIFIC_COLLEGE_COORDS).find(([key]) => nameLower.includes(key));
    let targetLat: number | null = null;
    let targetLng: number | null = null;

    if (match) {
      targetLat = match[1].lat;
      targetLng = match[1].lng;
    } else {
      // Find city match
      let cityMatch = Object.entries(CITY_COORDS).find(([cityKey]) =>
        cityLower.includes(cityKey) || locLower.includes(cityKey) || nameLower.includes(cityKey)
      );

      if (!cityMatch) {
        // Default to Chennai base if Tamil Nadu or unknown
        cityMatch = ["chennai", CITY_COORDS.chennai];
      }

      const base = cityMatch[1];
      const h = hashString(c.id);
      // Small offset within 0.01 to 0.08 degrees (~1km to 8km within city)
      const latOffset = (((h % 100) - 50) / 1000) * 0.15;
      const lngOffset = ((((h >> 3) % 100) - 50) / 1000) * 0.15;

      targetLat = parseFloat((base.lat + latOffset).toFixed(6));
      targetLng = parseFloat((base.lng + lngOffset).toFixed(6));
    }

    if (c.latitude !== targetLat || c.longitude !== targetLng) {
      await db.collegeProfile.update({
        where: { id: c.id },
        data: {
          latitude: targetLat,
          longitude: targetLng,
        },
      });
      updatedCount++;
    }
  }

  console.log(`✅ Successfully updated coordinates for ${updatedCount} colleges out of ${colleges.length}!`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Failed to seed coordinates:", e);
    process.exit(1);
  });
