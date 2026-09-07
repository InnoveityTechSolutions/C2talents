import { db } from "../src/lib/db";

interface LocationRule {
  matchKeywords: string[];
  city: string;
  location: string;
  lat: number;
  lng: number;
}

const LOCATION_RULES: LocationRule[] = [
  // COIMBATORE
  { matchKeywords: ["kumaraguru", "kct"], city: "Coimbatore", location: "Saravanampatti, Coimbatore", lat: 11.0789, lng: 76.9890 },
  { matchKeywords: ["psg college", "psg institute"], city: "Coimbatore", location: "Peelamedu, Coimbatore", lat: 11.0247, lng: 77.0027 },
  { matchKeywords: ["coimbatore institute of technology", "cit"], city: "Coimbatore", location: "Civil Aerodrome Post, Coimbatore", lat: 11.0289, lng: 77.0270 },
  { matchKeywords: ["govt college of technology", "gct"], city: "Coimbatore", location: "Thadagam Road, Coimbatore", lat: 11.0172, lng: 76.9363 },
  { matchKeywords: ["sri krishna college", "skcet"], city: "Coimbatore", location: "Kuniamuthur, Coimbatore", lat: 10.9378, lng: 76.9567 },
  { matchKeywords: ["coimbatore"], city: "Coimbatore", location: "Coimbatore, Tamil Nadu", lat: 11.0168, lng: 76.9558 },

  // TRICHY (TIRUCHIRAPPALLI)
  { matchKeywords: ["nit trichy", "national institute of technology tiruchirappalli", "national institute of technology trichy"], city: "Trichy", location: "Thuvakudi, Trichy", lat: 10.7601, lng: 78.8147 },
  { matchKeywords: ["thiagarajar polytechnic", "bishop heber"], city: "Trichy", location: "Puthur, Trichy", lat: 10.8215, lng: 78.6830 },
  { matchKeywords: ["st josephs college trichy"], city: "Trichy", location: "Teppakulam, Trichy", lat: 10.8290, lng: 78.6934 },
  { matchKeywords: ["holy cross college trichy"], city: "Trichy", location: "Teppakulam, Trichy", lat: 10.8275, lng: 78.6970 },
  { matchKeywords: ["jamal mohamed college"], city: "Trichy", location: "TVK Nagar, Trichy", lat: 10.7932, lng: 78.6894 },
  { matchKeywords: ["trichy", "tiruchirappalli"], city: "Trichy", location: "Tiruchirappalli, Tamil Nadu", lat: 10.7905, lng: 78.7047 },

  // MADURAI
  { matchKeywords: ["thiagarajar college of engineering", "tce"], city: "Madurai", location: "Thiruparankundram, Madurai", lat: 9.8821, lng: 78.0815 },
  { matchKeywords: ["thiagarajar college madurai"], city: "Madurai", location: "Teppakulam, Madurai", lat: 9.9125, lng: 78.1488 },
  { matchKeywords: ["american college"], city: "Madurai", location: "Tallakulam, Madurai", lat: 9.9252, lng: 78.1198 },
  { matchKeywords: ["madurai kamaraj university"], city: "Madurai", location: "Palkalai Nagar, Madurai", lat: 9.9463, lng: 78.0125 },
  { matchKeywords: ["madurai"], city: "Madurai", location: "Madurai, Tamil Nadu", lat: 9.9252, lng: 78.1198 },

  // THANJAVUR
  { matchKeywords: ["sastra"], city: "Thanjavur", location: "Thirumalaisamudram, Thanjavur", lat: 10.7281, lng: 79.0533 },
  { matchKeywords: ["thanjavur medical college"], city: "Thanjavur", location: "Medical College Road, Thanjavur", lat: 10.7760, lng: 79.1250 },
  { matchKeywords: ["thanjavur"], city: "Thanjavur", location: "Thanjavur, Tamil Nadu", lat: 10.7870, lng: 79.1378 },

  // VELLORE
  { matchKeywords: ["vit vellore", "vellore institute of technology"], city: "Vellore", location: "Katpadi, Vellore", lat: 12.9692, lng: 79.1559 },
  { matchKeywords: ["christian medical college", "cmc vellore"], city: "Vellore", location: "Bagayam, Vellore", lat: 12.8715, lng: 79.1312 },
  { matchKeywords: ["vellore"], city: "Vellore", location: "Vellore, Tamil Nadu", lat: 12.9165, lng: 79.1325 },

  // TIRUNELVELI
  { matchKeywords: ["tirunelveli medical college"], city: "Tirunelveli", location: "High Ground, Tirunelveli", lat: 8.7139, lng: 77.7567 },
  { matchKeywords: ["manonmaniam sundaranar university"], city: "Tirunelveli", location: "Abishekapatti, Tirunelveli", lat: 8.7302, lng: 77.6415 },
  { matchKeywords: ["tirunelveli"], city: "Tirunelveli", location: "Tirunelveli, Tamil Nadu", lat: 8.7139, lng: 77.7567 },

  // SALEM
  { matchKeywords: ["sona college"], city: "Salem", location: "Suramangalam, Salem", lat: 11.6781, lng: 78.1256 },
  { matchKeywords: ["govt college of engineering salem"], city: "Salem", location: "Karuppur, Salem", lat: 11.7135, lng: 78.1095 },
  { matchKeywords: ["salem"], city: "Salem", location: "Salem, Tamil Nadu", lat: 11.6643, lng: 78.1460 },

  // ERODE & NAMAKKAL
  { matchKeywords: ["kongu engineering college"], city: "Perundurai", location: "Perundurai, Erode", lat: 11.2743, lng: 77.6070 },
  { matchKeywords: ["bannari amman"], city: "Sathyamangalam", location: "Sathyamangalam, Erode", lat: 11.5034, lng: 77.2435 },
  { matchKeywords: ["ksr", "rangasamy"], city: "Tiruchengode", location: "Tiruchengode, Namakkal", lat: 11.3601, lng: 77.8967 },
  { matchKeywords: ["erode"], city: "Erode", location: "Erode, Tamil Nadu", lat: 11.3410, lng: 77.7172 },
  { matchKeywords: ["namakkal"], city: "Namakkal", location: "Namakkal, Tamil Nadu", lat: 11.2189, lng: 78.1674 },

  // CHIDAMBARAM & CUDDALORE
  { matchKeywords: ["annamalai university"], city: "Chidambaram", location: "Annamalai Nagar, Chidambaram", lat: 11.3912, lng: 79.7145 },
  { matchKeywords: ["chidambaram"], city: "Chidambaram", location: "Chidambaram, Cuddalore", lat: 11.3912, lng: 79.7145 },

  // KARAIKUDI & SIVAGANGAI
  { matchKeywords: ["alagappa university"], city: "Karaikudi", location: "Alagappa Puram, Karaikudi", lat: 10.0763, lng: 78.7845 },
  { matchKeywords: ["karaikudi"], city: "Karaikudi", location: "Karaikudi, Sivagangai", lat: 10.0763, lng: 78.7845 },

  // VIRUDHUNAGAR & SIVAKASI
  { matchKeywords: ["mepco"], city: "Sivakasi", location: "Sivakasi, Virudhunagar", lat: 9.4891, lng: 77.8285 },
  { matchKeywords: ["kamaraj college of engineering"], city: "Virudhunagar", location: "Virudhunagar, Tamil Nadu", lat: 9.6015, lng: 77.9482 },

  // CHENNAI & SUBURBS
  { matchKeywords: ["iit madras", "indian institute of technology madras"], city: "Chennai", location: "Adyar, Chennai", lat: 12.9915, lng: 80.2337 },
  { matchKeywords: ["anna university act campus"], city: "Chennai", location: "Guindy, Chennai", lat: 13.0102, lng: 80.2355 },
  { matchKeywords: ["anna university ceg campus"], city: "Chennai", location: "Guindy, Chennai", lat: 13.0108, lng: 80.2356 },
  { matchKeywords: ["anna university sap campus"], city: "Chennai", location: "Guindy, Chennai", lat: 13.0105, lng: 80.2354 },
  { matchKeywords: ["anna university mit campus"], city: "Chennai", location: "Chromepet, Chennai", lat: 12.9481, lng: 80.1398 },
  { matchKeywords: ["loyola"], city: "Chennai", location: "Nungambakkam, Chennai", lat: 13.0624, lng: 80.2343 },
  { matchKeywords: ["madras christian college", "mcc"], city: "Chennai", location: "Tambaram, Chennai", lat: 12.9224, lng: 80.1232 },
  { matchKeywords: ["srm institute", "srm university", "srm valliammai", "srm college"], city: "Kattankulathur", location: "Kattankulathur, Chengalpattu", lat: 12.8231, lng: 80.0444 },
  { matchKeywords: ["ssn college", "sivasubramaniya nadar"], city: "Chennai", location: "Kalavakkam, OMR, Chennai", lat: 12.7513, lng: 80.1970 },
  { matchKeywords: ["sathyabama"], city: "Chennai", location: "Sholinganallur, OMR, Chennai", lat: 12.8718, lng: 80.2208 },
  { matchKeywords: ["hindustan institute", "hindustan college"], city: "Chennai", location: "Padur, OMR, Chennai", lat: 12.7937, lng: 80.2223 },
  { matchKeywords: ["sairam", "sai ram"], city: "Chennai", location: "West Tambaram, Chennai", lat: 12.9602, lng: 80.0558 },
  { matchKeywords: ["saveetha"], city: "Chennai", location: "Thandalam, Chennai", lat: 13.0280, lng: 80.0175 },
  { matchKeywords: ["rajalakshmi"], city: "Chennai", location: "Thandalam, Chennai", lat: 13.0084, lng: 79.9702 },
  { matchKeywords: ["svce", "venkateswara college of engineering"], city: "Sriperumbudur", location: "Sriperumbudur, Kanchipuram", lat: 12.9890, lng: 79.9715 },
  { matchKeywords: ["panimalar"], city: "Chennai", location: "Poonamallee, Chennai", lat: 13.0482, lng: 80.0545 },
  { matchKeywords: ["kcg college"], city: "Chennai", location: "Karapakkam, OMR, Chennai", lat: 12.9234, lng: 80.2312 },
  { matchKeywords: ["easwari"], city: "Chennai", location: "Ramapuram, Chennai", lat: 13.0324, lng: 80.1795 },
  { matchKeywords: ["ramachandra"], city: "Chennai", location: "Porur, Chennai", lat: 13.0361, lng: 80.1412 },
  { matchKeywords: ["vels university", "vels college"], city: "Chennai", location: "Pallavaram, Chennai", lat: 12.9610, lng: 80.1620 },
  { matchKeywords: ["presidency college"], city: "Chennai", location: "Chepauk, Chennai", lat: 13.0594, lng: 80.2828 },
  { matchKeywords: ["madras medical college", "mmc"], city: "Chennai", location: "Park Town, Chennai", lat: 13.0812, lng: 80.2785 },
  { matchKeywords: ["stanley medical college"], city: "Chennai", location: "Royapuram, Chennai", lat: 13.1044, lng: 80.2863 },
  { matchKeywords: ["kilpauk medical college"], city: "Chennai", location: "Kilpauk, Chennai", lat: 13.0784, lng: 80.2443 },
  { matchKeywords: ["ethiraj"], city: "Chennai", location: "Egmore, Chennai", lat: 13.0645, lng: 80.2586 },
  { matchKeywords: ["stella maris"], city: "Chennai", location: "Cathedral Road, Chennai", lat: 13.0470, lng: 80.2530 },
  { matchKeywords: ["womens christian college"], city: "Chennai", location: "Nungambakkam, Chennai", lat: 13.0617, lng: 80.2445 },
  { matchKeywords: ["dr mgr"], city: "Chennai", location: "Maduravoyal, Chennai", lat: 13.0674, lng: 80.1654 },
  { matchKeywords: ["meenakshi college of physiotherapy", "meenakshi university"], city: "Chennai", location: "Kanchipuram Road, Chennai", lat: 13.0360, lng: 80.1802 },

  // OTHER TN CITIES
  { matchKeywords: ["kanchipuram", "kancheepuram"], city: "Kanchipuram", location: "Kanchipuram, Tamil Nadu", lat: 12.8342, lng: 79.7036 },
  { matchKeywords: ["dindigul"], city: "Dindigul", location: "Dindigul, Tamil Nadu", lat: 10.3673, lng: 77.9803 },
  { matchKeywords: ["kanyakumari", "nagercoil"], city: "Nagercoil", location: "Nagercoil, Kanyakumari", lat: 8.1833, lng: 77.4119 },
  { matchKeywords: ["pondicherry", "puducherry"], city: "Puducherry", location: "Puducherry, UT", lat: 11.9416, lng: 79.8083 },
  { matchKeywords: ["hosur"], city: "Hosur", location: "Hosur, Krishnagiri", lat: 12.7409, lng: 77.8253 },

  // OTHER METROS
  { matchKeywords: ["iisc bangalore", "iim bangalore", "bangalore", "bengaluru"], city: "Bengaluru", location: "Bengaluru, Karnataka", lat: 12.9716, lng: 77.5946 },
  { matchKeywords: ["iit bombay", "mumbai"], city: "Mumbai", location: "Mumbai, Maharashtra", lat: 19.0760, lng: 72.8777 },
  { matchKeywords: ["delhi"], city: "Delhi", location: "New Delhi, Delhi", lat: 28.6139, lng: 77.2090 },
  { matchKeywords: ["pune"], city: "Pune", location: "Pune, Maharashtra", lat: 18.5204, lng: 73.8567 },
  { matchKeywords: ["hyderabad"], city: "Hyderabad", location: "Hyderabad, Telangana", lat: 17.3850, lng: 78.4867 },
  { matchKeywords: ["kolkata"], city: "Kolkata", location: "Kolkata, West Bengal", lat: 22.5726, lng: 88.3639 },
];

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

async function main() {
  console.log("📍 Reseeding highly accurate locations and coordinates with strict alphanumeric normalization...");

  const colleges = await db.collegeProfile.findMany({
    select: {
      id: true,
      name: true,
      location: true,
      city: true,
      address: true,
    },
  });

  let updatedCount = 0;

  for (const c of colleges) {
    const rawSearchText = `${c.name} ${c.location || ""} ${c.city || ""} ${c.address || ""}`;
    const cleanSearchText = normalizeText(rawSearchText);

    // Find rule match
    let matchedRule = LOCATION_RULES.find((rule) =>
      rule.matchKeywords.some((kw) => cleanSearchText.includes(normalizeText(kw)))
    );

    let targetCity = "Chennai";
    let targetLocation = "Chennai, Tamil Nadu";
    let targetLat = 13.0827;
    let targetLng = 80.2707;

    if (matchedRule) {
      targetCity = matchedRule.city;
      targetLocation = matchedRule.location;
      targetLat = matchedRule.lat;
      targetLng = matchedRule.lng;
    } else {
      // General fallback based on generic words in full search text
      if (cleanSearchText.includes("coimbatore")) {
        targetCity = "Coimbatore";
        targetLocation = "Coimbatore, Tamil Nadu";
        targetLat = 11.0168;
        targetLng = 76.9558;
      } else if (cleanSearchText.includes("trichy") || cleanSearchText.includes("tiruchirappalli")) {
        targetCity = "Trichy";
        targetLocation = "Tiruchirappalli, Tamil Nadu";
        targetLat = 10.7905;
        targetLng = 78.7047;
      } else if (cleanSearchText.includes("madurai")) {
        targetCity = "Madurai";
        targetLocation = "Madurai, Tamil Nadu";
        targetLat = 9.9252;
        targetLng = 78.1198;
      } else if (cleanSearchText.includes("thanjavur")) {
        targetCity = "Thanjavur";
        targetLocation = "Thanjavur, Tamil Nadu";
        targetLat = 10.7870;
        targetLng = 79.1378;
      } else if (cleanSearchText.includes("vellore")) {
        targetCity = "Vellore";
        targetLocation = "Vellore, Tamil Nadu";
        targetLat = 12.9165;
        targetLng = 79.1325;
      } else if (cleanSearchText.includes("tirunelveli")) {
        targetCity = "Tirunelveli";
        targetLocation = "Tirunelveli, Tamil Nadu";
        targetLat = 8.7139;
        targetLng = 77.7567;
      } else if (cleanSearchText.includes("salem")) {
        targetCity = "Salem";
        targetLocation = "Salem, Tamil Nadu";
        targetLat = 11.6643;
        targetLng = 78.1460;
      } else if (cleanSearchText.includes("erode")) {
        targetCity = "Erode";
        targetLocation = "Erode, Tamil Nadu";
        targetLat = 11.3410;
        targetLng = 77.7172;
      }
    }

    // Add tiny deterministic micro-offset so colleges in same suburb don't have identical 0.00km distance
    const h = hashString(c.id);
    const latOffset = (((h % 40) - 20) / 1000) * 0.08;
    const lngOffset = ((((h >> 2) % 40) - 20) / 1000) * 0.08;

    const finalLat = parseFloat((targetLat + latOffset).toFixed(6));
    const finalLng = parseFloat((targetLng + lngOffset).toFixed(6));

    await db.collegeProfile.update({
      where: { id: c.id },
      data: {
        city: targetCity,
        location: targetLocation,
        latitude: finalLat,
        longitude: finalLng,
      },
    });

    updatedCount++;
  }

  console.log(`✅ Updated accurate cities, locations, and coordinates for ${updatedCount} / ${colleges.length} colleges!`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error reseeding accurate coordinates:", err);
    process.exit(1);
  });
