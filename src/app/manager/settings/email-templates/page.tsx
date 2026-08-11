"use client";

import { useState, useEffect } from "react";
import {
  MailCheck,
  Save,
  RotateCcw,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Tag,
  Bold,
  Italic,
  Underline,
  List,
  ChevronRight,
  X,
  Lock,
  Edit3,
  Eye,
  Columns,
  GraduationCap,
} from "lucide-react";

interface VariableDef {
  name: string;
  label: string;
  description: string;
  sample: string;
}

interface EmailTemplate {
  templateKey: string;
  templateName: string;
  category: string;
  description?: string;
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
  updatedAt: string | null;
  availableVariables: VariableDef[];
  sampleData: Record<string, string>;
  isCustomized?: boolean;
}

const TEMPLATE_METADATA: Record<string, { title: string; desc: string; icon: string }> = {
  registration_received: {
    title: "Registration Request Received",
    desc: "Sent automatically to college administrators right after submitting a registration request.",
    icon: "📥",
  },
  registration_approved: {
    title: "Registration Approved",
    desc: "Sent to college administrators when their account is verified, containing the portal login link.",
    icon: "✅",
  },
  registration_rejected: {
    title: "Registration Rejected",
    desc: "Sent to applicants if institution registration details cannot be verified.",
    icon: "❌",
  },
  profile_submitted: {
    title: "College Profile Submitted",
    desc: "Sent to admins when a college submits their full profile for review.",
    icon: "📄",
  },
  changes_requested: {
    title: "Revision Requested",
    desc: "Sent when an admin requests corrections or updates to a college profile.",
    icon: "✏️",
  },
  profile_published: {
    title: "College Profile Published",
    desc: "Sent when a college profile goes live on the public C2Talents platform.",
    icon: "🚀",
  },
  welcome_email: {
    title: "Welcome Email",
    desc: "Sent to newly onboarded college managers and team members.",
    icon: "🎉",
  },
  password_reset: {
    title: "Password Reset Request",
    desc: "Sent when a user requests a secure password reset link.",
    icon: "🔐",
  },
  team_invitation: {
    title: "Team Member Invitation",
    desc: "Sent when inviting internal team managers or reviewers.",
    icon: "👥",
  },
  smtp_test: {
    title: "SMTP Connection Test",
    desc: "Sent during administrative mail server connectivity testing.",
    icon: "⚙️",
  },
};

const MERGE_VARIABLES: VariableDef[] = [
  { name: "collegeName", label: "College Name", description: "Institution's full name", sample: "Sri Muthukumaran College of Education" },
  { name: "contactPerson", label: "Contact Person", description: "Name of the applicant / admin", sample: "Dr. Rajesh Kumar" },
  { name: "portalLink", label: "Portal Access Link", description: "Secure onboarding or tracking URL", sample: "https://c2talents.com/portal/auth-token" },
  { name: "approvalDate", label: "Approval Date", description: "Date of approval", sample: "August 4, 2026" },
  { name: "profileUrl", label: "Profile Live URL", description: "Public college page link", sample: "https://c2talents.com/colleges/sri-muthukumaran" },
  { name: "supportEmail", label: "Support Email", description: "Platform support email address", sample: "support@c2talents.com" },
  { name: "companyName", label: "Company Name", description: "Brand / Organization name", sample: "C2Talents" },
  { name: "website", label: "Platform Website", description: "Main platform web address", sample: "https://c2talents.com" },
  { name: "currentYear", label: "Current Year", description: "Four-digit current year", sample: "2026" },
];

export default function EnterpriseEmailTemplateCMS() {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("registration_received");
  const [searchQuery, setSearchQuery] = useState("");

  const [currentUser, setCurrentUser] = useState<{ role: string; email: string } | null>(null);
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "split">("split");
  const [activeInput, setActiveInput] = useState<"subject" | "preheader" | "greeting" | "headerTitle" | "bodyHtml" | "buttonText" | "buttonUrl" | null>("bodyHtml");

  // Form State
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [greeting, setGreeting] = useState("");
  const [headerTitle, setHeaderTitle] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");

  // Signature / Footer State
  const [supportEmail, setSupportEmail] = useState("support@c2talents.com");
  const [companyName, setCompanyName] = useState("C2Talents");
  const [website, setWebsite] = useState("https://c2talents.com");

  // UI state
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState("");
  const [showTestModal, setShowTestModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Fetch Current User & Templates
  useEffect(() => {
    async function init() {
      try {
        const userRes = await fetch("/api/admin/auth/me");
        const userData = await userRes.json();
        if (userData.user) setCurrentUser(userData.user);

        const res = await fetch("/api/admin/email-templates");
        const data = await res.json();
        if (data.templates && Array.isArray(data.templates)) {
          setTemplates(data.templates);
          const initial = data.templates[0] || data.templates.find((t: any) => t.templateKey === "registration_received");
          if (initial) loadTemplateIntoForm(initial);
        }
      } catch (err) {
        showToast("error", "Failed to load email templates from database.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  function showToast(type: "success" | "error", text: string) {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  }

  function loadTemplateIntoForm(tpl: EmailTemplate) {
    if (!tpl) return;
    setSelectedKey(tpl.templateKey);
    setSubject(tpl.subject || "");
    setPreheader(tpl.preheader || "");
    setGreeting(tpl.greeting || "");
    setHeaderTitle(tpl.headerTitle || "");
    setBodyHtml(tpl.bodyHtml || "");
    setButtonText(tpl.buttonText || "");
    setButtonUrl(tpl.buttonUrl || "");
  }

  const currentTemplate = templates.find((t) => t.templateKey === selectedKey) || templates[0];
  const isSuperAdmin = !currentUser || currentUser.role === "SUPER_ADMIN";

  // Insert Variable Chip into active input field
  function handleInsertVariable(variableName: string) {
    const varTag = `{{${variableName}}}`;

    if (activeInput === "subject") setSubject((prev) => prev + " " + varTag);
    else if (activeInput === "preheader") setPreheader((prev) => prev + " " + varTag);
    else if (activeInput === "greeting") setGreeting((prev) => prev + " " + varTag);
    else if (activeInput === "headerTitle") setHeaderTitle((prev) => prev + " " + varTag);
    else if (activeInput === "buttonText") setButtonText((prev) => prev + " " + varTag);
    else if (activeInput === "buttonUrl") setButtonUrl((prev) => varTag);
    else {
      setBodyHtml((prev) => prev + ` ${varTag}`);
    }
  }

  // Format Helper for Body Content
  function applyBodyFormatting(tag: "b" | "i" | "u" | "h2" | "ul") {
    if (tag === "b") setBodyHtml((prev) => prev + " <strong>bold text</strong>");
    else if (tag === "i") setBodyHtml((prev) => prev + " <em>italic text</em>");
    else if (tag === "u") setBodyHtml((prev) => prev + " <u>underlined text</u>");
    else if (tag === "h2") setBodyHtml((prev) => prev + "\n<h2>Section Heading</h2>");
    else if (tag === "ul") setBodyHtml((prev) => prev + "\n<ul>\n  <li>Key item 1</li>\n  <li>Key item 2</li>\n</ul>");
  }

  // Save Changes directly to Database
  async function handleSaveChanges() {
    if (!isSuperAdmin) {
      showToast("error", "Permission Denied: Only Super Administrators can save email templates.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/email-templates/${selectedKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateName: TEMPLATE_METADATA[selectedKey]?.title || currentTemplate?.templateName,
          category: currentTemplate?.category || "System",
          subject,
          preheader,
          headerTitle,
          greeting,
          bodyHtml,
          buttonText,
          buttonUrl,
          footerHtml: `<p>&copy; {{currentYear}} ${companyName}. All rights reserved.</p><p>Support: <a href="mailto:${supportEmail}">${supportEmail}</a></p>`,
          status: "PUBLISHED",
          updatedBy: currentUser?.email || "Super Admin",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast("success", "Saved! All future emails sent by the platform will use this format automatically.");
        const refreshRes = await fetch("/api/admin/email-templates");
        const refreshData = await refreshRes.json();
        if (refreshData.templates) setTemplates(refreshData.templates);
      } else {
        showToast("error", data.error || "Failed to save email template.");
      }
    } catch (err: any) {
      showToast("error", "Network error while saving email template.");
    } finally {
      setSaving(false);
    }
  }

  // Restore Default Template
  async function handleRestoreDefault() {
    if (!isSuperAdmin) {
      showToast("error", "Permission Denied: Only Super Administrators can restore default templates.");
      return;
    }

    if (!confirm(`Restore '${TEMPLATE_METADATA[selectedKey]?.title}' back to the original default format?`)) {
      return;
    }

    setResetting(true);
    try {
      const res = await fetch(`/api/admin/email-templates/${selectedKey}/reset`, { method: "POST" });
      const data = await res.json();

      if (res.ok && data.success && data.defaultTemplate) {
        loadTemplateIntoForm(data.defaultTemplate);
        showToast("success", "Restored to original default template.");

        const refreshRes = await fetch("/api/admin/email-templates");
        const refreshData = await refreshRes.json();
        if (refreshData.templates) setTemplates(refreshData.templates);
      } else {
        showToast("error", data.error || "Failed to restore default template.");
      }
    } catch (e) {
      showToast("error", "Error restoring default template.");
    } finally {
      setResetting(false);
    }
  }

  // Send Test Email
  async function handleSendTestEmail() {
    if (!testEmailRecipient || !testEmailRecipient.includes("@")) {
      showToast("error", "Please enter a valid recipient email address.");
      return;
    }

    setTesting(true);
    try {
      const res = await fetch(`/api/admin/email-templates/${selectedKey}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: testEmailRecipient,
          subject,
          preheader,
          headerTitle,
          greeting,
          bodyHtml,
          buttonText,
          buttonUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("success", `Test email sent to ${testEmailRecipient}!`);
        setShowTestModal(false);
      } else {
        showToast("error", data.error || "Failed to send test email.");
      }
    } catch (e) {
      showToast("error", "Failed to dispatch test email.");
    } finally {
      setTesting(false);
    }
  }

  // Render Real-time Live Preview HTML aligned with C2Talents theme
  function renderLivePreviewHtml() {
    const sample: Record<string, string> = {
      collegeName: "Sri Muthukumaran College of Education",
      contactPerson: "Dr. Rajesh Kumar",
      portalLink: "https://c2talents.com/portal/sample-login-link",
      approvalDate: "August 4, 2026",
      profileUrl: "https://c2talents.com/colleges/sri-muthukumaran",
      supportEmail: supportEmail || "support@c2talents.com",
      companyName: companyName || "C2Talents",
      website: website || "https://c2talents.com",
      currentYear: "2026",
      reason: "Institutional accreditation document verification pending.",
      adminNotes: "Please update the hostel fee breakdown and upload official PNG logo.",
      recipientName: "Dr. Rajesh Kumar",
      userEmail: "rajesh.kumar@smce.edu",
      resetUrl: "https://c2talents.com/reset-password/sample",
    };

    let processedSubject = subject;
    let processedHeader = headerTitle;
    let processedGreeting = greeting;
    let processedBody = bodyHtml;
    let processedButtonText = buttonText;
    let processedButtonUrl = buttonUrl;

    Object.entries(sample).forEach(([k, v]) => {
      const regex = new RegExp(`\\{\\{${k}\\}\\}`, "g");
      processedSubject = processedSubject.replace(regex, v);
      processedHeader = processedHeader.replace(regex, v);
      processedGreeting = processedGreeting.replace(regex, v);
      processedBody = processedBody.replace(regex, v);
      processedButtonText = processedButtonText.replace(regex, v);
      processedButtonUrl = processedButtonUrl.replace(regex, v);
    });

    const bgOuter = isDarkMode ? "#0f172a" : "#f8fafc";
    const cardBg = isDarkMode ? "#1e293b" : "#ffffff";
    const textColor = isDarkMode ? "#f1f5f9" : "#1e293b";
    const subColor = isDarkMode ? "#94a3b8" : "#64748b";
    const borderCol = isDarkMode ? "#334155" : "#e2e8f0";

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin:0; padding:24px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background-color:${bgOuter}; color:${textColor}; }
          .container { max-width:600px; margin:0 auto; background:${cardBg}; border-radius:18px; border:1px solid ${borderCol}; overflow:hidden; box-shadow:0 12px 36px rgba(31,12,61,0.08); }
          .header { background:linear-gradient(135deg, #1c0b36 0%, #2a104e 50%, #3b2075 100%); padding:36px 28px; text-align:center; color:#ffffff; border-bottom:3px solid #fbbf24; }
          .logo-box { display:inline-flex; align-items:center; justify-content:center; gap:8px; margin-bottom:4px; }
          .logo-text { font-size:24px; font-weight:900; color:#ffffff; letter-spacing:-0.5px; }
          .logo-highlight { color:#fbbf24; }
          .sub-logo { font-size:10.5px; text-transform:uppercase; letter-spacing:1.5px; color:#fef08a; opacity:0.95; font-weight:800; margin-top:4px; }
          .banner-title { font-size:21px; font-weight:800; color:#ffffff; margin-top:18px; letter-spacing:-0.3px; }
          .content { padding:36px 32px; line-height:1.68; font-size:14px; color:${textColor}; }
          .greeting { font-size:16px; font-weight:800; margin-bottom:18px; color:#1c0b36; }
          .body-text p { margin-bottom:14px; }
          .body-text ul { padding-left:20px; margin-bottom:16px; }
          .body-text li { margin-bottom:6px; }
          .btn-container { text-align:center; margin:34px 0 26px 0; }
          .btn { display:inline-block; background:linear-gradient(135deg, #1c0b36, #3b2075); color:#fef08a !important; font-weight:800; font-size:14px; text-decoration:none; padding:14px 34px; border-radius:14px; border:1px solid rgba(251,191,36,0.5); box-shadow:0 6px 18px rgba(28,11,54,0.35); transition:all 0.2s; }
          .footer { background:${isDarkMode ? "#0f172a" : "#f8fafc"}; padding:26px; text-align:center; font-size:11.5px; color:${subColor}; border-top:1px solid ${borderCol}; }
          .footer a { color:#7c3aed; text-decoration:none; font-weight:700; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo-box">
              <span style="font-size:22px;">🎓</span>
              <span class="logo-text">C2<span class="logo-highlight">Talents</span></span>
            </div>
            <div class="sub-logo font-extrabold">Official Institution Notification</div>
            ${processedHeader ? `<div class="banner-title">${processedHeader}</div>` : ""}
          </div>
          <div class="content">
            ${processedGreeting ? `<div class="greeting">${processedGreeting}</div>` : ""}
            <div class="body-text">${processedBody}</div>
            ${
              processedButtonText
                ? `<div class="btn-container"><a href="${processedButtonUrl}" target="_blank" class="btn">${processedButtonText} →</a></div>`
                : ""
            }
          </div>
          <div class="footer">
            <p>&copy; 2026 ${companyName}. All rights reserved.</p>
            <p>For assistance, contact <a href="mailto:${supportEmail}">${supportEmail}</a> or visit <a href="${website}" target="_blank">${website}</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  const filteredTemplates = templates.filter((t) => {
    const meta = TEMPLATE_METADATA[t.templateKey] || { title: t.templateName, desc: "" };
    const query = searchQuery.toLowerCase();
    return meta.title.toLowerCase().includes(query) || meta.desc.toLowerCase().includes(query);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1c0b36] flex items-center justify-center p-6 font-sans">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-amber-400 mx-auto" />
          <p className="text-sm font-extrabold text-purple-200">Loading C2Talents Email CMS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8ff] flex flex-col font-sans text-slate-900">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-xs font-extrabold animate-in fade-in zoom-in-95 ${
            toastMessage.type === "success"
              ? "bg-[#1c0b36] text-amber-300 border-amber-500/50 shadow-purple-950/40"
              : "bg-rose-950 text-rose-200 border-rose-700/60"
          }`}
        >
          {toastMessage.type === "success" ? <CheckCircle2 className="w-4.5 h-4.5 text-amber-400" /> : <AlertCircle className="w-4.5 h-4.5 text-rose-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* TOP HEADER BAR — Matching C2Talents Website Theme */}
      <header className="bg-[#1c0b36] text-white border-b border-purple-900/60 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3b2075] to-[#7c3aed] text-amber-300 flex items-center justify-center font-black shadow-md border border-amber-400/30">
            <GraduationCap className="w-5.5 h-5.5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-tight">Email Template Management CMS</h1>
              <span className="bg-amber-400 text-stone-950 px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-stone-950" /> Live DB Sync
              </span>
            </div>
            <p className="text-xs text-purple-200/80 font-medium">
              Configure outgoing email dispatches to colleges • All changes save directly to database
            </p>
          </div>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="flex items-center bg-[#2b1252] p-1 rounded-xl border border-purple-800/60 text-xs font-bold">
            <button
              onClick={() => setViewMode("edit")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === "edit" ? "bg-[#1c0b36] text-amber-300 shadow-xs font-black border border-amber-500/30" : "text-purple-200/70 hover:text-white"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Full Visual Editor</span>
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === "split" ? "bg-[#1c0b36] text-amber-300 shadow-xs font-black border border-amber-500/30" : "text-purple-200/70 hover:text-white"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === "preview" ? "bg-[#1c0b36] text-amber-300 shadow-xs font-black border border-amber-500/30" : "text-purple-200/70 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Full Live Preview</span>
            </button>
          </div>

          <button
            onClick={handleRestoreDefault}
            disabled={resetting || !isSuperAdmin}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-900/40 hover:bg-purple-900/80 text-purple-200 text-xs font-bold transition-all border border-purple-800/60 disabled:opacity-50 cursor-pointer"
            title="Restore original factory default template"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? "animate-spin" : ""}`} />
            <span>Restore Default</span>
          </button>

          <button
            onClick={() => {
              setTestEmailRecipient(currentUser?.email || "admin@c2talents.com");
              setShowTestModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-900/70 hover:bg-purple-800 text-amber-300 text-xs font-extrabold border border-amber-400/40 shadow-xs transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-amber-300" />
            <span>Send Test Email</span>
          </button>

          <button
            onClick={handleSaveChanges}
            disabled={saving || !isSuperAdmin}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-xs shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin text-stone-950" /> : <Save className="w-4 h-4 text-stone-950" />}
            <span>Save Changes</span>
          </button>
        </div>
      </header>

      {/* MAIN 2-COLUMN PAGE WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT NAVIGATION COLUMN: Email Templates Menu */}
        <aside className="w-64 bg-[#1c0b36] border-r border-purple-900/60 flex flex-col shrink-0 text-purple-100">
          <div className="p-3.5 border-b border-purple-900/60 bg-[#16082d]">
            <div className="relative">
              <Search className="w-4 h-4 text-purple-300/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-9 pr-3 py-2 bg-purple-950/70 border border-purple-800/60 rounded-xl text-xs text-white placeholder:text-purple-300/50 focus:outline-none focus:border-amber-400 font-medium"
              />
            </div>
          </div>

          {/* Email Templates Catalog List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredTemplates.map((t) => {
              const meta = TEMPLATE_METADATA[t.templateKey] || {
                title: t.templateName,
                desc: "Platform email notification template.",
                icon: "✉️",
              };
              const isSelected = t.templateKey === selectedKey;

              return (
                <button
                  key={t.templateKey}
                  onClick={() => loadTemplateIntoForm(t)}
                  className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-gradient-to-r from-[#2e1457] to-[#3b2075] text-white border-amber-400/60 shadow-md border-l-4 border-l-amber-400"
                      : "bg-[#1f0c3d]/60 hover:bg-[#2e1457]/50 text-purple-200/90 border-purple-900/40"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg select-none">{meta.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs font-extrabold truncate ${isSelected ? "text-amber-300" : "text-white"}`}>
                          {meta.title}
                        </p>
                      </div>
                      <p className={`text-[10.5px] mt-0.5 line-clamp-2 ${isSelected ? "text-purple-100" : "text-purple-300/70 font-medium"}`}>
                        {meta.desc}
                      </p>
                      {t.isCustomized && (
                        <div className="mt-2 flex items-center gap-1 text-[9.5px]">
                          <span className={`font-extrabold px-1.5 py-0.5 rounded ${isSelected ? "bg-amber-400/20 text-amber-300 border border-amber-400/40" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"}`}>
                            Saved in DB
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* RIGHT WORKSPACE AREA */}
        <main className="flex-1 flex overflow-hidden bg-[#faf8ff]">
          {/* VISUAL EDITOR COLUMN */}
          {(viewMode === "edit" || viewMode === "split") && (
            <div className={`overflow-y-auto p-6 space-y-6 ${viewMode === "split" ? "w-1/2 border-r border-purple-100" : "w-full max-w-4xl mx-auto"}`}>
              {/* Permission Alert */}
              {!isSuperAdmin && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3 text-xs font-bold text-amber-900 shadow-2xs">
                  <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Preview Mode — Super Administrator privileges are required to save changes.</span>
                </div>
              )}

              {/* Dynamic Variables Chip Bar */}
              <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1c0b36]">
                    <Tag className="w-3.5 h-3.5 text-amber-500" />
                    <span>Insert Dynamic Data Values</span>
                  </div>
                  <span className="text-[10px] text-purple-700/70 font-bold">Click chip to add into active field</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {MERGE_VARIABLES.map((v) => (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => handleInsertVariable(v.name)}
                      className="px-2.5 py-1 bg-amber-400/10 hover:bg-amber-400 text-amber-800 hover:text-stone-950 border border-amber-400/40 rounded-xl text-[11px] font-extrabold flex items-center gap-1 transition-all cursor-pointer hover:scale-105 active:scale-95"
                      title={`${v.description} (Sample: ${v.sample})`}
                    >
                      <span className="text-amber-600 font-black">+</span>
                      <span>{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visual Form Fields Card */}
              <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                  <h2 className="text-sm font-extrabold text-[#1c0b36]">
                    {TEMPLATE_METADATA[selectedKey]?.title || currentTemplate?.templateName}
                  </h2>
                  <span className="text-xs font-extrabold text-amber-700 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                    Live DB Email Format
                  </span>
                </div>

                {/* Email Subject */}
                <div>
                  <label className="text-xs font-extrabold text-[#1c0b36] block mb-1">Email Subject Line *</label>
                  <input
                    type="text"
                    value={subject}
                    onFocus={() => setActiveInput("subject")}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject line seen in inbox..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#3b2075]/20 focus:border-[#3b2075]"
                  />
                </div>

                {/* Preheader Snippet */}
                <div>
                  <label className="text-xs font-extrabold text-[#1c0b36] block mb-1">Inbox Preview Text (Preheader)</label>
                  <input
                    type="text"
                    value={preheader}
                    onFocus={() => setActiveInput("preheader")}
                    onChange={(e) => setPreheader(e.target.value)}
                    placeholder="Short summary preview shown in Gmail..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#3b2075]/20"
                  />
                </div>

                {/* Greeting & Header Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-[#1c0b36] block mb-1">Salutation / Greeting</label>
                    <input
                      type="text"
                      value={greeting}
                      onFocus={() => setActiveInput("greeting")}
                      onChange={(e) => setGreeting(e.target.value)}
                      placeholder="e.g. Dear {{contactPerson}},"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#3b2075]/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-[#1c0b36] block mb-1">Header Banner Title</label>
                    <input
                      type="text"
                      value={headerTitle}
                      onFocus={() => setActiveInput("headerTitle")}
                      onChange={(e) => setHeaderTitle(e.target.value)}
                      placeholder="e.g. Registration Approved"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#3b2075]/20"
                    />
                  </div>
                </div>

                {/* Visual Body Editor */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-extrabold text-[#1c0b36]">Main Email Message Content *</label>

                    {/* Toolbar */}
                    <div className="flex items-center gap-1 bg-purple-50 p-1 rounded-xl border border-purple-200">
                      <button
                        type="button"
                        onClick={() => applyBodyFormatting("b")}
                        className="p-1.5 hover:bg-white rounded text-[#1c0b36] font-extrabold text-xs transition-colors"
                        title="Bold"
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyBodyFormatting("i")}
                        className="p-1.5 hover:bg-white rounded text-[#1c0b36] transition-colors"
                        title="Italic"
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => applyBodyFormatting("u")}
                        className="p-1.5 hover:bg-white rounded text-[#1c0b36] transition-colors"
                        title="Underline"
                      >
                        <Underline className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-px h-3.5 bg-purple-300 mx-0.5"></span>
                      <button
                        type="button"
                        onClick={() => applyBodyFormatting("h2")}
                        className="px-2 py-0.5 hover:bg-white rounded text-[#1c0b36] font-black text-[10px] transition-colors"
                        title="Heading"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onClick={() => applyBodyFormatting("ul")}
                        className="p-1.5 hover:bg-white rounded text-[#1c0b36] transition-colors"
                        title="Bullet List"
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={9}
                    value={bodyHtml}
                    onFocus={() => setActiveInput("bodyHtml")}
                    onChange={(e) => setBodyHtml(e.target.value)}
                    placeholder="Write your email body message paragraphs..."
                    className="w-full p-4 bg-slate-50 border border-purple-100 rounded-xl text-xs text-slate-900 font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#3b2075]/20 focus:border-[#1c0b36]"
                  ></textarea>
                </div>

                {/* Action CTA Button Settings */}
                <div className="pt-3 border-t border-purple-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-[#1c0b36] block mb-1">Button Text (CTA)</label>
                    <input
                      type="text"
                      value={buttonText}
                      onFocus={() => setActiveInput("buttonText")}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="e.g. Access Onboarding Portal"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#3b2075]/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-[#1c0b36] block mb-1">Button Target Link</label>
                    <input
                      type="text"
                      value={buttonUrl}
                      onFocus={() => setActiveInput("buttonUrl")}
                      onChange={(e) => setButtonUrl(e.target.value)}
                      placeholder="e.g. {{portalLink}}"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-100 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#3b2075]/20"
                    />
                  </div>
                </div>

                {/* Footer / Signature Details */}
                <div className="pt-3 border-t border-purple-100 space-y-3">
                  <span className="text-[11px] font-extrabold text-purple-900 uppercase tracking-wider block">Footer & Signature Settings</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Support Email</label>
                      <input
                        type="email"
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-purple-100 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Company Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-purple-100 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Platform Website</label>
                      <input
                        type="text"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-purple-100 rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LIVE GMAIL PREVIEW COLUMN */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div className={`flex flex-col bg-[#f0eafb] overflow-hidden ${viewMode === "split" ? "w-1/2" : "w-full max-w-4xl mx-auto"}`}>
              {/* Preview Controls Bar */}
              <div className="bg-white border-b border-purple-100 p-3 flex items-center justify-between shrink-0 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-[#1c0b36] uppercase tracking-wider">Live Gmail Inbox Preview</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>

                <div className="flex items-center gap-1.5 bg-purple-50 p-1 rounded-xl border border-purple-200">
                  <button
                    type="button"
                    onClick={() => setDeviceMode("desktop")}
                    className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                      deviceMode === "desktop" ? "bg-[#1c0b36] text-amber-300 shadow-xs font-black" : "text-purple-800 hover:text-[#1c0b36]"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceMode("mobile")}
                    className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                      deviceMode === "mobile" ? "bg-[#1c0b36] text-amber-300 shadow-xs font-black" : "text-purple-800 hover:text-[#1c0b36]"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile Frame</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-1.5 rounded-lg text-purple-800 hover:text-[#1c0b36] transition-colors"
                    title="Toggle Dark Mode Preview"
                  >
                    {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-[#1c0b36]" />}
                  </button>
                </div>
              </div>

              {/* Inbox Header Mockup */}
              <div className="p-3.5 bg-white border-b border-purple-100 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400">From:</span>
                  <span className="font-extrabold text-[#1c0b36]">C2Talents Notifications &lt;noreply@c2talents.com&gt;</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-400">Subject:</span>
                  <span className="font-extrabold text-[#1c0b36] truncate max-w-[420px]">{subject || "No subject set"}</span>
                </div>
                {preheader && (
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-400 text-[11px]">Preview:</span>
                    <span className="text-slate-500 font-medium text-[11px] truncate max-w-[420px]">{preheader}</span>
                  </div>
                )}
              </div>

              {/* Rendered Live Iframe */}
              <div className="flex-1 overflow-auto p-4 flex justify-center items-start">
                <div
                  className={`transition-all duration-300 ${
                    deviceMode === "desktop" ? "w-full max-w-[640px]" : "w-[365px] border-[8px] border-slate-900 rounded-[32px] overflow-hidden shadow-2xl"
                  }`}
                >
                  <iframe
                    title="Live Email Preview"
                    srcDoc={renderLivePreviewHtml()}
                    className="w-full h-[650px] rounded-2xl bg-white shadow-xl border border-purple-200"
                  ></iframe>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* TEST EMAIL DISPATCH MODAL */}
      {showTestModal && (
        <div className="fixed inset-0 bg-[#1c0b36]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-purple-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <div className="flex items-center gap-2 text-sm font-extrabold text-[#1c0b36]">
                <Send className="w-4 h-4 text-amber-500" />
                <span>Send Live Test Email</span>
              </div>
              <button
                onClick={() => setShowTestModal(false)}
                className="p-1 hover:bg-purple-50 rounded-full text-slate-400 hover:text-[#1c0b36] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Send a real test email with the currently edited content to verify formatting and inbox delivery.
            </p>

            <div>
              <label className="text-xs font-extrabold text-[#1c0b36] block mb-1">Recipient Email Address *</label>
              <input
                type="email"
                value={testEmailRecipient}
                onChange={(e) => setTestEmailRecipient(e.target.value)}
                placeholder="admin@c2talents.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-purple-200 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#3b2075]/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendTestEmail}
                disabled={testing}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {testing ? <Loader2 className="w-4 h-4 animate-spin text-stone-950" /> : <Send className="w-3.5 h-3.5 text-stone-950" />}
                <span>{testing ? "Dispatching..." : "Send Test Email"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
