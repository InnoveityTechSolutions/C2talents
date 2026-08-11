import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { compileEmailTemplate } from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const lead = await db.admissionLead.findUnique({
      where: { id },
      include: {
        college: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            location: true,
            phone: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            duration: true,
            feesPerYear: true,
          },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ error: "Admission lead not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    console.error("[ADMIN ADMISSION LEAD GET ERROR]:", error);
    return NextResponse.json({ error: "Failed to fetch admission lead details" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { status, adminNotes, assignedCounselor, rejectionReason } = body;

    const existing = await db.admissionLead.findUnique({
      where: { id },
      include: { college: { select: { name: true } }, course: { select: { title: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Admission lead not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (assignedCounselor !== undefined) updateData.assignedCounselor = assignedCounselor;
    if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason;

    const updatedLead = await db.admissionLead.update({
      where: { id },
      data: updateData,
      include: { college: { select: { name: true } }, course: { select: { title: true } } },
    });

    // Send Automated Email Notification using EmailTemplate CMS on Status Change
    if (status && status !== existing.status) {
      const studentName = `${updatedLead.firstName} ${updatedLead.lastName}`.trim();
      const collegeName = updatedLead.college?.name || "Institution";

      try {
        let templateKey = "";
        let customVars: Record<string, any> = {
          recipientName: studentName,
          contactPerson: studentName,
          collegeName,
          applicationId: updatedLead.applicationId,
          portalLink: `http://localhost:3000/dashboard/applications`,
        };

        if (status === "APPROVED") {
          templateKey = "registration_approved";
          customVars.approvalDate = new Date().toLocaleDateString();
        } else if (status === "REJECTED") {
          templateKey = "registration_rejected";
          customVars.reason = rejectionReason || "Application criteria not met.";
        } else if (status === "DOCUMENTS_PENDING") {
          templateKey = "changes_requested";
          customVars.adminNotes = adminNotes || "Additional verification documents required.";
        } else if (status === "ADMISSION_CONFIRMED") {
          templateKey = "welcome_email";
          customVars.website = `http://localhost:3000/dashboard/applications`;
        }

        if (templateKey) {
          const compiled = await compileEmailTemplate(templateKey, customVars);
          await sendEmail({
            to: updatedLead.email,
            subject: compiled.subject,
            html: compiled.html,
          });
        }
      } catch (emailErr: any) {
        console.error("[STATUS EMAIL ERROR]:", emailErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Admission lead updated to ${status || "new details"}.`,
      lead: updatedLead,
    });
  } catch (error: any) {
    console.error("[ADMIN ADMISSION LEAD UPDATE ERROR]:", error);
    return NextResponse.json({ error: "Failed to update admission lead" }, { status: 500 });
  }
}
