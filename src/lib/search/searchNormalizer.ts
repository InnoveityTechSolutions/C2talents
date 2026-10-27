/**
 * College Search & Acronym Normalizer
 * Provides shared normalization, spelling variant resolution, and dynamic acronym generation
 * to ensure consistent matching across Public, Admin, and Database search workflows.
 */

// Common English/academic stop words that should not block multi-token matching
const STOP_WORDS = new Set([
  "college", "colleges", "institute", "institutes", "institution", "institutions",
  "university", "universities", "campus", "school", "schools", "of", "in", "at",
  "near", "nearby", "for", "with", "all", "the", "and", "to", "an", "a"
]);

/**
 * Common spelling variants and synonyms in Indian higher education
 */
const SPELLING_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bchevalier\b/gi, "chevaliar"],
  [/\bchevaliar\b/gi, "chevalier"],
  [/\bwomens\b|\bwomen's\b/gi, "women"],
  [/\benginnering\b|\benginering\b|\bengneering\b|\bengg\b/gi, "engineering"],
  [/\btech\b|\btechnolgy\b/gi, "technology"],
  [/\bgovernment\b|\bgovt\b|\bgov\b/gi, "govt"],
  [/\bst\b|\bst\.\b|\bsaint\b/gi, "st"],
  [/\bdr\b|\bdr\.\b|\bdoctor\b/gi, "dr"],
  [/\buniv\b|\buniv\.\b/gi, "university"],
  [/\binst\b|\binst\.\b/gi, "institute"],
];

/**
 * Generate dynamic acronyms for any college name
 * e.g., "Chevaliar T. Thomas Elizabeth College for Women" -> ["cttec", "cttewc", "cttecfw"]
 * e.g., "Vellore Institute of Technology" -> ["vit"]
 * e.g., "Madras Christian College" -> ["mcc"]
 * e.g., "Thiagarajar College of Engineering" -> ["tce"]
 */
export function getCollegeAcronyms(
  name: string,
  extras?: { email?: string | null; website?: string | null }
): string[] {
  if (!name || typeof name !== "string") return [];

  // Remove content in brackets first for core acronym
  const withoutBrackets = name.replace(/\([^)]*\)/g, " ");
  const clean = withoutBrackets.replace(/[^\w\s]/g, " ").trim();
  const words = clean.split(/\s+/).filter(Boolean);

  const acronyms: string[] = [];

  if (words.length >= 2) {
    // 1. Raw initials of all words
    acronyms.push(words.map((w) => w[0]).join("").toLowerCase());

    // 2. Initials excluding grammatical stop words ("for", "of", "and", "in", "the", "to", "at")
    const nonStopWords = words.filter(
      (w) => !["for", "of", "and", "in", "the", "to", "at", "an", "a"].includes(w.toLowerCase())
    );
    if (nonStopWords.length >= 2) {
      acronyms.push(nonStopWords.map((w) => w[0]).join("").toLowerCase());
    }

    // 3. Core initials excluding gender suffixes ("women", "womens", "men")
    const coreWords = nonStopWords.filter(
      (w) => !["women", "womens", "men"].includes(w.toLowerCase())
    );
    if (coreWords.length >= 2) {
      acronyms.push(coreWords.map((w) => w[0]).join("").toLowerCase());
    }
  }

  // 4. Also extract any abbreviation explicitly in parentheses, e.g. "College (CTTEC) for Women"
  const bracketMatch = name.match(/\(([A-Za-z0-9]{2,10})\)/);
  if (bracketMatch && bracketMatch[1]) {
    acronyms.push(bracketMatch[1].toLowerCase());
  }

  // 5. Extract domain token from email if available, e.g. "office@cttewc.edu.in" -> "cttewc"
  if (extras?.email) {
    const atParts = extras.email.split("@");
    if (atParts[1]) {
      const emailDomain = atParts[1].split(".")[0];
      if (emailDomain && emailDomain.length >= 2 && emailDomain.length <= 12) {
        acronyms.push(emailDomain.toLowerCase());
      }
    }
  }

  // 6. Extract domain token from website if available, e.g. "https://cttewc.edu.in/" -> "cttewc"
  if (extras?.website) {
    try {
      const host = new URL(
        extras.website.startsWith("http") ? extras.website : "https://" + extras.website
      ).hostname;
      const sub = host.replace(/^www\./, "").split(".")[0];
      if (sub && sub.length >= 2 && sub.length <= 12) {
        acronyms.push(sub.toLowerCase());
      }
    } catch {}
  }

  // Deduplicate and filter out trivial 1-letter acronyms
  return Array.from(new Set(acronyms.filter((a) => a.length >= 2 && a.length <= 12)));
}

/**
 * Clean and normalize a search query or college name string
 */
export function normalizeSearchString(raw: string): string {
  if (!raw) return "";
  return raw
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract clean, distinctive tokens from a query (removing punctuation and pure stop words)
 */
export function extractCleanTokens(raw: string): {
  allTokens: string[];
  distinctiveTokens: string[];
} {
  if (!raw) return { allTokens: [], distinctiveTokens: [] };

  const clean = raw.toLowerCase().replace(/[^\w\s]/g, " ");
  const allTokens = clean.split(/\s+/).map((t) => t.trim()).filter(Boolean);
  const distinctiveTokens = allTokens.filter(
    (t) => t.length >= 2 && !STOP_WORDS.has(t)
  );

  return { allTokens, distinctiveTokens };
}

/**
 * Generate spelling variants for a given search query
 */
export function generateSearchVariants(query: string): string[] {
  if (!query) return [];
  const qLower = query.toLowerCase().trim();
  const variants = new Set<string>([qLower]);

  // 1. Without brackets: "(CTTEC)" -> "CTTEC"
  const withoutBrackets = qLower.replace(/[()]/g, " ").replace(/\s+/g, " ").trim();
  if (withoutBrackets.length >= 2) {
    variants.add(withoutBrackets);
  }

  // 2. Without bracket content: "(CTTEC)" -> ""
  const withoutBracketContent = qLower.replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
  if (withoutBracketContent.length >= 2) {
    variants.add(withoutBracketContent);
  }

  // 3. Without dots: "T." -> "T"
  const withoutDots = withoutBracketContent.replace(/\./g, " ").replace(/\s+/g, " ").trim();
  if (withoutDots.length >= 2) {
    variants.add(withoutDots);
  }

  // Base list to apply replacements to
  const baseForms = [qLower, withoutBrackets, withoutBracketContent, withoutDots];

  for (const form of baseForms) {
    if (!form || form.length < 2) continue;
    // Apply known spelling swaps
    if (form.includes("chevalier")) {
      variants.add(form.replace(/\bchevalier\b/g, "chevaliar"));
    }
    if (form.includes("chevaliar")) {
      variants.add(form.replace(/\bchevaliar\b/g, "chevalier"));
    }
    if (form.includes("women") || form.includes("womens")) {
      variants.add(form.replace(/\bwomens?\b/g, "women"));
    }
    if (form.includes("st") || form.includes("saint")) {
      variants.add(form.replace(/\bsaint\b/g, "st"));
      variants.add(form.replace(/\bst\b/g, "saint"));
    }
    if (form.includes("govt") || form.includes("government")) {
      variants.add(form.replace(/\bgovernment\b/g, "govt"));
      variants.add(form.replace(/\bgovt\b/g, "government"));
    }
  }

  // Acronym extraction if user included (CTTEC) or CTTEC
  const acronyms = getCollegeAcronyms(query);
  acronyms.forEach((a) => variants.add(a));

  return Array.from(variants).filter((v) => v.length >= 2);
}

export const KNOWN_LOCATION_KEYWORDS = new Set([
  "chennai", "coimbatore", "madurai", "trichy", "tiruchirappalli", "salem",
  "tirunelveli", "erode", "vellore", "thanjavur", "dindigul", "kanchipuram",
  "karur", "namakkal", "krishnagiri", "dharmapuri", "tiruppur", "cuddalore",
  "villupuram", "nagapattinam", "pudukkottai", "ramanathapuram", "sivaganga",
  "virudhunagar", "thoothukudi", "tuticorin", "kanyakumari", "nagercoil",
  "theni", "nilgiris", "ooty", "tamil", "nadu", "tamilnadu", "bangalore",
  "bengaluru", "hyderabad", "delhi", "mumbai", "pune", "kolkata", "noida", "gurugram"
]);

/**
 * Builds safe, parameterized Prisma query conditions for college searches.
 * Enforces that name tokens query college name/shortName/slug, and location tokens query city/district/location.
 * Never allows street address names or unrelated fields to qualify an unrelated college.
 */
export function buildPrismaCollegeSearchConditions(searchInput: string): any[] {
  if (!searchInput || !searchInput.trim()) return [];

  const rawTrim = searchInput.trim();
  const clean = rawTrim.toLowerCase().replace(/['’]/g, " ").replace(/[^\w\s]/g, " ").trim();
  const allWords = clean.split(/\s+/).filter(Boolean);
  if (allWords.length === 0) return [];

  const locationTokens: string[] = [];
  const nameTokens: string[] = [];

  for (const w of allWords) {
    if (KNOWN_LOCATION_KEYWORDS.has(w)) {
      locationTokens.push(w);
    } else if (w.length >= 2 && !STOP_WORDS.has(w)) {
      nameTokens.push(w);
    }
  }

  const andConditions: any[] = [];

  if (nameTokens.length > 0) {
    for (const tok of nameTokens) {
      const tokVariants = new Set<string>([tok]);
      if (tok === "chevalier") tokVariants.add("chevaliar");
      if (tok === "chevaliar") tokVariants.add("chevalier");
      if (tok === "women" || tok === "womens") {
        tokVariants.add("women");
        tokVariants.add("womens");
      }
      if (tok === "govt" || tok === "government") {
        tokVariants.add("govt");
        tokVariants.add("government");
      }
      if (tok === "st" || tok === "saint") {
        tokVariants.add("st");
        tokVariants.add("saint");
      }
      if (tok === "dr" || tok === "doctor") {
        tokVariants.add("dr");
        tokVariants.add("doctor");
      }
      if (tok.length > 3 && tok.endsWith("s")) {
        tokVariants.add(tok.slice(0, -1));
      }

      andConditions.push({
        OR: Array.from(tokVariants).flatMap((tv) => [
          { name: { contains: tv } },
          { shortName: { contains: tv } },
          { slug: { contains: tv } },
        ]),
      });
    }

    if (locationTokens.length > 0) {
      for (const loc of locationTokens) {
        andConditions.push({
          OR: [
            { city: { contains: loc } },
            { district: { contains: loc } },
            { location: { contains: loc } },
          ],
        });
      }
    }
  } else if (locationTokens.length > 0) {
    for (const loc of locationTokens) {
      andConditions.push({
        OR: [
          { city: { contains: loc } },
          { district: { contains: loc } },
          { location: { contains: loc } },
        ],
      });
    }
  } else {
    andConditions.push({
      OR: [
        { name: { contains: rawTrim } },
        { shortName: { contains: rawTrim } },
        { slug: { contains: rawTrim } },
      ],
    });
  }

  return andConditions;
}

/**
 * Master multi-attribute search matcher for college records
 * Handles full names, partial names, case-insensitivity, acronyms, spelling variants,
 * location, and multi-word token queries with zero tolerance for unrelated college bleed.
 */
export function matchesCollegeSearch(college: any, searchQuery: string): boolean {
  if (!searchQuery || !searchQuery.trim()) return true;
  if (!college) return false;

  const rawTrim = searchQuery.trim();
  const qLower = rawTrim.toLowerCase();
  const qClean = qLower.replace(/['’]/g, " ").replace(/[^\w\s]/g, " ").trim();
  const allWords = qClean.split(/\s+/).filter(Boolean);
  if (allWords.length === 0) return true;

  const cName = (college.name || "").toLowerCase().replace(/['’]/g, " ").replace(/[^\w\s]/g, " ");
  const cShort = (college.shortName || "").toLowerCase().trim();
  const cSlug = (college.slug || "").toLowerCase().trim();
  const cCity = (college.city || "").toLowerCase().trim();
  const cLoc = (college.location || "").toLowerCase().trim();
  const cDist = (college.district || "").toLowerCase().trim();

  // 1. Direct name exact or substring match
  if (cName.includes(qClean) || (cShort && cShort === qClean)) {
    return true;
  }

  // 2. Acronym match: if user query is a short code (2-8 chars, single word, e.g. "VIT", "EEC", "BWC")
  if (allWords.length === 1 && rawTrim.length >= 2 && rawTrim.length <= 8 && !rawTrim.includes(" ")) {
    const code = rawTrim.toLowerCase();
    if (cShort === code) return true;
    if (cSlug === code || cSlug.startsWith(code + "-")) return true;
    const dynamicAcronyms = getCollegeAcronyms(college.name || "");
    if (dynamicAcronyms.includes(code)) return true;
  }

  // 3. Separate location tokens from name tokens
  const locationTokens: string[] = [];
  const nameTokens: string[] = [];

  for (const w of allWords) {
    if (KNOWN_LOCATION_KEYWORDS.has(w)) {
      locationTokens.push(w);
    } else if (w.length >= 2 && !STOP_WORDS.has(w)) {
      nameTokens.push(w);
    }
  }

  // If there are distinctive name tokens (e.g. "bharathi", "easwari", "thomas")
  if (nameTokens.length > 0) {
    // EVERY name token MUST match college name, shortName, or slug
    const allNameTokensMatch = nameTokens.every((tok) => {
      const tokVariants = new Set<string>([tok]);
      if (tok === "chevalier") tokVariants.add("chevaliar");
      if (tok === "chevaliar") tokVariants.add("chevalier");
      if (tok === "women" || tok === "womens") {
        tokVariants.add("women");
        tokVariants.add("womens");
      }
      if (tok === "govt" || tok === "government") {
        tokVariants.add("govt");
        tokVariants.add("government");
      }
      if (tok === "st" || tok === "saint") {
        tokVariants.add("st");
        tokVariants.add("saint");
      }
      if (tok === "dr" || tok === "doctor") {
        tokVariants.add("dr");
        tokVariants.add("doctor");
      }
      if (tok.length > 3 && tok.endsWith("s")) {
        tokVariants.add(tok.slice(0, -1));
      }

      return Array.from(tokVariants).some((tv) =>
        cName.includes(tv) ||
        (cShort && cShort.includes(tv)) ||
        (cSlug && cSlug.includes(tv))
      );
    });

    if (!allNameTokensMatch) return false;

    // If location tokens are also present in query, college must also match location
    if (locationTokens.length > 0) {
      const locationMatch = locationTokens.some((loc) =>
        cCity.includes(loc) || cLoc.includes(loc) || cDist.includes(loc)
      );
      if (!locationMatch) return false;
    }

    return true;
  }

  // If only location tokens are present (e.g. "colleges in chennai", "madurai")
  if (locationTokens.length > 0) {
    return locationTokens.some((loc) =>
      cCity.includes(loc) || cLoc.includes(loc) || cDist.includes(loc)
    );
  }

  // Direct normalized name check
  const normQ = normalizeSearchString(rawTrim);
  const normName = normalizeSearchString(college.name || "");
  if (normName.length > 0 && normQ.length > 0) {
    if (normName.includes(normQ) || normQ.includes(normName)) return true;
  }

  return false;
}
