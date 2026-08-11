import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_EMAIL_TEMPLATES } from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";

export async function POST(req: Request, context: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await context.params;
    const def = DEFAULT_EMAIL_TEMPLATES[key];

    if (!def) {
      return NextResponse.json({ error: `Email template key '${key}' not found.` }, { status: 404 });
    }

    await db.emailTemplate.deleteMany({
      where: { templateKey: key },
    });

    return NextResponse.json({
      success: true,
      message: `Email template '${def.templateName}' reset to system default!`,
      defaultTemplate: def,
    });
  } catch (err: any) {
    console.error("[POST /api/admin/email-templates/[key]/reset Error]:", err);
    return NextResponse.json(
      { error: "Failed to reset template: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
