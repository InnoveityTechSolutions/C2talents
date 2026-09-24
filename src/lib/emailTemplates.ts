import { db } from "@/lib/db";
import { renderBaseEmailTemplate } from "@/lib/email";

export interface EmailTemplateDefinition {
  templateKey: string;
  templateName: string;
  category: "Onboarding" | "Approval" | "Notifications" | "Authentication" | "System";
  subject: string;
  preheader: string;
  headerTitle: string;
  greeting: string;
  bodyHtml: string;
  buttonText: string;
  buttonUrl: string;
  footerHtml: string;
  status: "DRAFT" | "PUBLISHED";
  version: number;
  updatedBy: string;
  updatedAt?: string | Date;
  availableVariables: { name: string; description: string }[];
  sampleData: Record<string, string>;
}

export const DEFAULT_EMAIL_TEMPLATES: Record<string, EmailTemplateDefinition> = {
  registration_received: {
    templateKey: "registration_received",
    templateName: "Registration Request Received",
    category: "Onboarding",
    subject: "Registration Request Received - {{collegeName}}",
    preheader: "We have received your institution registration request for {{collegeName}}.",
    headerTitle: "Registration Request Received",
    greeting: "Dear {{contactPerson}},",
    bodyHtml: `<p>Thank you for submitting a college registration request for <strong>{{collegeName}}</strong> on the <strong>{{companyName}}</strong> platform.</p>
<p>Our verification panel will review your institutional credentials. Upon approval, an official portal access link will be delivered to this email address allowing you to set up your profile.</p>`,
    buttonText: "Track Request Status",
    buttonUrl: "{{portalLink}}",
    footerHtml: `<p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p><p>For assistance, contact <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>`,
    status: "PUBLISHED",
    version: 1,
    updatedBy: "System Default",
    availableVariables: [
      { name: "collegeName", description: "Name of the institution" },
      { name: "contactPerson", description: "Name of the applicant / contact person" },
      { name: "portalLink", description: "Link to track status" },
      { name: "supportEmail", description: "Platform support email" },
      { name: "companyName", description: "Company brand name" },
      { name: "currentYear", description: "Current year" },
    ],
    sampleData: {
      collegeName: "St. Xavier Institute of Technology",
      contactPerson: "Dr. Rajesh Kumar",
      portalLink: "http://localhost:3000/dashboard/applications",
      supportEmail: "support@c2talents.com",
      companyName: "C2Talents Platform",
      currentYear: "2026",
    },
  },
  registration_approved: {
    templateKey: "registration_approved",
    templateName: "Registration Approved",
    category: "Approval",
    subject: "College Registration Approved — Complete Your College Profile",
    preheader: "Your registration request for {{collegeName}} has been approved.",
    headerTitle: "Registration Approved",
    greeting: "Dear {{contactPerson}},",
    bodyHtml: `<p>We are pleased to inform you that your registration request for <strong>{{collegeName}}</strong> has been reviewed and approved on {{approvalDate}}.</p>
<p>Your institution is now authorized to access the C2Talents onboarding portal to submit degree courses, fee structures, hostel information, and placement statistics.</p>
<p>Please click the button below to complete your institutional profile. This link is unique and secure to your institution.</p>`,
    buttonText: "Complete College Profile",
    buttonUrl: "{{portalLink}}",
    footerHtml: `<p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p><p>For assistance, contact <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>`,
    status: "PUBLISHED",
    version: 1,
    updatedBy: "System Default",
    availableVariables: [
      { name: "collegeName", description: "Name of the institution" },
      { name: "contactPerson", description: "Contact person name" },
      { name: "portalLink", description: "Secure onboarding portal access URL" },
      { name: "accessUrl", description: "Secure onboarding portal access URL" },
      { name: "approvalDate", description: "Date of approval" },
      { name: "supportEmail", description: "Support email" },
      { name: "companyName", description: "Company name" },
      { name: "currentYear", description: "Current year" },
    ],
    sampleData: {
      collegeName: "St. Xavier Institute of Technology",
      contactPerson: "Dr. Rajesh Kumar",
      portalLink: "http://localhost:3000/college-portal/token-12345",
      accessUrl: "http://localhost:3000/college-portal/token-12345",
      approvalDate: "August 4, 2026",
      supportEmail: "support@c2talents.com",
      companyName: "C2Talents Platform",
      currentYear: "2026",
    },
  },
  registration_rejected: {
    templateKey: "registration_rejected",
    templateName: "Registration Rejected",
    category: "Approval",
    subject: "Registration Request Status Update - {{collegeName}}",
    preheader: "Status update regarding your registration request for {{collegeName}}.",
    headerTitle: "Registration Status Update",
    greeting: "Dear {{contactPerson}},",
    bodyHtml: `<p>Thank you for your interest in registering <strong>{{collegeName}}</strong> on the C2Talents platform.</p>
<p>After reviewing your submission, our administration panel was unable to approve the request at this time for the following reason:</p>
<blockquote style="padding: 12px 16px; background-color: #fef2f2; border-left: 4px solid #ef4444; color: #991b1b; border-radius: 4px; margin: 16px 0;">{{reason}}</blockquote>
<p>If you believe this was in error or wish to provide updated verification documents, please reach out to our team at {{supportEmail}}.</p>`,
    buttonText: "Contact Support",
    buttonUrl: "mailto:{{supportEmail}}",
    footerHtml: `<p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p>`,
    status: "PUBLISHED",
    version: 1,
    updatedBy: "System Default",
    availableVariables: [
      { name: "collegeName", description: "Name of the institution" },
      { name: "contactPerson", description: "Contact person name" },
      { name: "reason", description: "Reason for rejection" },
      { name: "supportEmail", description: "Support email" },
      { name: "companyName", description: "Company name" },
      { name: "currentYear", description: "Current year" },
    ],
    sampleData: {
      collegeName: "St. Xavier Institute of Technology",
      contactPerson: "Dr. Rajesh Kumar",
      reason: "Institutional accreditation document could not be verified.",
      supportEmail: "support@c2talents.com",
      companyName: "C2Talents Platform",
      currentYear: "2026",
    },
  },
  profile_submitted: {
    templateKey: "profile_submitted",
    templateName: "Profile Submission Received",
    category: "Notifications",
    subject: "Profile Submission Confirmation - {{collegeName}}",
    preheader: "We have received your detailed profile submission for {{collegeName}}.",
    headerTitle: "Profile Submission Received",
    greeting: "Dear {{contactPerson}},",
    bodyHtml: `<p>Thank you for completing and submitting the official profile details for <strong>{{collegeName}}</strong>.</p>
<p>Our quality verification panel is currently reviewing your submitted degree courses, fee structures, hostel information, and media prior to publishing your profile live.</p>`,
    buttonText: "View Submission Details",
    buttonUrl: "{{portalLink}}",
    footerHtml: `<p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p>`,
    status: "PUBLISHED",
    version: 1,
    updatedBy: "System Default",
    availableVariables: [
      { name: "collegeName", description: "Name of the institution" },
      { name: "contactPerson", description: "Contact person name" },
      { name: "portalLink", description: "Portal link" },
      { name: "supportEmail", description: "Support email" },
      { name: "companyName", description: "Company name" },
      { name: "currentYear", description: "Current year" },
    ],
    sampleData: {
      collegeName: "St. Xavier Institute of Technology",
      contactPerson: "Dr. Rajesh Kumar",
      portalLink: "http://localhost:3000/college-portal/token-12345",
      supportEmail: "support@c2talents.com",
      companyName: "C2Talents Platform",
      currentYear: "2026",
    },
  },
  changes_requested: {
    templateKey: "changes_requested",
    templateName: "Profile Revision Requested",
    category: "Notifications",
    subject: "Action Required: Revisions Requested for {{collegeName}} Profile",
    preheader: "Revisions have been requested for your {{collegeName}} profile.",
    headerTitle: "Profile Revisions Requested",
    greeting: "Dear {{contactPerson}},",
    bodyHtml: `<p>Our verification team reviewed the submitted profile for <strong>{{collegeName}}</strong> and identified items that require update or clarification prior to live publication.</p>
<div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 14px 18px; margin: 16px 0; border-radius: 6px;">
  <strong style="color: #c2410c;">Reviewer Notes:</strong>
  <p style="margin-top: 6px; color: #9a3412;">{{adminNotes}}</p>
</div>
<p>Please use the link below to log in and update the requested information.</p>`,
    buttonText: "Update College Profile",
    buttonUrl: "{{portalLink}}",
    footerHtml: `<p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p>`,
    status: "PUBLISHED",
    version: 1,
    updatedBy: "System Default",
    availableVariables: [
      { name: "collegeName", description: "Name of the institution" },
      { name: "contactPerson", description: "Contact person name" },
      { name: "adminNotes", description: "Feedback notes from reviewer" },
      { name: "portalLink", description: "Edit profile link" },
      { name: "supportEmail", description: "Support email" },
      { name: "companyName", description: "Company name" },
      { name: "currentYear", description: "Current year" },
    ],
    sampleData: {
      collegeName: "St. Xavier Institute of Technology",
      contactPerson: "Dr. Rajesh Kumar",
      adminNotes: "Please update the hostel fee breakdown for 2026 and re-upload the campus logo in PNG format.",
      portalLink: "http://localhost:3000/college-portal/token-12345",
      supportEmail: "support@c2talents.com",
      companyName: "C2Talents Platform",
      currentYear: "2026",
    },
  },
  profile_published: {
    templateKey: "profile_published",
    templateName: "Profile Published & Live",
    category: "Notifications",
    subject: "Congratulations! {{collegeName}} is Now Live on C2Talents",
    preheader: "Your official profile for {{collegeName}} is now live.",
    headerTitle: "College Profile Published",
    greeting: "Dear {{contactPerson}},",
    bodyHtml: `<p>We are excited to announce that your college profile for <strong>{{collegeName}}</strong> has been verified and published live on the C2Talents platform!</p>
<p>Students, applicants, and recruiters nationwide can now search, explore degree courses, read reviews, and connect directly with your admissions office.</p>`,
    buttonText: "View Live Profile",
    buttonUrl: "{{profileUrl}}",
    footerHtml: `<p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p>`,
    status: "PUBLISHED",
    version: 1,
    updatedBy: "System Default",
    availableVariables: [
      { name: "collegeName", description: "Name of the institution" },
      { name: "contactPerson", description: "Contact person name" },
      { name: "profileUrl", description: "Live public profile URL" },
      { name: "supportEmail", description: "Support email" },
      { name: "companyName", description: "Company name" },
      { name: "currentYear", description: "Current year" },
    ],
    sampleData: {
      collegeName: "St. Xavier Institute of Technology",
      contactPerson: "Dr. Rajesh Kumar",
      profileUrl: "http://localhost:3000/colleges/st-xavier-institute-of-technology",
      supportEmail: "support@c2talents.com",
      companyName: "C2Talents Platform",
      currentYear: "2026",
    },
  },
  password_reset: {
    templateKey: "password_reset",
    templateName: "Password Reset Link",
    category: "Authentication",
    subject: "Reset Your C2Talents Account Password",
    preheader: "Password reset request for your C2Talents account.",
    headerTitle: "Password Reset Request",
    greeting: "Hello {{recipientName}},",
    bodyHtml: `<p>We received a request to reset the password for your C2Talents account associated with <strong>{{userEmail}}</strong>.</p>
<p>To set up a new password, click the button below. For security, this link will expire in 60 minutes.</p>
<p>If you did not request a password reset, you can safely ignore this message; your account password will remain unchanged.</p>`,
    buttonText: "Reset My Password",
    buttonUrl: "{{resetUrl}}",
    footerHtml: `<p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p>`,
    status: "PUBLISHED",
    version: 1,
    updatedBy: "System Default",
    availableVariables: [
      { name: "recipientName", description: "Recipient name" },
      { name: "userEmail", description: "User email address" },
      { name: "resetUrl", description: "Password reset URL link" },
      { name: "supportEmail", description: "Support email" },
      { name: "companyName", description: "Company name" },
      { name: "currentYear", description: "Current year" },
    ],
    sampleData: {
      recipientName: "Praveen Natarajan",
      userEmail: "praveen@c2talents.com",
      resetUrl: "http://localhost:3000/reset-password?token=sample-reset-token",
      supportEmail: "support@c2talents.com",
      companyName: "C2Talents Platform",
      currentYear: "2026",
    },
  },
  team_invitation: {
    templateKey: "team_invitation",
    templateName: "Account / Team Invitation",
    category: "Authentication",
    subject: "You've Been Invited to Join C2Talents Enterprise Portal",
    preheader: "Invitation to join C2Talents Enterprise Portal.",
    headerTitle: "Team Invitation",
    greeting: "Hello {{recipientName}},",
    bodyHtml: `<p><strong>{{inviterName}}</strong> has invited you to join the C2Talents Enterprise platform in the role of <strong>{{roleName}}</strong>.</p>
<p>Click the button below to accept your invitation and activate your account credentials.</p>`,
    buttonText: "Accept Invitation",
    buttonUrl: "{{acceptUrl}}",
    footerHtml: `<p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p>`,
    status: "PUBLISHED",
    version: 1,
    updatedBy: "System Default",
    availableVariables: [
      { name: "recipientName", description: "Invited user's name" },
      { name: "inviterName", description: "Name of inviter" },
      { name: "roleName", description: "Assigned role name" },
      { name: "acceptUrl", description: "Accept invitation URL" },
      { name: "supportEmail", description: "Support email" },
      { name: "companyName", description: "Company name" },
      { name: "currentYear", description: "Current year" },
    ],
    sampleData: {
      recipientName: "Anita Sharma",
      inviterName: "Super Admin",
      roleName: "College Manager",
      acceptUrl: "http://localhost:3000/accept-invitation?token=sample-invite-123",
      supportEmail: "support@c2talents.com",
      companyName: "C2Talents Platform",
      currentYear: "2026",
    },
  },
  welcome_email: {
    templateKey: "welcome_email",
    templateName: "Welcome Email",
    category: "Onboarding",
    subject: "Welcome to C2Talents Platform, {{recipientName}}!",
    preheader: "Welcome to C2Talents - Your premier higher education portal.",
    headerTitle: "Welcome to C2Talents",
    greeting: "Welcome {{recipientName}},",
    bodyHtml: `<p>We are delighted to welcome you to the <strong>{{companyName}}</strong> community!</p>
<p>C2Talents connects students with top institutions, verified course offerings, scholarships, and career counseling services.</p>
<p>Get started today by exploring top-ranked colleges or managing your applications.</p>`,
    buttonText: "Explore Platform",
    buttonUrl: "{{website}}",
    footerHtml: `<p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p>`,
    status: "PUBLISHED",
    version: 1,
    updatedBy: "System Default",
    availableVariables: [
      { name: "recipientName", description: "User's full name" },
      { name: "website", description: "Main platform website URL" },
      { name: "supportEmail", description: "Support email" },
      { name: "companyName", description: "Company name" },
      { name: "currentYear", description: "Current year" },
    ],
    sampleData: {
      recipientName: "Praveen Natarajan",
      website: "http://localhost:3000",
      supportEmail: "support@c2talents.com",
      companyName: "C2Talents Platform",
      currentYear: "2026",
    },
  },
  smtp_test: {
    templateKey: "smtp_test",
    templateName: "SMTP Test Email",
    category: "System",
    subject: "C2Talents SMTP Configuration Verification - {{timestamp}}",
    preheader: "This is a test email verifying your SMTP server integration.",
    headerTitle: "SMTP Test Success",
    greeting: "Hello Administrator,",
    bodyHtml: `<p>This test email confirms that your SMTP credentials and mail delivery server settings are correctly configured on <strong>{{companyName}}</strong>.</p>
<div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 16px; margin: 16px 0; border-radius: 6px; color: #15803d;">
  <strong>Delivery Status:</strong> OK &bull; Connection Verified on {{timestamp}}
</div>`,
    buttonText: "Open Admin CMS",
    buttonUrl: "http://localhost:3000/manager/dashboard",
    footerHtml: `<p>&copy; {{currentYear}} {{companyName}}. System Verification Log.</p>`,
    status: "PUBLISHED",
    version: 1,
    updatedBy: "System Default",
    availableVariables: [
      { name: "timestamp", description: "Timestamp of test dispatch" },
      { name: "supportEmail", description: "Support email" },
      { name: "companyName", description: "Company name" },
      { name: "currentYear", description: "Current year" },
    ],
    sampleData: {
      timestamp: "2026-08-04 11:15:00 UTC",
      supportEmail: "support@c2talents.com",
      companyName: "C2Talents Platform",
      currentYear: "2026",
    },
  },
};

/**
 * Replace placeholders like {{variableName}} in string
 */
export function replacePlaceholders(templateStr: string, variables: Record<string, any>): string {
  if (!templateStr) return "";
  
  // Auto-inject common global variables if missing
  const fullVars: Record<string, any> = {
    companyName: "C2Talents Platform",
    supportEmail: "support@c2talents.com",
    website: "http://localhost:3000",
    currentYear: new Date().getFullYear().toString(),
    ...variables,
  };

  return templateStr.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    return fullVars && fullVars[key] !== undefined && fullVars[key] !== null
      ? String(fullVars[key])
      : `{{${key}}}`;
  });
}

/**
 * Get active template data from DB or system fallback
 */
export async function getEmailTemplateData(templateKey: string): Promise<EmailTemplateDefinition> {
  const defaultTemplate = DEFAULT_EMAIL_TEMPLATES[templateKey] || DEFAULT_EMAIL_TEMPLATES.registration_received;

  try {
    const dbTemplate = await db.emailTemplate.findUnique({
      where: { templateKey },
    });

    if (dbTemplate && dbTemplate.isActive) {
      return {
        ...defaultTemplate,
        templateName: dbTemplate.templateName || dbTemplate.name || defaultTemplate.templateName,
        category: (dbTemplate.category as any) || defaultTemplate.category,
        subject: dbTemplate.subject || defaultTemplate.subject,
        preheader: dbTemplate.preheader || defaultTemplate.preheader,
        headerTitle: dbTemplate.headerTitle || dbTemplate.title || defaultTemplate.headerTitle,
        greeting: dbTemplate.greeting || defaultTemplate.greeting,
        bodyHtml: dbTemplate.bodyHtml || defaultTemplate.bodyHtml,
        buttonText: dbTemplate.buttonText || dbTemplate.ctaText || defaultTemplate.buttonText,
        buttonUrl: dbTemplate.buttonUrl || defaultTemplate.buttonUrl,
        footerHtml: dbTemplate.footerHtml || defaultTemplate.footerHtml,
        status: (dbTemplate.status as any) || "PUBLISHED",
        version: dbTemplate.version || 1,
        updatedBy: dbTemplate.updatedBy || "Super Admin",
        updatedAt: dbTemplate.updatedAt,
      };
    }
  } catch (err: any) {
    console.error(`[EMAIL TEMPLATES] Error fetching DB template for ${templateKey}:`, err.message);
  }

  return defaultTemplate;
}

/**
 * Compile dynamic HTML and subject for email sending
 */
export async function compileEmailTemplate(
  templateKey: string,
  variables: Record<string, any>
): Promise<{ subject: string; html: string }> {
  const template = await getEmailTemplateData(templateKey);

  const fullVars = {
    collegeName: variables.collegeName || "Institution",
    contactPerson: variables.contactPerson || variables.recipientName || "Valued Customer",
    portalLink: variables.portalLink || variables.accessUrl || "http://localhost:3000/dashboard/applications",
    profileUrl: variables.profileUrl || variables.liveUrl || "http://localhost:3000",
    resetUrl: variables.resetUrl || "http://localhost:3000/reset-password",
    acceptUrl: variables.acceptUrl || "http://localhost:3000/accept-invitation",
    approvalDate: variables.approvalDate || new Date().toLocaleDateString(),
    reason: variables.reason || "Review requirements not met.",
    adminNotes: variables.adminNotes || "Please review portal updates.",
    supportEmail: "support@c2talents.com",
    companyName: "C2Talents Platform",
    currentYear: new Date().getFullYear().toString(),
    ...variables,
  };

  const compiledSubject = replacePlaceholders(template.subject, fullVars);
  const compiledPreheader = replacePlaceholders(template.preheader, fullVars);
  const compiledHeaderTitle = replacePlaceholders(template.headerTitle, fullVars);
  const compiledGreeting = replacePlaceholders(template.greeting, fullVars);
  const compiledBodyHtml = replacePlaceholders(template.bodyHtml, fullVars);
  const compiledButtonText = template.buttonText ? replacePlaceholders(template.buttonText, fullVars) : undefined;
  const compiledButtonUrl = template.buttonUrl ? replacePlaceholders(template.buttonUrl, fullVars) : undefined;
  const compiledFooterHtml = template.footerHtml ? replacePlaceholders(template.footerHtml, fullVars) : undefined;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://c2talents.com";
  const logoFallbackUrl = `${appUrl}/logo.png`;

  // Institutional Summary Table for Registration Approved / Changes
  const showInstitutionSummary =
    templateKey === "registration_approved" || templateKey === "registration_received" || templateKey === "changes_requested";

  const institutionSummaryHtml = showInstitutionSummary
    ? `
      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin: 24px 0; padding: 18px 22px;">
        <div style="font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">
          Institution Verification Summary
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 13px; line-height: 1.6;">
          <tr>
            <td style="padding: 6px 0; color: #64748B; font-weight: 600; width: 140px; vertical-align: top;">Institution Name:</td>
            <td style="padding: 6px 0; color: #0F172A; font-weight: 700; font-size: 14px;">${fullVars.collegeName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748B; font-weight: 600; vertical-align: top;">Representative:</td>
            <td style="padding: 6px 0; color: #1E293B; font-weight: 600;">${fullVars.contactPerson}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748B; font-weight: 600; vertical-align: top;">Verification:</td>
            <td style="padding: 6px 0;">
              <span style="display: inline-block; background-color: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 4px;">
                ✓ Verified & Authorized
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748B; font-weight: 600; vertical-align: top;">Access Period:</td>
            <td style="padding: 6px 0; color: #475569; font-weight: 500;">14 Days from Approval</td>
          </tr>
        </table>
      </div>
    `
    : "";

  // Next Steps Guidance for Onboarding
  const nextStepsHtml =
    templateKey === "registration_approved"
      ? `
      <div style="background-color: #F5F3FF; border: 1px solid #DDD6FE; border-radius: 10px; padding: 18px 22px; margin: 24px 0;">
        <div style="font-size: 11px; font-weight: 800; color: #5B21B6; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 8px;">
          Next Steps to Complete Onboarding:
        </div>
        <ol style="margin: 0; padding-left: 20px; color: #4C1D95; font-size: 13px; line-height: 1.6;">
          <li style="margin-bottom: 6px;">Click the <strong>${compiledButtonText || "Complete College Profile"}</strong> button below to open your dedicated onboarding portal.</li>
          <li style="margin-bottom: 6px;">Enter your degree programs, fee structures, facilities, and placement statistics.</li>
          <li>Submit for final review to publish your college live on the C2Talents platform.</li>
        </ol>
      </div>
    `
      : "";

  // Build complete responsive HTML email wrapper with pristine white high-contrast header
  const html = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${compiledSubject}</title>
</head>
<body style="margin: 0; padding: 0; min-width: 100%; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #334155;">
  <!-- Preheader preview text -->
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #F8FAFC; opacity: 0;">
    ${compiledPreheader}
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F8FAFC; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05); text-align: left;">
          
          <!-- Top Brand Accent Gradient Bar -->
          <tr>
            <td style="height: 5px; background: linear-gradient(90deg, #1e0a38 0%, #4338ca 45%, #f59e0b 100%); line-height: 5px; font-size: 1px;">
              &nbsp;
            </td>
          </tr>

          <!-- Clean Pristine Header with Highly Visible Logo on White -->
          <tr>
            <td style="padding: 32px 36px 20px 36px; background-color: #FFFFFF; text-align: center; border-bottom: 1px solid #F1F5F9;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="vertical-align: middle;">
                    <a href="${appUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                      <img src="cid:c2talentslogo" alt="C2Talents Logo" height="48" style="height: 48px; max-height: 48px; width: auto; display: block; border: 0; outline: none; margin: 0 auto;" onError="this.onerror=null;this.src='${logoFallbackUrl}';" />
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 10px;">
                    <span style="font-size: 11px; font-weight: 700; color: #64748B; letter-spacing: 1.5px; text-transform: uppercase;">
                      Higher Education Platform &bull; Official Notice
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Title & Status Header -->
          <tr>
            <td style="padding: 28px 36px 8px 36px; text-align: center; background-color: #FAFAFA; border-bottom: 1px solid #F1F5F9;">
              <div style="margin-bottom: 12px;">
                <span style="display: inline-block; background-color: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; font-size: 11px; font-weight: 800; padding: 4px 14px; border-radius: 9999px; letter-spacing: 0.5px; text-transform: uppercase;">
                  &#10003;&nbsp; ${templateKey === "registration_approved" ? "Registration Approved" : "Official Update"}
                </span>
              </div>
              <h1 style="font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 6px 0; letter-spacing: -0.4px; line-height: 1.3;">
                ${compiledHeaderTitle}
              </h1>
              <p style="font-size: 13px; color: #64748B; margin: 0; line-height: 1.5;">
                ${compiledPreheader}
              </p>
            </td>
          </tr>

          <!-- Main Email Content Area -->
          <tr>
            <td style="padding: 32px 36px; color: #334155; font-size: 14px; line-height: 1.6;">
              ${compiledGreeting ? `<div style="font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 14px;">${compiledGreeting}</div>` : ""}

              <div style="line-height: 1.7; color: #334155;">
                ${compiledBodyHtml}
              </div>

              ${institutionSummaryHtml}
              ${nextStepsHtml}

              <!-- Action Button Area -->
              ${
                compiledButtonText && compiledButtonUrl
                  ? `
                  <div style="text-align: center; margin: 32px 0 24px 0;">
                    <a href="${compiledButtonUrl}" target="_blank" style="background: linear-gradient(135deg, #1e0a38 0%, #3b1473 100%); background-color: #1e0a38; color: #FFFFFF !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 8px; display: inline-block; letter-spacing: 0.3px; box-shadow: 0 4px 14px rgba(30, 10, 56, 0.25);">
                      ${compiledButtonText} &rarr;
                    </a>
                    <div style="margin-top: 14px; font-size: 11px; color: #94A3B8; word-break: break-all; max-width: 500px; margin-left: auto; margin-right: auto; line-height: 1.5;">
                      If the button does not work, copy and paste this link into your browser:<br />
                      <a href="${compiledButtonUrl}" style="color: #4338ca; text-decoration: underline;">${compiledButtonUrl}</a>
                    </div>
                  </div>
                `
                  : ""
              }
            </td>
          </tr>

          <!-- Clean SaaS Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #64748B; line-height: 1.6;">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #475569;">
                C2Talents Platform &bull; Connecting Students with Premier Institutions
              </p>
              <p style="margin: 0 0 12px 0;">
                <a href="${appUrl}" style="color: #4338ca; text-decoration: none; font-weight: 600;">Official Website</a> &nbsp;|&nbsp;
                <a href="mailto:support@c2talents.com" style="color: #4338ca; text-decoration: none; font-weight: 600;">Support Desk</a> &nbsp;|&nbsp;
                <a href="${appUrl}/privacy" style="color: #64748B; text-decoration: none;">Privacy Policy</a>
              </p>
              <div style="border-top: 1px solid #E2E8F0; padding-top: 12px; margin-top: 12px; font-size: 11px; color: #94A3B8;">
                &copy; ${new Date().getFullYear()} C2Talents Inc. All rights reserved. This is an automated official transmission delivered to an authorized institutional email.
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject: compiledSubject, html };
}

/**
 * Version History Helper
 */
export async function createTemplateVersion(
  templateKey: string,
  data: Partial<EmailTemplateDefinition>,
  changedBy: string = "Super Admin",
  summary: string = "Updated email template"
) {
  try {
    const current = await db.emailTemplate.findUnique({ where: { templateKey } });
    const versionNum = (current?.version || 0) + 1;

    await db.emailTemplateVersion.create({
      data: {
        templateKey,
        version: versionNum,
        subject: data.subject || current?.subject || "",
        preheader: data.preheader || current?.preheader || null,
        headerTitle: data.headerTitle || current?.headerTitle || null,
        greeting: data.greeting || current?.greeting || null,
        bodyHtml: data.bodyHtml || current?.bodyHtml || "",
        buttonText: data.buttonText || current?.buttonText || null,
        buttonUrl: data.buttonUrl || current?.buttonUrl || null,
        footerHtml: data.footerHtml || current?.footerHtml || null,
        changedBy,
        changeSummary: summary,
      },
    });

    return versionNum;
  } catch (err: any) {
    console.error(`[EMAIL VERSIONING ERROR]:`, err.message);
    return 1;
  }
}

/**
 * Audit Log Helper
 */
export async function logEmailAudit(
  templateKey: string,
  action: "EDIT" | "PUBLISH" | "RESTORE" | "RESET" | "TEST",
  userEmail: string = "superadmin@c2talents.com",
  details: string = ""
) {
  try {
    await db.emailAuditLog.create({
      data: {
        templateKey,
        action,
        userEmail,
        details,
        ipAddress: "127.0.0.1",
      },
    });
  } catch (err: any) {
    console.error(`[EMAIL AUDIT LOG ERROR]:`, err.message);
  }
}
