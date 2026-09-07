import { GoogleGenerativeAI } from "@google/generative-ai";

export type DomainType =
  | "ARTS"
  | "SCIENCE"
  | "ENGINEERING"
  | "MEDICAL"
  | "DENTAL"
  | "PHYSIOTHERAPY"
  | "LAW"
  | "COMMERCE"
  | "MANAGEMENT"
  | "PHARMACY"
  | "NURSING"
  | "POLYTECHNIC";

export type SearchScope = "COLLEGES" | "COURSES" | "SCHOLARSHIPS" | "NEWS" | "GLOBAL" | "COMPARISON";

export interface StructuredSearchIntent {
  query: string;
  normalizedQuery: string;
  intent: "BEST_NEARBY" | "NEARBY" | "BEST" | "GENERAL_SEARCH" | "COMPARE";
  targetScope: SearchScope;
  domains: DomainType[];
  courses: string[];
  location: string | null;
  locationRequired: boolean;
  latitude: number | null;
  longitude: number | null;
  radiusKm: number | null;
  ownership: "Government" | "Private" | "Autonomous" | "Aided" | "Deemed" | null;
  naacGrade: string | null; // "A++", "A+", "A", "ANY"
  maxFees: number | null;
  hasHostel: boolean;
  hasGoodPlacements: boolean;
  compareColleges: string[];
  rankingRequested: boolean;
  nearbyRequested: boolean;
  sort: "DISTANCE" | "RANKING" | "DISTANCE_AND_RANKING" | "RELEVANCE";
  confidence: number;
}

const KNOWN_CITIES = [
  "chennai",
  "coimbatore",
  "madurai",
  "trichy",
  "tiruchirappalli",
  "theni",
  "vellore",
  "bangalore",
  "bengaluru",
  "tamil nadu",
  "delhi",
  "mumbai",
  "salem",
  "erode",
  "tirunelveli",
  "thanjavur",
  "kanchipuram",
  "pune",
  "hyderabad",
  "kolkata",
  "noida",
  "gurugram",
  "dindigul",
  "karur",
  "namakkal",
  "dharmapuri",
  "krishnagiri",
  "tiruppur",
  "nilgiris",
  "ooty",
  "cuddalore",
  "villupuram",
  "nagapattinam",
  "pudukkottai",
  "ramanathapuram",
  "sivaganga",
  "virudhunagar",
  "thoothukudi",
  "tuticorin",
  "kanyakumari",
  "nagercoil",
];

/**
 * Tanglish & Typo Normalizer
 */
export function normalizeTanglishAndTypos(input: string): string {
  let text = input.trim().toLowerCase();

  // Common Typo corrections
  text = text
    .replace(/\b(enginnering|enginering|engneering|engg)\b/g, "engineering")
    .replace(/\b(maduraii|madura)\b/g, "madurai")
    .replace(/\b(chennnai|chenai)\b/g, "chennai")
    .replace(/\b(annamalai\s+univ|annamalai\s+university)\b/g, "annamalai university")
    .replace(/\b(tce|thiagarajar\s+engg)\b/g, "thiagarajar college of engineering");

  // Tanglish phrase normalization
  text = text
    .replace(/\b(pakkathula|pakkathil|kitta|nalla)\b/g, "near")
    .replace(/\b(irukura|irukkura|ulladha)\b/g, "with")
    .replace(/\b(venum|veenum|kaattunga)\b/g, " ")
    .replace(/\b(la|in|nalla|kammi\s+fees|low\s+fees\s+la)\b/g, (match) => {
      if (match === "la") return "in";
      if (match.includes("fees")) return "cheap";
      return match;
    });

  return text;
}

/**
 * Deterministic NLP Parser as primary/fallback parser
 */
export function parseIntentDeterministic(input: string): StructuredSearchIntent {
  const rawQuery = input.trim();
  const normalizedQuery = normalizeTanglishAndTypos(rawQuery);
  let workingText = normalizedQuery;

  let targetScope: SearchScope = "COLLEGES";
  let intent: StructuredSearchIntent["intent"] = "GENERAL_SEARCH";
  const domains: DomainType[] = [];
  const courses: string[] = [];
  const compareColleges: string[] = [];
  let location: string | null = null;
  let nearbyRequested = false;
  let rankingRequested = false;
  let radiusKm: number | null = null;
  let ownership: StructuredSearchIntent["ownership"] = null;
  let naacGrade: string | null = null;
  let maxFees: number | null = null;
  let hasHostel = false;
  let hasGoodPlacements = false;

  // 0. Detect Comparison Intent ("VIT vs SSN", "American College vs Thiagarajar")
  if (/\b(vs|versus|compared\s+to|compare)\b/i.test(workingText)) {
    targetScope = "COMPARISON";
    intent = "COMPARE";
    const parts = workingText.split(/\b(?:vs|versus|compared\s+to|compare)\b/i);
    parts.forEach((p) => {
      const trimmed = p.trim();
      if (trimmed.length > 1) compareColleges.push(trimmed);
    });
  }

  // 1. Detect Scope Intent
  if (/\b(scholarship|scholarships|financial\s+aid|fellowship|stipend)\b/i.test(workingText)) {
    targetScope = "SCHOLARSHIPS";
  } else if (/\b(news|article|articles|admission\s+news|update|updates|cutoff|cutoffs)\b/i.test(workingText)) {
    targetScope = "NEWS";
  } else if (/\b(course|courses|degree|degrees|syllabus|duration)\b/i.test(workingText) && !/\b(college|colleges|university)\b/i.test(workingText)) {
    targetScope = "COURSES";
  }

  // 2. Detect Radius & Distance Intent
  const radiusMatch = workingText.match(
    /(\d+)\s*(?:km|kms|kilometer|kilometers)?\s*(?:near\s+by|nearby|near\s+me|within|around|radius)?/i
  );
  const explicitWithinMatch = workingText.match(
    /(?:within|around|radius\s+of)\s*(\d+)\s*(?:km|kms|kilometer|kilometers)?/i
  );

  if (explicitWithinMatch && explicitWithinMatch[1]) {
    radiusKm = parseInt(explicitWithinMatch[1], 10);
    nearbyRequested = true;
    workingText = workingText.replace(explicitWithinMatch[0], " ");
  } else if (
    radiusMatch &&
    radiusMatch[1] &&
    (workingText.includes("near") || workingText.includes("within") || workingText.includes("km"))
  ) {
    const val = parseInt(radiusMatch[1], 10);
    if (val > 0 && val <= 3000) {
      radiusKm = val;
      nearbyRequested = true;
      workingText = workingText.replace(radiusMatch[0], " ");
    }
  }

  if (/\b(near\s+by|nearby|near\s+me|nearest|close\s+to|around\s+me|closest|near)\b/i.test(workingText)) {
    nearbyRequested = true;
    workingText = workingText.replace(
      /\b(near\s+by|nearby|near\s+me|nearest|close\s+to|around\s+me|closest|near)\b/gi,
      " "
    );
  }

  // 3. Detect Ranking Intent
  if (/\b(best|top|top-rated|top\s*\d+|highest\s*rated|number\s*one|no\s*1|leading|good|recommended)\b/i.test(workingText)) {
    rankingRequested = true;
    workingText = workingText.replace(
      /\b(best|top-rated|top\s*\d*|top|highest\s*rated|number\s*one|no\s*1|leading|good|recommended)\b/gi,
      " "
    );
  }

  if (intent !== "COMPARE") {
    if (rankingRequested && nearbyRequested) {
      intent = "BEST_NEARBY";
    } else if (nearbyRequested) {
      intent = "NEARBY";
    } else if (rankingRequested) {
      intent = "BEST";
    }
  }

  // 4. Detect Facility & Requirement Intent (Hostel, Placements)
  if (/\b(hostel|residential|dormitory|dorm)\b/i.test(workingText)) {
    hasHostel = true;
  }
  if (/\b(placement|placements|highest\s+package|salary|hiring|recruiters)\b/i.test(workingText)) {
    hasGoodPlacements = true;
  }

  // 5. Detect Max Fees Intent
  if (/\b(cheap|affordable|low\s+fee|low\s+cost|low\s+fees)\b/i.test(workingText)) {
    maxFees = 200000;
  }
  const feesLakhMatch = workingText.match(/(?:under|below|less\s+than|within)\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|l)\b/i);
  const feesKMatch = workingText.match(/(?:under|below|less\s+than|within)\s*(\d+)\s*(?:k|thousand)\b/i);
  if (feesLakhMatch && feesLakhMatch[1]) {
    maxFees = parseFloat(feesLakhMatch[1]) * 100000;
    workingText = workingText.replace(feesLakhMatch[0], " ");
  } else if (feesKMatch && feesKMatch[1]) {
    maxFees = parseInt(feesKMatch[1], 10) * 1000;
    workingText = workingText.replace(feesKMatch[0], " ");
  }

  // 6. Detect NAAC Intent
  if (/\bnaac\s*a\+\+/i.test(workingText)) {
    naacGrade = "A++";
    workingText = workingText.replace(/\bnaac\s*a\+\+/gi, " ");
  } else if (/\bnaac\s*a\+/i.test(workingText)) {
    naacGrade = "A+";
    workingText = workingText.replace(/\bnaac\s*a\+/gi, " ");
  } else if (/\bnaac\s*a\b/i.test(workingText)) {
    naacGrade = "A";
    workingText = workingText.replace(/\bnaac\s*a\b/gi, " ");
  } else if (/\b(naac|naac\s+accredited|accredited)\b/i.test(workingText)) {
    naacGrade = "ANY";
    workingText = workingText.replace(/\b(naac|naac\s+accredited|accredited)\b/gi, " ");
  }

  // 7. Detect Ownership Intent
  if (/\b(government|govt|govt-aided|state\s+govt|public)\b/i.test(workingText)) {
    ownership = "Government";
    workingText = workingText.replace(/\b(government|govt|govt-aided|state\s+govt|public)\b/gi, " ");
  } else if (/\b(private|self-financing|self-financed)\b/i.test(workingText)) {
    ownership = "Private";
    workingText = workingText.replace(/\b(private|self-financing|self-financed)\b/gi, " ");
  } else if (/\b(autonomous)\b/i.test(workingText)) {
    ownership = "Autonomous";
    workingText = workingText.replace(/\b(autonomous)\b/gi, " ");
  } else if (/\b(deemed)\b/i.test(workingText)) {
    ownership = "Deemed";
    workingText = workingText.replace(/\b(deemed)\b/gi, " ");
  }

  // 8. Detect Domains
  const hasArts = /\b(arts|art|humanities|ba|b\.a|fine\s+arts|liberal\s+arts)\b/i.test(normalizedQuery);
  const hasScience = /\b(science|bsc|b\.sc|physics|chemistry|mathematics|biology|msc|m\.sc)\b/i.test(normalizedQuery);
  const hasEngg = /\b(engineering|engineer|btech|b\.tech|be|b\.e|mtech|m\.e|cse|ece|eee|mechanical|civil|it|information\s+technology|computer\s+science|ai|artificial\s+intelligence|data\s+science)\b/i.test(normalizedQuery);
  const hasMed = /\b(medical|mbbs|medicine|doctor)\b/i.test(normalizedQuery);
  const hasDental = /\b(dental|bds|mds)\b/i.test(normalizedQuery);
  const hasPhysio = /\b(physiotherapy|bpt|mpt)\b/i.test(normalizedQuery);
  const hasLaw = /\b(law|llb|llm|legal)\b/i.test(normalizedQuery);
  const hasMgmt = /\b(mba|bba|management|business|pgdm)\b/i.test(normalizedQuery);
  const hasComm = /\b(commerce|bcom|b\.com|finance)\b/i.test(normalizedQuery);
  const hasPharm = /\b(pharmacy|bpharm|b\.pharm)\b/i.test(normalizedQuery);
  const hasNursing = /\b(nursing|b\.sc\s+nursing)\b/i.test(normalizedQuery);
  const hasPoly = /\b(polytechnic|diploma)\b/i.test(normalizedQuery);

  if (hasArts) domains.push("ARTS");
  if (hasScience) domains.push("SCIENCE");
  if (hasEngg) domains.push("ENGINEERING");
  if (hasMed) domains.push("MEDICAL");
  if (hasDental) domains.push("DENTAL");
  if (hasPhysio) domains.push("PHYSIOTHERAPY");
  if (hasLaw) domains.push("LAW");
  if (hasMgmt) domains.push("MANAGEMENT");
  if (hasComm) domains.push("COMMERCE");
  if (hasPharm) domains.push("PHARMACY");
  if (hasNursing) domains.push("NURSING");
  if (hasPoly) domains.push("POLYTECHNIC");

  // Specific course detection
  if (/\b(cse|computer\s*science)\b/i.test(normalizedQuery)) courses.push("Computer Science");
  if (/\b(bca)\b/i.test(normalizedQuery)) courses.push("BCA");
  if (/\b(mba)\b/i.test(normalizedQuery)) courses.push("MBA");
  if (/\b(mbbs)\b/i.test(normalizedQuery)) courses.push("MBBS");
  if (/\b(btech|b\.tech)\b/i.test(normalizedQuery)) courses.push("B.Tech");
  if (/\b(ba\s+english|english)\b/i.test(normalizedQuery)) courses.push("BA English");

  // 9. Location Extraction & Normalization
  for (const city of KNOWN_CITIES) {
    const cityRegex = new RegExp(`\\b${city}\\b`, "i");
    if (cityRegex.test(normalizedQuery)) {
      location = city.charAt(0).toUpperCase() + city.slice(1);
      break;
    }
  }

  if (!location) {
    const inLocationMatch = normalizedQuery.match(/\b(?:in|at|near|around)\s+([a-zA-Z]+)\b/i);
    if (inLocationMatch && inLocationMatch[1]) {
      const candidateLoc = inLocationMatch[1].trim();
      const lowerCand = candidateLoc.toLowerCase();
      if (!["me", "my", "college", "colleges", "engineering", "medical", "arts", "science"].includes(lowerCand)) {
        location = candidateLoc.charAt(0).toUpperCase() + candidateLoc.slice(1);
      }
    }
  }

  const locationRequired = Boolean(location);

  let sort: StructuredSearchIntent["sort"] = "RELEVANCE";
  if (nearbyRequested && rankingRequested) {
    sort = "DISTANCE_AND_RANKING";
  } else if (nearbyRequested) {
    sort = "DISTANCE";
  } else if (rankingRequested) {
    sort = "RANKING";
  }

  return {
    query: rawQuery,
    normalizedQuery,
    intent,
    targetScope,
    domains,
    courses,
    location,
    locationRequired,
    latitude: null,
    longitude: null,
    radiusKm,
    ownership,
    naacGrade,
    maxFees,
    hasHostel,
    hasGoodPlacements,
    compareColleges,
    rankingRequested,
    nearbyRequested,
    sort,
    confidence: 1.0,
  };
}

/**
 * Hybrid AI + NLP Parser leveraging Gemini API when configured
 */
export async function parseSearchIntentAI(input: string): Promise<StructuredSearchIntent> {
  const deterministicIntent = parseIntentDeterministic(input);

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return deterministicIntent;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `You are an AI Search Intent Parser for an Indian Higher Education Search Platform.
Extract the structured search intent from the student's natural language query.
Return ONLY valid JSON matching this schema:
{
  "query": string,
  "normalizedQuery": string,
  "intent": "BEST_NEARBY" | "NEARBY" | "BEST" | "GENERAL_SEARCH" | "COMPARE",
  "targetScope": "COLLEGES" | "COURSES" | "SCHOLARSHIPS" | "NEWS" | "GLOBAL" | "COMPARISON",
  "domains": Array<"ARTS"|"SCIENCE"|"ENGINEERING"|"MEDICAL"|"DENTAL"|"PHYSIOTHERAPY"|"LAW"|"COMMERCE"|"MANAGEMENT"|"PHARMACY"|"NURSING"|"POLYTECHNIC">,
  "courses": string[],
  "location": string | null,
  "locationRequired": boolean,
  "nearbyRequested": boolean,
  "rankingRequested": boolean,
  "ownership": "Government" | "Private" | "Autonomous" | "Aided" | "Deemed" | null,
  "naacGrade": "A++" | "A+" | "A" | "ANY" | null,
  "maxFees": number | null,
  "hasHostel": boolean,
  "hasGoodPlacements": boolean,
  "compareColleges": string[],
  "radiusKm": number | null,
  "sort": "DISTANCE" | "RANKING" | "DISTANCE_AND_RANKING" | "RELEVANCE"
}`;

    const res = await Promise.race([
      model.generateContent(`${systemPrompt}\n\nUser Query: "${input}"`),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
    ]);

    if (!res) return deterministicIntent;

    const responseText = res.response.text();
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedAi = JSON.parse(jsonMatch[0]);
      const finalDomains = Array.from(new Set([...(parsedAi.domains || []), ...deterministicIntent.domains]));

      const extractedLoc = parsedAi.location || deterministicIntent.location;
      return {
        ...deterministicIntent,
        intent: parsedAi.intent || deterministicIntent.intent,
        targetScope: parsedAi.targetScope || deterministicIntent.targetScope,
        domains: finalDomains as DomainType[],
        location: extractedLoc,
        locationRequired: Boolean(extractedLoc),
        nearbyRequested: Boolean(parsedAi.nearbyRequested || deterministicIntent.nearbyRequested),
        rankingRequested: Boolean(parsedAi.rankingRequested || deterministicIntent.rankingRequested),
        ownership: parsedAi.ownership || deterministicIntent.ownership,
        naacGrade: parsedAi.naacGrade || deterministicIntent.naacGrade,
        maxFees: parsedAi.maxFees || deterministicIntent.maxFees,
        hasHostel: Boolean(parsedAi.hasHostel || deterministicIntent.hasHostel),
        hasGoodPlacements: Boolean(parsedAi.hasGoodPlacements || deterministicIntent.hasGoodPlacements),
        compareColleges: parsedAi.compareColleges || deterministicIntent.compareColleges,
        sort: parsedAi.sort || deterministicIntent.sort,
      };
    }
  } catch (err) {
    console.warn("AI Intent Parsing fallback to deterministic NLP engine:", err);
  }

  return deterministicIntent;
}

/**
 * Generate "Why this matches" criteria list for a result card
 */
export function generateMatchReasons(college: any, intent: StructuredSearchIntent): string[] {
  const reasons: string[] = [];

  if (intent.domains && intent.domains.length > 0) {
    const domName = intent.domains[0].charAt(0) + intent.domains[0].slice(1).toLowerCase();
    reasons.push(`✓ ${domName}`);
  }

  if (intent.location && (college.city?.toLowerCase().includes(intent.location.toLowerCase()) || college.location?.toLowerCase().includes(intent.location.toLowerCase()))) {
    reasons.push(`✓ ${intent.location}`);
  }

  if (college.ownership || college.type) {
    reasons.push(`✓ ${college.ownership || college.type}`);
  }

  if (college.naacGrade && college.naacGrade !== "Not Accredited") {
    reasons.push(`✓ NAAC ${college.naacGrade}`);
  }

  if (college.rating) {
    reasons.push(`✓ ${college.rating.toFixed(1)} Rating`);
  }

  if (intent.hasHostel) {
    reasons.push(`✓ Hostel Available`);
  }

  if (intent.hasGoodPlacements && college.avgPackage) {
    reasons.push(`✓ ₹${college.avgPackage} LPA Avg Placement`);
  }

  return reasons.slice(0, 4);
}
