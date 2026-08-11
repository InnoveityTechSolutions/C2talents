import "dotenv/config";
import { executeMultiAgentExtraction } from "./src/lib/ai/pipeline/verification/orchestrator";

async function test() {
  const testUrls = ["https://smgacw.org/", "https://ceg.annauniv.edu/"];

  for (const url of testUrls) {
    console.log("\n====================================================");
    console.log("🚀 TESTING EXTRACTION FOR:", url);
    console.log("====================================================");

    const result = await executeMultiAgentExtraction(url);

    console.log("\n📍 CONTACT INFO:");
    console.log({
      phone: result.extractedData.phone?.value,
      mobile: result.extractedData.mobile?.value,
      email: result.extractedData.email?.value,
      website: result.extractedData.website?.value,
      address: result.extractedData.address?.value,
      city: result.extractedData.city?.value,
      facebook: result.extractedData.facebook?.value,
      instagram: result.extractedData.instagram?.value,
      linkedin: result.extractedData.linkedin?.value,
      youtube: result.extractedData.youtube?.value,
    });

    console.log("\n📚 COURSES EXTRACTED:");
    console.log("Total Count:", result.extractedData.courses?.length || 0);
    console.log("Sample Courses:", result.extractedData.courses?.slice(0, 8));
  }
}

test().catch(console.error);
