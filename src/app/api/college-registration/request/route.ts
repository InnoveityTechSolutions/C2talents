import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, generateCollegeRegistrationReceivedEmailHtml } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { collegeName, contactPerson, email, mobile, website, location, category, feesPerYear, type, additionalNotes } = body;

    if (!collegeName || typeof collegeName !== "string" || !collegeName.trim()) {
      return NextResponse.json({ error: "College Name is required." }, { status: 400 });
    }
    if (!contactPerson || typeof contactPerson !== "string" || !contactPerson.trim()) {
      return NextResponse.json({ error: "Contact Person name is required." }, { status: 400 });
    }
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json({ error: "Email Address is required." }, { status: 400 });
    }
    if (!mobile || typeof mobile !== "string" || !mobile.trim()) {
      return NextResponse.json({ error: "Mobile Number is required." }, { status: 400 });
    }
    if (!location || typeof location !== "string" || !location.trim()) {
      return NextResponse.json({ error: "Location (City/State) is required." }, { status: 400 });
    }



    const registrationRequest = await db.collegeRegistrationRequest.create({
      data: {
        collegeName: collegeName.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        website: website ? website.trim() : null,
        location: location.trim(),
        additionalNotes: additionalNotes ? additionalNotes.trim() : null,
        status: "PENDING",
      },
    });

    // Dispatch initial registration received confirmation email in the background without blocking HTTP response
    (async () => {
      try {
        const { generateCollegeRegistrationReceivedEmailDetails } = await import("@/lib/email");
        const { subject: dynamicSubject, html: emailHtml } = await generateCollegeRegistrationReceivedEmailDetails({
          collegeName: registrationRequest.collegeName,
          contactPerson: registrationRequest.contactPerson,
          location: registrationRequest.location || undefined,
        });

        await sendEmail({
          to: registrationRequest.email,
          subject: dynamicSubject,
          html: emailHtml,
        });
      } catch (emailErr: any) {
        console.warn(
          `[REGISTRATION REQUEST EMAIL NOTICE]: Background SMTP email dispatch skipped for ${registrationRequest.email}:`,
          emailErr.message
        );
      }
    })();

    return NextResponse.json(
      {
        success: true,
        message: "College registration request submitted successfully and is pending admin review.",
        request: registrationRequest,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[POST /api/college-registration/request Error]:", err);
    return NextResponse.json(
      { error: "Failed to submit registration request: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
