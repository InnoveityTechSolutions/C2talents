import { PipelineData } from "../collection/types";
import { getMultiSourceText } from "../collection/sourceFinder";
import { runAiAgent } from "./aiHelper";

export async function generateOverview(data: PipelineData) {
  const sourceText = getMultiSourceText(
    data, 
    ["HOMEPAGE", "ABOUT"], 
    ["about", "overview", "welcome", "principal", "director", "profile", "institution", "college"]
  );
  
  if (!sourceText || sourceText.length < 50) return null;

  const collegeName = data.visitedPages.find(p => (p.category || "").toUpperCase() === "HOMEPAGE")?.title.split(/[|\-–,]/)[0].trim() || "The College";
  
  const systemPrompt = `You are the Senior Academic Writer for ${collegeName}.
Write a rich, comprehensive, and professional Overview section (2 detailed paragraphs).
MERGE verified information from all provided source pages (Homepage, About Page, Principal/Director Messages, and Institutional Profiles).

RULES:
1. Do NOT write generic one-liners. Provide complete, professional, and student-friendly prose.
2. NEVER invent facts, dates, names, or figures not present in the source text.
3. If no relevant information exists in the source text, return {"overview": null}.

Return a valid JSON object: {"overview": "String rich summary or null"}`;

  const res = await runAiAgent(systemPrompt, `Source text:\n\n${sourceText}`, { overview: null });
  return res?.overview || null;
}

