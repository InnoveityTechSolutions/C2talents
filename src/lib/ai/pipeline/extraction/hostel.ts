import { PipelineData } from "../collection/types";
import { getPagesForCategory } from "../collection/sourceFinder";

export function extractHostel(data: PipelineData) {
  // Extract ONLY from Hostel pages
  const hostelPages = getPagesForCategory(data.visitedPages, ["HOSTEL"]);
  
  if (hostelPages.length === 0) {
    return {
      hostelAvailable: false,
      boysHostel: false,
      girlsHostel: false,
      acRooms: false,
      messAvailable: false,
      hostelFeePerYear: null,
      hostelFees: null,
    };
  }

  const fullText = hostelPages.map(p => p.text).join("\n");

  const isHostelMentioned = /hostel|accommodation|residence/i.test(fullText);
  const feeMatch = fullText.match(/(?:hostel\s*fee|accommodation\s*fee)[\s\S]{0,30}?(\d{2,3},?\d{3})/i);

  return {
    hostelAvailable: isHostelMentioned,
    boysHostel: /boys?\s*hostel|men'?s?\s*hostel/i.test(fullText),
    girlsHostel: /girls?\s*hostel|women'?s?\s*hostel|ladies?\s*hostel/i.test(fullText),
    acRooms: /a\/?c\s*room|air\s*conditioned/i.test(fullText),
    messAvailable: /mess|dining|canteen|food/i.test(fullText),
    hostelFeePerYear: feeMatch ? parseInt(feeMatch[1].replace(/,/g, ''), 10) : null,
    hostelFees: null,
  };
}

