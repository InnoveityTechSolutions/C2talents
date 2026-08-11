import { PipelineData } from "../collection/types";
import { searchFullWebsiteContent } from "../collection/sourceFinder";
import { runAiAgent } from "./aiHelper";

export async function generateFaq(data: PipelineData) {
  const sourceText = searchFullWebsiteContent(data);
  const collegeName = data.visitedPages.find(p => (p.category || "").toUpperCase() === "HOMEPAGE")?.title.split(/[|\-–,]/)[0].trim() || "The College";
  
  const systemPrompt = `You are the Student Inquiry & Help Desk Specialist for ${collegeName}. 
Generate 5 to 8 detailed, highly informative Frequently Asked Questions (FAQs) and verified answers based on the entire website content.

RULES:
1. Cover key student topics: Admissions, Courses, Fees, Placements, Hostel, and Campus Facilities.
2. NEVER invent answers, dates, or fees not present in the source text.
3. Provide complete, helpful answers based strictly on verified source information.

Return a valid JSON object: {"faq": [{"question": "...", "answer": "..."}]}`;

  const res = await runAiAgent(systemPrompt, `Entire website content:\n\n${sourceText.slice(0, 30000)}`, { faq: null });
  return res?.faq || null;
}

