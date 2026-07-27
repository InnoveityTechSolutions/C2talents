async function testSaveCollege() {
  console.log("=== TESTING SAVE COLLEGE BACKEND FLOW ===");
  const testPayload = {
    name: "Loyola College Test " + Date.now(),
    shortName: "LOYOLA",
    slug: "loyola-college-test-" + Date.now(),
    description: "Premier college in Chennai.",
    city: "Chennai",
    state: "Tamil Nadu",
    type: "Private",
    ownership: "Private",
    categories: "Arts & Science, Autonomous",
    feesPerYear: 55000,
    avgPackage: 6.5,
    highestPackage: 15.0,
    status: "PUBLISHED",
    courses: [
      { title: "B.Sc Computer Science", feesPerYear: 55000 }
    ],
    galleryImages: []
  };

  const res = await fetch("http://localhost:3000/api/admin/colleges", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testPayload),
  });

  console.log("Response Status:", res.status);
  const data = await res.json();
  console.log("Response Body:", data);
}

testSaveCollege().catch(console.error);
