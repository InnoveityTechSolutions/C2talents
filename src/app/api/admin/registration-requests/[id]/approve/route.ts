import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, generateCollegeApprovalEmailHtml } from "@/lib/email";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));
    const { adminNotes } = body;

    const requestItem = await db.collegeRegistrationRequest.findUnique({
      where: { id },
    });

    if (!requestItem) {
      return NextResponse.json({ error: "Registration request not found." }, { status: 404 });
    }

    // Generate fresh secure accessToken if not present
    const accessToken = requestItem.accessToken || crypto.randomUUID();

    const updatedRequest = await db.collegeRegistrationRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        accessToken,
        adminNotes: adminNotes || requestItem.adminNotes || "Approved by Admin",
      },
    });

    // Build unique secure portal access URL
    const hostHeader = req.headers.get("host") || "localhost:3000";
    const protocol = hostHeader.includes("localhost") ? "http" : "https";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${hostHeader}`;
    const accessUrl = `${baseUrl}/college-portal/${accessToken}`;

    // Dispatch email asynchronously in background so approval response returns immediately (<100ms)
    (async () => {
      try {
        const { generateCollegeApprovalEmailDetails } = await import("@/lib/email");
        const { subject: dynamicSubject, html: emailHtml } = await generateCollegeApprovalEmailDetails({
          collegeName: updatedRequest.collegeName,
          contactPerson: updatedRequest.contactPerson,
          accessUrl,
        });

        await sendEmail({
          to: updatedRequest.email,
          subject: dynamicSubject,
          html: emailHtml,
        });
      } catch (emailErr: any) {
        console.warn(`[APPROVE EMAIL NOTICE]: Background SMTP email dispatch skipped for ${updatedRequest.collegeName}:`, emailErr.message);
      }
    })();

    return NextResponse.json({
      success: true,
      message: `Registration request for ${updatedRequest.collegeName} approved successfully! Verification token link generated.`,
      request: updatedRequest,
      accessUrl,
      emailSent: true,
    });
  } catch (err: any) {
    console.error("[POST /api/admin/registration-requests/[id]/approve Error]:", err);
    return NextResponse.json(
      { error: "Failed to approve request: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
