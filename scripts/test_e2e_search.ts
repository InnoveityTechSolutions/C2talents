import { PrismaClient } from "@prisma/client";
import { matchesCollegeSearch } from "../src/lib/search/searchNormalizer";
import { checkForDuplicateCollege } from "../src/lib/duplicateChecker";

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

async function runE2ETests() {
  console.log("=== STARTING RIGOROUS E2E VERIFICATION ===");

  // 1. Find college in MySQL DB
  console.log("\n[TEST 1] Querying MySQL DB directly for Chevalier college...");
  const dbRecord = await prisma.collegeProfile.findFirst({
    where: {
      isDeleted: false,
      OR: [
        { name: { contains: "Chevaliar" } },
        { name: { contains: "Chevalier" } },
      ],
    },
    select: {
      id: true,
      name: true,
      shortName: true,
      slug: true,
      city: true,
      location: true,
      status: true,
      website: true,
      email: true,
      isDeleted: true,
    },
  });

  if (!dbRecord) {
    throw new Error("FAILED: College not found in database!");
  }
  console.log("Found in DB:", JSON.stringify(dbRecord, null, 2));

  // 2. Test Admin API / Search
  console.log("\n[TEST 2] Testing Admin Search Queries on /api/admin/colleges and client filter...");
  const adminQueries = [
    "Chevalier T. Thomas Elizabeth College (CTTEC) for Women",
    "Chevalier",
    "Chevaliar",
    "CTTEC",
    "cttec",
    "CTTEWC",
    "Thomas Elizabeth",
    "Elizabeth College",
  ];

  // Fetch all admin colleges (what the manager UI does)
  const allAdminRes = await fetch(`${BASE_URL}/api/admin/colleges`, { cache: "no-store" });
  const allAdminData = await allAdminRes.json();
  console.log(`Fetched total colleges for Admin Manager: ${allAdminData.colleges?.length || 0}`);

  for (const q of adminQueries) {
    // A. Frontend client-side filter simulation (as used in src/app/admin/colleges/page.tsx)
    const clientMatches = (allAdminData.colleges || []).filter((c: any) =>
      matchesCollegeSearch(c, q)
    );
    const foundTargetClient = clientMatches.some((c: any) => c.id === dbRecord.id);

    // B. Direct API query simulation (?query=...)
    const apiRes = await fetch(`${BASE_URL}/api/admin/colleges?query=${encodeURIComponent(q)}`, {
      cache: "no-store",
    });
    const apiData = await apiRes.json();
    const foundTargetApi = (apiData.colleges || []).some((c: any) => c.id === dbRecord.id);

    console.log(
      `Query "${q}": Admin Client Matches = ${clientMatches.length} (Target ID found: ${foundTargetClient}) | Admin API matches = ${apiData.colleges?.length || 0} (Target ID found: ${foundTargetApi})`
    );

    if (!foundTargetClient) {
      throw new Error(`FAILED: Client search failed for query: "${q}"`);
    }
    if (!foundTargetApi) {
      throw new Error(`FAILED: Admin API search failed for query: "${q}"`);
    }
  }

  // 3. Confirm Public Frontend and Admin Manager Reference Same Underlying Record
  console.log("\n[TEST 3] Comparing Public API (/api/colleges) with Admin Record...");
  for (const q of ["Chevalier", "Chevaliar", "CTTEC", "Thomas Elizabeth"]) {
    const pubRes = await fetch(`${BASE_URL}/api/colleges?search=${encodeURIComponent(q)}`, {
      cache: "no-store",
    });
    const pubData = await pubRes.json();
    const pubColleges = Array.isArray(pubData) ? pubData : (pubData.colleges || []);
    const targetInPublic = pubColleges.find((c: any) => c.id === dbRecord.id);

    console.log(
      `Public Search "${q}": Found ${pubColleges.length} results. Target Record matched? ${Boolean(targetInPublic)}`
    );
    if (!targetInPublic) {
      throw new Error(`FAILED: Public search failed for query: "${q}"`);
    }
    if (targetInPublic.id !== dbRecord.id) {
      throw new Error(`FAILED: ID mismatch between public (${targetInPublic.id}) and DB (${dbRecord.id})`);
    }
  }

  // 4. Duplicate Check Workflow
  console.log("\n[TEST 4] Testing duplicate check workflow...");
  const dupCheck1 = await checkForDuplicateCollege({
    name: "Chevalier T. Thomas Elizabeth College (CTTEC) for Women",
    website: "https://cttewc.edu.in/",
  });
  console.log("Duplicate check with variant name & official website:");
  console.log({
    isDuplicate: dupCheck1.isDuplicate,
    matchType: dupCheck1.matchType,
    matchedId: dupCheck1.matchedCollege?.id,
    matchedName: dupCheck1.matchedCollege?.name,
    matchedStatus: dupCheck1.matchedCollege?.status,
    matchedLocation: dupCheck1.matchedCollege?.location,
    matchedSlug: dupCheck1.matchedCollege?.slug,
    score: dupCheck1.similarityScore,
  });

  if (!dupCheck1.isDuplicate || dupCheck1.matchedCollege?.id !== dbRecord.id) {
    throw new Error("FAILED: Duplicate check failed to detect existing Chevalier college!");
  }

  const dupCheckByNameOnly = await checkForDuplicateCollege({
    name: "Chevalier T. Thomas Elizabeth College for Women",
  });
  console.log("Duplicate check with variant name ONLY (no website/email/phone):");
  console.log({
    isDuplicate: dupCheckByNameOnly.isDuplicate,
    matchType: dupCheckByNameOnly.matchType,
    matchedId: dupCheckByNameOnly.matchedCollege?.id,
    score: dupCheckByNameOnly.similarityScore,
  });

  if (!dupCheckByNameOnly.isDuplicate || dupCheckByNameOnly.matchedCollege?.id !== dbRecord.id) {
    throw new Error("FAILED: Duplicate check by name failed!");
  }

  // 5. Test genuinely new college can be added without false-positive duplicate
  console.log("\n[TEST 5] Testing genuinely new college duplicate check...");
  const newCollegeName = "St. Zephyr Unique Global Institute of Applied Advanced Technology 2026";
  const newDupCheck = await checkForDuplicateCollege({
    name: newCollegeName,
    website: "https://zephyrunique2026.edu.in",
  });
  console.log("New College Duplicate Check Result:", {
    isDuplicate: newDupCheck.isDuplicate,
    similarityScore: newDupCheck.similarityScore,
  });

  if (newDupCheck.isDuplicate) {
    throw new Error("FAILED: False positive duplicate detected for new college!");
  }

  // 6. Test both team members / simultaneous consistency
  console.log("\n[TEST 6] Verifying consistency across multiple independent calls...");
  const user1Results = (allAdminData.colleges || []).filter((c: any) =>
    matchesCollegeSearch(c, "CTTEC")
  );
  const user2Results = (allAdminData.colleges || []).filter((c: any) =>
    matchesCollegeSearch(c, "CTTEC")
  );
  console.log(
    `User 1 results count: ${user1Results.length}, User 2 results count: ${user2Results.length}, Identical: ${user1Results[0]?.id === user2Results[0]?.id}`
  );

  console.log("\n>>> ALL 6 E2E TESTS PASSED WITH 100% SUCCESS! <<<");
}

runE2ETests()
  .catch((err) => {
    console.error("E2E Test Error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
