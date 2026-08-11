import { PipelineData } from "../collection/types";
import { getMultiSourceText } from "../collection/sourceFinder";
import { runAiAgent } from "./aiHelper";

export async function generateCampusLife(data: PipelineData) {
  const sourceText = getMultiSourceText(
    data,
    ["FACILITIES", "HOSTEL", "GALLERY"],
    ["campus", "facility", "sports", "library", "hostel", "canteen", "gym", "auditorium", "infrastructure", "lab", "building"]
  );
  
  if (!sourceText || sourceText.length < 50) return null;

  const collegeName = data.visitedPages.find(p => (p.category || "").toUpperCase() === "HOMEPAGE")?.title.split(/[|\-–,]/)[0].trim() || "The College";
  
  const systemPrompt = `You are the Campus & Infrastructure Journalist for ${collegeName}.
Write a rich, vivid, and student-friendly Campus Life & Infrastructure description (2 detailed paragraphs).
MERGE verified information from all provided source pages (Campus Overview, Facilities, Sports, Library, Hostel, and Gallery descriptions).

RULES:
1. Do NOT write generic one-liners. Provide detailed, engaging prose highlighting campus atmosphere and facilities.
2. NEVER invent facilities, buildings, or features not in the source text.
3. If no campus/facility information exists anywhere in the source text, return {"campusLife": null}.

Return a valid JSON object: {"campusLife": "String rich summary or null"}`;

  const res = await runAiAgent(systemPrompt, `Source text:\n\n${sourceText}`, { campusLife: null });
  return res?.campusLife || null;
}

