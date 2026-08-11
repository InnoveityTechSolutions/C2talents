import { db } from "@/lib/db";

export interface DuplicateCheckParams {
  name: string;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  googleMapUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  excludeId?: string | null; // Exclude current college ID if editing
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchType?: "EXACT_WEBSITE" | "EXACT_EMAIL" | "EXACT_PHONE" | "FUZZY_NAME_SIMILARITY" | "COORDINATES";
  matchedCollege?: any;
  similarityScore: number; // Percentage e.g. 96.5
  warningMessage?: string;
}

// 1. Text Normalizer
export function normalizeName(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b(autonomous|affiliated|college|institution|institute|university|of|technology|engineering|arts|science|commerce|management|research|campus|chennai|tamil nadu|india)\b/gi, "")
    .replace(/\s+/g, "")
    .trim();
}

// 2. Domain Normalizer for Website URLs
export function normalizeDomain(urlStr?: string | null): string {
  if (!urlStr || !urlStr.trim()) return "";
  try {
    let clean = urlStr.trim().toLowerCase();
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = "https://" + clean;
    }
    const parsed = new URL(clean);
    return parsed.hostname.replace(/^www\./, "").trim();
  } catch (e) {
    return urlStr.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0].trim();
  }
}

// 3. Phone Digits Normalizer
export function normalizePhone(phoneStr?: string | null): string {
  if (!phoneStr) return "";
  const digits = phoneStr.replace(/\D/g, "");
  // Take last 10 digits for Indian mobile / landline matching
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

// 4. Email Normalizer
export function normalizeEmail(emailStr?: string | null): string {
  if (!emailStr) return "";
  return emailStr.trim().toLowerCase();
}

// 5. Levenshtein & Jaccard Hybrid Similarity Calculator (0 to 100%)
export function calculateStringSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  if (str1 === str2) return 100;

  const norm1 = normalizeName(str1);
  const norm2 = normalizeName(str2);

  if (norm1 === norm2 && norm1.length > 0) return 98;

  // Check Acronym match e.g. "MCC" vs "Madras Christian College"
  const getAcronym = (s: string) =>
    s
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toLowerCase();

  const acr1 = getAcronym(str1);
  const acr2 = getAcronym(str2);

  if ((acr1.length >= 3 && acr1 === norm2) || (acr2.length >= 3 && acr2 === norm1)) {
    return 92;
  }

  // Token Jaccard Similarity
  const tokens1 = new Set(str1.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean));
  const tokens2 = new Set(str2.toLowerCase().replace(/[^\w\s]/g, "").split(/\s+/).filter(Boolean));

  const intersection = new Set([...tokens1].filter((x) => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);

  const jaccardScore = union.size > 0 ? (intersection.size / union.size) * 100 : 0;

  // Levenshtein Distance
  const len1 = norm1.length;
  const len2 = norm2.length;
  if (len1 === 0 || len2 === 0) return jaccardScore;

  const matrix: number[][] = [];
  for (let i = 0; i <= len1; i++) matrix[i] = [i];
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = norm1[i - 1] === norm2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const levDistance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  const levScore = (1 - levDistance / maxLen) * 100;

  // Weighted combination
  return Math.round(Math.max(jaccardScore, levScore));
}

// 6. Comprehensive Multi-Condition Duplicate Checker
export async function checkForDuplicateCollege(params: DuplicateCheckParams): Promise<DuplicateCheckResult> {
  const { name, website, email, phone, excludeId } = params;

  const normTargetDomain = normalizeDomain(website);
  const normTargetEmail = normalizeEmail(email);
  const normTargetPhone = normalizePhone(phone);
  const normTargetName = normalizeName(name);

  // Fetch candidate colleges from Database (excluding deleted & excluded IDs)
  const existingColleges = await db.collegeProfile.findMany({
    where: {
      isDeleted: false,
      status: { not: "DELETED" },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: {
      id: true,
      name: true,
      shortName: true,
      website: true,
      email: true,
      phone: true,
      mobile: true,
      city: true,
      state: true,
      logo: true,
      image: true,
      createdAt: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  for (const col of existingColleges) {
    // 1. EXACT WEBSITE DOMAIN MATCH
    if (normTargetDomain && col.website) {
      const colDomain = normalizeDomain(col.website);
      if (colDomain && colDomain === normTargetDomain) {
        return {
          isDuplicate: true,
          matchType: "EXACT_WEBSITE",
          matchedCollege: col,
          similarityScore: 100,
          warningMessage: `This official website domain (${normTargetDomain}) is already linked to existing college '${col.name}'.`,
        };
      }
    }

    // 2. EXACT EMAIL MATCH
    if (normTargetEmail && col.email) {
      const colEmail = normalizeEmail(col.email);
      if (colEmail && colEmail === normTargetEmail) {
        return {
          isDuplicate: true,
          matchType: "EXACT_EMAIL",
          matchedCollege: col,
          similarityScore: 100,
          warningMessage: `This official email address (${normTargetEmail}) already belongs to existing college '${col.name}'.`,
        };
      }
    }

    // 3. EXACT PHONE MATCH
    if (normTargetPhone && normTargetPhone.length >= 7) {
      const colPhone = normalizePhone(col.phone);
      const colMobile = normalizePhone(col.mobile);
      if ((colPhone && colPhone === normTargetPhone) || (colMobile && colMobile === normTargetPhone)) {
        return {
          isDuplicate: true,
          matchType: "EXACT_PHONE",
          matchedCollege: col,
          similarityScore: 100,
          warningMessage: `This contact phone number (${phone}) already exists for college '${col.name}'.`,
        };
      }
    }

    // 4. AI FUZZY NAME & ACRONYM SIMILARITY SCORE (> 85%)
    const simScore = calculateStringSimilarity(name, col.name);
    if (simScore >= 85) {
      return {
        isDuplicate: true,
        matchType: "FUZZY_NAME_SIMILARITY",
        matchedCollege: col,
        similarityScore: simScore,
        warningMessage: `A college with similar name '${col.name}' already exists in the database (${simScore}% similarity).`,
      };
    }
  }

  return {
    isDuplicate: false,
    similarityScore: 0,
  };
}
