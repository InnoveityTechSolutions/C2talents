"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Server,
  Lock,
  Eye,
  EyeOff,
  User,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Send,
  Save,
  RefreshCw,
} from "lucide-react";

export default function AdminSmtpSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPass: "",
    senderName: "C2Talents Platform",
    encryptionType: "TLS",
    fromEmail: "",
  });

  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });

  const [testModal, setTestModal] = useState({
    isOpen: false,
    toEmail: "",
  });

  useEffect(() => {
    fetchSmtpConfig();
  }, []);

  async function fetchSmtpConfig() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings/smtp");
      const data = await res.json();
      if (data.success && data.config) {
        setFormData({
          smtpHost: data.config.smtpHost || "",
          smtpPort: data.config.smtpPort || 587,
          smtpUser: data.config.smtpUser || "",
          smtpPass: data.config.smtpPass || "",
          senderName: data.config.senderName || "C2Talents Platform",
          encryptionType: data.config.encryptionType || "TLS",
          fromEmail: data.config.fromEmail || "",
        });
        setIsConfigured(Boolean(data.config.isConfigured));
        if (data.config.updatedAt) setLastUpdated(data.config.updatedAt);
      }
    } catch (err: any) {
      console.error("Failed to load SMTP config:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "smtpPort" ? (value ? parseInt(value, 10) : 587) : value,
    }));
    if (statusMessage.message) setStatusMessage({ type: null, message: "" });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatusMessage({ type: null, message: "" });

    try {
      const res = await fetch("/api/admin/settings/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save SMTP configuration.");
      }

      setStatusMessage({
        type: "success",
        message: data.message || "SMTP Configuration saved successfully!",
      });

      setIsConfigured(true);
      if (data.config?.updatedAt) setLastUpdated(data.config.updatedAt);
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        message: err.message || "An error occurred while saving configuration.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleTestEmail() {
    if (!testModal.toEmail || !testModal.toEmail.trim()) {
      alert("Please enter a valid recipient email address for testing.");
      return;
    }

    setTesting(true);
    try {
      const res = await fetch("/api/admin/settings/smtp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: testModal.toEmail.trim(),
          ...formData,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Test email delivery failed.");
      }

      alert(`✅ ${data.message || "Test email sent successfully!"}`);
      setTestModal({ isOpen: false, toEmail: "" });
    } catch (err: any) {
      alert(`❌ Error sending test email: ${err.message}`);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#1f0c3d] via-[#2d1659] to-[#3b2075] text-white p-6 rounded-3xl shadow-xl border border-[#3b2075]/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-extrabold tracking-tight">Dynamic SMTP Email Settings</h1>
          </div>
          <p className="text-xs text-purple-200/80 font-medium">
            Manage platform email servers dynamically. Update Host, Port, Credentials, and Sender info without redeploying code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isConfigured ? (
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Active DB Configuration
            </span>
          ) : (
            <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-extrabold flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" /> Default / Fallback Mode
            </span>
          )}
        </div>
      </div>

      {statusMessage.message && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-3 animate-in fade-in ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800"
              : "bg-rose-500/10 border-rose-500/30 text-rose-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.message}</span>
        </div>
      )}

      {/* SMTP Configuration Form Card */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        {loading ? (
          <div className="p-12 text-center text-stone-500 text-xs flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-[#3b2075] animate-spin" />
            <span>Loading active SMTP credentials...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
                <Server className="w-5 h-5 text-[#3b2075]" /> Server Connection Credentials
              </h2>
              {lastUpdated && (
                <span className="text-[11px] text-stone-400 font-semibold">
                  Last saved: {new Date(lastUpdated).toLocaleString()}
                </span>
              )}
            </div>

            {/* Host & Port */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  SMTP Host Server <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Server className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="smtpHost"
                    required
                    value={formData.smtpHost}
                    onChange={handleChange}
                    placeholder="e.g. smtp.gmail.com, smtp.sendgrid.net, mail.yourdomain.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-[#3b2075] focus:bg-white focus:outline-none text-xs text-stone-900 placeholder-stone-400 font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  SMTP Port <span className="text-amber-500">*</span>
                </label>
                <input
                  type="number"
                  name="smtpPort"
                  required
                  value={formData.smtpPort}
                  onChange={handleChange}
                  placeholder="587"
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-[#3b2075] focus:bg-white focus:outline-none text-xs text-stone-900 font-medium transition-all"
                />
              </div>
            </div>

            {/* Username & Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  SMTP Username / Email <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    name="smtpUser"
                    required
                    value={formData.smtpUser}
                    onChange={handleChange}
                    placeholder="notifications@c2talents.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-[#3b2075] focus:bg-white focus:outline-none text-xs text-stone-900 placeholder-stone-400 font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  SMTP Password / App Password <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="smtpPass"
                    required
                    value={formData.smtpPass}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-[#3b2075] focus:bg-white focus:outline-none text-xs text-stone-900 font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-700 transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-stone-500 mt-1 block font-medium">
                  🔒 Stored securely in database using AES-256 encryption.
                </span>
              </div>
            </div>

            {/* Sender Name, Encryption, From Email */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Sender Name
                </label>
                <input
                  type="text"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleChange}
                  placeholder="C2Talents Admissions"
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-[#3b2075] focus:bg-white focus:outline-none text-xs text-stone-900 placeholder-stone-400 font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Encryption Type
                </label>
                <select
                  name="encryptionType"
                  value={formData.encryptionType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-[#3b2075] focus:bg-white focus:outline-none text-xs text-stone-900 font-medium transition-all"
                >
                  <option value="TLS">TLS (Port 587 / STARTTLS)</option>
                  <option value="SSL">SSL (Port 465)</option>
                  <option value="NONE">NONE (Plaintext Port 25)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  From Email Address <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    name="fromEmail"
                    required
                    value={formData.fromEmail}
                    onChange={handleChange}
                    placeholder="no-reply@c2talents.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-50 border border-stone-200 focus:border-[#3b2075] focus:bg-white focus:outline-none text-xs text-stone-900 placeholder-stone-400 font-medium transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setTestModal({ isOpen: true, toEmail: formData.fromEmail || formData.smtpUser || "" })}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#3b2075] font-extrabold text-xs transition-all border border-purple-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#3b2075]" /> Send Test Email ↗
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={fetchSmtpConfig}
                  className="px-4 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all border border-stone-200 cursor-pointer"
                  title="Reload active settings"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 sm:flex-initial px-8 py-3.5 rounded-xl bg-[#3b2075] hover:bg-[#4c1d95] text-amber-300 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving Configuration...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save SMTP Configuration
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Send Test Email Modal */}
      {testModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
                <Send className="w-5 h-5 text-[#3b2075]" /> Send Test Email
              </h3>
              <button
                onClick={() => setTestModal({ isOpen: false, toEmail: "" })}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Enter a recipient email address below to test the connection with <strong>{formData.smtpHost || "configured server"}</strong>.
            </p>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                Recipient Email Address <span className="text-amber-500">*</span>
              </label>
              <input
                type="email"
                required
                value={testModal.toEmail}
                onChange={(e) => setTestModal((prev) => ({ ...prev, toEmail: e.target.value }))}
                placeholder="your.email@gmail.com"
                className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#3b2075]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleTestEmail}
                disabled={testing}
                className="w-full py-3 rounded-xl bg-[#3b2075] hover:bg-[#4c1d95] text-amber-300 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
              >
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Dispatch Test Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
