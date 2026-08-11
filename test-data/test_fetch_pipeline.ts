

async function testFetchPipeline() {
  const testUrl = "https://srmasc.ac.in/";
  console.log(`=== Testing Hybrid Pipeline on SRM ASC ===`);
  try {
    const res = await fetch("http://localhost:3000/api/admin/ai/fetch-website", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: testUrl })
    });
    
    console.log(`Status: ${res.status}`);
    const result = await res.json();
    
    if (result.success) {
      console.log("\n--- QUALITY REPORT ---");
      console.log(result.qualityReport);
      
      console.log("\n--- FACTUAL FIELDS (Deterministic) ---");
      console.log("Name:", result.data.name);
      console.log("Est Year:", result.data.estYear);
      console.log("Facilities:", result.data.facilities);
      
      console.log("\n--- API LOGS ---");
      console.log(result.logs);
      
      console.log("\n--- AI GENERATED SECTION 13 CONTENT ---");
      console.log("SEO Title:", result.data.seoTitle);
      console.log("SEO Desc:", result.data.seoDescription);
      console.log(result.data.collegeContent);
      
      console.log("\n--- VALIDATED COURSES ---");
      console.log(result.data.courses);
    } else {
      console.error(result);
    }
  } catch (e) {
    console.error(e);
  }
}

testFetchPipeline();
