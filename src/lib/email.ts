import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { decryptSecret } from "@/lib/crypto";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  overrideSmtpConfig?: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPass: string;
    senderName: string;
    encryptionType: string;
    fromEmail: string;
  };
}

export async function getActiveSmtpConfig() {
  try {
    const config = await db.smtpConfig.findUnique({
      where: { id: "default" },
    });

    if (config && config.smtpHost && config.smtpUser) {
      const decryptedPass = config.smtpPass ? decryptSecret(config.smtpPass) : "";
      return {
        smtpHost: config.smtpHost,
        smtpPort: config.smtpPort || 587,
        smtpUser: config.smtpUser,
        smtpPass: decryptedPass,
        senderName: config.senderName || "C2Talents Platform",
        encryptionType: config.encryptionType || "TLS",
        fromEmail: config.fromEmail || config.smtpUser,
        source: "DATABASE",
      };
    }
  } catch (err: any) {
    console.error("[EMAIL SERVICE] Error fetching DB SMTP config:", err.message);
  }

  // Fallback to process.env credentials
  const envHost = process.env.SMTP_HOST;
  const envPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const envUser = process.env.SMTP_USER;
  const envPass = process.env.SMTP_PASS;
  const envFrom = process.env.SMTP_FROM || '"C2Talents Platform" <no-reply@c2talents.com>';

  if (envHost && envUser) {
    return {
      smtpHost: envHost,
      smtpPort: envPort,
      smtpUser: envUser,
      smtpPass: envPass || "",
      senderName: "C2Talents Platform",
      encryptionType: envPort === 465 ? "SSL" : "TLS",
      fromEmail: envFrom,
      source: "ENV",
    };
  }

  return null;
}

export async function verifySmtpConnection(customConfig?: {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  encryptionType?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const config = customConfig || (await getActiveSmtpConfig());
    if (!config || !config.smtpHost || !config.smtpUser) {
      return { success: false, error: "SMTP Host and Username are required." };
    }
    const nodemailer = await import("nodemailer");
    const isSecure = config.encryptionType === "SSL" || config.smtpPort === 465;
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: isSecure,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    await transporter.verify();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to connect to SMTP server." };
  }
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  overrideSmtpConfig,
}: SendEmailOptions): Promise<{ success: boolean; messageId?: string; simulated?: boolean; error?: string }> {
  const smtpConfig = overrideSmtpConfig || (await getActiveSmtpConfig());

  if (smtpConfig && smtpConfig.smtpHost && smtpConfig.smtpUser) {
    try {
      const nodemailer = await import("nodemailer").catch(() => null);

      if (nodemailer) {
        const isSecure = smtpConfig.encryptionType === "SSL" || smtpConfig.smtpPort === 465;

        const transporter = nodemailer.createTransport({
          host: smtpConfig.smtpHost,
          port: smtpConfig.smtpPort,
          secure: isSecure,
          auth: {
            user: smtpConfig.smtpUser,
            pass: smtpConfig.smtpPass,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        let fromString = smtpConfig.fromEmail;
        if (smtpConfig.fromEmail && !smtpConfig.fromEmail.includes("<")) {
          fromString = smtpConfig.senderName
            ? `"${smtpConfig.senderName}" <${smtpConfig.fromEmail}>`
            : smtpConfig.fromEmail;
        }

        // Attach local logo as inline CID attachment if file exists
        const logoPath = path.join(process.cwd(), "public", "logo.png");
        const attachments = fs.existsSync(logoPath)
          ? [
              {
                filename: "logo.png",
                path: logoPath,
                cid: "c2talentslogo",
                contentDisposition: "inline" as const,
              },
            ]
          : [];

        const plainText = text || htmlToPlainText(html);

        const info = await transporter.sendMail({
          from: fromString,
          to,
          subject,
          html,
          text: plainText,
          attachments,
        });

        console.log(
          `[EMAIL SERVICE] Email dispatched successfully to ${to} via ${smtpConfig.smtpHost}. Message ID: ${info.messageId}`
        );
        return { success: true, messageId: info.messageId };
      }
    } catch (err: any) {
      console.error(`[EMAIL SERVICE ERROR] Failed to send email to ${to}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  // When no active SMTP config is found
  console.warn("====================================================");
  console.warn(`[EMAIL WARNING] SMTP credentials not configured. Email to ${to} could NOT be delivered.`);
  console.warn(`[EMAIL SIMULATION] Subject: ${subject}`);
  console.warn(`[EMAIL SIMULATION] Content:\n${html.replace(/<[^>]+>/g, " ").slice(0, 300)}...`);
  console.warn("====================================================");

  return {
    success: false,
    simulated: true,
    error: "SMTP credentials not configured. Please configure SMTP in Settings > SMTP Settings or in your environment variables.",
  };
}

// Utility to convert HTML to plain text
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, "$2 ($1)")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/td>/gi, " | ")
    .replace(/<[^>]+>/g, "")
    .replace(/\n\s+\n/g, "\n\n")
    .trim();
}

// =========================================================
// REUSABLE BASE EMAIL TEMPLATE SYSTEM (ENTERPRISE SAAS RENDERER)
// =========================================================

export interface BaseEmailTemplateOptions {
  title: string;
  preheader?: string;
  recipientName: string;
  bodyParagraphs: string[];
  infoTable?: {
    label: string;
    value: string;
    badge?: { text: string; color: string; bg: string; border: string };
  }[];
  nextSteps?: string[];
  cta?: { text: string; url: string };
  noticeText?: string;
}

export function renderBaseEmailTemplate({
  title,
  preheader,
  recipientName,
  bodyParagraphs,
  infoTable,
  nextSteps,
  cta,
  noticeText,
}: BaseEmailTemplateOptions): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const logoUrl = `${appUrl}/logo.png`;

  const infoTableHtml =
    infoTable && infoTable.length > 0
      ? `<div style="background-color: #FAFAFA; border: 1px solid #E5E7EB; border-radius: 6px; margin: 24px 0; overflow: hidden;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;">
          ${infoTable
            .map(
              (row, idx) => `
            <tr>
              <td style="padding: 12px 16px; ${
                idx < infoTable.length - 1 ? "border-bottom: 1px solid #E5E7EB;" : ""
              } font-size: 13px; font-weight: 600; color: #4B5563; width: 160px; white-space: nowrap; vertical-align: top;">
                ${row.label}
              </td>
              <td style="padding: 12px 16px; ${
                idx < infoTable.length - 1 ? "border-bottom: 1px solid #E5E7EB;" : ""
              } font-size: 14px; font-weight: 600; color: #111827; vertical-align: top;">
                ${
                  row.badge
                    ? `<span style="display: inline-block; background-color: ${row.badge.bg}; color: ${row.badge.color}; border: 1px solid ${row.badge.border}; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.3px;">${row.badge.text}</span>`
                    : row.value
                }
              </td>
            </tr>
          `
            )
            .join("")}
        </table>
      </div>`
      : "";

  const nextStepsHtml =
    nextSteps && nextSteps.length > 0
      ? `<div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 20px; margin: 24px 0;">
        <div style="font-size: 13px; font-weight: 700; color: #1E293B; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Next Steps</div>
        <ol style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.6;">
          ${nextSteps.map((step) => `<li style="margin-bottom: 8px;">${step}</li>`).join("")}
        </ol>
      </div>`
      : "";

  const ctaHtml = cta
    ? `<div style="margin: 28px 0; text-align: left;">
        <a href="${cta.url}" target="_blank" style="background-color: #0F172A; color: #FFFFFF; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px; display: inline-block; box-shadow: none;">
          ${cta.text}
        </a>
        <div style="margin-top: 14px; font-size: 12px; color: #6B7280; word-break: break-all;">
          If the button above does not work, copy and paste the following URL into your browser:<br />
          <a href="${cta.url}" style="color: #2563EB; text-decoration: underline;">${cta.url}</a>
        </div>
      </div>`
    : "";

  const noticeHtml = noticeText
    ? `<div style="font-size: 12px; color: #6B7280; border-top: 1px solid #E5E7EB; padding-top: 16px; margin-top: 24px; line-height: 1.5;">
        ${noticeText}
      </div>`
    : "";

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin: 0; padding: 0; min-width: 100%; background-color: #F4F5F7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    ${preheader ? `<div style="display: none; max-height: 0px; overflow: hidden;">${preheader}</div>` : ""}
    
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F4F5F7; padding: 40px 16px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 8px; border: 1px solid #E5E7EB; overflow: hidden; text-align: left;">
            
            <!-- Enterprise Corporate Header -->
            <tr>
              <td style="padding: 24px 32px; border-bottom: 1px solid #E5E7EB; background-color: #FFFFFF;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="left" style="vertical-align: middle;">
                      <a href="${appUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                        <img src="cid:c2talentslogo" alt="C2Talents Logo" height="42" style="height: 42px; width: auto; max-height: 42px; display: block; border: 0; outline: none;" onError="this.onerror=null;this.src='${logoUrl}';" />
                      </a>
                    </td>
                    <td align="right" style="vertical-align: middle;">
                      <span style="font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.8px;">Higher Education Platform</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Main Content Area -->
            <tr>
              <td style="padding: 32px; color: #374151;">
                <h1 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 16px 0; line-height: 1.4; letter-spacing: -0.3px;">
                  ${title}
                </h1>

                <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 16px 0;">
                  Dear ${recipientName},
                </p>

                ${bodyParagraphs
                  .map((p) => `<p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0 0 16px 0;">${p}</p>`)
                  .join("")}

                ${infoTableHtml}
                ${nextStepsHtml}
                ${ctaHtml}
                ${noticeHtml}
              </td>
            </tr>

            <!-- Enterprise Footer -->
            <tr>
              <td style="padding: 24px 32px; background-color: #FAFAFA; border-top: 1px solid #E5E7EB; font-size: 12px; color: #6B7280; line-height: 1.5;">
                <p style="margin: 0 0 12px 0; color: #374151; font-size: 13px;">
                  Regards,<br />
                  <strong>C2Talents Team</strong>
                </p>
                <div style="border-top: 1px solid #E5E7EB; padding-top: 12px; margin-top: 12px;">
                  <p style="margin: 0 0 4px 0; font-weight: 600; color: #4B5563;">C2Talents Enterprise Platform</p>
                  <p style="margin: 0 0 8px 0;">
                    <a href="${appUrl}" style="color: #2563EB; text-decoration: none;">Official Website</a> &nbsp;|&nbsp;
                    <a href="mailto:support@c2talents.com" style="color: #2563EB; text-decoration: none;">Support Email</a> &nbsp;|&nbsp;
                    <a href="${appUrl}/privacy" style="color: #6B7280; text-decoration: none;">Privacy Policy</a> &nbsp;|&nbsp;
                    <a href="${appUrl}/terms" style="color: #6B7280; text-decoration: none;">Terms of Service</a>
                  </p>
                  <p style="margin: 0; color: #9CA3AF;">&copy; ${new Date().getFullYear()} C2Talents Inc. All rights reserved. Confidential transaction notice.</p>
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

import { compileEmailTemplate, DEFAULT_EMAIL_TEMPLATES } from "@/lib/emailTemplates";

// =========================================================
// DYNAMIC ENTERPRISE EMAIL TEMPLATES
// =========================================================

// 1. Registration Received
export async function generateCollegeRegistrationReceivedEmailDetails({
  collegeName,
  contactPerson,
  location,
}: {
  collegeName: string;
  contactPerson: string;
  location?: string;
}): Promise<{ subject: string; html: string }> {
  return compileEmailTemplate("registration_received", { collegeName, contactPerson, location });
}

export async function generateCollegeRegistrationReceivedEmailHtml(params: {
  collegeName: string;
  contactPerson: string;
  location?: string;
}): Promise<string> {
  const { html } = await generateCollegeRegistrationReceivedEmailDetails(params);
  return html;
}

// 2. Registration Approved
export async function generateCollegeApprovalEmailDetails({
  collegeName,
  contactPerson,
  accessUrl,
}: {
  collegeName: string;
  contactPerson: string;
  accessUrl: string;
}): Promise<{ subject: string; html: string }> {
  const approvalDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return compileEmailTemplate("registration_approved", {
    collegeName,
    contactPerson,
    accessUrl,
    portalLink: accessUrl,
    approvalDate,
  });
}

export async function generateCollegeApprovalEmailHtml(params: {
  collegeName: string;
  contactPerson: string;
  accessUrl: string;
}): Promise<string> {
  const { html } = await generateCollegeApprovalEmailDetails(params);
  return html;
}

// 3. Registration Rejected
export async function generateCollegeRejectionEmailDetails({
  collegeName,
  contactPerson,
  reason,
}: {
  collegeName: string;
  contactPerson: string;
  reason?: string;
}): Promise<{ subject: string; html: string }> {
  return compileEmailTemplate("registration_rejected", { collegeName, contactPerson, reason });
}

export async function generateCollegeRejectionEmailHtml(params: {
  collegeName: string;
  contactPerson: string;
  reason?: string;
}): Promise<string> {
  const { html } = await generateCollegeRejectionEmailDetails(params);
  return html;
}

// 4. Profile Submitted
export async function generateCollegeDataSubmittedEmailDetails({
  collegeName,
  contactPerson,
}: {
  collegeName: string;
  contactPerson: string;
}): Promise<{ subject: string; html: string }> {
  return compileEmailTemplate("profile_submitted", { collegeName, contactPerson });
}

export async function generateCollegeDataSubmittedEmailHtml(params: {
  collegeName: string;
  contactPerson: string;
}): Promise<string> {
  const { html } = await generateCollegeDataSubmittedEmailDetails(params);
  return html;
}

// 5. Changes Requested
export async function generateCollegeChangesRequestedEmailDetails({
  collegeName,
  contactPerson,
  accessUrl,
  adminNotes,
}: {
  collegeName: string;
  contactPerson: string;
  accessUrl: string;
  adminNotes?: string;
}): Promise<{ subject: string; html: string }> {
  return compileEmailTemplate("changes_requested", { collegeName, contactPerson, accessUrl, adminNotes });
}

export async function generateCollegeChangesRequestedEmailHtml(params: {
  collegeName: string;
  contactPerson: string;
  accessUrl: string;
  adminNotes?: string;
}): Promise<string> {
  const { html } = await generateCollegeChangesRequestedEmailDetails(params);
  return html;
}

// 6. Profile Published
export async function generateCollegePublishedEmailDetails({
  collegeName,
  contactPerson,
  collegeSlug,
  liveUrl,
}: {
  collegeName: string;
  contactPerson?: string;
  collegeSlug: string;
  liveUrl?: string;
}): Promise<{ subject: string; html: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://c2talents.com";
  const profileUrl = liveUrl || `${appUrl}/colleges/${collegeSlug}`;
  return compileEmailTemplate("profile_published", { collegeName, contactPerson, collegeSlug, liveUrl: profileUrl });
}

export async function generateCollegePublishedEmailHtml(params: {
  collegeName: string;
  contactPerson?: string;
  collegeSlug: string;
  liveUrl?: string;
}): Promise<string> {
  const { html } = await generateCollegePublishedEmailDetails(params);
  return html;
}

// 7. Password Reset Request
export async function generatePasswordResetEmailDetails({
  recipientName,
  resetUrl,
  expiresInMinutes = 60,
}: {
  recipientName: string;
  resetUrl: string;
  expiresInMinutes?: number;
}): Promise<{ subject: string; html: string }> {
  return compileEmailTemplate("password_reset", { recipientName, resetUrl, expiresInMinutes });
}

export async function generatePasswordResetEmailHtml(params: {
  recipientName: string;
  resetUrl: string;
  expiresInMinutes?: number;
}): Promise<string> {
  const { html } = await generatePasswordResetEmailDetails(params);
  return html;
}

// 8. Team / Portal Invitation Email
export async function generateInvitationEmailDetails({
  recipientName,
  inviterName,
  roleName,
  acceptUrl,
}: {
  recipientName: string;
  inviterName?: string;
  roleName?: string;
  acceptUrl: string;
}): Promise<{ subject: string; html: string }> {
  return compileEmailTemplate("team_invitation", { recipientName, inviterName, roleName, acceptUrl });
}

export async function generateInvitationEmailHtml(params: {
  recipientName: string;
  inviterName?: string;
  roleName?: string;
  acceptUrl: string;
}): Promise<string> {
  const { html } = await generateInvitationEmailDetails(params);
  return html;
}

// 9. General Enterprise Notification Email
export async function generateNotificationEmailDetails({
  recipientName,
  title,
  message,
  actionUrl,
  actionText,
}: {
  recipientName: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}): Promise<{ subject: string; html: string }> {
  return compileEmailTemplate("general_notification", { recipientName, title, message, actionUrl, actionText });
}

export async function generateNotificationEmailHtml(params: {
  recipientName: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}): Promise<string> {
  const { html } = await generateNotificationEmailDetails(params);
  return html;
}

