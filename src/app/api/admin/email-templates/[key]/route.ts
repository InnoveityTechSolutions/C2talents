import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_EMAIL_TEMPLATES, createTemplateVersion, logEmailAudit } from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";

export async function GET(req: Request, context: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await context.params;
    const def = DEFAULT_EMAIL_TEMPLATES[key] || DEFAULT_EMAIL_TEMPLATES.registration_received;

    const dbItem = await db.emailTemplate.findUnique({
      where: { templateKey: key },
    });

    const versionHistory = await db.emailTemplateVersion.findMany({
      where: { templateKey: key },
      orderBy: { version: "desc" },
      take: 10,
    });

    const auditLogs = await db.emailAuditLog.findMany({
      where: { templateKey: key },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      template: {
        templateKey: key,
        templateName: dbItem?.templateName || dbItem?.name || def.templateName,
        category: dbItem?.category || def.category,
        subject: dbItem?.subject || def.subject,
        preheader: dbItem?.preheader || def.preheader,
        headerTitle: dbItem?.headerTitle || dbItem?.title || def.headerTitle,
        greeting: dbItem?.greeting || def.greeting,
        bodyHtml: dbItem?.bodyHtml || def.bodyHtml,
        buttonText: dbItem?.buttonText || dbItem?.ctaText || def.buttonText,
        buttonUrl: dbItem?.buttonUrl || def.buttonUrl,
        footerHtml: dbItem?.footerHtml || def.footerHtml,
        status: dbItem?.status || "PUBLISHED",
        version: dbItem?.version || 1,
        updatedBy: dbItem?.updatedBy || "System Default",
        updatedAt: dbItem?.updatedAt || null,
        availableVariables: def.availableVariables,
        sampleData: def.sampleData,
        isCustomized: Boolean(dbItem),
      },
      versionHistory,
      auditLogs,
    });
  } catch (err: any) {
    console.error("[GET /api/admin/email-templates/[key] Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch template" }, { status: 500 });
  }
}

export async function POST(req: Request, context: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await context.params;
    const def = DEFAULT_EMAIL_TEMPLATES[key] || DEFAULT_EMAIL_TEMPLATES.registration_received;

    const body = await req.json();
    const {
      templateName,
      category,
      subject,
      preheader,
      headerTitle,
      greeting,
      bodyHtml,
      buttonText,
      buttonUrl,
      footerHtml,
      status = "PUBLISHED",
      updatedBy = "Super Admin",
    } = body;

    if (!subject || typeof subject !== "string" || !subject.trim()) {
      return NextResponse.json({ error: "Email subject line is required." }, { status: 400 });
    }

    if (!bodyHtml || typeof bodyHtml !== "string" || !bodyHtml.trim()) {
      return NextResponse.json({ error: "Email body content is required." }, { status: 400 });
    }

    // Versioning
    const newVersion = await createTemplateVersion(
      key,
      {
        subject,
        preheader,
        headerTitle,
        greeting,
        bodyHtml,
        buttonText,
        buttonUrl,
        footerHtml,
      },
      updatedBy,
      status === "PUBLISHED" ? "Published template changes" : "Saved draft version"
    );

    const savedTemplate = await db.emailTemplate.upsert({
      where: { templateKey: key },
      update: {
        templateName: templateName || def.templateName,
        category: category || def.category,
        subject: subject.trim(),
        preheader: preheader ? preheader.trim() : null,
        headerTitle: headerTitle ? headerTitle.trim() : null,
        greeting: greeting ? greeting.trim() : null,
        bodyHtml: bodyHtml.trim(),
        buttonText: buttonText ? buttonText.trim() : null,
        buttonUrl: buttonUrl ? buttonUrl.trim() : null,
        footerHtml: footerHtml ? footerHtml.trim() : null,
        status,
        version: newVersion,
        updatedBy,
        // Legacy compat fields
        name: templateName || def.templateName,
        title: headerTitle || def.headerTitle,
      },
      create: {
        templateKey: key,
        templateName: templateName || def.templateName,
        category: category || def.category,
        subject: subject.trim(),
        preheader: preheader ? preheader.trim() : null,
        headerTitle: headerTitle ? headerTitle.trim() : null,
        greeting: greeting ? greeting.trim() : null,
        bodyHtml: bodyHtml.trim(),
        buttonText: buttonText ? buttonText.trim() : null,
        buttonUrl: buttonUrl ? buttonUrl.trim() : null,
        footerHtml: footerHtml ? footerHtml.trim() : null,
        status,
        version: newVersion,
        updatedBy,
        name: templateName || def.templateName,
        title: headerTitle || def.headerTitle,
      },
    });

    // Log Audit Event
    await logEmailAudit(
      key,
      status === "PUBLISHED" ? "PUBLISH" : "EDIT",
      updatedBy,
      `Saved ${status} version v${newVersion}`
    );

    return NextResponse.json({
      success: true,
      message: `Email template '${savedTemplate.templateName}' updated successfully (v${newVersion})!`,
      template: savedTemplate,
    });
  } catch (err: any) {
    console.error("[POST /api/admin/email-templates/[key] Error]:", err);
    return NextResponse.json(
      { error: "Failed to save email template: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
