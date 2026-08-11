import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { encryptSecret, decryptSecret } from "@/lib/crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await db.smtpConfig.findUnique({
      where: { id: "default" },
    });

    if (!config) {
      return NextResponse.json({
        success: true,
        config: {
          smtpHost: process.env.SMTP_HOST || "",
          smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
          smtpUser: process.env.SMTP_USER || "",
          smtpPass: process.env.SMTP_PASS ? "••••••••••••" : "",
          senderName: "C2Talents Platform",
          encryptionType: "TLS",
          fromEmail: process.env.SMTP_FROM || process.env.SMTP_USER || "",
          isConfigured: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      config: {
        id: config.id,
        smtpHost: config.smtpHost,
        smtpPort: config.smtpPort,
        smtpUser: config.smtpUser,
        smtpPass: config.smtpPass ? "••••••••••••" : "",
        senderName: config.senderName,
        encryptionType: config.encryptionType,
        fromEmail: config.fromEmail,
        isConfigured: true,
        updatedAt: config.updatedAt,
      },
    });
  } catch (err: any) {
    console.error("[GET /api/admin/settings/smtp Error]:", err);
    return NextResponse.json(
      { error: "Failed to fetch SMTP configuration: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { smtpHost, smtpPort, smtpUser, smtpPass, senderName, encryptionType, fromEmail } = body;

    if (!smtpHost || typeof smtpHost !== "string" || !smtpHost.trim()) {
      return NextResponse.json({ error: "SMTP Host is required." }, { status: 400 });
    }
    if (!smtpUser || typeof smtpUser !== "string" || !smtpUser.trim()) {
      return NextResponse.json({ error: "SMTP Username / Email is required." }, { status: 400 });
    }
    if (!fromEmail || typeof fromEmail !== "string" || !fromEmail.trim()) {
      return NextResponse.json({ error: "From Email Address is required." }, { status: 400 });
    }

    const parsedPort = smtpPort ? parseInt(String(smtpPort), 10) : 587;
    if (isNaN(parsedPort) || parsedPort <= 0 || parsedPort > 65535) {
      return NextResponse.json({ error: "Please enter a valid SMTP Port (e.g. 587 or 465)." }, { status: 400 });
    }

    // Handle Password Encryption
    let encryptedPassword = "";
    if (smtpPass && smtpPass !== "••••••••••••") {
      encryptedPassword = encryptSecret(smtpPass.trim());
    } else {
      // Retain existing saved password if masked placeholder was submitted
      const existing = await db.smtpConfig.findUnique({ where: { id: "default" } });
      if (existing) {
        encryptedPassword = existing.smtpPass;
      } else if (process.env.SMTP_PASS) {
        encryptedPassword = encryptSecret(process.env.SMTP_PASS);
      }
    }

    const savedConfig = await db.smtpConfig.upsert({
      where: { id: "default" },
      update: {
        smtpHost: smtpHost.trim(),
        smtpPort: parsedPort,
        smtpUser: smtpUser.trim(),
        smtpPass: encryptedPassword,
        senderName: senderName ? senderName.trim() : "C2Talents Platform",
        encryptionType: encryptionType || "TLS",
        fromEmail: fromEmail.trim(),
        isEncrypted: true,
      },
      create: {
        id: "default",
        smtpHost: smtpHost.trim(),
        smtpPort: parsedPort,
        smtpUser: smtpUser.trim(),
        smtpPass: encryptedPassword,
        senderName: senderName ? senderName.trim() : "C2Talents Platform",
        encryptionType: encryptionType || "TLS",
        fromEmail: fromEmail.trim(),
        isEncrypted: true,
      },
    });

    console.log(`[SMTP CONFIG SAVED] Updated SMTP settings for Host: ${savedConfig.smtpHost}, User: ${savedConfig.smtpUser}`);

    return NextResponse.json({
      success: true,
      message: "SMTP Configuration saved successfully! All platform emails will now use this active configuration.",
      config: {
        id: savedConfig.id,
        smtpHost: savedConfig.smtpHost,
        smtpPort: savedConfig.smtpPort,
        smtpUser: savedConfig.smtpUser,
        smtpPass: "••••••••••••",
        senderName: savedConfig.senderName,
        encryptionType: savedConfig.encryptionType,
        fromEmail: savedConfig.fromEmail,
        isConfigured: true,
        updatedAt: savedConfig.updatedAt,
      },
    });
  } catch (err: any) {
    console.error("[POST /api/admin/settings/smtp Error]:", err);
    return NextResponse.json(
      { error: "Failed to save SMTP configuration: " + (err.message || "Unknown error") },
      { status: 500 }
    );
  }
}
