import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { CollegeRegistrationStatus } from "@prisma/client";
import { conductGeminiCollegeResearch } from "./geminiResearchEngine";
import {
  parseBulkResearchInput,
  isUrlOrWebsiteLabel,
  extractDomainFromUrl,
} from "./bulkResearchParser";
import { normalizeAndDeduplicateContactNumbers } from "./contactNormalizer";

export { parseBulkResearchInput };

export interface ResearchItem {
  id: string;
  collegeName: string;
  url?: string;
  status: "QUEUED" | "PROCESSING" | "READY_FOR_REVIEW" | "FAILED";
  error?: string;
  draftId?: string;
  reviewUrl?: string;
  notified: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface ResearchJob {
  jobId: string;
  totalCount: number;
  completedCount: number;
  failedCount: number;
  status: "IN_PROGRESS" | "COMPLETED" | "PARTIALLY_FAILED";
  createdAt: string;
  updatedAt: string;
  items: ResearchItem[];
}

const JOBS_FILE_PATH = path.join(process.cwd(), "backups", "research_jobs.json");

// Ensure backups directory exists
function ensureJobsFileDir() {
  const dir = path.dirname(JOBS_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// In-memory jobs cache
let jobsCache: Record<string, ResearchJob> = {};
let isWorkerRunning = false;

// Load persisted jobs from disk
function loadJobsFromDisk(): Record<string, ResearchJob> {
  try {
    ensureJobsFileDir();
    if (fs.existsSync(JOBS_FILE_PATH)) {
      const data = fs.readFileSync(JOBS_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("[RESEARCH JOB QUEUE] Error loading jobs from disk:", e);
  }
  return {};
}

// Save jobs to disk
function saveJobsToDisk(jobs: Record<string, ResearchJob>) {
  try {
    ensureJobsFileDir();
    fs.writeFileSync(JOBS_FILE_PATH, JSON.stringify(jobs, null, 2), "utf-8");
  } catch (e) {
    console.error("[RESEARCH JOB QUEUE] Error saving jobs to disk:", e);
  }
}

// Initialize cache
if (Object.keys(jobsCache).length === 0) {
  jobsCache = loadJobsFromDisk();
}

/**
 * Creates a new bulk research job and triggers background processing.
 */
export async function createBulkResearchJob(
  inputs: Array<{ name: string; url?: string }>
): Promise<ResearchJob> {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  // Normalize, strip prefixes, pair, and deduplicate inputs
  const parsedInputs = parseBulkResearchInput(inputs);

  const items: ResearchItem[] = parsedInputs.map((item, index) => {
    return {
      id: `item_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
      collegeName: item.name,
      url: item.url,
      status: "QUEUED",
      notified: false,
      createdAt: now,
    };
  });

  const job: ResearchJob = {
    jobId,
    totalCount: items.length,
    completedCount: 0,
    failedCount: 0,
    status: "IN_PROGRESS",
    createdAt: now,
    updatedAt: now,
    items,
  };

  jobsCache[jobId] = job;
  saveJobsToDisk(jobsCache);

  // Trigger background processor asynchronously (non-blocking)
  triggerQueueWorker().catch((err) => {
    console.error("[RESEARCH WORKER EXCEPTION]:", err);
  });

  return job;
}

/**
 * Background worker that processes queued items with controlled concurrency.
 */
async function triggerQueueWorker() {
  if (isWorkerRunning) return;
  isWorkerRunning = true;

  try {
    let hasWork = true;

    while (hasWork) {
      // Find the next queued item across all active jobs
      let targetJob: ResearchJob | null = null;
      let targetItem: ResearchItem | null = null;

      for (const jId of Object.keys(jobsCache)) {
        const job = jobsCache[jId];
        if (job.status === "IN_PROGRESS") {
          const item = job.items.find((i) => i.status === "QUEUED");
          if (item) {
            targetJob = job;
            targetItem = item;
            break;
          }
        }
      }

      if (!targetJob || !targetItem) {
        hasWork = false;
        break;
      }

      // Process this item
      await processResearchItem(targetJob, targetItem);
    }
  } finally {
    isWorkerRunning = false;
  }
}

function unwrapVerificationData(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(unwrapVerificationData);
  if ("value" in obj && typeof obj.value !== "undefined" && ("confidenceScore" in obj || "verificationStatus" in obj || "sourceUrl" in obj || "confidence" in obj)) {
    return unwrapVerificationData(obj.value);
  }
  const res: any = {};
  for (const [k, v] of Object.entries(obj)) {
    res[k] = unwrapVerificationData(v);
  }
  return res;
}

/**
 * Helper to find an existing unapproved draft for idempotent updates on retries.
 * Prevents creating duplicate drafts while respecting distinct colleges.
 */
async function findExistingUnapprovedDraft(targetName: string, targetUrl?: string) {
  const unapprovedStatuses: CollegeRegistrationStatus[] = [
    CollegeRegistrationStatus.DATA_SUBMITTED,
    CollegeRegistrationStatus.PENDING,
    CollegeRegistrationStatus.NEEDS_REVISION,
  ];
  const cleanTarget = targetName.trim();
  const normTarget = cleanTarget.toLowerCase().replace(/[^a-z0-9]/g, "");

  // 1. Direct exact match
  const direct = await db.collegeRegistrationRequest.findFirst({
    where: {
      collegeName: cleanTarget,
      status: { in: unapprovedStatuses },
    },
  });
  if (direct) return direct;

  // 2. Fetch candidates for normalized name and domain checks
  const candidates = await db.collegeRegistrationRequest.findMany({
    where: { status: { in: unapprovedStatuses } },
  });

  for (const c of candidates) {
    const cCleanName = c.collegeName
      .replace(/^\s*(?:\[?\d+\]?[\.\)\:\-]\s*|[-*•]\s*)/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    if (cCleanName && cCleanName === normTarget) {
      return c;
    }
  }

  // 3. Domain match (if URL is present)
  if (targetUrl) {
    const targetDomain = extractDomainFromUrl(targetUrl);
    if (targetDomain) {
      for (const c of candidates) {
        const cDomain = extractDomainFromUrl(c.website || c.collegeName);
        if (cDomain && cDomain === targetDomain) {
          const isPlaceholder = isUrlOrWebsiteLabel(c.collegeName);
          const cNorm = c.collegeName.toLowerCase().replace(/[^a-z0-9]/g, "");
          // Match if the existing draft was an invalid URL placeholder or names are compatible
          if (isPlaceholder || cNorm.includes(normTarget) || normTarget.includes(cNorm)) {
            return c;
          }
        }
      }
    }
  }

  return null;
}

/**
 * Processes a single college research item:
 * 1. Crawls/extracts the college data
 * 2. Creates/updates a pending draft in CollegeRegistrationRequest with status: DATA_SUBMITTED
 * 3. Does NOT save to production CollegeProfile
 * 4. Marks item READY_FOR_REVIEW
 */
async function processResearchItem(job: ResearchJob, item: ResearchItem) {
  item.status = "PROCESSING";
  job.updatedAt = new Date().toISOString();
  saveJobsToDisk(jobsCache);

  try {
    console.log(`[RESEARCH WORKER] Starting Gemini research for: "${item.collegeName}" (URL: ${item.url || "N/A"})`);

    if (!item.url || !item.url.trim().startsWith("http")) {
      throw new Error(
        `Research requires an official college website URL. Cannot research "${item.collegeName}" without official URL. Mock fallback is permanently disabled.`
      );
    }

    // Run Gemini-first research engine on official website
    const researchResult = await conductGeminiCollegeResearch({
      collegeName: item.collegeName,
      officialWebsiteUrl: item.url,
    });

    const extractedData = researchResult.data;

    // Clean and validate college name: strip list markers (e.g. "1. "), and never use raw URLs or website labels
    let cleanCandidateName = (item.collegeName || "").replace(/^\s*(?:\[?\d+\]?[\.\)\:\-]\s*|[-*•]\s*)/, "").trim();
    if (isUrlOrWebsiteLabel(cleanCandidateName)) {
      cleanCandidateName = "";
    }

    let extractedName = (extractedData.name?.value || extractedData.name || "").replace(/^\s*(?:\[?\d+\]?[\.\)\:\-]\s*|[-*•]\s*)/, "").trim();
    if (isUrlOrWebsiteLabel(extractedName)) {
      extractedName = "";
    }

    const domain = item.url ? extractDomainFromUrl(item.url) : null;
    const domainFallback = domain ? domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1) : "College Profile";
    const finalCollegeName = cleanCandidateName || extractedName || domainFallback;
    extractedData.name = finalCollegeName;
    if (item.url) {
      extractedData.website = item.url;
      if (!extractedData.contact) extractedData.contact = {};
      extractedData.contact.website = item.url;
    }

    // Check if an existing unapproved draft exists for this college to prevent duplicate drafts
    let existingRequest = await findExistingUnapprovedDraft(finalCollegeName, item.url);

    let draftId: string;

    const contactRes = normalizeAndDeduplicateContactNumbers(
      extractedData.phone || extractedData.contact?.phone,
      extractedData.mobile || extractedData.contact?.mobile
    );

    if (existingRequest) {
      // Update existing draft in-place, cleaning any legacy dummy mobile numbers
      const updated = await db.collegeRegistrationRequest.update({
        where: { id: existingRequest.id },
        data: {
          collegeName: finalCollegeName,
          mobile: contactRes.mobile || (existingRequest.mobile !== "9999999999" ? existingRequest.mobile : ""),
          website: item.url || existingRequest.website,
          submittedData: JSON.stringify(extractedData),
          status: "DATA_SUBMITTED",
          adminNotes: "AI Research draft updated via Gemini official website research and ready for administrator review.",
        },
      });
      draftId = updated.id;
    } else {
      // Create fresh pending draft with deduplicated genuine contact numbers
      const created = await db.collegeRegistrationRequest.create({
        data: {
          collegeName: finalCollegeName,
          contactPerson: "Gemini Research System",
          email: extractedData.email || extractedData.contact?.email || `research_${Date.now()}@c2talents.com`,
          mobile: contactRes.mobile || "",
          website: item.url || extractedData.website || extractedData.contact?.website || null,
          location: extractedData.location?.city || extractedData.city || extractedData.location?.state || "Tamil Nadu",
          status: "DATA_SUBMITTED",
          submittedData: JSON.stringify(extractedData),
          adminNotes: "Gemini official website research extraction complete. Ready for administrator inspection & approval.",
        },
      });
      draftId = created.id;
    }

    item.status = "READY_FOR_REVIEW";
    item.draftId = draftId;
    item.reviewUrl = `/manager/submitted-colleges?reviewId=${draftId}`;
    item.completedAt = new Date().toISOString();
    job.completedCount++;

    console.log(`[RESEARCH WORKER] ✅ Ready for review: "${finalCollegeName}" (Draft ID: ${draftId})`);
  } catch (error: any) {
    console.error(`[RESEARCH WORKER] ❌ Failed research for "${item.collegeName}":`, error?.message || error);
    item.status = "FAILED";
    item.error = error?.message || "Official website research failed. No mock data was generated.";
    job.failedCount++;
  } finally {
    // Check if job completed
    const remaining = job.items.filter((i) => i.status === "QUEUED" || i.status === "PROCESSING").length;
    if (remaining === 0) {
      job.status = job.failedCount > 0 && job.completedCount === 0 ? "PARTIALLY_FAILED" : "COMPLETED";
    }
    job.updatedAt = new Date().toISOString();
    saveJobsToDisk(jobsCache);
  }
}

/**
 * Returns all active and completed jobs.
 */
export function getAllResearchJobs(): ResearchJob[] {
  return Object.values(jobsCache).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Retrieves a specific job by ID.
 */
export function getResearchJobById(jobId: string): ResearchJob | null {
  return jobsCache[jobId] || null;
}

/**
 * Returns pending unnotified review items across all jobs.
 */
export function getUnnotifiedReviewItems(): Array<{
  id: string;
  jobId: string;
  collegeName: string;
  draftId?: string;
  reviewUrl: string;
  completedAt: string;
}> {
  const result: Array<{
    id: string;
    jobId: string;
    collegeName: string;
    draftId?: string;
    reviewUrl: string;
    completedAt: string;
  }> = [];

  for (const jId of Object.keys(jobsCache)) {
    const job = jobsCache[jId];
    for (const item of job.items) {
      if (item.status === "READY_FOR_REVIEW" && !item.notified && item.reviewUrl) {
        result.push({
          id: item.id,
          jobId: jId,
          collegeName: item.collegeName,
          draftId: item.draftId,
          reviewUrl: item.reviewUrl,
          completedAt: item.completedAt || item.createdAt,
        });
      }
    }
  }

  return result;
}

/**
 * Marks specified items as notified so desktop/in-app notifications are not repeated.
 */
export function markItemsAsNotified(itemIds: string[]) {
  const set = new Set(itemIds);
  let changed = false;

  for (const jId of Object.keys(jobsCache)) {
    const job = jobsCache[jId];
    for (const item of job.items) {
      if (set.has(item.id) && !item.notified) {
        item.notified = true;
        changed = true;
      }
    }
  }

  if (changed) {
    saveJobsToDisk(jobsCache);
  }
}
