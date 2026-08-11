import { executeMultiAgentExtraction } from "../src/lib/ai/pipeline/verification/orchestrator";

async function runTest() {
  console.log("=================================================");
  console.log("Testing Enterprise Deterministic College Extraction Engine");
  console.log("=================================================\n");

  const testUrl = "https://tce.edu"; // Thiagarajar College of Engineering
  console.log(`Starting extraction for target URL: ${testUrl}`);

  try {
    const result = await executeMultiAgentExtraction(testUrl);

    console.log("\n✅ Pipeline Execution Completed Successfully!");
    console.log("\nVisited Pages:");
    result.pipelineData.visitedPages.forEach(p => console.log(` - [${p.category}] ${p.url} (${p.title})`));


    console.log("\nExtracted College Name:", result.extractedData.name?.value);
    console.log("Extracted Est Year:", result.extractedData.estYear?.value);
    console.log("Extracted Website:", result.extractedData.website?.value);
    console.log("Extracted Phone:", result.extractedData.phone?.value);
    console.log("Extracted Email:", result.extractedData.email?.value);
    console.log("Extracted Courses Count:", result.extractedData.courses?.length);
    console.log("Extracted Facilities Count:", result.extractedData.facilities?.value?.length);

    console.log("\nSection 13 AI Summaries Generated:");
    console.log("- Overview:", result.extractedData.collegeContent?.overview ? "Yes" : "Null");
    console.log("- History:", result.extractedData.collegeContent?.history ? "Yes" : "Null");
    console.log("- Vision:", result.extractedData.collegeContent?.vision ? "Yes" : "Null");
    console.log("- Mission:", result.extractedData.collegeContent?.mission ? "Yes" : "Null");
    console.log("- Campus Life:", result.extractedData.collegeContent?.campusLife ? "Yes" : "Null");
    console.log("- Student Life:", result.extractedData.collegeContent?.studentLife ? "Yes" : "Null");
    console.log("- Why Choose:", result.extractedData.collegeContent?.whyChoose ? "Yes" : "Null");
    console.log("- SEO Article:", result.extractedData.collegeContent?.seoArticle ? "Yes" : "Null");

    console.log("\nPipeline Logs:");
    result.logs.forEach(l => console.log(l));

  } catch (err: any) {
    console.error("❌ Test Failed:", err);
  }
}

runTest();
