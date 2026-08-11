import { PipelineData } from "../collection/types";
import { getMultiSourceText } from "../collection/sourceFinder";
import { runAiAgent } from "./aiHelper";

export async function generateStudentLife(data: PipelineData) {
  const sourceText = getMultiSourceText(
    data,
    ["FACILITIES", "HOSTEL", "GALLERY", "ACHIEVEMENTS"],
    ["student", "club", "society", "event", "cultural", "fest", "activities", "extracurricular", "recreation"]
  );
  
  if (!sourceText || sourceText.length < 50) return null;

  const collegeName = data.visitedPages.find(p => (p.category || "").toUpperCase() === "HOMEPAGE")?.title.split(/[|\-–,]/)[0].trim() || "The College";
  
  const systemPrompt = `You are the Student Life & Co-Curricular Specialist for ${collegeName}.
Write a complete, engaging Student Life & Extracurricular Activities description (2 detailed paragraphs).
MERGE verified information from all provided source pages (Student Life, Clubs, Events, Cultural Activities, and Hostel pages).

RULES:
1. Do NOT write generic one-liners. Provide detailed, student-centric prose.
2. NEVER invent clubs, events, or student activities not present in the source text.
3. If no student life information exists anywhere in the source text, return {"studentLife": null}.

Return a valid JSON object: {"studentLife": "String rich summary or null"}`;

  const res = await runAiAgent(systemPrompt, `Source text:\n\n${sourceText}`, { studentLife: null });
  return res?.studentLife || null;
}

