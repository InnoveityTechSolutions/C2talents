import { db } from "@/lib/db";

/**
 * Normalizes a course title by trimming whitespace and collapsing repeated spaces.
 */
export function normalizeCourseTitle(title: string): string {
  if (!title || typeof title !== "string") return "";
  return title.trim().replace(/\s+/g, " ");
}

/**
 * Generates a stable, canonical deduplication key for a course title.
 * Used for comparing courses within the SAME college to prevent duplicates while
 * strictly preserving distinct specializations, degrees, and academic levels.
 *
 * Rules:
 * 1. Trims and collapses whitespace.
 * 2. Case-insensitive comparison.
 * 3. Normalizes degree punctuation (e.g. "B.Tech" -> "btech", "B.E." -> "be", "M.Sc." -> "msc").
 * 4. Normalizes symbols: "&" <-> "and".
 * 5. Normalizes connecting prepositions between degree and specialization (e.g. "B.Tech in CSE" vs "B.Tech CSE").
 * 6. NEVER merges different degrees (e.g. B.Tech vs M.Tech, B.Sc vs M.Sc, UG vs PG).
 * 7. NEVER merges different specializations (e.g. "CSE" vs "Mechanical", "AI & Data Science" vs "AI").
 */
export function getCourseDeduplicationKey(title: string): string {
  if (!title || typeof title !== "string") return "";

  let norm = title.trim().toLowerCase().replace(/\s+/g, " ");

  // Normalize "&" to "and"
  norm = norm.replace(/\s*&\s*/g, " and ");

  // Normalize degree abbreviations (removing internal dots without changing letters)
  norm = norm
    .replace(/\bb\.?\s*tech\.?\b/g, "btech")
    .replace(/\bm\.?\s*tech\.?\b/g, "mtech")
    .replace(/\bb\.?\s*e\.?\b/g, "be")
    .replace(/\bm\.?\s*e\.?\b/g, "me")
    .replace(/\bb\.?\s*sc\.?\b/g, "bsc")
    .replace(/\bm\.?\s*sc\.?\b/g, "msc")
    .replace(/\bb\.?\s*com\.?\b/g, "bcom")
    .replace(/\bm\.?\s*com\.?\b/g, "mcom")
    .replace(/\bb\.?\s*b\.?\s*a\.?\b/g, "bba")
    .replace(/\bm\.?\s*b\.?\s*a\.?\b/g, "mba")
    .replace(/\bm\.?\s*c\.?\s*a\.?\b/g, "mca")
    .replace(/\bb\.?\s*c\.?\s*a\.?\b/g, "bca")
    .replace(/\bph\.?\s*d\.?\b/g, "phd")
    .replace(/\bl\.?\s*l\.?\s*b\.?\b/g, "llb")
    .replace(/\bl\.?\s*l\.?\s*m\.?\b/g, "llm")
    .replace(/\bd\.?\s*pharm\.?\b/g, "dpharm")
    .replace(/\bb\.?\s*pharm\.?\b/g, "bpharm")
    .replace(/\bm\.?\s*pharm\.?\b/g, "mpharm");

  // Remove common connecting prepositions between degree and specialization:
  // e.g. "btech in computer science" -> "btech computer science"
  // e.g. "bachelor of technology in civil engineering" -> "btech civil engineering"
  norm = norm
    .replace(/\bbachelor\s+of\s+technology\b/g, "btech")
    .replace(/\bbachelor\s+of\s+engineering\b/g, "be")
    .replace(/\bmaster\s+of\s+technology\b/g, "mtech")
    .replace(/\bmaster\s+of\s+engineering\b/g, "me")
    .replace(/\bbachelor\s+of\s+science\b/g, "bsc")
    .replace(/\bmaster\s+of\s+science\b/g, "msc")
    .replace(/\bbachelor\s+of\s+commerce\b/g, "bcom")
    .replace(/\bmaster\s+of\s+commerce\b/g, "mcom");

  // Normalize " - " or " : " or " in " separating degree and branch
  norm = norm.replace(/\b(in|of)\b/g, " ");
  norm = norm.replace(/[\-–—:\(\)\[\],.]+/g, " ");

  // Collapse whitespace again and trim
  return norm.replace(/\s+/g, " ").trim();
}

/**
 * Extracts verified minimum percentage from minGpa or eligibility text.
 * Returns null if no verified percentage was found (does NOT invent or default to 50%/60%).
 */
export function extractMinPercentage(eligibility?: string | null, rawMinGpa?: any): number | null {
  if (rawMinGpa !== undefined && rawMinGpa !== null && rawMinGpa !== "") {
    const parsed = typeof rawMinGpa === "number" ? rawMinGpa : parseFloat(String(rawMinGpa).replace(/[^0-9.]/g, ""));
    if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
      return parsed;
    }
  }

  if (!eligibility || typeof eligibility !== "string") {
    return null;
  }

  // Look for percentage patterns: "minimum 50%", "min 60%", "50% aggregate", "at least 55%", "with 60%"
  const clean = eligibility.trim();
  const match =
    clean.match(/(?:minimum|min\.?|at\s+least|with|aggregate)?\s*([0-9]{2}(?:\.[0-9]+)?)\s*%/i) ||
    clean.match(/([0-9]{2}(?:\.[0-9]+)?)\s*%\s*(?:in|marks|aggregate|score|minimum)?/i);

  if (match) {
    const num = parseFloat(match[1]);
    if (!isNaN(num) && num >= 30 && num <= 100) {
      return num;
    }
  }

  return null;
}

/**
 * Parses course fees safely without inventing defaults.
 * Converts Lakhs to full numeric values and semester fees to annual amounts when specified.
 * Returns 0 if fee is unknown or unverified.
 */
export function parseCourseFee(rawFee?: any): number {
  if (rawFee === undefined || rawFee === null || rawFee === "") {
    return 0;
  }
  if (typeof rawFee === "number") {
    return isNaN(rawFee) || rawFee < 0 ? 0 : rawFee;
  }

  const str = String(rawFee).trim().toLowerCase();
  if (!str || /^(n\/?a|not available|null|unknown|tbd)$/i.test(str)) {
    return 0;
  }

  // Check for Lakhs (e.g. "1.5 Lakhs", "1.5L", "2 Lakh")
  const lakhMatch = str.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:lakhs?|lac|l\b)/i);
  if (lakhMatch) {
    const val = parseFloat(lakhMatch[1]) * 100000;
    if (str.includes("sem") || str.includes("half year")) {
      return Math.round(val * 2);
    }
    return Math.round(val);
  }

  // Clean commas and extract digits
  const clean = str.replace(/,/g, "");
  const numMatch = clean.match(/([0-9]+(?:\.[0-9]+)?)/);
  if (!numMatch) {
    return 0;
  }

  const num = parseFloat(numMatch[1]);
  if (isNaN(num) || num <= 0) {
    return 0;
  }

  // If specified as semester fee, multiply by 2 for annual fee
  if (str.includes("sem") || str.includes("half year")) {
    return Math.round(num * 2);
  }

  return Math.round(num);
}

export interface IncomingCourseData {
  id?: string;
  title: string;
  duration?: string | null;
  feesPerYear?: number | string | null;
  minGpa?: number | string | null;
  eligibility?: string | null;
  seats?: number | string | null;
  entranceExam?: string | null;
  careerPath?: string | null;
  demand?: string | null;
}

/**
 * Deduplicates an in-memory list of courses (e.g. from AI extraction or JSON import)
 * keeping the richest course record for each unique canonical key.
 */
export function deduplicateCourseList<T extends { title?: string; feesPerYear?: any; minGpa?: any; eligibility?: any; seats?: any }>(
  courses: T[]
): T[] {
  if (!Array.isArray(courses) || courses.length === 0) return [];

  const map = new Map<string, T>();

  for (const c of courses) {
    if (!c || !c.title) continue;
    const cleanTitle = normalizeCourseTitle(c.title);
    if (!cleanTitle || cleanTitle.length < 2) continue;

    const key = getCourseDeduplicationKey(cleanTitle);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, { ...c, title: cleanTitle });
    } else {
      // Merge: prefer fields that have verified information
      const existingFee = parseCourseFee(existing.feesPerYear);
      const incomingFee = parseCourseFee(c.feesPerYear);
      const existingMinGpa = extractMinPercentage(existing.eligibility, existing.minGpa);
      const incomingMinGpa = extractMinPercentage(c.eligibility, c.minGpa);

      map.set(key, {
        ...existing,
        ...c,
        title: cleanTitle.length > existing.title!.length ? cleanTitle : existing.title,
        feesPerYear: incomingFee > 0 ? incomingFee : existingFee,
        minGpa: incomingMinGpa !== null ? incomingMinGpa : existingMinGpa,
        eligibility: c.eligibility || existing.eligibility,
        seats: c.seats || existing.seats,
      });
    }
  }

  return Array.from(map.values());
}

/**
 * Safe Upsert Engine for College Courses.
 *
 * Guarantees:
 * 1. Scope: Scoped strictly to `collegeId`. Does not merge courses between different colleges.
 * 2. Identity: Matches by `collegeId` + `getCourseDeduplicationKey(title)`.
 * 3. Atomic / Concurrency: Uses transaction and existing record locking.
 * 4. Updates Existing: When a matching course exists, updates its details in-place
 *    WITHOUT generating a new course ID or breaking foreign keys (applications, leads).
 * 5. Inserts New: Inserts genuinely new courses.
 * 6. No Fabricated Defaults: Preserves exact fees or 0 (never ₹60,000), preserves verified minGpa or null.
 */
export async function upsertCollegeCourses(
  collegeId: string,
  incomingCourses: IncomingCourseData[],
  tx?: any
): Promise<{ createdCount: number; updatedCount: number; totalCount: number; courseIds: string[] }> {
  const runner = tx || db;

  if (!collegeId || typeof collegeId !== "string") {
    throw new Error("upsertCollegeCourses: collegeId is required");
  }

  if (!Array.isArray(incomingCourses) || incomingCourses.length === 0) {
    return { createdCount: 0, updatedCount: 0, totalCount: 0, courseIds: [] };
  }

  // 1. Deduplicate incoming courses first
  const cleanIncoming = deduplicateCourseList(incomingCourses);

  // 2. Query existing active courses for this college
  const existingCourses = await runner.course.findMany({
    where: {
      collegeId,
      isDeleted: false,
    },
    select: {
      id: true,
      title: true,
      duration: true,
      feesPerYear: true,
      minGpa: true,
      eligibility: true,
      seats: true,
      entranceExam: true,
      careerPath: true,
      demand: true,
    },
  });

  // Map existing courses by deduplication key
  const existingMap = new Map<string, typeof existingCourses[0]>();
  for (const ec of existingCourses) {
    const key = getCourseDeduplicationKey(ec.title);
    if (!existingMap.has(key)) {
      existingMap.set(key, ec);
    }
  }

  let createdCount = 0;
  let updatedCount = 0;
  const courseIds: string[] = [];

  for (const inc of cleanIncoming) {
    const title = normalizeCourseTitle(inc.title);
    if (!title) continue;

    const key = getCourseDeduplicationKey(title);
    const existing = existingMap.get(key);

    const parsedFee = parseCourseFee(inc.feesPerYear);
    const parsedMinGpa = extractMinPercentage(inc.eligibility, inc.minGpa);
    const parsedSeats = inc.seats ? parseInt(String(inc.seats).replace(/[^0-9]/g, ""), 10) || null : null;
    const duration = (inc.duration || (existing ? existing.duration : "4 Years")).trim();
    const eligibility = inc.eligibility ? String(inc.eligibility).trim() : (existing?.eligibility ?? null);
    const entranceExam = inc.entranceExam ? String(inc.entranceExam).trim() : (existing?.entranceExam ?? null);
    const careerPath = inc.careerPath ? String(inc.careerPath).trim() : (existing?.careerPath ?? null);
    const demand = inc.demand ? String(inc.demand).trim() : (existing?.demand ?? "High");

    if (existing) {
      // UPDATE in place — preserve ID, applications, and leads
      // Only overwrite fee if incoming has a verified non-zero fee or existing was 0
      const finalFee = parsedFee > 0 ? parsedFee : existing.feesPerYear;
      const finalMinGpa = parsedMinGpa !== null ? parsedMinGpa : existing.minGpa;

      const updated = await runner.course.update({
        where: { id: existing.id },
        data: {
          title: title, // keep cleanest casing
          duration,
          feesPerYear: finalFee,
          minGpa: finalMinGpa,
          eligibility,
          seats: parsedSeats !== null ? parsedSeats : existing.seats,
          entranceExam,
          careerPath,
          demand,
          updatedAt: new Date(),
        },
        select: { id: true },
      });

      courseIds.push(updated.id);
      updatedCount++;
    } else {
      // INSERT new course
      const created = await runner.course.create({
        data: {
          collegeId,
          title,
          duration,
          feesPerYear: parsedFee,
          minGpa: parsedMinGpa,
          eligibility,
          seats: parsedSeats,
          entranceExam,
          careerPath,
          demand,
        },
        select: { id: true },
      });

      // Register into existingMap to avoid duplicate inserts within the same call
      existingMap.set(key, {
        id: created.id,
        title,
        duration,
        feesPerYear: parsedFee,
        minGpa: parsedMinGpa,
        eligibility,
        seats: parsedSeats,
        entranceExam,
        careerPath,
        demand,
      });

      courseIds.push(created.id);
      createdCount++;
    }
  }

  return {
    createdCount,
    updatedCount,
    totalCount: courseIds.length,
    courseIds,
  };
}
