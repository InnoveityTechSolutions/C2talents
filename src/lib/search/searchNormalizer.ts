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

/**
 * Master multi-attribute search matcher for college records
 * Handles full names, partial names, case-insensitivity, acronyms, spelling variants,
 * location, course titles, email, website, and multi-word token queries.
 */
export function matchesCollegeSearch(college: any, searchQuery: string): boolean {
  if (!searchQuery || !searchQuery.trim()) return true;
  if (!college) return false;

  const rawQuery = searchQuery.trim();
  const q = rawQuery.toLowerCase();
  const variants = generateSearchVariants(rawQuery);
  const { distinctiveTokens, allTokens } = extractCleanTokens(rawQuery);

  // Build spelling variations for the college name
  const nameVariants = [college.name || ""];
  if (/chevaliar/i.test(college.name || "")) {
    nameVariants.push(college.name.replace(/chevaliar/gi, "chevalier"));
  }
  if (/chevalier/i.test(college.name || "")) {
    nameVariants.push(college.name.replace(/chevalier/gi, "chevaliar"));
  }

  // Generate dynamic acronyms for this college
  const acronyms = getCollegeAcronyms(college.name || "", {
    email: college.email,
    website: college.website,
  });
  if (college.shortName) {
    acronyms.push(college.shortName.toLowerCase());
  }

  const nameVariantsStr = nameVariants.join(" ").toLowerCase();
  const shortStr = (college.shortName || "").toLowerCase();
  const slugStr = (college.slug || "").toLowerCase();
  const cityStr = (college.city || "").toLowerCase();
  const locStr = (college.location || "").toLowerCase();
  const distStr = (college.district || "").toLowerCase();
  const addrStr = (college.address || "").toLowerCase();
  const stateStr = (college.state || "").toLowerCase();
  const affilStr = (college.affiliatedUniversity || "").toLowerCase();
  const catStr = (college.category || "").toLowerCase();
  const catsStr = (college.categories || "").toLowerCase();
  const emailStr = (college.email || "").toLowerCase();
  const websiteStr = (college.website || "").toLowerCase();
  const acronymsStr = acronyms.join(" ").toLowerCase();
  const coursesStr = Array.isArray(college.courses)
    ? college.courses.map((crs: any) => crs?.title || "").join(" ").toLowerCase()
    : "";

  const combinedStr = [
    nameVariantsStr,
    shortStr,
    acronymsStr,
    slugStr,
    cityStr,
    locStr,
    distStr,
    addrStr,
    stateStr,
    affilStr,
    catStr,
    catsStr,
    emailStr,
    websiteStr,
    coursesStr,
  ].join(" ");

  // 1. Direct variants substring & acronym check
  for (const v of variants) {
    if (v.length >= 2) {
      if (combinedStr.includes(v)) return true;
      if (acronyms.includes(v)) return true;
      if (slugStr.includes(v.replace(/\s+/g, "-"))) return true;
    }
  }

  // 2. Token-based multi-word check
  const tokensToCheck = distinctiveTokens.length > 0 ? distinctiveTokens : allTokens;
  if (tokensToCheck.length > 0) {
    const matchedCount = tokensToCheck.filter((tok) => {
      if (combinedStr.includes(tok)) return true;
      if (tok === "chevalier" && combinedStr.includes("chevaliar")) return true;
      if (tok === "chevaliar" && combinedStr.includes("chevalier")) return true;
      if (acronyms.includes(tok)) return true;
      return false;
    }).length;

    // Full match of all distinctive tokens
    if (matchedCount === tokensToCheck.length) return true;
    // For queries with 3+ distinctive tokens, allow a 60% match threshold
    if (tokensToCheck.length >= 3 && matchedCount / tokensToCheck.length >= 0.6) return true;
  }

  // 3. Normalized string containment check
  const normQ = normalizeSearchString(rawQuery);
  const normName = normalizeSearchString(college.name || "");
  if (normName.length > 0 && normQ.length > 0) {
    if (normName.includes(normQ) || normQ.includes(normName)) return true;
  }

  return false;
}
