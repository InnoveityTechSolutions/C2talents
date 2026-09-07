export interface ParsedSearchQuery {
  rawQuery: string;
  cleanQuery: string;
  searchTokens: string[];
  intent: "NEARBY" | "BEST" | null;
  domain:
    | "ENGINEERING"
    | "MEDICAL"
    | "DENTAL"
    | "PHYSIOTHERAPY"
    | "LAW"
    | "COMMERCE"
    | "MANAGEMENT"
    | "PHARMACY"
    | "NURSING"
    | "ARTS"
    | "POLYTECHNIC"
    | null;
  isBest: boolean;
  isNearMe: boolean;
  distanceRadius: number | null; // in km
  targetLocation: string | null;
  targetOwnership: string | null; // "Government", "Private", "Autonomous", "Aided", "Deemed"
  isAutonomousOnly: boolean;
  targetNaacGrade: string | null; // "A++", "A+", "A", "ANY"
  targetCategory: string | null;
  targetCourse: string | null;
  maxFees: number | null;
}

const KNOWN_CITIES = [
  "chennai",
  "coimbatore",
  "madurai",
  "trichy",
  "tiruchirappalli",
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
];

export function parseSearchQuery(input: string): ParsedSearchQuery {
  const rawQuery = input.trim();
  let workingText = rawQuery.toLowerCase();

  let intent: "NEARBY" | "BEST" | null = null;
  let domain: ParsedSearchQuery["domain"] = null;
  let isBest = false;
  let isNearMe = false;
  let distanceRadius: number | null = null;
  let targetLocation: string | null = null;
  let targetOwnership: string | null = null;
  let isAutonomousOnly = false;
  let targetNaacGrade: string | null = null;
  let targetCategory: string | null = null;
  let targetCourse: string | null = null;
  let maxFees: number | null = null;

  // 1. Parse Distance & Radius & "Near By" Intent
  const radiusMatch = workingText.match(
    /(\d+)\s*(?:km|kms|kilometer|kilometers)?\s*(?:near\s+by|nearby|near\s+me|within|around|radius)?/i
  );
  const explicitWithinMatch = workingText.match(
    /(?:within|around|radius\s+of)\s*(\d+)\s*(?:km|kms|kilometer|kilometers)?/i
  );

  if (explicitWithinMatch && explicitWithinMatch[1]) {
    distanceRadius = parseInt(explicitWithinMatch[1], 10);
    isNearMe = true;
    intent = "NEARBY";
    workingText = workingText.replace(explicitWithinMatch[0], " ");
  } else if (
    radiusMatch &&
    radiusMatch[1] &&
    (workingText.includes("near") || workingText.includes("within") || workingText.includes("km"))
  ) {
    const val = parseInt(radiusMatch[1], 10);
    if (val > 0 && val <= 3000) {
      distanceRadius = val;
      isNearMe = true;
      intent = "NEARBY";
      workingText = workingText.replace(radiusMatch[0], " ");
    }
  }

  if (
    /\b(near\s+by|nearby|near\s+me|near|nearest|close\s+to|around\s+me)\b/i.test(workingText)
  ) {
    isNearMe = true;
    intent = "NEARBY";
    workingText = workingText.replace(
      /\b(near\s+by|nearby|near\s+me|near|nearest|close\s+to|around\s+me)\b/gi,
      " "
    );
  }

  // 2. Parse Best / Top Intent
  if (/\b(best|top|top\s*\d+|highest\s*rated|number\s*one|no\s*1)\b/i.test(workingText)) {
    isBest = true;
    if (!intent) intent = "BEST";
    workingText = workingText.replace(/\b(best|top\s*\d*|top|highest\s*rated|number\s*one|no\s*1)\b/gi, " ");
  }

  // 3. Parse Max Fees (e.g. "under 5 lakh", "under 5l", "under 50k", "below 2 lakh")
  const feesLakhMatch = workingText.match(/(?:under|below|less\s+than|within)\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|l)\b/i);
  const feesKMatch = workingText.match(/(?:under|below|less\s+than|within)\s*(\d+)\s*(?:k|thousand)\b/i);
  const feesExactMatch = workingText.match(/(?:under|below|less\s+than|within)\s*(\d{4,8})\b/i);

  if (feesLakhMatch && feesLakhMatch[1]) {
    maxFees = parseFloat(feesLakhMatch[1]) * 100000;
    workingText = workingText.replace(feesLakhMatch[0], " ");
  } else if (feesKMatch && feesKMatch[1]) {
    maxFees = parseInt(feesKMatch[1], 10) * 1000;
    workingText = workingText.replace(feesKMatch[0], " ");
  } else if (feesExactMatch && feesExactMatch[1]) {
    maxFees = parseInt(feesExactMatch[1], 10);
    workingText = workingText.replace(feesExactMatch[0], " ");
  }

  // 4. Parse NAAC Grade Intent
  if (/\bnaac\s*a\+\+/i.test(workingText)) {
    targetNaacGrade = "A++";
    workingText = workingText.replace(/\bnaac\s*a\+\+/gi, " ");
  } else if (/\bnaac\s*a\+/i.test(workingText)) {
    targetNaacGrade = "A+";
    workingText = workingText.replace(/\bnaac\s*a\+/gi, " ");
  } else if (/\bnaac\s*a\b/i.test(workingText)) {
    targetNaacGrade = "A";
    workingText = workingText.replace(/\bnaac\s*a\b/gi, " ");
  } else if (/\b(naac|naac\s+accredited|accredited)\b/i.test(workingText)) {
    targetNaacGrade = "ANY";
    workingText = workingText.replace(/\b(naac|naac\s+accredited|accredited)\b/gi, " ");
  }

  // 5. Parse Ownership Intent
  if (/\b(government|govt|govt-aided|state\s+govt|public)\b/i.test(workingText)) {
    targetOwnership = "Government";
    workingText = workingText.replace(/\b(government|govt|govt-aided|state\s+govt|public)\b/gi, " ");
  } else if (/\b(private|self-financing|deemed)\b/i.test(workingText)) {
    targetOwnership = "Private";
    workingText = workingText.replace(/\b(private|self-financing|deemed)\b/gi, " ");
  }

  if (/\b(autonomous)\b/i.test(workingText)) {
    isAutonomousOnly = true;
    if (!targetOwnership) targetOwnership = "Autonomous";
    workingText = workingText.replace(/\b(autonomous)\b/gi, " ");
  }

  // 6. Parse Domain / Category Intent
  if (
    /\b(engineering|engineer|btech|b\.tech|be|mtech|m\.e|cse|ece|eee|mechanical|civil|it|information\s+technology|computer\s+science|electronics|electrical|artificial\s+intelligence|data\s+science)\b/i.test(
      workingText
    )
  ) {
    domain = "ENGINEERING";
    targetCategory = "Engineering";
    if (/\b(computer\s*science|cse)\b/i.test(workingText)) targetCourse = "Computer Science";
    workingText = workingText.replace(
      /\b(engineering|engineer|btech|b\.tech|be|mtech|m\.e|cse|ece|eee|mechanical|civil|it|information\s+technology|computer\s+science|electronics|electrical|artificial\s+intelligence|data\s+science)\b/gi,
      " "
    );
  } else if (/\b(dental|bds|mds)\b/i.test(workingText)) {
    domain = "DENTAL";
    targetCategory = "Dental";
    targetCourse = "BDS";
    workingText = workingText.replace(/\b(dental|bds|mds)\b/gi, " ");
  } else if (/\b(physiotherapy|bpt|mpt)\b/i.test(workingText)) {
    domain = "PHYSIOTHERAPY";
    targetCategory = "Physiotherapy";
    targetCourse = "BPT";
    workingText = workingText.replace(/\b(physiotherapy|bpt|mpt)\b/gi, " ");
  } else if (/\b(medical|mbbs|medicine|doctor)\b/i.test(workingText)) {
    domain = "MEDICAL";
    targetCategory = "Medical";
    targetCourse = "MBBS";
    workingText = workingText.replace(/\b(medical|mbbs|medicine|doctor)\b/gi, " ");
  } else if (/\b(mba|management|pgdm|business)\b/i.test(workingText)) {
    domain = "MANAGEMENT";
    targetCategory = "Management";
    targetCourse = "MBA";
    workingText = workingText.replace(/\b(mba|management|pgdm|business)\b/gi, " ");
  } else if (/\b(commerce|bcom|b\.com|finance|accounting)\b/i.test(workingText)) {
    domain = "COMMERCE";
    targetCategory = "Commerce";
    targetCourse = "B.Com";
    workingText = workingText.replace(/\b(commerce|bcom|b\.com|finance|accounting)\b/gi, " ");
  } else if (/\b(law|llb|legal)\b/i.test(workingText)) {
    domain = "LAW";
    targetCategory = "Law";
    targetCourse = "LLB";
    workingText = workingText.replace(/\b(law|llb|legal)\b/gi, " ");
  } else if (/\b(polytechnic|diploma)\b/i.test(workingText)) {
    domain = "POLYTECHNIC";
    targetCategory = "Polytechnic";
    workingText = workingText.replace(/\b(polytechnic|diploma)\b/gi, " ");
  } else if (/\b(pharmacy|bpharm|b\.pharm)\b/i.test(workingText)) {
    domain = "PHARMACY";
    targetCategory = "Pharmacy";
    targetCourse = "B.Pharm";
    workingText = workingText.replace(/\b(pharmacy|bpharm|b\.pharm)\b/gi, " ");
  } else if (/\b(nursing|b\.sc\s+nursing)\b/i.test(workingText)) {
    domain = "NURSING";
    targetCategory = "Nursing";
    workingText = workingText.replace(/\b(nursing|b\.sc\s+nursing)\b/gi, " ");
  }

  // Strip generic filler words
  workingText = workingText.replace(
    /\b(colleges|college|institutes|institute|universities|university|schools|school|in|near|at|for|of|with|under|by)\b/gi,
    " "
  );

  // 7. Parse Location Intent from known cities
  for (const city of KNOWN_CITIES) {
    const cityRegex = new RegExp(`\\b${city}\\b`, "i");
    if (cityRegex.test(workingText) || cityRegex.test(rawQuery.toLowerCase())) {
      targetLocation = city.charAt(0).toUpperCase() + city.slice(1);
      workingText = workingText.replace(cityRegex, " ");
      break;
    }
  }

  // Clean tokens
  const cleanTokens = workingText
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  const cleanQuery = cleanTokens.join(" ");

  return {
    rawQuery,
    cleanQuery,
    searchTokens: cleanTokens,
    intent,
    domain,
    isBest,
    isNearMe,
    distanceRadius,
    targetLocation,
    targetOwnership,
    isAutonomousOnly,
    targetNaacGrade,
    targetCategory,
    targetCourse,
    maxFees,
  };
}
