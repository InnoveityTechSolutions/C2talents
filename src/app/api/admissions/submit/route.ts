import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { compileEmailTemplate } from "@/lib/emailTemplates";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      studentId,
      collegeId,
      courseId,
      programme,
      firstName,
      lastName,
      gender,
      dob,
      fatherName,
      motherName,
      mobileNumber,
      alternateNumber,
      email,
      address,
      city,
      district,
      state,
      pincode,
      nationality,
      community,
      religion,
      bloodGroup,

      // Academic 10th
      board10th,
      school10th,
      percentage10th,
      year10th,

      // Academic 12th
      board12th,
      school12th,
      percentage12th,
      group12th,
      year12th,

      // Academic UG
      ugCollege,
      ugUniversity,
      ugDegree,
      ugSpecialization,
      ugPercentage,
      ugYear,
      currentArrears,
      historyArrears,

      // Documents
      marksheet10thUrl,
      marksheet12thUrl,
      marksheetUgUrl,
      tcUrl,
      communityCertUrl,
      photoUrl,
      aadharUrl,
      otherDocUrl,

      // Additional
      hostelRequired,
      transportRequired,
      scholarshipRequired,
      firstGraduate,
      sportsQuota,
      ncc,
      nss,
      achievements,
      extraCurricular,
      statementOfPurpose,
    } = body;

    // Validation
    if (!collegeId || !firstName || !mobileNumber || !email) {
      return NextResponse.json(
        { error: "College, First Name, Mobile Number, and Email are required." },
        { status: 400 }
      );
    }

    // Verify college exists
    const college = await db.collegeProfile.findUnique({
      where: { id: collegeId },
      select: { id: true, name: true, email: true },
    });

    if (!college) {
      return NextResponse.json({ error: "Selected college does not exist." }, { status: 404 });
    }

    // Verify course if selected
    let courseName = "General Admission";
    if (courseId) {
      const course = await db.course.findUnique({
        where: { id: courseId },
        select: { id: true, title: true, collegeId: true },
      });
      if (course) {
        if (course.collegeId !== collegeId) {
          return NextResponse.json({ error: "Selected course does not belong to this college." }, { status: 400 });
        }
        courseName = course.title;
      }
    }

    // Generate unique human-readable Application ID
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const applicationId = `APP-${new Date().getFullYear()}-${randomDigits}`;

    // Insert AdmissionLead into database
    const lead = await db.admissionLead.create({
      data: {
        applicationId,
        studentId: studentId || null,
        collegeId,
        courseId: courseId || null,
        programme: programme || "UG",
        status: "NEW",

        firstName,
        lastName: lastName || "",
        gender: gender || "Male",
        dob: dob || "",
        fatherName: fatherName || null,
        motherName: motherName || null,
        mobileNumber,
        alternateNumber: alternateNumber || null,
        email,
        address: address || null,
        city: city || null,
        district: district || null,
        state: state || "Tamil Nadu",
        pincode: pincode || null,
        nationality: nationality || "Indian",
        community: community || null,
        religion: religion || null,
        bloodGroup: bloodGroup || null,

        board10th: board10th || null,
        school10th: school10th || null,
        percentage10th: percentage10th ? parseFloat(percentage10th) : null,
        year10th: year10th || null,

        board12th: board12th || null,
        school12th: school12th || null,
        percentage12th: percentage12th ? parseFloat(percentage12th) : null,
        group12th: group12th || null,
        year12th: year12th || null,

        ugCollege: ugCollege || null,
        ugUniversity: ugUniversity || null,
        ugDegree: ugDegree || null,
        ugSpecialization: ugSpecialization || null,
        ugPercentage: ugPercentage ? parseFloat(ugPercentage) : null,
        ugYear: ugYear || null,
        currentArrears: currentArrears ? parseInt(currentArrears, 10) : 0,
        historyArrears: historyArrears ? parseInt(historyArrears, 10) : 0,

        marksheet10thUrl: marksheet10thUrl || null,
        marksheet12thUrl: marksheet12thUrl || null,
        marksheetUgUrl: marksheetUgUrl || null,
        tcUrl: tcUrl || null,
        communityCertUrl: communityCertUrl || null,
        photoUrl: photoUrl || null,
        aadharUrl: aadharUrl || null,
        otherDocUrl: otherDocUrl || null,

        hostelRequired: Boolean(hostelRequired),
        transportRequired: Boolean(transportRequired),
        scholarshipRequired: Boolean(scholarshipRequired),
        firstGraduate: Boolean(firstGraduate),
        sportsQuota: Boolean(sportsQuota),
        ncc: Boolean(ncc),
        nss: Boolean(nss),
        achievements: achievements || null,
        extraCurricular: extraCurricular || null,
        statementOfPurpose: statementOfPurpose || null,
      },
    });

    // Dispatch Confirmation Email using EmailTemplate Manager
    try {
      const emailContent = await compileEmailTemplate("registration_received", {
        recipientName: `${firstName} ${lastName}`.trim(),
        contactPerson: `${firstName} ${lastName}`.trim(),
        collegeName: college.name,
        courseName,
        applicationId,
        portalLink: `http://localhost:3000/dashboard/applications`,
      });

      await sendEmail({
        to: email,
        subject: `Application Submitted - ${applicationId} (${college.name})`,
        html: emailContent.html,
      });
    } catch (mailErr: any) {
      console.error("[ADMISSION EMAIL DISPATCH ERROR]:", mailErr.message);
    }

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
      applicationId: lead.applicationId,
      leadId: lead.id,
    });
  } catch (error: any) {
    console.error("[ADMISSION SUBMIT ERROR]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit admission application." },
      { status: 500 }
    );
  }
}
