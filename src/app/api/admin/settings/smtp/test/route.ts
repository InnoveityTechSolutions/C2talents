import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decryptSecret } from "@/lib/crypto";
import { sendEmail, renderBaseEmailTemplate } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { toEmail, smtpHost, smtpPort, smtpUser, smtpPass, senderName, encryptionType, fromEmail } = body;

    if (!toEmail || typeof toEmail !== "string" || !toEmail.trim()) {
      return NextResponse.json({ error: "Please enter a test recipient email address." }, { status: 400 });
    }
    if (!smtpHost || typeof smtpHost !== "string" || !smtpHost.trim()) {
      return NextResponse.json({ error: "SMTP Host is required for test." }, { status: 400 });
    }
    if (!smtpUser || typeof smtpUser !== "string" || !smtpUser.trim()) {
      return NextResponse.json({ error: "SMTP User is required for test." }, { status: 400 });
    }

    let rawPassword = smtpPass;
    if (!rawPassword || rawPassword === "••••••••••••") {
      const existing = await db.smtpConfig.findUnique({ where: { id: "default" } });
      if (existing) {
        rawPassword = decryptSecret(existing.smtpPass);
      } else {
        rawPassword = process.env.SMTP_PASS || "";
      }
    }

    const parsedPort = smtpPort ? parseInt(String(smtpPort), 10) : 587;

    const testConfig = {
      smtpHost: smtpHost.trim(),
      smtpPort: parsedPort,
      smtpUser: smtpUser.trim(),
      smtpPass: rawPassword,
      senderName: senderName ? senderName.trim() : "C2Talents Platform Test",
      encryptionType: encryptionType || "TLS",
      fromEmail: fromEmail ? fromEmail.trim() : smtpUser.trim(),
    };

    const testHtml = renderBaseEmailTemplate({
      title: "SMTP Configuration Test",
      preheader: "Verification email for C2Talents SMTP Server.",
      recipientName: "System Administrator",
      bodyParagraphs: [
        "This test email confirms that your SMTP server configuration in the C2Talents Enterprise Admin Panel is active and operational.",
      ],
      infoTable: [
        { label: "SMTP Host:", value: `${testConfig.smtpHost}:${testConfig.smtpPort}` },
        { label: "Sender:", value: `${testConfig.senderName} (${testConfig.fromEmail})` },
        { label: "Encryption:", value: testConfig.encryptionType },
        { label: "Timestamp:", value: new Date().toISOString() },
        {
          label: "Connection Status:",
          value: "ACTIVE",
          badge: { text: "OPERATIONAL", color: "#047857", bg: "#ECFDF5", border: "#A7F3D0" },
        },
      ],
    });

    const result = await sendEmail({
      to: toEmail.trim(),
      subject: "SMTP Configuration Test",
      html: testHtml,
      overrideSmtpConfig: testConfig,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "SMTP test email delivery failed. Please verify your credentials and host settings.",
          result,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test email dispatched successfully to ${toEmail}! Please check your inbox.`,
      result,
    });
  } catch (err: any) {
    console.error("[POST /api/admin/settings/smtp/test Error]:", err);
    return NextResponse.json(
      { error: "SMTP Connection / Test Delivery Failed: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
