import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const db = new PrismaClient();

async function testPageMatch() {
  const decodedId = "c-s-i-bishop-newbigin-college-of-education";
  const cleanTarget = decodedId.toLowerCase().replace(/[^a-z0-9]/g, "");

  const allDbColleges = await db.collegeProfile.findMany({
    select: { id: true, name: true, slug: true },
  });

  const matched = allDbColleges.find((c) => {
    const normName = c.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const normSlug = (c.slug || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return (
      normName === cleanTarget ||
      normSlug === cleanTarget ||
      (cleanTarget.length > 5 && (normName.includes(cleanTarget) || cleanTarget.includes(normName)))
    );
  });

  if (matched) {
    const full = await db.collegeProfile.findUnique({
      where: { id: matched.id },
      include: { courses: true },
    });
    console.log("✅ MATCHED DB COLLEGE:", full?.name);
    console.log("COURSES IN DB:", full?.courses.map(c => c.title));
  } else {
    console.log("❌ NO MATCH FOUND");
  }
}

testPageMatch();
