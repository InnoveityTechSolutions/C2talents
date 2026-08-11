import { PipelineData } from "../collection/types";
import { getPagesForCategory } from "../collection/sourceFinder";

export function extractPlacements(data: PipelineData) {
  // Extract ONLY from Placement pages
  const placementPages = getPagesForCategory(data.visitedPages, ["PLACEMENT"]);
  
  if (placementPages.length === 0) {
    return {
      highestPackage: null,
      avgPackage: null,
      placementPercentage: null,
      topRecruiters: null,
      internshipDetails: null,
    };
  }

  const sourceText = placementPages.map(p => p.text).join("\n");

  const highestPackageMatch = sourceText.match(/highest\s*(?:package|ctc|salary)\s*(?:is|of|:)?\s*[₹Rs.]*\s*(\d+(?:\.\d+)?)\s*(?:LPA|Lakhs?)/i);
  const avgPackageMatch = sourceText.match(/(?:average|avg)\s*(?:package|ctc|salary)\s*(?:is|of|:)?\s*[₹Rs.]*\s*(\d+(?:\.\d+)?)\s*(?:LPA|Lakhs?)/i);
  const placementPctMatch = sourceText.match(/(\d{2,3})%\s*(?:placement|placed|students\s+placed)/i);
  
  const recruitersMatch = sourceText.match(/(?:recruiters|recruiting partners|top recruiters)[\s\S]{0,100}?:([\s\S]{0,150})(?:\.|\n)/i);

  return {
    highestPackage: highestPackageMatch ? parseFloat(highestPackageMatch[1]) : null,
    avgPackage: avgPackageMatch ? parseFloat(avgPackageMatch[1]) : null,
    placementPercentage: placementPctMatch ? parseFloat(placementPctMatch[1]) : null,
    topRecruiters: recruitersMatch ? recruitersMatch[1].replace(/\s+/g, " ").trim() : null,
    internshipDetails: /internship/i.test(sourceText) ? "Internship opportunities are offered to eligible students." : null,
  };
}

