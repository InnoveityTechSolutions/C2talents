import { PipelineData } from "../collection/types";
import { getPagesForCategory } from "../collection/sourceFinder";

export function extractAdmissions(data: PipelineData) {
  // Extract ONLY from Admission pages
  const admissionPages = getPagesForCategory(data.visitedPages, ["ADMISSION"]);
  
  if (admissionPages.length === 0) {
    return {
      admissionEligibility: null,
      admissionProcess: null,
      documentsRequired: null,
      admissionEntranceExams: null,
      importantDates: null,
    };
  }

  const sourceText = admissionPages.map(p => p.text).join("\n");

  const eligibilityMatch = /10\+2|graduation|bachelor|master|eligibility/i.test(sourceText) ? "Candidates must satisfy the required academic qualifications (10+2 / Graduation) as specified by the institution." : null;
  const processMatch = /counselling|merit|entrance|application|apply online/i.test(sourceText) ? "Admissions are conducted through merit lists, counselling processes, or competitive entrance exams." : null;
  const docMatch = /documents?|certificates?|mark sheet|identity proof/i.test(sourceText) ? "Relevant mark sheets, transfer certificate, conduct certificate, community certificate, and ID proof required." : null;

  const exams = Array.from(sourceText.matchAll(/\b(JEE|NEET|TANCET|CAT|MAT|XAT|CMAT|GMAT|GATE|NATA|CLAT|KEAM|KCET)\b/gi)).map(m => m[1].toUpperCase());
  const uniqueExams = Array.from(new Set(exams)).join(", ");

  return {
    admissionEligibility: eligibilityMatch,
    admissionProcess: processMatch,
    documentsRequired: docMatch,
    admissionEntranceExams: uniqueExams || null,
    importantDates: null,
  };
}

