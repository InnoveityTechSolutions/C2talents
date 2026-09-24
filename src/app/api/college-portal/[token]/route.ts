import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, generateCollegeDataSubmittedEmailHtml } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(req: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await context.params;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Access token is required." }, { status: 400 });
    }

    const requestItem = await db.collegeRegistrationRequest.findUnique({
      where: { accessToken: token },
    });

    if (!requestItem) {
      return NextResponse.json(
        { error: "Invalid or expired access token. Please contact platform administration." },
        { status: 404 }
      );
    }

    if (requestItem.tokenExpiresAt && new Date() > requestItem.tokenExpiresAt) {
      return NextResponse.json(
        { error: "This registration access link has expired. Please contact administration to renew your link." },
        { status: 410 }
      );
    }

    if (requestItem.status === "REJECTED") {
      return NextResponse.json(
        { error: "This college registration request has been rejected." },
        { status: 403 }
      );
    }

    let parsedSubmittedData = null;
    if (requestItem.submittedData) {
      try {
        parsedSubmittedData = JSON.parse(requestItem.submittedData);
      } catch (e) {}
    }

    return NextResponse.json({
      success: true,
      request: {
        id: requestItem.id,
        collegeName: requestItem.collegeName,
        contactPerson: requestItem.contactPerson,
        email: requestItem.email,
        mobile: requestItem.mobile,
        website: requestItem.website,
        location: requestItem.location,
        status: requestItem.status,
        adminNotes: requestItem.adminNotes,
        updatedAt: requestItem.updatedAt,
      },
      submittedData: parsedSubmittedData,
    });
  } catch (err: any) {
    console.error("[GET /api/college-portal/[token] Error]:", err);
    return NextResponse.json(
      { error: "Error verifying access token: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}

export async function POST(req: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await context.params;
    const body = await req.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Access token is required." }, { status: 400 });
    }

    const requestItem = await db.collegeRegistrationRequest.findUnique({
      where: { accessToken: token },
    });

    if (!requestItem) {
      return NextResponse.json({ error: "Invalid or expired access token." }, { status: 404 });
    }

    if (requestItem.tokenExpiresAt && new Date() > requestItem.tokenExpiresAt) {
      return NextResponse.json(
        { error: "This registration access link has expired. Please contact administration to renew your link." },
        { status: 410 }
      );
    }

    if (requestItem.status === "REJECTED") {
      return NextResponse.json({ error: "This registration request is no longer active." }, { status: 403 });
    }

    // Save profile data payload as stringified JSON & set status to DATA_SUBMITTED
    const submittedDataStr = JSON.stringify(body);

    const updatedRequest = await db.collegeRegistrationRequest.update({
      where: { id: requestItem.id },
      data: {
        submittedData: submittedDataStr,
        status: "DATA_SUBMITTED",
        adminNotes: null, // Clear any previous revision notes
      },
    });

    // Safely send data submission confirmation email to college
    try {
      const { generateCollegeDataSubmittedEmailDetails } = await import("@/lib/email");
      const { subject: dynamicSubject, html: emailHtml } = await generateCollegeDataSubmittedEmailDetails({
        collegeName: updatedRequest.collegeName,
        contactPerson: updatedRequest.contactPerson,
      });

      await sendEmail({
        to: updatedRequest.email,
        subject: dynamicSubject,
        html: emailHtml,
      });
    } catch (emailErr: any) {
      console.warn(`[DATA_SUBMITTED EMAIL NOTICE]: Email dispatch skipped for ${updatedRequest.collegeName}:`, emailErr.message);
    }

    return NextResponse.json({
      success: true,
      message: "College profile data submitted successfully! Admin review in progress.",
      request: updatedRequest,
    });
  } catch (err: any) {
    console.error("[POST /api/college-portal/[token] Error]:", err);
    return NextResponse.json(
      { error: "Failed to submit college data: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
