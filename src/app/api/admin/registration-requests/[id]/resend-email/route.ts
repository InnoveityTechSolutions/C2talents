import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, generateCollegeApprovalEmailDetails } from "@/lib/email";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const requestItem = await db.collegeRegistrationRequest.findUnique({
      where: { id },
    });

    if (!requestItem) {
      return NextResponse.json({ error: "Registration request not found." }, { status: 404 });
    }

    if (requestItem.status === "REJECTED") {
      return NextResponse.json(
        { error: "Cannot send approval email for a rejected registration request." },
        { status: 400 }
      );
    }

    // Reuse existing access token without rotating unless missing
    let accessToken = requestItem.accessToken;
    let tokenExpiresAt = requestItem.tokenExpiresAt;

    if (!accessToken) {
      accessToken = crypto.randomUUID();
      tokenExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      await db.collegeRegistrationRequest.update({
        where: { id },
        data: { accessToken, tokenExpiresAt },
      });
    } else if (tokenExpiresAt && new Date() > tokenExpiresAt) {
      // Extend expiration if it had expired
      tokenExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      await db.collegeRegistrationRequest.update({
        where: { id },
        data: { tokenExpiresAt },
      });
    }

    // Build portal access URL
    const hostHeader = req.headers.get("host") || "localhost:3000";
    const protocol = hostHeader.includes("localhost") ? "http" : "https";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${hostHeader}`;
    const accessUrl = `${baseUrl}/college-portal/${accessToken}`;

    // Generate details
    const emailDetails = await generateCollegeApprovalEmailDetails({
      collegeName: requestItem.collegeName,
      contactPerson: requestItem.contactPerson,
      accessUrl,
    });

    const sendResult = await sendEmail({
      to: requestItem.email,
      subject: emailDetails.subject,
      html: emailDetails.html,
    });

    if (sendResult.success && !sendResult.simulated) {
      await db.collegeRegistrationRequest.update({
        where: { id },
        data: {
          emailSent: true,
          emailSentAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Approval email sent successfully to ${requestItem.email}!`,
        emailSent: true,
        accessUrl,
      });
    }

    const errorMessage = sendResult.error || (sendResult.simulated
      ? "SMTP credentials not configured. Please configure SMTP in Settings > SMTP Settings."
      : "Failed to dispatch email via SMTP server.");

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        emailSent: false,
        accessUrl,
      },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("[POST /api/admin/registration-requests/[id]/resend-email Error]:", err);
    return NextResponse.json(
      { error: "Failed to resend approval email: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
