import { PipelineData } from "../collection/types";
import { getMultiSourceText } from "../collection/sourceFinder";
import { runAiAgent } from "./aiHelper";

export async function generateHistory(data: PipelineData) {
  const sourceText = getMultiSourceText(
    data,
    ["ABOUT"],
    ["history", "established", "founded", "founder", "heritage", "legacy", "timeline", "milestone", "since"]
  );
  
  if (!sourceText || sourceText.length < 50) return null;

  const collegeName = data.visitedPages.find(p => (p.category || "").toUpperCase() === "HOMEPAGE")?.title.split(/[|\-–,]/)[0].trim() || "The College";
  
  const systemPrompt = `You are the History & Institutional Heritage Writer for ${collegeName}.
Write a detailed, well-structured History section (2 paragraphs).
MERGE verified information from all provided source pages (History Page, About Page, Founder details, Timelines, and Milestones).

RULES:
1. Do NOT write brief one-liners. Provide complete, professional prose detailing establishment and growth.
2. NEVER invent facts, years, or names not present in the source text.
3. If no historical information exists in the source text, return {"history": null}.

Return a valid JSON object: {"history": "String rich summary or null"}`;

  const res = await runAiAgent(systemPrompt, `Source text:\n\n${sourceText}`, { history: null });
  return res?.history || null;
}

