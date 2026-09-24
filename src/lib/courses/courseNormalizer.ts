/**
 * Strict Course Normalization and Matching Engine
 * Enforces true database relationship verification for academic programs.
 */

export interface CanonicalCourse {
  key: string;
  name: string;
  degreeLevel: "UG" | "PG" | "DOCTORATE" | "DIPLOMA";
  aliases: string[];
  patterns: RegExp[];
  dbMatchPatterns: string[];
}

export const CANONICAL_COURSES: Record<string, CanonicalCourse> = {
  BBA: {
    key: "BBA",
    name: "BBA",
    degreeLevel: "UG",
    aliases: ["bba", "b.b.a", "bachelor of business administration", "bba hons", "bba general"],
    patterns: [/\bb\.?b\.?a\b/i, /\bbachelor\s+of\s+business\s+administration\b/i],
    dbMatchPatterns: ["BBA", "B.B.A", "Business Administration"],
  },
  BCA: {
    key: "BCA",
    name: "BCA",
    degreeLevel: "UG",
    aliases: ["bca", "b.c.a", "bachelor of computer applications"],
    patterns: [/\bb\.?c\.?a\b/i, /\bbachelor\s+of\s+computer\s+applications\b/i],
    dbMatchPatterns: ["BCA", "B.C.A", "Computer Applications"],
  },
  MBA: {
    key: "MBA",
    name: "MBA",
    degreeLevel: "PG",
    aliases: ["mba", "m.b.a", "master of business administration", "pgdm"],
    patterns: [/\bm\.?b\.?a\b/i, /\bmaster\s+of\s+business\s+administration\b/i, /\bpgdm\b/i],
    dbMatchPatterns: ["MBA", "M.B.A", "PGDM"],
  },
  MBBS: {
    key: "MBBS",
    name: "MBBS",
    degreeLevel: "UG",
    aliases: ["mbbs", "m.b.b.s", "bachelor of medicine"],
    patterns: [/\bm\.?b\.?b\.?s\b/i, /\bbachelor\s+of\s+medicine\b/i],
    dbMatchPatterns: ["MBBS", "M.B.B.S"],
  },
  BTECH: {
    key: "BTECH",
    name: "B.Tech / B.E",
    degreeLevel: "UG",
    aliases: ["btech", "b.tech", "be", "b.e", "bachelor of technology", "bachelor of engineering"],
    patterns: [/\bb\.?tech\b/i, /\bb\.?e\.?\b/i, /\bbachelor\s+of\s+(?:technology|engineering)\b/i],
    dbMatchPatterns: ["B.Tech", "B.E", "Bachelor of Technology", "Engineering"],
  },
  MTECH: {
    key: "MTECH",
    name: "M.Tech / M.E",
    degreeLevel: "PG",
    aliases: ["mtech", "m.tech", "me", "m.e", "master of technology", "master of engineering"],
    patterns: [/\bm\.?tech\b/i, /\bm\.?e\.?\b/i, /\bmaster\s+of\s+(?:technology|engineering)\b/i],
    dbMatchPatterns: ["M.Tech", "M.E", "Master of Technology"],
  },
  BPHARMA: {
    key: "BPHARMA",
    name: "B.Pharma",
    degreeLevel: "UG",
    aliases: ["bpharm", "bpharma", "b.pharm", "b.pharma", "bachelor of pharmacy", "dpharm", "d.pharm"],
    patterns: [/\bb\.?pharm(?:a)?\b/i, /\bbachelor\s+of\s+pharmacy\b/i, /\bd\.?pharm(?:a)?\b/i],
    dbMatchPatterns: ["B.Pharm", "B.Pharma", "Pharmacy", "D.Pharm"],
  },
  LAW: {
    key: "LAW",
    name: "Law (LL.B)",
    degreeLevel: "UG",
    aliases: ["law", "llb", "ll.b", "ba llb", "bba llb", "bachelor of law"],
    patterns: [/\bl\.?l\.?b\b/i, /\bba\s+llb\b/i, /\bbba\s+llb\b/i, /\bbachelor\s+of\s+law\b/i],
    dbMatchPatterns: ["LLB", "LL.B", "Law"],
  },
  COMMERCE: {
    key: "COMMERCE",
    name: "Commerce (B.Com)",
    degreeLevel: "UG",
    aliases: ["bcom", "b.com", "mcom", "m.com", "bachelor of commerce"],
    patterns: [/\bb\.?com\b/i, /\bm\.?com\b/i, /\bbachelor\s+of\s+commerce\b/i],
    dbMatchPatterns: ["B.Com", "M.Com", "Commerce"],
  },
  ARTS_SCIENCE: {
    key: "ARTS_SCIENCE",
    name: "Arts & Science (BA / B.Sc)",
    degreeLevel: "UG",
    aliases: ["ba", "b.a", "bsc", "b.sc", "ma", "m.a", "msc", "m.sc", "arts", "science"],
    patterns: [/\bb\.?a\b/i, /\bb\.?sc\b/i, /\bbsc\b/i, /\bba\b/i, /\bm\.?sc\b/i, /\bma\b/i],
    dbMatchPatterns: ["B.A", "B.Sc", "BSc", "BA", "M.Sc", "M.A"],
  },
};

/**
 * Detect canonical course from text query or query parameter
 */
export function detectCourseFromQuery(input: string): CanonicalCourse | null {
  if (!input || !input.trim()) return null;
  const raw = input.trim();

  // 1. Direct key match (e.g. "BBA", "btech", "BCA")
  const upperKey = raw.toUpperCase().replace(/[^A-Z]/g, "");
  if (CANONICAL_COURSES[upperKey]) {
    return CANONICAL_COURSES[upperKey];
  }

  // 2. Check each canonical definition patterns
  for (const course of Object.values(CANONICAL_COURSES)) {
    for (const pattern of course.patterns) {
      if (pattern.test(raw)) {
        return course;
      }
    }
  }

  return null;
}

/**
 * Build strict Prisma relational query filter for a canonical course.
 * Guarantees that only colleges with at least one matching course in their courses[] table are returned.
 */
export function getPrismaCourseRelationalFilter(courseOrKey: CanonicalCourse | string): any {
  const course = typeof courseOrKey === "string"
    ? (CANONICAL_COURSES[courseOrKey as any] || detectCourseFromQuery(courseOrKey))
    : courseOrKey;

  if (!course || !course.dbMatchPatterns) {
    // If invalid or unknown, guarantee 0 matches safely
    return { id: "__NO_MATCH__" };
  }

  return {
    courses: {
      some: {
        isDeleted: false,
        OR: course.dbMatchPatterns.map((term) => ({
          title: { contains: term },
        })),
      },
    },
  };
}

/**
 * In-memory validator ensuring a college actually possesses a course matching the canonical definition.
 * Used as a zero-trust post-filter to protect against false positives.
 */
export function isCollegeOfferingCourse(
  college: { name?: string; courses?: Array<{ title?: string; isDeleted?: boolean; stream?: string }> | null },
  courseOrKey: CanonicalCourse | string
): boolean {
  if (!college || !Array.isArray(college.courses) || college.courses.length === 0) {
    return false;
  }

  const course = typeof courseOrKey === "string"
    ? (CANONICAL_COURSES[courseOrKey as any] || detectCourseFromQuery(courseOrKey))
    : courseOrKey;

  if (!course || !course.patterns) return false;

  return college.courses.some((c) => {
    if (!c || c.isDeleted || !c.title) return false;
    const title = c.title;

    // Direct pattern verification
    return course.patterns.some((pattern) => pattern.test(title));
  });
}
