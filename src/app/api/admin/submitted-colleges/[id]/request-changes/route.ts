import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { adminNotes } = body;

    if (!adminNotes || typeof adminNotes !== "string" || !adminNotes.trim()) {
      return NextResponse.json({ error: "Please provide feedback or specific requested changes." }, { status: 400 });
    }

    const registrationRequest = await db.collegeRegistrationRequest.findUnique({
      where: { id },
    });

    if (!registrationRequest) {
      return NextResponse.json({ error: "Registration request not found." }, { status: 404 });
    }

    const updatedRequest = await db.collegeRegistrationRequest.update({
      where: { id },
      data: {
        status: "NEEDS_REVISION",
        adminNotes: adminNotes.trim(),
      },
    });

    // Safely dispatch revision requested email notification to college
    try {
      const hostHeader = req.headers.get("host") || "localhost:3000";
      const protocol = hostHeader.includes("localhost") ? "http" : "https";
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${hostHeader}`;
      const accessUrl = `${baseUrl}/college-portal/${updatedRequest.accessToken}`;

      const { sendEmail, generateCollegeChangesRequestedEmailDetails } = await import("@/lib/email");
      const { subject: dynamicSubject, html: emailHtml } = await generateCollegeChangesRequestedEmailDetails({
        collegeName: updatedRequest.collegeName,
        contactPerson: updatedRequest.contactPerson,
        accessUrl,
        adminNotes: updatedRequest.adminNotes || undefined,
      });

      await sendEmail({
        to: updatedRequest.email,
        subject: dynamicSubject,
        html: emailHtml,
      });
    } catch (emailErr: any) {
      console.warn(`[REVISION EMAIL NOTICE]: Email dispatch skipped for ${updatedRequest.collegeName}:`, emailErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `Revision request sent to ${registrationRequest.collegeName}. Status updated to NEEDS_REVISION.`,
      request: updatedRequest,
    });
  } catch (err: any) {
    console.error("[POST /api/admin/submitted-colleges/[id]/request-changes Error]:", err);
    return NextResponse.json(
      { error: "Failed to request changes: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
