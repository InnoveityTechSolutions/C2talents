import { NextResponse } from "next/server";
import {
  createBulkResearchJob,
  getAllResearchJobs,
  getResearchJobById,
} from "@/lib/ai/researchJobQueue";
import { parseBulkResearchInput } from "@/lib/ai/bulkResearchParser";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (jobId) {
      const job = getResearchJobById(jobId);
      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, job });
    }

    const jobs = getAllResearchJobs();
    return NextResponse.json({ success: true, jobs, count: jobs.length });
  } catch (err: any) {
    console.error("[RESEARCH JOBS API ERROR]:", err);
    return NextResponse.json({ error: err.message || "Failed to retrieve jobs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    // Parse text, colleges array, or single college object robustly
    let items: Array<{ name: string; url?: string }> = [];
    if (typeof body.text === "string" && body.text.trim()) {
      items = parseBulkResearchInput(body.text);
    } else if (Array.isArray(body.colleges)) {
      items = parseBulkResearchInput(body.colleges);
    } else if (body.name || body.url) {
      items = parseBulkResearchInput([{ name: body.name, url: body.url }]);
    } else if (typeof body === "object") {
      items = parseBulkResearchInput(body);
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Please provide at least one college name or URL to research." },
        { status: 400 }
      );
    }

    // Limit to 50 colleges per job for safety
    if (items.length > 50) {
      items = items.slice(0, 50);
    }

    const job = await createBulkResearchJob(items);

    return NextResponse.json({
      success: true,
      message: `Started bulk research job for ${items.length} colleges.`,
      job,
    });
  } catch (err: any) {
    console.error("[POST /api/admin/research/jobs ERROR]:", err);
    return NextResponse.json({ error: err.message || "Failed to start research job" }, { status: 500 });
  }
}
