/**
 * C2 Talents Contact Number Normalization & Deduplication Engine
 * 
 * Guarantees:
 * 1. Strict separation of Landline numbers (STD code + number) and Mobile numbers (10 digits starting with 6-9).
 * 2. Deduplicates repeated occurrences of the same number regardless of formatting (+91, spaces, hyphens, leading 0).
 * 3. Never generates or guesses mobile numbers.
 * 4. Filters out dummy/placeholder numbers (e.g. 9999999999, 9876543210, 1234567890) and internal platform helplines.
 * 5. Preserves genuinely different verified numbers when an institution publishes multiple lines.
 */

// Known placeholder numbers or internal platform helplines that must NEVER be saved as a college's contact
const BLACKLISTED_DIGITS = new Set([
  "9999999999",
  "9600097807", // C2 Talents internal platform helpline
  "0000000000",
  "1234567890",
  "9876543210",
  "9999999990",
  "1111111111",
  "2222222222",
  "3333333333",
  "4444444444",
  "5555555555",
]);

export interface NormalizedContactItem {
  type: "MOBILE" | "LANDLINE";
  canonical: string; // Digits only used for deduplication
  display: string;   // Clean formatted representation
}

/**
 * Parses and validates an individual phone/mobile token.
 */
export function cleanSingleContactNumber(raw: string): NormalizedContactItem | null {
  if (!raw || typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Extract all digit characters
  const rawDigits = trimmed.replace(/\D/g, "");
  if (!rawDigits || rawDigits.length < 7 || rawDigits.length > 13) {
    return null;
  }

  // Check blacklist
  if (BLACKLISTED_DIGITS.has(rawDigits)) {
    return null;
  }

  // 1. Check for Indian Mobile Number:
  // Must be 10 digits starting with 6, 7, 8, 9
  // Or 11 digits starting with 0 followed by 6-9 (e.g. 09840123456)
  // Or 12 digits starting with 91 followed by 6-9 (e.g. 919840123456)
  let canonicalMobile: string | null = null;
  if (rawDigits.length === 10 && /^[6-9]/.test(rawDigits)) {
    canonicalMobile = rawDigits;
  } else if (rawDigits.length === 11 && rawDigits.startsWith("0") && /^[6-9]/.test(rawDigits.slice(1))) {
    canonicalMobile = rawDigits.slice(1);
  } else if (rawDigits.length === 12 && rawDigits.startsWith("91") && /^[6-9]/.test(rawDigits.slice(2))) {
    canonicalMobile = rawDigits.slice(2);
  }

  if (canonicalMobile) {
    if (BLACKLISTED_DIGITS.has(canonicalMobile)) {
      return null;
    }
    return {
      type: "MOBILE",
      canonical: canonicalMobile,
      display: canonicalMobile,
    };
  }

  // 2. Check for Indian Landline Number with STD Code:
  // Usually 10 to 11 digits total (e.g. 044-25286411 -> 044 (3) + 25286411 (8) = 11 digits with 0)
  // Or 8 digits local number (e.g. 28178200)
  const isLandlinePattern =
    /^0\d{2,4}[\s\-]/.test(trimmed) ||
    /^\+91[-\s]?(?:0)?\d{2,4}[\s\-]/.test(trimmed) ||
    /^\(?0\d{2,4}\)?[\s\-]/.test(trimmed);

  if (isLandlinePattern || (rawDigits.startsWith("0") && rawDigits.length <= 11)) {
    // Standardize STD code format e.g. 044-25286411
    const match = trimmed.match(/^(?:\+91[-\s]?)?\(?(0\d{2,4})\)?[-\s]?(\d{6,8})$/);
    if (match) {
      const std = match[1];
      const local = match[2];
      const formatted = `${std}-${local}`;
      const canonical = `${std.replace(/^0+/, "")}${local}`;
      return {
        type: "LANDLINE",
        canonical,
        display: formatted,
      };
    }
    return {
      type: "LANDLINE",
      canonical: rawDigits.replace(/^91/, "").replace(/^0+/, ""),
      display: trimmed.replace(/^\+91[\s\-]*/, ""),
    };
  }

  // If digits length is 8-11 without mobile starting digit (e.g. landline without 0 prefix, like 04425286411)
  if (rawDigits.length >= 8 && rawDigits.length <= 11 && !/^[6-9]/.test(rawDigits)) {
    let formatted = trimmed;
    if (rawDigits.startsWith("044") && rawDigits.length === 11) {
      formatted = `044-${rawDigits.slice(3)}`;
    }
    return {
      type: "LANDLINE",
      canonical: rawDigits.replace(/^0+/, ""),
      display: formatted,
    };
  }

  return null;
}

/**
 * Splits, deduplicates, and separates raw phone and mobile entries into clean, canonical strings.
 */
export function normalizeAndDeduplicateContactNumbers(
  rawPhone: unknown,
  rawMobile: unknown
): {
  phone: string;
  mobile: string;
  verifiedMobiles: string[];
  verifiedLandlines: string[];
} {
  const parseChunks = (input: unknown): string[] => {
    if (!input) return [];
    if (Array.isArray(input)) return input.flatMap(parseChunks);
    return String(input)
      .split(/[,;\/|\\n\r\t]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const phoneChunks = parseChunks(rawPhone);
  const mobileChunks = parseChunks(rawMobile);

  const seenMobiles = new Set<string>();
  const verifiedMobiles: string[] = [];

  const seenLandlines = new Set<string>();
  const verifiedLandlines: string[] = [];

  // Process mobile chunks first to validate genuine mobiles
  for (const chunk of mobileChunks) {
    const res = cleanSingleContactNumber(chunk);
    if (!res) continue;
    if (res.type === "MOBILE") {
      if (!seenMobiles.has(res.canonical)) {
        seenMobiles.add(res.canonical);
        verifiedMobiles.push(res.display);
      }
    } else if (res.type === "LANDLINE") {
      // Landline mistakenly put in mobile field -> re-route to landline
      if (!seenLandlines.has(res.canonical)) {
        seenLandlines.add(res.canonical);
        verifiedLandlines.push(res.display);
      }
    }
  }

  // Process phone chunks
  for (const chunk of phoneChunks) {
    const res = cleanSingleContactNumber(chunk);
    if (!res) continue;
    if (res.type === "LANDLINE") {
      if (!seenLandlines.has(res.canonical)) {
        seenLandlines.add(res.canonical);
        verifiedLandlines.push(res.display);
      }
    } else if (res.type === "MOBILE") {
      // Mobile in phone field -> only add if not already in mobiles
      if (!seenMobiles.has(res.canonical)) {
        seenMobiles.add(res.canonical);
        verifiedMobiles.push(res.display);
      }
    }
  }

  return {
    phone: verifiedLandlines.join(", "),
    mobile: verifiedMobiles.join(", "),
    verifiedMobiles,
    verifiedLandlines,
  };
}
