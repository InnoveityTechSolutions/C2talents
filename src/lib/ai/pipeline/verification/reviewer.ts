import { runAiAgent } from "../generation/aiHelper";

export async function reviewExtraction(data: any) {
  const systemPrompt = `You are the Final Review Agent for a college extraction pipeline.
You will receive a JSON object of extracted data.
Your job is to:
1. Fix grammar and capitalization.
2. Remove any contradictory statements or hallucinated phrases like "Data not provided" or "As an AI...".
3. Ensure absolute consistency.
4. DO NOT generate new facts. If something is missing, leave it as null.
Return the exact same JSON schema but with reviewed values.
`;

  // We only send the Section 13 content to the reviewer to save tokens and prevent structured fields from being messed up
  const contentToReview = JSON.stringify(data.collegeContent || {}, null, 2);
  const reviewedContent = await runAiAgent(systemPrompt, `Review this data:\n\n${contentToReview}`, data.collegeContent);
  
  if (reviewedContent && typeof reviewedContent === "object") {
    data.collegeContent = { ...data.collegeContent, ...reviewedContent };
  }
  
  return data;
}
