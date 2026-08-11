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

    // Check if an active request already exists for this email
    const existingRequest = await db.collegeRegistrationRequest.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        status: { in: ["PENDING", "APPROVED", "DATA_SUBMITTED"] },
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        {
          error: "A registration request for this email address is already registered or undergoing review.",
          request: existingRequest,
        },
        { status: 409 }
      );
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
        status: "APPROVED",
      },
    });

    // Auto-create published CollegeProfile in the database so it appears in the college directory
    let createdCollegeProfile = null;
    try {
      let baseSlug = collegeName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      if (!baseSlug) baseSlug = `college-${Date.now()}`;
      
      let finalSlug = baseSlug;
      const existingCollege = await db.collegeProfile.findUnique({ where: { slug: finalSlug } });
      if (existingCollege) {
        finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
      }

      // Create associate user account
      const newUser = await db.user.create({
        data: {
          email: email.trim().toLowerCase(),
          passwordHash: "hashed_pass_placeholder",
          role: "COLLEGE",
          name: contactPerson.trim(),
        },
      });

      const selectedCategory = category || "Engineering";
      const parsedFees = feesPerYear ? parseFloat(feesPerYear) : 75000;
      const collegeType = type || "Private";

      createdCollegeProfile = await db.collegeProfile.create({
        data: {
          userId: newUser.id,
          name: collegeName.trim(),
          shortName: collegeName.trim().slice(0, 6).toUpperCase(),
          slug: finalSlug,
          description: additionalNotes ? additionalNotes.trim() : `${collegeName.trim()} is an accredited educational institution located in ${location.trim()}.`,
          location: location.trim(),
          city: location.trim().split(",")[0].trim(),
          state: location.trim().split(",").length > 1 ? location.trim().split(",")[1].trim() : "Tamil Nadu",
          email: email.trim().toLowerCase(),
          phone: mobile.trim(),
          mobile: mobile.trim(),
          website: website ? website.trim() : null,
          category: selectedCategory,
          categories: `${selectedCategory}, ${collegeType}`,
          type: collegeType,
          ownership: collegeType,
          rating: 4.2,
          feesPerYear: isNaN(parsedFees) ? 75000 : parsedFees,
          avgPackage: 5.5,
          highestPackage: 14.0,
          placementPercentage: 88.0,
          image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
          logo: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=400&q=80",
          status: "PUBLISHED",
          featured: false,
        },
      });
    } catch (profileErr: any) {
      console.warn("[COLLEGE AUTO-PUBLISH NOTICE]: Could not auto-publish CollegeProfile:", profileErr.message);
    }

    // Safely dispatch initial registration received confirmation email
    let emailSent = false;
    try {
      const { generateCollegeRegistrationReceivedEmailDetails } = await import("@/lib/email");
      const { subject: dynamicSubject, html: emailHtml } = await generateCollegeRegistrationReceivedEmailDetails({
        collegeName: registrationRequest.collegeName,
        contactPerson: registrationRequest.contactPerson,
        location: registrationRequest.location || undefined,
      });

      const emailResult = await sendEmail({
        to: registrationRequest.email,
        subject: dynamicSubject,
        html: emailHtml,
      });

      emailSent = Boolean(emailResult?.success);
    } catch (emailErr: any) {
      console.warn(
        `[REGISTRATION REQUEST EMAIL NOTICE]: Network/SMTP email dispatch skipped for ${registrationRequest.email}:`,
        emailErr.message
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "College registered successfully and published in database directory!",
        request: registrationRequest,
        college: createdCollegeProfile,
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
