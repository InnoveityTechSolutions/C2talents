import { PipelineData } from "../collection/types";
import { getMultiSourceText } from "../collection/sourceFinder";
import { runAiAgent } from "./aiHelper";

export async function generateResearchSummary(data: PipelineData) {
  const sourceText = getMultiSourceText(
    data,
    ["RESEARCH", "NAAC"],
    ["research", "innovation", "project", "publication", "center", "centre", "patent", "funding", "iqac", "lab", "consultancy"]
  );
  
  if (!sourceText || sourceText.length < 50) return null;

  const collegeName = data.visitedPages.find(p => (p.category || "").toUpperCase() === "HOMEPAGE")?.title.split(/[|\-–,]/)[0].trim() || "The College";
  
  const systemPrompt = `You are the Research & Innovation Academic Editor for ${collegeName}.
Write a detailed Research & Innovation Summary (2 comprehensive paragraphs).
MERGE verified information from all provided source pages (Research Page, Innovation Hubs, Research Centers, IQAC, Publications, and Patents).

RULES:
1. Do NOT write generic 1-liners. Highlight research centers, grants, publications, and innovation hubs.
2. NEVER invent research projects, patent names, or funding numbers not present in the source text.
3. If no research information exists anywhere in the source text, return {"researchSummary": null}.

Return a valid JSON object: {"researchSummary": "String rich summary or null"}`;

  const res = await runAiAgent(systemPrompt, `Source text:\n\n${sourceText}`, { researchSummary: null });
  return res?.researchSummary || null;
}

