import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    const updatedRequest = await db.collegeRegistrationRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        adminNotes: adminNotes || "Registration request rejected by Admin.",
      },
    });

    // Safely send rejection notification email
    try {
      const { sendEmail, generateCollegeRejectionEmailDetails } = await import("@/lib/email");
      const { subject: dynamicSubject, html: emailHtml } = await generateCollegeRejectionEmailDetails({
        collegeName: updatedRequest.collegeName,
        contactPerson: updatedRequest.contactPerson,
        reason: updatedRequest.adminNotes || undefined,
      });

      await sendEmail({
        to: updatedRequest.email,
        subject: dynamicSubject,
        html: emailHtml,
      });
    } catch (emailErr: any) {
      console.warn(`[REJECT EMAIL NOTICE]: Email dispatch skipped for ${updatedRequest.collegeName}:`, emailErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `Registration request for ${updatedRequest.collegeName} has been rejected.`,
      request: updatedRequest,
    });
  } catch (err: any) {
    console.error("[POST /api/admin/registration-requests/[id]/reject Error]:", err);
    return NextResponse.json(
      { error: "Failed to reject request: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
