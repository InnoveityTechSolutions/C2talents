import { PipelineData } from "../collection/types";
import { getMultiSourceText } from "../collection/sourceFinder";
import { runAiAgent } from "./aiHelper";

export async function generateWhyChoose(data: PipelineData) {
  const sourceText = getMultiSourceText(
    data,
    ["ABOUT", "PLACEMENT", "COURSES", "NAAC", "ACHIEVEMENTS"],
    ["why choose", "highlight", "rank", "accreditation", "excellence", "feature", "advantage", "best", "strength"]
  );
  
  if (!sourceText || sourceText.length < 50) return null;

  const collegeName = data.visitedPages.find(p => (p.category || "").toUpperCase() === "HOMEPAGE")?.title.split(/[|\-–,]/)[0].trim() || "The College";
  
  const systemPrompt = `You are the Higher Education Admissions Counselor for ${collegeName}.
Formulate a rich, compelling 'Why Choose College' section (2 detailed paragraphs).
MERGE verified information from all provided source pages (About, Placements, Rankings, Accreditations, Infrastructure, and Achievements).

RULES:
1. Do NOT write generic one-liners. Highlight genuine key strengths, placement records, and academic features.
2. NEVER invent achievements, awards, or statistics not present in the source text.
3. If no distinct highlights exist in the source text, return {"whyChoose": null}.

Return a valid JSON object: {"whyChoose": "String rich summary or null"}`;

  const res = await runAiAgent(systemPrompt, `Source text:\n\n${sourceText}`, { whyChoose: null });
  return res?.whyChoose || null;
}

