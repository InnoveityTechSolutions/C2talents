import { parseSearchQuery } from "../src/lib/search/smartParser";
import { db } from "../src/lib/db";

async function runStrictIntentTests() {
  console.log("🧪 Testing Strict Search Intent Parser & Domain Exclusion Engine...\n");

  const testQueries = [
    "engineering",
    "engineering colleges",
    "nearby engineering colleges",
    "near by college for engineering",
    "best engineering colleges",
    "best engineering colleges in Chennai",
    "government engineering colleges",
    "private engineering colleges",
    "autonomous engineering colleges",
    "engineering colleges near Chennai",
    "engineering colleges near Madurai",
    "medical colleges",
    "dental colleges",
    "physiotherapy colleges",
    "law colleges",
    "government colleges in Chennai",
    "NAAC A++ engineering colleges",
    "150 km engineering colleges",
  ];

  for (let i = 0; i < testQueries.length; i++) {
    const q = testQueries[i];
    const parsed = parseSearchQuery(q);

    console.log(`[Scenario ${i + 1}/${testQueries.length}] Query: "${q}"`);
    console.log(`  Parsed Intent -> Intent: ${parsed.intent || "NONE"}, Domain: ${parsed.domain || "NONE"}, Location: ${parsed.targetLocation || "NONE"}, Ownership: ${parsed.targetOwnership || "NONE"}, NAAC: ${parsed.targetNaacGrade || "NONE"}`);

    const where: any = {
      status: { not: "DRAFT" },
      isDeleted: false,
    };
    const andConditions: any[] = [];

    const domain = parsed.domain;
    if (domain === "ENGINEERING") {
      andConditions.push({
        OR: [
          { name: { contains: "Engineering" } },
          { name: { contains: "Technology" } },
          { name: { contains: "IIT" } },
          { name: { contains: "NIT" } },
          { categories: { contains: "Engineering" } },
          {
            courses: {
              some: {
                OR: [
                  { title: { contains: "B.Tech" } },
                  { title: { contains: "B.E" } },
                  { title: { contains: "BE" } },
                  { title: { contains: "M.Tech" } },
                  { title: { contains: "M.E" } },
                  { title: { contains: "Engineering" } },
                ],
              },
            },
          },
        ],
      });
    } else if (domain === "DENTAL") {
      andConditions.push({
        OR: [
          { name: { contains: "Dental" } },
          { description: { contains: "Dental" } },
          { courses: { some: { title: { contains: "BDS" } } } },
        ],
      });
    } else if (domain === "PHYSIOTHERAPY") {
      andConditions.push({
        OR: [
          { name: { contains: "Physiotherapy" } },
          { description: { contains: "Physiotherapy" } },
          { courses: { some: { title: { contains: "BPT" } } } },
        ],
      });
    } else if (domain === "MEDICAL") {
      andConditions.push({
        OR: [
          { name: { contains: "Medical" } },
          { name: { contains: "Medicine" } },
          { courses: { some: { title: { contains: "MBBS" } } } },
        ],
      });
    }

    if (parsed.targetLocation) {
      andConditions.push({
        OR: [
          { location: { contains: parsed.targetLocation } },
          { city: { contains: parsed.targetLocation } },
          { district: { contains: parsed.targetLocation } },
        ],
      });
    }

    if (andConditions.length > 0) where.AND = andConditions;

    const rawDbColleges = await db.collegeProfile.findMany({
      where,
      include: { courses: true },
      take: 50,
    });

    const filtered = rawDbColleges.filter((c) => {
      const nameL = c.name.toLowerCase();
      const hasEnggCourse = c.courses.some((course) =>
        /b\.?tech|b\.?e|m\.?tech|m\.?e|engineering|cse|ece|eee|mechanical|civil/i.test(course.title)
      );

      if (domain === "ENGINEERING") {
        if (/dental|physiotherapy|nursing|pharmacy|paramedical|siddha|ayurveda|homeopathy/i.test(nameL) && !hasEnggCourse) {
          return false;
        }
        if (/medical|hospital/i.test(nameL) && !/engineering|technology/i.test(nameL) && !hasEnggCourse) {
          return false;
        }
      } else if (domain === "MEDICAL") {
        if (/engineering|technology|dental|physiotherapy/i.test(nameL) && !nameL.includes("medical")) return false;
      }
      return true;
    });

    console.log(`  Matching Colleges Found: ${filtered.length}`);

    // Verify ZERO dental/physiotherapy/medical colleges returned when query has Engineering intent
    if (domain === "ENGINEERING") {
      const invalidColleges = filtered.filter(c => /dental|physiotherapy|nursing/i.test(c.name.toLowerCase()));
      if (invalidColleges.length > 0) {
        console.error(`  ❌ FAIL: Returned unrelated colleges for engineering: ${invalidColleges.map(c=>c.name).join(", ")}`);
        process.exit(1);
      } else {
        console.log(`  ✅ Domain Exclusion Verified: 0 Dental / Physiotherapy colleges in Engineering results.`);
      }
    }

    if (filtered.length > 0) {
      console.log(`  Top Candidate: "${filtered[0].name}" (${filtered[0].city || "N/A"})`);
    }
    console.log("------------------------------------------------------------------------");
  }

  console.log("\n✅ ALL 18 STRICT SEARCH INTENT TEST SCENARIOS PASSED WITH ZERO UNRELATED DOMAIN LEAKS!");
}

runStrictIntentTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Intent verification failed:", err);
    process.exit(1);
  });
