import { NextResponse } from "next/server";
import { conductGeminiCollegeResearch } from "@/lib/ai/geminiResearchEngine";
import { isGeminiConfigured } from "@/lib/ai/geminiClient";
import { executeMultiAgentExtraction } from "../../../../../lib/ai/pipeline/verification/orchestrator";
import { downloadOfficialMedia } from "@/lib/ai/media-downloader";

export interface FieldMetadata<T = any> {
  value: T | null;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  confidenceScore: number;
  sourceUrl: string;
  sourcePage?: string;
  verified: boolean;
  verificationStatus: "VERIFIED" | "MANUAL_VERIFICATION_REQUIRED";
  warning?: string;
  status: string;
}

export function makeVerifiedField<T>(value: T, sourceUrl: string, score = 95): FieldMetadata<T> {
  return {
    value,
    confidenceScore: score,
    confidence: score >= 90 ? "HIGH" : "MEDIUM",
    sourceUrl,
    sourcePage: sourceUrl,
    verified: true,
    verificationStatus: "VERIFIED",
    status: "Verified from Official Website",
  };
}

export function makeUnverifiedField<T>(warningMsg = "⚠ Please Enter Manually"): FieldMetadata<T> {
  return {
    value: null,
    confidenceScore: 40,
    confidence: "LOW",
    sourceUrl: "",
    sourcePage: "",
    verified: false,
    verificationStatus: "MANUAL_VERIFICATION_REQUIRED",
    warning: warningMsg,
    status: "Needs Manual Verification",
  };
}

export async function POST(req: Request) {
  const startTime = Date.now();
  console.log("\n====================================================");
  console.log("🌐 Gemini College Website Analysis Engine Triggered");
  console.log("====================================================");

  try {
    const body = await req.json().catch(() => ({}));
    const rawUrl = (body.url || "").trim();

    if (!rawUrl) {
      return NextResponse.json({ error: "Please enter a valid official college website URL." }, { status: 400 });
    }

    // PRIMARY ENGINE: Gemini Generative AI Research Engine
    if (isGeminiConfigured()) {
      try {
        console.log(`[ANALYSIS ENGINE] Running Gemini primary research on: ${rawUrl}`);
        const geminiResult = await conductGeminiCollegeResearch({
          officialWebsiteUrl: rawUrl,
        });

        const totalExecutionTimeMs = Date.now() - startTime;
        geminiResult.qualityReport.processingTimeMs = totalExecutionTimeMs;

        console.log(`[ANALYSIS ENGINE] ✅ Gemini research succeeded in ${totalExecutionTimeMs}ms.`);
        return NextResponse.json({
          success: true,
          data: geminiResult.data,
          qualityReport: geminiResult.qualityReport,
          logs: geminiResult.logs,
        });
      } catch (geminiErr: any) {
        console.warn(`[ANALYSIS ENGINE] Gemini research error (${geminiErr.message}). Falling back to secondary pipeline...`);
      }
    }

    // SECONDARY FALLBACK: Multi-Agent Extraction Pipeline
    let pipelineResult;
    try {
      pipelineResult = await executeMultiAgentExtraction(rawUrl);
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Website could not be analyzed." }, { status: 502 });
    }

    const { pipelineData, extractedData } = pipelineResult;
    const { targetUrl, discoveredImages, discoveredPdfs, visitedPages, logs } = pipelineData;

    // Section 10 Local Media Downloader Engine
    const collegeSlug = extractedData.slug?.value || targetUrl.replace(/^https?:\/\/(www\.)?/i, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();

    // Download Logo
    const logoCandidate = discoveredImages.find((img) => img.contextTag === "LOGO") || discoveredImages[0];
    let localLogoUrl = "";
    if (logoCandidate) {
      logs.push(`Downloading official logo from ${logoCandidate.url}...`);
      const dl = await downloadOfficialMedia(logoCandidate.url, collegeSlug, "logo");
      localLogoUrl = dl.localUrl;
    }

    // Download Banner
    const bannerCandidate = discoveredImages.find((img) => img.contextTag === "BANNER") || discoveredImages[1] || discoveredImages[0];
    let localBannerUrl = "";
    if (bannerCandidate) {
      logs.push(`Downloading official banner image from ${bannerCandidate.url}...`);
      const dl = await downloadOfficialMedia(bannerCandidate.url, collegeSlug, "banner");
      localBannerUrl = dl.localUrl;
    }

    // Download Campus Gallery Images (up to 6)
    const galleryCandidates = discoveredImages.filter((img) => img.url !== logoCandidate?.url && img.url !== bannerCandidate?.url).slice(0, 6);
    const downloadedGallery: Array<{ url: string; altText: string; caption: string }> = [];

    for (let i = 0; i < galleryCandidates.length; i++) {
      const img = galleryCandidates[i];
      const dl = await downloadOfficialMedia(img.url, collegeSlug, "campus");
      downloadedGallery.push({
        url: dl.localUrl,
        altText: img.alt || `Official Campus Photo ${i + 1}`,
        caption: `Campus Photo ${i + 1}`,
      });
    }

    if (localLogoUrl) {
      extractedData.logo = makeVerifiedField(localLogoUrl, targetUrl, 98);
    }
    if (localBannerUrl) {
      extractedData.banner = makeVerifiedField(localBannerUrl, targetUrl, 98);
    }

    extractedData.candidateGalleryImages = downloadedGallery;
    extractedData.foundGalleryImagesCount = downloadedGallery.length;

    // Quality Report Calculation
    const trackedKeys = Object.keys(extractedData).filter(
      (k) => !["candidateGalleryImages", "foundGalleryImagesCount", "courses", "collegeContent", "courseValidationReport"].includes(k)
    );

    let verifiedCount = 0;
    let unconfirmedCount = 0;

    trackedKeys.forEach((key) => {
      const f = extractedData[key];
      if (f && typeof f === "object" && f.verified && f.value !== null && f.value !== "") {
        verifiedCount++;
      } else {
        unconfirmedCount++;
      }
    });

    const totalFields = trackedKeys.length;
    const confidenceScore = Math.round((verifiedCount / totalFields) * 100);

    const missingInformation: string[] = [];
    if (!extractedData.hostelFees?.value && !extractedData.hostelFeePerYear?.value) missingInformation.push("Hostel Fee Missing");
    if (!extractedData.highestPackage?.value && !extractedData.avgPackage?.value) missingInformation.push("Placement Statistics Missing");
    if (!extractedData.scholarshipDetails?.value) missingInformation.push("Scholarship Details Missing");
    if (!extractedData.transportFees?.value) missingInformation.push("Transport Fee Missing");
    if (downloadedGallery.length === 0) missingInformation.push("Campus Gallery Missing");
    if (!extractedData.collegeContent?.research) missingInformation.push("Research Details Missing");
    if (!extractedData.phone?.value && !extractedData.email?.value) missingInformation.push("Contact Details Missing");

    const totalExecutionTimeMs = Date.now() - startTime;

    const qualityReport = {
      pagesCrawled: visitedPages.length,
      pdfsParsed: discoveredPdfs.length,
      imagesDownloaded: (localLogoUrl ? 1 : 0) + (localBannerUrl ? 1 : 0) + downloadedGallery.length,
      coursesFound: Array.isArray(extractedData.courses) ? extractedData.courses.length : 0,
      facilitiesFound: Array.isArray(extractedData.facilities?.value) ? extractedData.facilities.value.length : 0,
      placementsFound: Boolean(extractedData.highestPackage?.value || extractedData.topRecruiters?.value),
      admissionsFound: Boolean(extractedData.admissionEligibility?.value || extractedData.admissionProcess?.value),
      fieldsPopulated: verifiedCount,
      fieldsMissing: unconfirmedCount,
      missingInformation,
      confidenceScore,
      processingTimeMs: totalExecutionTimeMs,
      courseValidationReport: extractedData.courseValidationReport,
    };

    return NextResponse.json({
      success: true,
      data: extractedData,
      qualityReport,
      logs,
    });
  } catch (err: any) {
    console.error("❌ [ANALYSIS ENGINE EXCEPTION]:", err);
    return NextResponse.json(
      { error: `AI Analysis Exception: ${err.message || "Failed to analyze website"}` },
      { status: 500 }
    );
  }
}
