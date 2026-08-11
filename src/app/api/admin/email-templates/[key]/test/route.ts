import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { compileEmailTemplate, DEFAULT_EMAIL_TEMPLATES } from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";

export async function POST(req: Request, context: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await context.params;
    const def = DEFAULT_EMAIL_TEMPLATES[key];

    if (!def) {
      return NextResponse.json({ error: `Email template key '${key}' not found.` }, { status: 404 });
    }

    const body = await req.json();
    const { recipientEmail, customVariables } = body;

    if (!recipientEmail || typeof recipientEmail !== "string" || !recipientEmail.trim()) {
      return NextResponse.json({ error: "Please provide a valid recipient email address for testing." }, { status: 400 });
    }

    const testVars = {
      ...def.sampleData,
      ...(customVariables || {}),
      recipientName: recipientEmail.split("@")[0] || "Test Recipient",
    };

    const { subject, html } = await compileEmailTemplate(key, testVars);

    const result = await sendEmail({
      to: recipientEmail.trim(),
      subject: `[TEST PREVIEW] ${subject}`,
      html,
    });

    return NextResponse.json({
      success: true,
      message: `Test email for template '${def.templateName}' dispatched to ${recipientEmail.trim()} successfully!`,
      simulated: result.simulated,
    });
  } catch (err: any) {
    console.error("[POST /api/admin/email-templates/[key]/test Error]:", err);
    return NextResponse.json(
      { error: "Failed to send test email: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
