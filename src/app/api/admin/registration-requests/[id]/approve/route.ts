import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, generateCollegeApprovalEmailDetails } from "@/lib/email";
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
    // Default 14-day validity for token
    const tokenExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const updatedRequest = await db.collegeRegistrationRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        accessToken,
        tokenExpiresAt,
        approvedAt: new Date(),
        adminNotes: adminNotes || requestItem.adminNotes || "Approved by Admin",
      },
    });

    // Build unique secure portal access URL
    const hostHeader = req.headers.get("host") || "localhost:3000";
    const protocol = hostHeader.includes("localhost") ? "http" : "https";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${hostHeader}`;
    const accessUrl = `${baseUrl}/college-portal/${accessToken}`;

    // Await email dispatch directly to the organization email entered in registration form
    let emailSent = false;
    let emailError: string | null = null;

    try {
      const emailDetails = await generateCollegeApprovalEmailDetails({
        collegeName: updatedRequest.collegeName,
        contactPerson: updatedRequest.contactPerson,
        accessUrl,
      });

      const sendResult = await sendEmail({
        to: updatedRequest.email,
        subject: emailDetails.subject,
        html: emailDetails.html,
      });

      if (sendResult.success && !sendResult.simulated) {
        emailSent = true;
        await db.collegeRegistrationRequest.update({
          where: { id },
          data: {
            emailSent: true,
            emailSentAt: new Date(),
          },
        });
      } else if (sendResult.simulated) {
        emailError = "SMTP credentials not configured. Please configure SMTP in Settings > SMTP Settings.";
      } else {
        emailError = sendResult.error || "Failed to dispatch email via SMTP.";
      }
    } catch (emailErr: any) {
      console.error(`[APPROVE EMAIL ERROR] Failed for ${updatedRequest.email}:`, emailErr);
      emailError = emailErr.message || "Failed to dispatch email.";
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? `Registration request for ${updatedRequest.collegeName} approved and official confirmation email sent to ${updatedRequest.email}!`
        : `Registration request approved! Note: Email could not be delivered (${emailError}). You can configure SMTP or click Resend Email.`,
      request: updatedRequest,
      accessUrl,
      emailSent,
      emailError,
    });
  } catch (err: any) {
    console.error("[POST /api/admin/registration-requests/[id]/approve Error]:", err);
    return NextResponse.json(
      { error: "Failed to approve request: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
