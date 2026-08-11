import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { logEmailAudit } from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";

export async function POST(req: Request, context: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await context.params;
    const body = await req.json();
    const { versionId, userEmail = "superadmin@c2talents.com" } = body;

    if (!versionId) {
      return NextResponse.json({ error: "Version ID is required for rollback." }, { status: 400 });
    }

    const versionRecord = await db.emailTemplateVersion.findUnique({
      where: { id: versionId },
    });

    if (!versionRecord) {
      return NextResponse.json({ error: "Historical version record not found." }, { status: 404 });
    }

    const newVersionNum = versionRecord.version + 1;

    const restored = await db.emailTemplate.upsert({
      where: { templateKey: key },
      update: {
        subject: versionRecord.subject,
        preheader: versionRecord.preheader,
        headerTitle: versionRecord.headerTitle,
        greeting: versionRecord.greeting,
        bodyHtml: versionRecord.bodyHtml,
        buttonText: versionRecord.buttonText,
        buttonUrl: versionRecord.buttonUrl,
        footerHtml: versionRecord.footerHtml,
        version: newVersionNum,
        status: "PUBLISHED",
        updatedBy: userEmail,
      },
      create: {
        templateKey: key,
        templateName: key,
        subject: versionRecord.subject,
        preheader: versionRecord.preheader,
        headerTitle: versionRecord.headerTitle,
        greeting: versionRecord.greeting,
        bodyHtml: versionRecord.bodyHtml,
        buttonText: versionRecord.buttonText,
        buttonUrl: versionRecord.buttonUrl,
        footerHtml: versionRecord.footerHtml,
        version: newVersionNum,
        status: "PUBLISHED",
        updatedBy: userEmail,
      },
    });

    await logEmailAudit(key, "RESTORE", userEmail, `Restored template to historical version v${versionRecord.version}`);

    return NextResponse.json({
      success: true,
      message: `Template successfully restored to version v${versionRecord.version}!`,
      template: restored,
    });
  } catch (err: any) {
    console.error("[POST /api/admin/email-templates/[key]/restore Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to restore version" }, { status: 500 });
  }
}
