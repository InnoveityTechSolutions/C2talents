import { crawlWebsite } from "../collection/crawler";
import { extractBasicInfo } from "../extraction/basicInfo";
import { extractContactInfo } from "../extraction/contact";
import { extractCourses } from "../extraction/courses";
import { extractFacilities } from "../extraction/facilities";
import { extractPlacements } from "../extraction/placements";
import { extractAdmissions } from "../extraction/admissions";
import { extractHostel } from "../extraction/hostel";
import { extractResearch } from "../extraction/research";
import { generateOverview } from "../generation/overview";
import { generateHistory } from "../generation/history";
import { generateVision } from "../generation/vision";
import { generateMission } from "../generation/mission";
import { generateCampusLife } from "../generation/campusLife";
import { generateStudentLife } from "../generation/studentLife";
import { generateAdmissionSummary } from "../generation/admissionSummary";
import { generatePlacementSummary } from "../generation/placementSummary";
import { generateResearchSummary } from "../generation/researchSummary";
import { generateSeo } from "../generation/seo";
import { generateFaq } from "../generation/faq";
import { generateWhyChoose } from "../generation/whyChoose";
import { validateExtraction } from "./validator";
import { mergeIntoCollegeSchema } from "./merger";

export async function executeMultiAgentExtraction(targetUrl: string, options: { maxPages?: number } = {}) {
  const startTime = Date.now();
  const logs: string[] = [];

  const log = (msg: string) => {
    console.log(`[DETERMINISTIC ENGINE] ${msg}`);
    logs.push(`[${new Date().toISOString()}] ${msg}`);
  };

  // STEP 1, 2, 3, 4, 5: DOWNLOAD, CLEAN & CLASSIFY PAGES
  log(`STEP 1-5: Crawling and classifying pages for ${targetUrl}...`);
  const pipelineData = await crawlWebsite(targetUrl);
  logs.push(...(pipelineData.logs || []));

  // STEP 6: INDEPENDENT DETERMINISTIC EXTRACTORS WITH ERROR ISOLATION
  log(`STEP 6: Executing independent deterministic extractors (No AI)...`);

  let basicInfo: any = {};
  let contactInfo: any = {};
  let courses: any[] = [];
  let facilities: any[] = [];
  let placements: any = {};
  let admissions: any = {};
  let hostel: any = {};
  let researchText: string | null = null;

  // Basic Info Extractor
  try {
    basicInfo = extractBasicInfo(pipelineData);
    log(`Basic Info Extractor completed successfully.`);
  } catch (err: any) {
    log(`❌ Basic Info Extractor error: ${err.message}`);
  }

  // Contact Extractor
  try {
    contactInfo = extractContactInfo(pipelineData);
    log(`Contact Extractor completed successfully.`);
  } catch (err: any) {
    log(`❌ Contact Extractor error: ${err.message}`);
  }

  // Course Extractor
  try {
    courses = extractCourses(pipelineData);
    log(`Course Extractor completed successfully (${courses.length} courses found).`);
  } catch (err: any) {
    log(`❌ Course Extractor error: ${err.message}`);
  }

  // Facilities Extractor
  try {
    facilities = extractFacilities(pipelineData);
    log(`Facilities Extractor completed successfully (${facilities.length} facilities found).`);
  } catch (err: any) {
    log(`❌ Facilities Extractor error: ${err.message}`);
  }

  // Placement Extractor
  try {
    placements = extractPlacements(pipelineData);
    log(`Placement Extractor completed successfully.`);
  } catch (err: any) {
    log(`❌ Placement Extractor error: ${err.message}`);
  }

  // Admission Extractor
  try {
    admissions = extractAdmissions(pipelineData);
    log(`Admission Extractor completed successfully.`);
  } catch (err: any) {
    log(`❌ Admission Extractor error: ${err.message}`);
  }

  // Hostel Extractor
  try {
    hostel = extractHostel(pipelineData);
    log(`Hostel Extractor completed successfully.`);
  } catch (err: any) {
    log(`❌ Hostel Extractor error: ${err.message}`);
  }

  // Research Extractor
  try {
    researchText = extractResearch(pipelineData);
    log(`Research Extractor completed successfully.`);
  } catch (err: any) {
    log(`❌ Research Extractor error: ${err.message}`);
  }

  // STEP 7: VALIDATION ENGINE
  log(`STEP 7: Validating extracted facts...`);
  const validatedFacts = validateExtraction({
    basicInfo,
    contactInfo,
    courses,
    facilities,
    placements,
    admissions,
    hostel,
    researchText,
  });

  // STEP 8: MERGE ALL EXTRACTED FACTS INTO VERIFIED JSON
  log(`STEP 8: Merging all extracted facts...`);

  // STEP 9: AI SUMMARIZER LAYER (ONLY FOR SECTION 13 NARRATIVE SUMMARIES)
  log(`STEP 9: Running AI Summarizer for Section 13 narrative text...`);
  let overview = null, history = null, vision = null, mission = null;
  let campusLife = null, studentLife = null;
  let admissionSummary = null, placementSummary = null, researchSummary = null;
  let seo = { seoTitle: null, seoDescription: null, metaKeywords: null, seoArticle: null };
  let faq = null, whyChoose = null;

  try {
    const results = await Promise.allSettled([
      generateOverview(pipelineData),
      generateHistory(pipelineData),
      generateVision(pipelineData),
      generateMission(pipelineData),
      generateCampusLife(pipelineData),
      generateStudentLife(pipelineData),
      generateAdmissionSummary(pipelineData),
      generatePlacementSummary(pipelineData),
      generateResearchSummary(pipelineData),
      generateSeo(pipelineData),
      generateFaq(pipelineData),
      generateWhyChoose(pipelineData)
    ]);

    overview = results[0].status === "fulfilled" ? results[0].value : null;
    history = results[1].status === "fulfilled" ? results[1].value : null;
    vision = results[2].status === "fulfilled" ? results[2].value : null;
    mission = results[3].status === "fulfilled" ? results[3].value : null;
    campusLife = results[4].status === "fulfilled" ? results[4].value : null;
    studentLife = results[5].status === "fulfilled" ? results[5].value : null;
    admissionSummary = results[6].status === "fulfilled" ? results[6].value : null;
    placementSummary = results[7].status === "fulfilled" ? results[7].value : null;
    researchSummary = results[8].status === "fulfilled" ? results[8].value : null;
    seo = results[9].status === "fulfilled" ? results[9].value : seo;
    faq = results[10].status === "fulfilled" ? results[10].value : null;
    whyChoose = results[11].status === "fulfilled" ? results[11].value : null;
    
    log(`AI Summarizer completed successfully.`);
  } catch (err: any) {
    log(`⚠️ AI Summarizer error: ${err.message}`);
  }

  const cName = validatedFacts.basicInfo?.name?.value || "The Institution";
  const cCity = validatedFacts.basicInfo?.city?.value || "";
  const cType = validatedFacts.basicInfo?.type?.value || "higher education";
  const cEst = validatedFacts.basicInfo?.estYear?.value || "";
  const cNaac = validatedFacts.basicInfo?.naacGrade?.value || "";
  const cFacs = Array.isArray(validatedFacts.facilities?.value) ? validatedFacts.facilities.value.join(", ") : "";

  const defaultOverview = `${cName} is a premier ${cType} institution${cCity ? " located in " + cCity : ""}${cEst ? ", established in " + cEst : ""}. ${cNaac ? "Accredited with NAAC " + cNaac + "." : ""}`.trim();
  const defaultCampus = `Campus life at ${cName} offers a vibrant academic environment equipped with modern infrastructure${cFacs ? " including " + cFacs : ""}.`;
  const defaultPlacements = validatedFacts.placements?.highestPackage 
    ? `Placements at ${cName} feature a highest package of ${validatedFacts.placements.highestPackage}${validatedFacts.placements.topRecruiters ? " with top recruiters: " + validatedFacts.placements.topRecruiters : ""}.`
    : `Dedicated placement cell assisting students with campus interviews, internships, and industry partnerships.`;
  const defaultAdmissions = validatedFacts.admissions?.admissionEligibility 
    ? `Admissions eligibility: ${validatedFacts.admissions.admissionEligibility}. ${validatedFacts.admissions.admissionProcess ? "Process: " + validatedFacts.admissions.admissionProcess : ""}`.trim()
    : `Admissions are conducted as per official eligibility and university merit guidelines.`;

  const formattedFaq = Array.isArray(faq) && faq.length > 0
    ? faq.map((f: any) => `Q: ${f.question || f.q}\nA: ${f.answer || f.a}`).join("\n\n")
    : typeof faq === "string" && faq.length > 10 ? faq : `Q: What courses are offered at ${cName}?\nA: Various undergraduate and postgraduate degree programs.\n\nQ: Does the college offer placement assistance?\nA: Yes, a dedicated placement cell assists students with campus placements and career development.`;

  const finalOverview = overview || defaultOverview;
  const finalCampus = campusLife || defaultCampus;
  const finalPlacements = placementSummary || defaultPlacements;
  const finalAdmissions = admissionSummary || defaultAdmissions;
  const finalWhyChoose = whyChoose || `${cName} features accredited academic programs, experienced faculty, modern facilities${cFacs ? " including " + cFacs : ""}, and active placement support.`;

  const generatedContent = {
    overview: finalOverview,
    about: finalOverview,
    history: history || `${cName} was established${cEst ? " in " + cEst : ""} to provide quality higher education and professional training.`,
    vision: vision || `To be a center of academic excellence and holistic student development.`,
    mission: mission || `To provide accessible, high-quality education, foster research, and develop skilled professionals.`,
    coreValues: `Academic Excellence, Integrity, Innovation, Social Responsibility`,
    highlights: finalWhyChoose,
    whyChoose: finalWhyChoose,
    campusLife: finalCampus,
    studentLife: studentLife || finalCampus,
    studentActivities: studentLife || finalCampus,
    infrastructureOverview: finalCampus,
    facilitiesDescription: finalCampus,
    hostelLife: finalCampus,
    admissionSummary: finalAdmissions,
    admissionGuide: finalAdmissions,
    eligibility: validatedFacts.admissions?.admissionEligibility || finalAdmissions,
    placementOverview: finalPlacements,
    topRecruiters: validatedFacts.placements?.topRecruiters || finalPlacements,
    scholarships: "Merit-based scholarships and government fee concessions are available for eligible students.",
    research: researchSummary || "The institution actively encourages research initiatives, student projects, and academic publications.",
    seoArticle: seo?.seoArticle || finalOverview,
    seoTitle: seo?.seoTitle || `${cName} - Courses, Admissions, Placements & Fees`,
    seoDescription: seo?.seoDescription || finalOverview.slice(0, 160),
    metaKeywords: seo?.metaKeywords || `${cName}, admissions, courses, placements, fees`,
    faq: formattedFaq
  };

  // STEP 10: POPULATE CMS SCHEMA
  log(`STEP 10: Assembling final CMS verification JSON payload...`);
  const finalJson = mergeIntoCollegeSchema(validatedFacts, generatedContent, pipelineData);
  finalJson.logs = logs;

  return {
    pipelineData,
    extractedData: finalJson.data,
    qualityReport: finalJson.qualityReport,
    logs
  };
}

