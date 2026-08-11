import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_EMAIL_TEMPLATES } from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const dbTemplates = await db.emailTemplate.findMany();

    const dbMap = new Map<string, any>();
    dbTemplates.forEach((t) => dbMap.set(t.templateKey, t));

    const templates = Object.values(DEFAULT_EMAIL_TEMPLATES).map((def) => {
      const dbItem = dbMap.get(def.templateKey);

      return {
        templateKey: def.templateKey,
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
      };
    });

    return NextResponse.json({
      success: true,
      count: templates.length,
      templates,
    });
  } catch (err: any) {
    console.error("[GET /api/admin/email-templates Error]:", err);
    return NextResponse.json(
      { error: "Failed to fetch email templates: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
