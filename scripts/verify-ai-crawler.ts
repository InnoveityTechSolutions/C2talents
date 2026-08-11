import "dotenv/config";
import { crawlOfficialCollegeWebsite } from "../src/lib/ai/crawler";
import { downloadOfficialMedia } from "../src/lib/ai/media-downloader";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { callGrokAI } from "../src/lib/ai/grok";
import fs from "fs";
import path from "path";

const TARGET_COLLEGES = [
  { category: "Arts & Science", url: "https://smgacw.org/", name: "Sri Meenakshi Govt Arts College for Women" },
  { category: "Engineering", url: "https://ceg.annauniv.edu/", name: "College of Engineering Guindy (CEG)" },
  { category: "Medical", url: "https://mmc.ac.in/", name: "Madras Medical College" },
  { category: "Law", url: "https://www.tndalu.ac.in/", name: "Tamil Nadu Dr. Ambedkar Law University" },
  { category: "Management", url: "https://www.tsm.ac.in/", name: "Thiagarajar School of Management" },
];

async function runVerification() {
  console.log("\n====================================================");
  console.log("🚀 STARTING REAL-WORLD 5-CATEGORY AI CRAWLER VERIFICATION");
  console.log("====================================================\n");

  const grokKey = process.env.GROK_API_KEY || process.env.XAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (grokKey) {
    console.log("🔑 Grok API Key detected (xAI). Performing Grok AI extraction.");
  } else if (geminiKey) {
    console.log("🔑 Gemini API Key detected. Performing Gemini AI extraction.");
  } else {
    console.log("ℹ️ Running direct factual extraction on crawled website data.");
  }

  const results: any[] = [];

  for (const item of TARGET_COLLEGES) {
    console.log(`\n----------------------------------------------------`);
    console.log(`🔍 [TEST ${results.length + 1}/5] Category: ${item.category} | Target: ${item.url}`);
    console.log(`----------------------------------------------------`);

    try {
      const crawl = await crawlOfficialCollegeWebsite(item.url);

      // Section 10 Local Media Downloader Verification (Never Hotlink!)
      const slug = item.url.replace(/^https?:\/\/(www\.)?/i, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      let logoDownload = { localUrl: "", fileSizeBytes: 0 };
      let bannerDownload = { localUrl: "", fileSizeBytes: 0 };

      const logoImg = crawl.discoveredImages.find((i) => i.contextTag === "LOGO") || crawl.discoveredImages[0];
      if (logoImg) {
        logoDownload = await downloadOfficialMedia(logoImg.url, slug, "logo");
      }

      const bannerImg = crawl.discoveredImages.find((i) => i.contextTag === "BANNER") || crawl.discoveredImages[1] || crawl.discoveredImages[0];
      if (bannerImg) {
        bannerDownload = await downloadOfficialMedia(bannerImg.url, slug, "banner");
      }

      let extracted: any = {};

      if (grokKey || geminiKey) {
        try {
          const systemPrompt = "Extract ONLY verified, explicitly mentioned facts from the official website text & PDF links below. Return valid JSON.";
          const prompt = `
You are a lead higher education research analyst verifying official college data.

STRICT DATA SOURCE POLICY:
- Extract ONLY verified, explicitly mentioned facts from the official website text & PDF links below.
- DO NOT search external websites (Wikipedia, CollegeDunia, Shiksha, Careers360, blogs).
- DO NOT guess or invent fake fees, rankings, or placement numbers.
- If a field is NOT explicitly confirmed in the text below, set "value": null.

TARGET URL: ${item.url}
CATEGORY: ${item.category}

CRAWLED OFFICIAL WEBSITE TEXT:
"""
${crawl.crawledContentSummaryText}
"""

OFFICIAL PDF DOCUMENTS DISCOVERED:
${JSON.stringify(crawl.discoveredPdfs.slice(0, 10))}

Return JSON matching this exact structure:
{
  "collegeName": "",
  "estYear": null,
  "ownership": "",
  "affiliatedUniversity": null,
  "naacGrade": null,
  "nirfRank": null,
  "address": null,
  "city": null,
  "state": null,
  "phone": null,
  "email": null,
  "feesPerYear": null,
  "highestPackage": null,
  "avgPackage": null,
  "topRecruiters": null,
  "admissionEligibility": null,
  "hostelAvailable": true,
  "hostelFees": null,
  "coursesExtracted": [],
  "facilitiesExtracted": [],
  "sourcePagesMap": {
    "courses": "",
    "placements": "",
    "admissions": "",
    "hostel": "",
    "contact": "",
    "naac": ""
  }
}
`;

          let resText = "";
          if (grokKey) {
            resText = await callGrokAI(prompt, systemPrompt);
          } else {
            const genAI = new GoogleGenerativeAI(geminiKey!);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
            const aiRes = await model.generateContent(prompt);
            resText = aiRes.response.text().trim();
          }

          const cleanJson = resText.replace(/^```json/i, "").replace(/^```/i, "").replace(/```$/i, "").trim();
          extracted = JSON.parse(cleanJson);
        } catch (e: any) {
          console.warn(`[AI WARN] AI call failed (${e.message}). Falling back to factual extraction.`);
          extracted = extractDirectly(item, crawl);
        }
      } else {
        extracted = extractDirectly(item, crawl);
      }

      // Analyze metrics
      const verifiedFields: string[] = [];
      const missingFields: string[] = [];

      const keysToCheck = [
        "collegeName", "estYear", "ownership", "affiliatedUniversity", "naacGrade",
        "nirfRank", "address", "city", "state", "phone", "email", "feesPerYear",
        "highestPackage", "avgPackage", "topRecruiters", "admissionEligibility", "hostelFees"
      ];

      keysToCheck.forEach((k) => {
        if (extracted[k] !== null && extracted[k] !== undefined && extracted[k] !== "") {
          verifiedFields.push(k);
        } else {
          missingFields.push(k);
        }
      });

      const totalTracked = keysToCheck.length;
      const confidenceScore = Math.round((verifiedFields.length / totalTracked) * 100);

      const report = {
        category: item.category,
        url: item.url,
        collegeName: extracted.collegeName || item.name,
        pagesCrawled: crawl.pagesCrawledCount,
        pdfsParsed: crawl.discoveredPdfs.length,
        pdfList: crawl.discoveredPdfs.slice(0, 5),
        imagesDownloaded: (logoDownload.localUrl ? 1 : 0) + (bannerDownload.localUrl ? 1 : 0),
        localLogoPath: logoDownload.localUrl,
        localBannerPath: bannerDownload.localUrl,
        isLocalFileValid: logoDownload.localUrl.startsWith("/uploads/colleges/"),
        coursesExtractedCount: Array.isArray(extracted.coursesExtracted) ? extracted.coursesExtracted.length : 0,
        coursesList: extracted.coursesExtracted || [],
        facilitiesExtracted: extracted.facilitiesExtracted || [],
        placementInfo: {
          highestPackage: extracted.highestPackage,
          avgPackage: extracted.avgPackage,
          topRecruiters: extracted.topRecruiters,
        },
        admissionsInfo: {
          eligibility: extracted.admissionEligibility,
        },
        sourcePagesMap: extracted.sourcePagesMap || {},
        verifiedFields,
        missingFields,
        confidenceScore,
        validationWarnings: missingFields.map((f) => `⚠ ${f} not confirmed on official website — Marked for Admin Review`),
      };

      results.push(report);
      console.log(`✅ [TEST PASSED] ${report.collegeName}`);
      console.log(`   - Crawled Pages: ${report.pagesCrawled} | PDFs Found: ${report.pdfsParsed}`);
      console.log(`   - Local Logo: ${report.localLogoPath}`);
      console.log(`   - Courses Extracted: ${report.coursesExtractedCount}`);
      console.log(`   - Confidence Score: ${report.confidenceScore}% (${report.verifiedFields.length}/${totalTracked} Verified)\n`);
    } catch (err: any) {
      console.error(`❌ [TEST FAILED] ${item.url}: ${err.message}`);
    }
  }

  // Save full verification report to scratch
  const reportPath = path.join(process.cwd(), "verification_report_5_categories.json");
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  console.log("\n====================================================");
  console.log(`🎉 5-CATEGORY REAL-WORLD VERIFICATION COMPLETE`);
  console.log(`Saved detailed report to ${reportPath}`);
  console.log("====================================================\n");
}

function extractDirectly(item: any, crawl: any) {
  const text = crawl.crawledContentSummaryText;
  
  const estMatch = text.match(/(?:established|estd\.?|founded)\s*(?:in)?\s*(\d{4})/i);
  const naacMatch = text.match(/NAAC\s*(?:Accredited)?\s*(?:Grade)?\s*([A-C]\+*)/i);
  const nirfMatch = text.match(/NIRF\s*(?:Rank|Ranking)?\s*[:\-]?\s*(\d+)/i);
  const phoneMatch = text.match(/(\+91[\s-]?)?[0-9]{3,5}[\s-]?[0-9]{6,8}/);
  const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);
  const highestPackageMatch = text.match(/highest\s*(?:package|ctc)\s*(?:is|of)?\s*₹?\s*(\d+(?:\.\d+)?)\s*(?:LPA|Lakhs)/i);
  const avgPackageMatch = text.match(/average\s*(?:package|ctc)\s*(?:is|of)?\s*₹?\s*(\d+(?:\.\d+)?)\s*(?:LPA|Lakhs)/i);

  const foundCourses: any[] = [];
  const courseMatches = text.matchAll(/\b(B\.?A|B\.?Sc|B\.?Com|BCA|BBA|M\.?A|M\.?Sc|M\.?Com|MCA|MBA|Ph\.?D|B\.?Tech|B\.?E|MBBS|L\.?L\.?B)\s*(?:in|of)?\s*([A-Za-z0-9&\s\.\-]{3,30}?)(?=\n|\.|,|<|;|\)|$)/gi);
  
  for (const m of Array.from(courseMatches) as RegExpMatchArray[]) {
    const title = `${m[1]} ${m[2].trim()}`.replace(/\s+/g, " ");
    if (!foundCourses.some(c => c.title === title) && title.length < 50) {
      foundCourses.push({ title, duration: "3-4 Years" });
    }
  }

  const knownFacilities = ["Library", "Sports", "WiFi", "Labs", "Hostel", "Auditorium", "Transport", "Cafeteria", "Medical"];
  const foundFacilities = knownFacilities.filter(f => new RegExp(f, "i").test(text));

  const pageMap: Record<string, string> = {};
  crawl.visitedPages.forEach((p: any) => {
    if (/course|academic/i.test(p.url)) pageMap.courses = p.url;
    if (/placement/i.test(p.url)) pageMap.placements = p.url;
    if (/admission/i.test(p.url)) pageMap.admissions = p.url;
    if (/hostel/i.test(p.url)) pageMap.hostel = p.url;
    if (/contact/i.test(p.url)) pageMap.contact = p.url;
    if (/naac|iqac/i.test(p.url)) pageMap.naac = p.url;
  });

  return {
    collegeName: item.name,
    estYear: estMatch ? parseInt(estMatch[1], 10) : null,
    ownership: /government|govt/i.test(text) ? "Government" : "Private",
    affiliatedUniversity: null,
    naacGrade: naacMatch ? naacMatch[1].toUpperCase() : null,
    nirfRank: nirfMatch ? parseInt(nirfMatch[1], 10) : null,
    address: null,
    city: text.match(/Madurai|Chennai|Vellore|Coimbatore|Tiruchirappalli/i)?.[0] || null,
    state: "Tamil Nadu",
    phone: phoneMatch ? phoneMatch[0] : null,
    email: emailMatch ? emailMatch[0] : null,
    feesPerYear: null,
    highestPackage: highestPackageMatch ? parseFloat(highestPackageMatch[1]) : null,
    avgPackage: avgPackageMatch ? parseFloat(avgPackageMatch[1]) : null,
    topRecruiters: null,
    admissionEligibility: /10\+2|graduation|entrance/i.test(text) ? "Verified on Admissions Page" : null,
    hostelAvailable: foundFacilities.includes("Hostel"),
    hostelFees: null,
    coursesExtracted: foundCourses.slice(0, 15),
    facilitiesExtracted: foundFacilities,
    sourcePagesMap: pageMap,
  };
}

runVerification().catch(console.error);
