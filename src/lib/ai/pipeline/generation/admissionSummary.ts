import { PipelineData } from "../collection/types";
import { getMultiSourceText } from "../collection/sourceFinder";
import { runAiAgent } from "./aiHelper";

export async function generateAdmissionSummary(data: PipelineData) {
  const sourceText = getMultiSourceText(
    data,
    ["ADMISSION", "COURSES"],
    ["admission", "eligibility", "apply", "counselling", "entrance", "prospectus", "fee", "documents", "application"]
  );
  
  if (!sourceText || sourceText.length < 50) return null;

  const collegeName = data.visitedPages.find(p => (p.category || "").toUpperCase() === "HOMEPAGE")?.title.split(/[|\-–,]/)[0].trim() || "The College";
  
  const systemPrompt = `You are the Admissions Guide Specialist for ${collegeName}.
Write a complete, professional, and student-friendly Admission Summary guide (2 detailed paragraphs).
MERGE verified information from all provided source pages (Admission Page, Eligibility Criteria, Entrance Exam requirements, and Courses).

RULES:
1. Do NOT write 1-sentence summaries. Provide a comprehensive, step-by-step admission guide.
2. NEVER invent eligibility marks, exam names, or document requirements not present in the source text.
3. If no admission information exists anywhere in the source text, return {"admissionSummary": null}.

Return a valid JSON object: {"admissionSummary": "String rich summary or null"}`;

  const res = await runAiAgent(systemPrompt, `Source text:\n\n${sourceText}`, { admissionSummary: null });
  return res?.admissionSummary || null;
}

