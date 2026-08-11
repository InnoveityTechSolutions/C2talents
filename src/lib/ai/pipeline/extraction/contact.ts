import { PipelineData } from "../collection/types";
import { getPagesForCategory } from "../collection/sourceFinder";

function mf(val: any, score = 85) {
  const isValid = val !== null && val !== undefined && val !== "" && !(Array.isArray(val) && val.length === 0);
  return {
    value: isValid ? val : null,
    confidenceScore: isValid ? score : 40,
    confidence: isValid ? "HIGH" : "LOW",
    sourceUrl: isValid ? "Official Website" : "",
    verified: isValid,
    verificationStatus: isValid ? "VERIFIED" : "MANUAL_VERIFICATION_REQUIRED",
    status: isValid ? "Extracted from Official Website" : "Needs Manual Verification",
    warning: isValid ? undefined : "⚠ Please Enter Manually",
  };
}

export const CITY_DISTRICT_MAP: Record<string, { city: string; district: string; state: string }> = {
  "tiruchirappalli": { city: "Tiruchirappalli", district: "Tiruchirappalli", state: "Tamil Nadu" },
  "tiruchirapalli": { city: "Tiruchirappalli", district: "Tiruchirappalli", state: "Tamil Nadu" },
  "trichy": { city: "Tiruchirappalli", district: "Tiruchirappalli", state: "Tamil Nadu" },
  "thuvakudi": { city: "Tiruchirappalli", district: "Tiruchirappalli", state: "Tamil Nadu" },
  "kattur": { city: "Tiruchirappalli", district: "Tiruchirappalli", state: "Tamil Nadu" },

  "madurai": { city: "Madurai", district: "Madurai", state: "Tamil Nadu" },
  "thiruparankundram": { city: "Madurai", district: "Madurai", state: "Tamil Nadu" },

  "chennai": { city: "Chennai", district: "Chennai", state: "Tamil Nadu" },
  "tambaram": { city: "Chennai", district: "Chengalpattu", state: "Tamil Nadu" },
  "chromepet": { city: "Chennai", district: "Chengalpattu", state: "Tamil Nadu" },
  "guindy": { city: "Chennai", district: "Chennai", state: "Tamil Nadu" },
  "chengalpattu": { city: "Chengalpattu", district: "Chengalpattu", state: "Tamil Nadu" },
  "kancheepuram": { city: "Kanchipuram", district: "Kanchipuram", state: "Tamil Nadu" },
  "kanchipuram": { city: "Kanchipuram", district: "Kanchipuram", state: "Tamil Nadu" },
  "sriperumbudur": { city: "Sriperumbudur", district: "Kanchipuram", state: "Tamil Nadu" },

  "coimbatore": { city: "Coimbatore", district: "Coimbatore", state: "Tamil Nadu" },
  "kovai": { city: "Coimbatore", district: "Coimbatore", state: "Tamil Nadu" },
  "peelamedu": { city: "Coimbatore", district: "Coimbatore", state: "Tamil Nadu" },

  "salem": { city: "Salem", district: "Salem", state: "Tamil Nadu" },
  "erode": { city: "Erode", district: "Erode", state: "Tamil Nadu" },
  "tirunelveli": { city: "Tirunelveli", district: "Tirunelveli", state: "Tamil Nadu" },
  "nellai": { city: "Tirunelveli", district: "Tirunelveli", state: "Tamil Nadu" },
  "thoothukudi": { city: "Thoothukudi", district: "Thoothukudi", state: "Tamil Nadu" },
  "tuticorin": { city: "Thoothukudi", district: "Thoothukudi", state: "Tamil Nadu" },
  "vellore": { city: "Vellore", district: "Vellore", state: "Tamil Nadu" },
  "katpadi": { city: "Vellore", district: "Vellore", state: "Tamil Nadu" },
  "thanjavur": { city: "Thanjavur", district: "Thanjavur", state: "Tamil Nadu" },
  "tanjore": { city: "Thanjavur", district: "Thanjavur", state: "Tamil Nadu" },
  "kumbakonam": { city: "Kumbakonam", district: "Thanjavur", state: "Tamil Nadu" },
  "dindigul": { city: "Dindigul", district: "Dindigul", state: "Tamil Nadu" },
  "nagercoil": { city: "Nagercoil", district: "Kanyakumari", state: "Tamil Nadu" },
  "kanyakumari": { city: "Nagercoil", district: "Kanyakumari", state: "Tamil Nadu" },
  "karur": { city: "Karur", district: "Karur", state: "Tamil Nadu" },
  "namakkal": { city: "Namakkal", district: "Namakkal", state: "Tamil Nadu" },
  "pudukkottai": { city: "Pudukkottai", district: "Pudukkottai", state: "Tamil Nadu" },
  "pudukotai": { city: "Pudukkottai", district: "Pudukkottai", state: "Tamil Nadu" },
  "virudhunagar": { city: "Virudhunagar", district: "Virudhunagar", state: "Tamil Nadu" },
  "sivakasi": { city: "Sivakasi", district: "Virudhunagar", state: "Tamil Nadu" },
  "cuddalore": { city: "Cuddalore", district: "Cuddalore", state: "Tamil Nadu" },
  "villupuram": { city: "Villupuram", district: "Villupuram", state: "Tamil Nadu" },
  "tiruvannamalai": { city: "Tiruvannamalai", district: "Tiruvannamalai", state: "Tamil Nadu" },
  "hosur": { city: "Hosur", district: "Krishnagiri", state: "Tamil Nadu" },
  "krishnagiri": { city: "Krishnagiri", district: "Krishnagiri", state: "Tamil Nadu" },
  "dharmapuri": { city: "Dharmapuri", district: "Dharmapuri", state: "Tamil Nadu" },
  "tiruppur": { city: "Tiruppur", district: "Tiruppur", state: "Tamil Nadu" },
  "nagapattinam": { city: "Nagapattinam", district: "Nagapattinam", state: "Tamil Nadu" },
  "perambalur": { city: "Perambalur", district: "Perambalur", state: "Tamil Nadu" },
  "ariyalur": { city: "Ariyalur", district: "Ariyalur", state: "Tamil Nadu" },
  "ramanathapuram": { city: "Ramanathapuram", district: "Ramanathapuram", state: "Tamil Nadu" },
  "karaikudi": { city: "Karaikudi", district: "Sivagangai", state: "Tamil Nadu" },
  "sivagangai": { city: "Sivagangai", district: "Sivagangai", state: "Tamil Nadu" },
  "puducherry": { city: "Puducherry", district: "Puducherry", state: "Puducherry" },
  "pondicherry": { city: "Puducherry", district: "Puducherry", state: "Puducherry" },
  
  "bengaluru": { city: "Bengaluru", district: "Bengaluru", state: "Karnataka" },
  "bangalore": { city: "Bengaluru", district: "Bengaluru", state: "Karnataka" },
  "hyderabad": { city: "Hyderabad", district: "Hyderabad", state: "Telangana" },
  "kochi": { city: "Kochi", district: "Ernakulam", state: "Kerala" },
  "cochin": { city: "Kochi", district: "Ernakulam", state: "Kerala" },
  "trivandrum": { city: "Thiruvananthapuram", district: "Thiruvananthapuram", state: "Kerala" },
  "thiruvananthapuram": { city: "Thiruvananthapuram", district: "Thiruvananthapuram", state: "Kerala" }
};

export function extractContactInfo(data: PipelineData) {
  const contactPages = getPagesForCategory(data.visitedPages, ["CONTACT", "GENERAL", "HOMEPAGE"]);
  const contactText = contactPages.map(p => p.text).join("\n");
  const fullWebsiteText = data.crawledContentSummaryText;

  let extractedEmail: string | null = null;
  let extractedPhone: string | null = null;
  let extractedMobile: string | null = null;
  let extractedAddress: string | null = null;
  let extractedPincode: string | null = null;
  let extractedCity: string | null = null;
  let extractedDistrict: string | null = null;
  let extractedState: string | null = null;
  let extractedLandmark: string | null = null;
  let extractedMapUrl: string | null = null;
  let lat: number | null = null;
  let lng: number | null = null;

  // 1. JSON-LD Extraction for PostalAddress & ContactPoint & Geo
  for (const page of data.visitedPages) {
    if (page.jsonLdData) {
      for (const item of page.jsonLdData) {
        if (item) {
          if (item.email && typeof item.email === "string" && !extractedEmail) {
            extractedEmail = item.email.trim();
          }
          if (item.telephone && typeof item.telephone === "string" && !extractedPhone) {
            extractedPhone = item.telephone.trim();
          }
          if (item.address) {
            if (typeof item.address === "string" && !extractedAddress) {
              extractedAddress = item.address.trim();
            } else if (typeof item.address === "object") {
              const parts = [
                item.address.streetAddress,
                item.address.addressLocality,
                item.address.addressRegion,
                item.address.postalCode,
                item.address.addressCountry
              ].filter(Boolean);
              if (parts.length > 0 && !extractedAddress) {
                extractedAddress = parts.join(", ");
              }
              if (item.address.postalCode && !extractedPincode) {
                extractedPincode = String(item.address.postalCode).trim();
              }
              if (item.address.addressLocality && !extractedCity) {
                const loc = String(item.address.addressLocality).toLowerCase().trim();
                if (CITY_DISTRICT_MAP[loc]) {
                  extractedCity = CITY_DISTRICT_MAP[loc].city;
                  extractedDistrict = CITY_DISTRICT_MAP[loc].district;
                  extractedState = CITY_DISTRICT_MAP[loc].state;
                }
              }
            }
          }
          if (item.geo && typeof item.geo === "object") {
            if (item.geo.latitude) lat = parseFloat(item.geo.latitude);
            if (item.geo.longitude) lng = parseFloat(item.geo.longitude);
          }
        }
      }
    }
  }

  let extractedFacebook: string | null = null;
  let extractedInstagram: string | null = null;
  let extractedLinkedin: string | null = null;
  let extractedYoutube: string | null = null;

  // Search ALL visited pages for rawHtml & text inspection
  const pagesToInspect = data.visitedPages;

  // 2. HTML Inspection: mailto, tel, google map, and social media links across pages
  for (const page of pagesToInspect) {
    const raw = page.rawHtml || "";
    const txt = page.text || "";

    // mailto:
    if (!extractedEmail) {
      const mailtoMatch = raw.match(/href=["']mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})["']/i);
      if (mailtoMatch) extractedEmail = mailtoMatch[1].trim();
    }

    // tel:
    if (!extractedPhone) {
      const telMatch = raw.match(/href=["']tel:([\+\d\s\-]+)["']/i);
      if (telMatch) {
        const rawTel = telMatch[1].replace(/[^\d+]/g, "");
        if (rawTel.length >= 8) extractedPhone = telMatch[1].trim();
      }
    }

    // google map iframe / link
    if (!extractedMapUrl) {
      const mapMatch = raw.match(/(?:href|src)=["'](https?:\/\/(?:www\.)?(?:google\.com\/maps|maps\.google\.com|goo\.gl\/maps|maps\.app\.goo\.gl)[^"']+)["']/i);
      if (mapMatch) extractedMapUrl = mapMatch[1].trim();
    }

    // Social Media Links
    if (!extractedFacebook) {
      const fbMatch = raw.match(/href=["'](https?:\/\/(?:www\.)?facebook\.com\/[^"']+)["']/i);
      if (fbMatch && !/sharer|intent|dialog/i.test(fbMatch[1])) extractedFacebook = fbMatch[1].trim();
    }
    if (!extractedInstagram) {
      const instaMatch = raw.match(/href=["'](https?:\/\/(?:www\.)?instagram\.com\/[^"']+)["']/i);
      if (instaMatch) extractedInstagram = instaMatch[1].trim();
    }
    if (!extractedLinkedin) {
      const linMatch = raw.match(/href=["'](https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/[^"']+)["']/i);
      if (linMatch && !/shareArticle/i.test(linMatch[1])) extractedLinkedin = linMatch[1].trim();
    }
    if (!extractedYoutube) {
      const ytMatch = raw.match(/href=["'](https?:\/\/(?:www\.)?youtube\.com\/(?:user|channel|c|@)[^"']+)["']/i);
      if (ytMatch) extractedYoutube = ytMatch[1].trim();
    }
  }

  // 3. Fallback Email via Regex from Contact Text & Full Website Text
  if (!extractedEmail) {
    const emailMatch = contactText.match(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/i) || fullWebsiteText.match(/\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/i);
    if (emailMatch && !/example|domain|sample|user@|email@|noreply/i.test(emailMatch[1])) {
      extractedEmail = emailMatch[1].trim();
    }
  }

  // 4. Fallback Phone & Mobile via Regex from Contact Text & Full Website Text
  const phoneText = `${contactText}\n${fullWebsiteText}`;
  const phoneMatches = Array.from(phoneText.matchAll(/(?:\+?91[\s-]?)?(?:0\d{2,4}[\s-]?)?[2-9]\d{6,9}/g)).map(m => m[0].trim());
  if (!extractedPhone && phoneMatches.length > 0) {
    extractedPhone = phoneMatches[0];
  }
  if (!extractedMobile && phoneMatches.length > 1) {
    extractedMobile = phoneMatches[1];
  }

  // 5. Fallback Pincode via Regex (6-digit postal code starting with 1-8)
  if (!extractedPincode) {
    const pinMatch = contactText.match(/\b([1-8]\d{5})\b/) || fullWebsiteText.match(/\b([1-8]\d{5})\b/);
    if (pinMatch) extractedPincode = pinMatch[1];
  }

  // 6. Address Extraction from Contact Text / Pincode neighborhood
  if (!extractedAddress) {
    const addrMatch = contactText.match(/(?:address|location|reach us|contact us)[\s\-:]+([\s\S]{15,180}?)(?:\.\s|\n\n|$)/i) || fullWebsiteText.match(/(?:address|location|reach us|contact us)[\s\-:]+([\s\S]{15,180}?)(?:\.\s|\n\n|$)/i);
    if (addrMatch) {
      extractedAddress = addrMatch[1].replace(/[\s\n]+/g, " ").trim();
    } else if (extractedPincode) {
      const searchTarget = contactText.includes(extractedPincode) ? contactText : fullWebsiteText;
      const pIdx = searchTarget.indexOf(extractedPincode);
      if (pIdx !== -1) {
        const start = Math.max(0, pIdx - 100);
        const end = Math.min(searchTarget.length, pIdx + 20);
        extractedAddress = searchTarget.slice(start, end).replace(/[\s\n]+/g, " ").trim();
      }
    }
  }

  // Clean raw address string (remove UI symbols like  or repetitive site headers)
  if (extractedAddress) {
    extractedAddress = extractedAddress
      .replace(/[^\x20-\x7E,.\-\/()]/g, " ") // remove unicode icons
      .replace(/^(?:\||contact us|address)+/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // 7. Strict City & District Matching from Address or Contact Text
  const textForCity = `${extractedAddress || ""} ${contactText} ${fullWebsiteText}`.toLowerCase();
  for (const [key, info] of Object.entries(CITY_DISTRICT_MAP)) {
    const regex = new RegExp(`\\b${key}\\b`, "i");
    if (regex.test(textForCity)) {
      extractedCity = info.city;
      extractedDistrict = info.district;
      extractedState = info.state;
      break;
    }
  }

  // 8. Landmark Extraction from Address text
  if (extractedAddress) {
    const lmMatch = extractedAddress.match(/(?:near|opposite|opp\.?|next to|behind|adjacent to|on)\s+([A-Za-z0-9\s,&'-]{4,40}?)(?:,|\.|$)/i);
    if (lmMatch) {
      extractedLandmark = lmMatch[0].trim();
    }
  }

  // 9. Extract GPS Coordinates from Map URL
  if (extractedMapUrl && (!lat || !lng)) {
    const coordMatch = extractedMapUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ||
                       extractedMapUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) ||
                       extractedMapUrl.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/) ||
                       extractedMapUrl.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      lat = parseFloat(coordMatch[1]);
      lng = parseFloat(coordMatch[2]);
    }
  }

  return {
    phone: mf(extractedPhone, extractedPhone ? 90 : 40),
    mobile: mf(extractedMobile, extractedMobile ? 85 : 40),
    email: mf(extractedEmail, extractedEmail ? 90 : 40),
    pincode: mf(extractedPincode, extractedPincode ? 85 : 40),
    address: mf(extractedAddress, extractedAddress ? 80 : 40),
    city: mf(extractedCity, extractedCity ? 85 : 40),
    district: mf(extractedDistrict, extractedDistrict ? 80 : 40),
    state: mf(extractedState, extractedState ? 85 : 40),
    landmark: mf(extractedLandmark, extractedLandmark ? 75 : 40),
    area: mf(extractedCity, extractedCity ? 70 : 40),
    latitude: mf(lat, lat ? 90 : 40),
    longitude: mf(lng, lng ? 90 : 40),
    googleMapUrl: mf(extractedMapUrl, extractedMapUrl ? 90 : 40),
    facebook: mf(extractedFacebook, extractedFacebook ? 90 : 40),
    instagram: mf(extractedInstagram, extractedInstagram ? 90 : 40),
    linkedin: mf(extractedLinkedin, extractedLinkedin ? 90 : 40),
    youtube: mf(extractedYoutube, extractedYoutube ? 90 : 40),
  };
}

