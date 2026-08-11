import { PipelineData } from "../collection/types";
import { getPagesForCategory } from "../collection/sourceFinder";

export function extractResearch(data: PipelineData) {
  // Extract ONLY from Research pages
  const researchPages = getPagesForCategory(data.visitedPages, ["RESEARCH"]);
  if (researchPages.length === 0) return null;
  return researchPages.map(p => p.text).join("\n\n").slice(0, 5000); 
}

