import { db } from "../src/lib/db";

async function auditColleges() {
  console.log("🔍 Auditing college categories in database...");
  const colleges = await db.collegeProfile.findMany({
    select: { id: true, name: true, category: true, categories: true, courses: { select: { title: true } } },
  });

  console.log(`Total colleges: ${colleges.length}`);
  const catCount: Record<string, number> = {};

  colleges.forEach((c) => {
    const cat = c.category || "Uncategorized";
    catCount[cat] = (catCount[cat] || 0) + 1;
  });

  console.log("\n--- CATEGORY BREAKDOWN ---");
  Object.entries(catCount).forEach(([cat, cnt]) => {
    console.log(`  - ${cat}: ${cnt} colleges`);
  });

  // Check for colleges whose category might not match their name
  const misclassified: Array<{ id: string; name: string; currentCategory: string; suggestedCategory: string }> = [];

  colleges.forEach((c) => {
    const nameLower = c.name.toLowerCase();
    const current = c.category || "";

    let suggested = "";
    if (nameLower.includes("engineering") || nameLower.includes("technology") || nameLower.includes("iit") || nameLower.includes("nit") || nameLower.includes("polytechnic")) {
      if (nameLower.includes("polytechnic")) suggested = "Polytechnic";
      else suggested = "Engineering";
    } else if (nameLower.includes("medical") || nameLower.includes("medicine") || nameLower.includes("hospital") || nameLower.includes("physiotherapy") || nameLower.includes("nursing") || nameLower.includes("dental") || nameLower.includes("pharmacy")) {
      if (nameLower.includes("pharmacy")) suggested = "Pharmacy";
      else if (nameLower.includes("dental")) suggested = "Dental";
      else if (nameLower.includes("nursing")) suggested = "Nursing";
      else suggested = "Medical";
    } else if (nameLower.includes("management") || nameLower.includes("business") || nameLower.includes("iim") || nameLower.includes("mba")) {
      suggested = "Management";
    } else if (nameLower.includes("law") || nameLower.includes("juridical") || nameLower.includes("legal")) {
      suggested = "Law";
    } else if (nameLower.includes("arts") || nameLower.includes("science") || nameLower.includes("commerce")) {
      suggested = "Arts & Science";
    }

    if (suggested && current !== suggested && !current.includes(suggested)) {
      misclassified.push({ id: c.id, name: c.name, currentCategory: current, suggestedCategory: suggested });
    }
  });

  console.log(`\nPotential Category Adjustments Found: ${misclassified.length}`);
  if (misclassified.length > 0) {
    console.log("Sample mismatch:", misclassified.slice(0, 10));
  }
}

auditColleges()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
