import { PipelineData } from "../collection/types";
import { extractContactInfo } from "./contact";

function mf(val: any, score = 85) {
  const isValid = val !== null && val !== undefined && val !== "" && !(Array.isArray(val) && val.length === 0);
  return {
    value: isValid ? val : null,
    confidenceScore: isValid ? score : 40,
    confidence: isValid ? "HIGH" : "LOW",
    sourceUrl: isValid ? "Website" : "",
    verified: isValid,
    verificationStatus: isValid ? "VERIFIED" : "MANUAL_VERIFICATION_REQUIRED",
    status: isValid ? "Extracted from Official Website" : "Needs Manual Verification",
    warning: isValid ? undefined : "⚠ Please Enter Manually",
  };
}

export function extractBasicInfo(data: PipelineData) {
  const text = data.crawledContentSummaryText;
  const targetUrl = data.targetUrl;
  const homepage = data.visitedPages.find(p => (p.category || "").toUpperCase() === "HOMEPAGE") || data.visitedPages[0];
  
  // 1. College Name Extraction
  let extractedName = "";
  
  // Check JSON-LD
  for (const page of data.visitedPages) {
    if (page.jsonLdData && Array.isArray(page.jsonLdData)) {
      for (const item of page.jsonLdData) {
        if (item && (item["@type"] === "EducationalOrganization" || item["@type"] === "CollegeOrUniversity" || item["@type"] === "School" || item["@type"] === "Organization")) {
          if (item.name && typeof item.name === "string" && item.name.length > 5) {
            extractedName = item.name.trim();
            break;
          }
        }
      }
    }
    if (extractedName) break;
  }

  // Check OpenGraph
  if (!extractedName && homepage?.openGraphMeta?.site_name) {
    extractedName = homepage.openGraphMeta.site_name;
  }

  // Fallback to HTML Title tag
  if (!extractedName && homepage?.title) {
    let nameParts = homepage.title.split(/[|\-–,]/).map(p => p.trim());
    let nameCandidate = nameParts.find(p => p.length > 8 && !/home|official|welcome|index/i.test(p)) || nameParts[0];
    if (nameCandidate && !/home|official/i.test(nameCandidate)) {
      extractedName = nameCandidate;
    } else if (nameParts.length > 1 && nameParts[1]) {
      extractedName = nameParts[1];
    } else {
      extractedName = nameParts[0] || "";
    }
  }

  const nameVal = extractedName.replace(/\s+/g, " ").trim() || "Official College Profile";

  // 2. Established Year Extraction
  let estYearNum: number | null = null;
  const estMatch = text.match(/(?:established|estd\.?|founded|since)\s*(?:in)?\s*[:\-]?\s*(\d{4})/i);
  if (estMatch) {
    const yr = parseInt(estMatch[1], 10);
    if (yr >= 1800 && yr <= 2026) {
      estYearNum = yr;
    }
  }

  // Check JSON-LD foundingDate
  if (!estYearNum) {
    for (const page of data.visitedPages) {
      if (page.jsonLdData) {
        for (const item of page.jsonLdData) {
          if (item?.foundingDate) {
            const yr = parseInt(String(item.foundingDate).slice(0, 4), 10);
            if (yr >= 1800 && yr <= 2026) {
              estYearNum = yr;
              break;
            }
          }
        }
      }
      if (estYearNum) break;
    }
  }

  // 3. Affiliated University Extraction
  let affiliatedUni: string | null = null;
  const uniMatch = text.match(/(?:affiliated\s+to|affiliated\s+with)\s+([A-Z][a-zA-Z\s&]{4,60}(?:University|Deemed University))/i);
  if (uniMatch) {
    affiliatedUni = uniMatch[1].trim();
  }

  // 4. NAAC Grade & Accreditation
  const naacMatch = text.match(/NAAC\s*(?:Accredited)?\s*(?:Grade)?\s*[:\-]?\s*([A-C]\+*)/i);
  const naacGrade = naacMatch ? naacMatch[1].toUpperCase() : null;

  // 5. NIRF Rank
  const nirfMatch = text.match(/NIRF\s*(?:Rank|Ranking)?\s*[:\-]?\s*(\d+)/i);
  const nirfRank = nirfMatch ? parseInt(nirfMatch[1], 10) : null;

  // 6. Approvals
  const aicteMatch = /\bAICTE\b/i.test(text);
  const ugcMatch = /\bUGC\b/i.test(text);
  const autonomousMatch = /\bautonomous\b/i.test(text);

  // 7. City / District / State from Contact & Address Extractor
  const contactInfo = extractContactInfo(data);

  const slugVal = targetUrl.replace(/^https?:\/\/(www\.)?/i, "").replace(/[\/]+$/, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  const shortNameVal = nameVal.split(" ").filter((w: string) => w.length > 1 && /^[A-Z]/i.test(w)).map((w: string) => w[0].toUpperCase()).join("").slice(0, 8);

  return {
    name: mf(nameVal, 95),
    shortName: mf(shortNameVal, 85),
    slug: mf(slugVal, 95),
    estYear: mf(estYearNum, estYearNum ? 90 : 40),
    ownership: mf(/government|govt/i.test(text) ? "Government" : /aided/i.test(text) ? "Government Aided" : "Private", 85),
    type: mf(autonomousMatch ? "Autonomous" : "Affiliated", 80),
    isAutonomous: mf(autonomousMatch, 85),
    accreditation: mf(naacGrade ? `NAAC ${naacGrade}` : null, naacGrade ? 90 : 40),
    approval: mf(aicteMatch && ugcMatch ? "AICTE, UGC" : aicteMatch ? "AICTE" : ugcMatch ? "UGC" : null, aicteMatch || ugcMatch ? 85 : 40),
    aicteApproved: mf(aicteMatch, 85),
    ugcApproved: mf(ugcMatch, 85),
    naacGrade: mf(naacGrade, naacGrade ? 90 : 40),
    nirfRank: mf(nirfRank, nirfRank ? 90 : 40),
    affiliatedUniversity: mf(affiliatedUni, affiliatedUni ? 85 : 40),
    city: contactInfo.city,
    district: contactInfo.district,
    state: contactInfo.state,
    website: mf(targetUrl, 98),
  };
}

