import { PipelineData } from "../collection/types";
import { getMultiSourceText } from "../collection/sourceFinder";
import { runAiAgent } from "./aiHelper";

export async function generateMission(data: PipelineData) {
  const sourceText = getMultiSourceText(
    data,
    ["ABOUT", "NAAC"],
    ["mission", "objectives", "core values", "purpose", "goals", "commit"]
  );
  
  if (!sourceText || sourceText.length < 30) return null;

  const collegeName = data.visitedPages.find(p => (p.category || "").toUpperCase() === "HOMEPAGE")?.title.split(/[|\-–,]/)[0].trim() || "The College";
  
  const systemPrompt = `You are the Official Mission Statement Specialist for ${collegeName}.
Extract and format the official Mission Statement and Core Objectives of the institution.
MERGE details from Mission, Vision, About, and Core Values content.

RULES:
1. Preserve the authentic meaning and intent of the official Mission.
2. NEVER invent facts or hallucinate statements not in the source text.
3. If no mission statement exists anywhere in the source text, return {"mission": null}.

Return a valid JSON object: {"mission": "String official mission statement or null"}`;

  const res = await runAiAgent(systemPrompt, `Source text:\n\n${sourceText}`, { mission: null });
  return res?.mission || null;
}

