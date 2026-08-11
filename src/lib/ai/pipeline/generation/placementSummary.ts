import { PipelineData } from "../collection/types";
import { getMultiSourceText } from "../collection/sourceFinder";
import { runAiAgent } from "./aiHelper";

export async function generatePlacementSummary(data: PipelineData) {
  const sourceText = getMultiSourceText(
    data,
    ["PLACEMENT", "COURSES"],
    ["placement", "recruiter", "salary", "ctc", "lpa", "career", "internship", "company", "hired", "training", "placement cell"]
  );
  
  if (!sourceText || sourceText.length < 50) return null;

  const collegeName = data.visitedPages.find(p => (p.category || "").toUpperCase() === "HOMEPAGE")?.title.split(/[|\-–,]/)[0].trim() || "The College";
  
  const systemPrompt = `You are the Placement & Career Opportunities Analyst for ${collegeName}.
Write a comprehensive Placement & Career Opportunities Summary (2 detailed paragraphs).
MERGE verified information from all provided source pages (Placement Page, Training & Development, Recruiting Partners, CTC Statistics, and Career Cell pages).

RULES:
1. Do NOT write generic 1-liners. Highlight recruiter partnerships, training programs, and placement stats.
2. NEVER invent salary packages, company names, or placement percentages not present in the source text.
3. If no placement information exists anywhere in the source text, return {"placementSummary": null}.

Return a valid JSON object: {"placementSummary": "String rich summary or null"}`;

  const res = await runAiAgent(systemPrompt, `Source text:\n\n${sourceText}`, { placementSummary: null });
  return res?.placementSummary || null;
}

