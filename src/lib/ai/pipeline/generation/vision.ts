import { PipelineData } from "../collection/types";
import { getMultiSourceText } from "../collection/sourceFinder";
import { runAiAgent } from "./aiHelper";

export async function generateVision(data: PipelineData) {
  const sourceText = getMultiSourceText(
    data,
    ["ABOUT", "NAAC"],
    ["vision", "motto", "strive", "aim", "future", "aspire", "leadership"]
  );
  
  if (!sourceText || sourceText.length < 30) return null;

  const collegeName = data.visitedPages.find(p => (p.category || "").toUpperCase() === "HOMEPAGE")?.title.split(/[|\-–,]/)[0].trim() || "The College";
  
  const systemPrompt = `You are the Official Vision Statement Specialist for ${collegeName}.
Extract and format the official Vision Statement of the institution.
MERGE vision details from Vision, Mission, IQAC, and About pages.

RULES:
1. Preserve the authentic meaning and intent of the official Vision.
2. NEVER invent facts or hallucinate statements not in the source text.
3. If no vision statement exists anywhere in the source text, return {"vision": null}.

Return a valid JSON object: {"vision": "String official vision statement or null"}`;

  const res = await runAiAgent(systemPrompt, `Source text:\n\n${sourceText}`, { vision: null });
  return res?.vision || null;
}

