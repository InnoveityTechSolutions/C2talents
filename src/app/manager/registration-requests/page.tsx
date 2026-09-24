"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Copy,
  Search,
  MapPin,
  User,
  Mail,
  Phone,
  Globe,
  FileText,
  Loader2,
  ShieldCheck,
  Send,
  RefreshCw,
  Download,
  Inbox,
  Eye,
  Sparkles,
  AlertCircle,
} from "lucide-react";

import { PopupModal } from "@/components/ui/PopupModal";

// =========================================================
// C2TALENTS BRAND METRIC CARDS & SUB-COMPONENTS
// =========================================================

interface MetricBarProps {
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    submitted: number;
    published: number;
  };
}

function MetricBar({ stats }: MetricBarProps) {
  const cardData = [
    {
      title: "Total Requests",
      count: stats.total,
      sublabel: "Total Registrations",
      icon: <Building2 className="w-7 h-7 text-white/80 shrink-0" />,
      gradient: "from-[#1f0c3d] via-[#2d1659] to-[#3b2075]",
    },
    {
      title: "Pending Review",
      count: stats.pending,
      sublabel: "Requires Approval",
      icon: <Clock className="w-7 h-7 text-white/80 shrink-0" />,
      gradient: "from-amber-500 to-orange-600",
    },
    {
      title: "Approved Links",
      count: stats.approved,
      sublabel: "Access Issued",
      icon: <CheckCircle2 className="w-7 h-7 text-white/80 shrink-0" />,
      gradient: "from-blue-600 to-indigo-700",
    },
    {
      title: "Data Submitted",
      count: stats.submitted,
      sublabel: "Pending Audit",
      icon: <FileText className="w-7 h-7 text-white/80 shrink-0" />,
      gradient: "from-purple-600 to-indigo-800",
    },
    {
      title: "Live Published",
      count: stats.published,
      sublabel: "Live On Network",
      icon: <ShieldCheck className="w-7 h-7 text-white/80 shrink-0" />,
      gradient: "from-emerald-600 to-teal-700",
    },
    {
      title: "Rejected",
      count: stats.rejected,
      sublabel: "Declined Requests",
      icon: <XCircle className="w-7 h-7 text-white/80 shrink-0" />,
      gradient: "from-rose-600 to-red-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cardData.map((card, idx) => (
        <div
          key={idx}
          className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-4 text-white shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between border border-white/10`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs font-semibold text-white/90 tracking-tight">{card.title}</div>
              <div className="text-3xl font-extrabold text-white mt-1 tracking-tight">{card.count}</div>
            </div>
            {card.icon}
          </div>

          <div className="border-t border-white/20 my-3"></div>

          <div className="flex items-center justify-between text-[11px] text-white/90 font-medium">
            <span>{card.sublabel}</span>
            <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">{card.count}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// STATUS BADGES
function StatusBadge({ status, emailSent }: { status: string; emailSent?: boolean }) {
  switch (status) {
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-extrabold shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending
        </span>
      );
    case "APPROVED":
      return (
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-extrabold shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Approved
          </span>
          {emailSent ? (
            <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Email Sent
            </div>
          ) : (
            <div className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-amber-600" /> Email Pending
            </div>
          )}
        </div>
      );
    case "DATA_SUBMITTED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200/80 text-[11px] font-extrabold shadow-2xs">
          <FileText className="w-3.5 h-3.5 text-indigo-600" /> Submitted
        </span>
      );
    case "PUBLISHED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 text-[#3b2075] border border-purple-200/80 text-[11px] font-extrabold shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3b2075]" /> Published
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200/80 text-[11px] font-extrabold shadow-2xs">
          <XCircle className="w-3.5 h-3.5 text-rose-600" /> Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200 text-[11px] font-bold">
          {status}
        </span>
      );
  }
}

// FILTER TABS
interface FilterTabsProps {
  activeTab: string;
  onChange: (tab: string) => void;
  stats: { total: number; pending: number; approved: number; rejected: number; submitted: number; published: number };
}

function FilterTabs({ activeTab, onChange, stats }: FilterTabsProps) {
  const tabs = [
    { key: "ALL", label: "All", count: stats.total },
    { key: "PENDING", label: "Pending", count: stats.pending },
    { key: "APPROVED", label: "Approved", count: stats.approved },
    { key: "DATA_SUBMITTED", label: "Submitted", count: stats.submitted },
    { key: "PUBLISHED", label: "Published", count: stats.published },
    { key: "REJECTED", label: "Rejected", count: stats.rejected },
  ];

  return (
    <div className="flex items-center space-x-1 border-b border-purple-100 pb-0.5">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all duration-150 flex items-center space-x-1.5 cursor-pointer ${
              isActive
                ? "border-[#3b2075] text-[#1f0c3d]"
                : "border-transparent text-stone-500 hover:text-[#3b2075] hover:border-purple-200"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                isActive ? "bg-[#3b2075] text-amber-300" : "bg-purple-100/60 text-purple-900"
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// =========================================================
// MAIN PAGE COMPONENT
// =========================================================

export default function AdminRegistrationRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "error",
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    submitted: 0,
    published: 0,
  });

  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    type: "APPROVE" | "REJECT" | "VIEW_LINK" | null;
    request: any | null;
    adminNotes: string;
    accessUrl?: string;
  }>({
    isOpen: false,
    type: null,
    request: null,
    adminNotes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);

  async function handleResendEmail(reqItem: any) {
    setResendingId(reqItem.id);
    try {
      const res = await fetch(`/api/admin/registration-requests/${reqItem.id}/resend-email`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setPopup({
          isOpen: true,
          title: "Email Sent Successfully",
          message: `Approval email has been sent to ${reqItem.email}.`,
          type: "success",
        });
        fetchRequests();
      } else {
        setPopup({
          isOpen: true,
          title: "Email Delivery Failed",
          message: data.error || "Failed to send email. Please configure your SMTP settings in Settings > SMTP Settings.",
          type: "error",
        });
      }
    } catch (err: any) {
      setPopup({
        isOpen: true,
        title: "Error",
        message: err.message || "An unexpected error occurred while resending email.",
        type: "error",
      });
    } finally {
      setResendingId(null);
    }
  }

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  async function fetchRequests() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/registration-requests?status=${activeTab}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  }

  function handleExportCSV() {
    if (requests.length === 0) {
      alert("No data available to export.");
      return;
    }
    const headers = ["ID", "College Name", "Contact Person", "Email", "Mobile", "Location", "Status", "Created At"];
    const rows = requests.map((r) => [
      r.id,
      `"${r.collegeName}"`,
      `"${r.contactPerson}"`,
      r.email,
      r.mobile,
      `"${r.location}"`,
      r.status,
      new Date(r.createdAt).toLocaleString(),
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `registration_requests_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleOpenApproveModal(reqItem: any) {
    setActionModal({
      isOpen: true,
      type: "APPROVE",
      request: reqItem,
      adminNotes: "Approved by Admin. Verification link issued.",
    });
  }

  function handleOpenRejectModal(reqItem: any) {
    setActionModal({
      isOpen: true,
      type: "REJECT",
      request: reqItem,
      adminNotes: "Request does not meet current platform verification criteria.",
    });
  }

  function handleOpenViewLinkModal(reqItem: any) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const accessUrl = `${origin}/college-portal/${reqItem.accessToken}`;
    setActionModal({
      isOpen: true,
      type: "VIEW_LINK",
      request: reqItem,
      adminNotes: "",
      accessUrl,
    });
  }

  async function executeApprove() {
    if (!actionModal.request) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/registration-requests/${actionModal.request.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: actionModal.adminNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setActionModal({
          isOpen: true,
          type: "VIEW_LINK",
          request: data.request,
          adminNotes: data.emailSent
            ? `Approval successful! Confirmation email was dispatched to ${data.request?.email || actionModal.request.email}.`
            : `Approval successful! Note: ${data.emailError || "Email could not be delivered. Please configure SMTP in Settings."}`,
          accessUrl: data.accessUrl,
        });
        fetchRequests();
      } else {
        setPopup({ isOpen: true, title: "Approval Error", message: data.error || "Failed to approve request.", type: "error" });
      }
    } catch (err: any) {
      setPopup({ isOpen: true, title: "Error", message: err.message || "An unexpected error occurred.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  async function executeReject() {
    if (!actionModal.request) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/registration-requests/${actionModal.request.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: actionModal.adminNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setActionModal({ isOpen: false, type: null, request: null, adminNotes: "" });
        fetchRequests();
      } else {
        setPopup({ isOpen: true, title: "Rejection Error", message: data.error || "Failed to reject request.", type: "error" });
      }
    } catch (err: any) {
      setPopup({ isOpen: true, title: "Error", message: err.message || "An unexpected error occurred.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  const filteredRequests = requests.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      r.collegeName?.toLowerCase().includes(q) ||
      r.contactPerson?.toLowerCase().includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      r.location?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans text-stone-900 p-6 bg-[#FAF9F5] min-h-screen w-full max-w-none">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-purple-100">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#1f0c3d]">Registration Requests</h1>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Manage incoming college onboarding expressions of interest across your C2Talents SaaS platform.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-purple-50 text-stone-700 border border-stone-200 font-bold text-xs transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh requests list"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#3b2075] ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-purple-50 text-stone-700 border border-stone-200 font-bold text-xs transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Export list to CSV"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. COLORFUL VIBRANT METRIC CARDS */}
      <MetricBar stats={stats} />

      {/* 3. TOOLBAR: FILTER TABS & SEARCH BAR */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <FilterTabs activeTab={activeTab} onChange={setActiveTab} stats={stats} />

          {/* Search Bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search college, contact, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#3b2075] focus:ring-2 focus:ring-[#3b2075]/10 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 4. ENTERPRISE TABLE GRID */}
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-stone-500 text-xs flex flex-col items-center gap-2">
              <Loader2 className="w-7 h-7 text-[#3b2075] animate-spin" />
              <span className="font-bold text-[#1f0c3d]">Loading registration requests...</span>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center text-stone-500 text-xs flex flex-col items-center gap-2">
              <Inbox className="w-9 h-9 text-stone-300" />
              <span className="font-extrabold text-[#1f0c3d] text-sm">No registration requests found</span>
              <span className="text-stone-400 text-xs">
                {searchQuery ? `No records match "${searchQuery}".` : "No requests available in this status tab."}
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-purple-50/50 border-b border-purple-100 text-[#1f0c3d] font-extrabold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-5">College Details</th>
                    <th className="py-3.5 px-5">Contact Representative</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5">Website</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800 font-medium">
                  {filteredRequests.map((reqItem) => (
                    <tr
                      key={reqItem.id}
                      onClick={() => {
                        if (
                          reqItem.status === "APPROVED" ||
                          reqItem.status === "DATA_SUBMITTED" ||
                          reqItem.status === "PUBLISHED"
                        ) {
                          handleOpenViewLinkModal(reqItem);
                        }
                      }}
                      className="hover:bg-purple-50/20 transition-colors duration-150 cursor-pointer group"
                    >
                      {/* COLLEGE COLUMN */}
                      <td className="py-4 px-5">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#3b2075] text-amber-300 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                            {reqItem.collegeName?.slice(0, 2).toUpperCase() || "CL"}
                          </div>
                          <div>
                            <div className="font-extrabold text-[#1f0c3d] text-xs group-hover:text-[#4c1d95] transition-colors">
                              {reqItem.collegeName}
                            </div>
                            <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5 font-medium">
                              <MapPin className="w-3 h-3 text-amber-600" />
                              <span>{reqItem.location}</span>
                              <span className="text-stone-300">•</span>
                              <span className="text-stone-400">
                                {new Date(reqItem.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            {reqItem.additionalNotes && (
                              <div
                                className="text-[11px] text-stone-400 italic max-w-sm truncate mt-0.5"
                                title={reqItem.additionalNotes}
                              >
                                "{reqItem.additionalNotes}"
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* CONTACT COLUMN */}
                      <td className="py-4 px-5">
                        <div className="space-y-0.5 text-[11px]">
                          <div className="font-bold text-stone-900 flex items-center gap-1.5">
                            <User className="w-3 h-3 text-stone-400" />
                            <span>{reqItem.contactPerson}</span>
                          </div>
                          <div className="text-stone-500 flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-stone-400" />
                            <span>{reqItem.email}</span>
                          </div>
                          <div className="text-stone-500 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-stone-400" />
                            <span>{reqItem.mobile}</span>
                          </div>
                        </div>
                      </td>

                      {/* STATUS COLUMN */}
                      <td className="py-4 px-5">
                        <StatusBadge status={reqItem.status} emailSent={reqItem.emailSent} />
                      </td>

                      {/* WEBSITE COLUMN */}
                      <td className="py-4 px-5" onClick={(e) => e.stopPropagation()}>
                        {reqItem.website ? (
                          <a
                            href={reqItem.website}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#3b2075] hover:underline"
                          >
                            <Globe className="w-3 h-3 text-[#3b2075]" />
                            <span>Open Website</span>
                            <ExternalLink className="w-3 h-3 text-[#3b2075]" />
                          </a>
                        ) : (
                          <span className="text-stone-400 text-[11px]">-</span>
                        )}
                      </td>

                      {/* ACTIONS COLUMN */}
                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          {reqItem.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleOpenApproveModal(reqItem)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => handleOpenRejectModal(reqItem)}
                                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            </>
                          )}

                          {(reqItem.status === "APPROVED" ||
                            reqItem.status === "DATA_SUBMITTED" ||
                            reqItem.status === "PUBLISHED") && (
                            <>
                              <button
                                onClick={() => handleResendEmail(reqItem)}
                                disabled={resendingId === reqItem.id}
                                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-extrabold text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                                title="Resend approval email to institution"
                              >
                                {resendingId === reqItem.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                                ) : (
                                  <Send className="w-3.5 h-3.5 text-amber-700" />
                                )}
                                <span>Resend Email</span>
                              </button>

                              <button
                                onClick={() => handleOpenViewLinkModal(reqItem)}
                                className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#3b2075] border border-purple-200 font-extrabold text-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#3b2075]" /> View Portal
                              </button>

                              <button
                                onClick={() => {
                                  const origin = typeof window !== "undefined" ? window.location.origin : "";
                                  const accessUrl = `${origin}/college-portal/${reqItem.accessToken}`;
                                  navigator.clipboard.writeText(accessUrl);
                                  setPopup({
                                    isOpen: true,
                                    title: "Link Copied",
                                    message: "College portal token link copied to clipboard.",
                                    type: "success",
                                  });
                                }}
                                className="px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                                title="Copy portal link"
                              >
                                <Copy className="w-3.5 h-3.5 text-stone-400" /> Copy Link
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 5. BRAND MODAL DIALOGS (APPROVE, REJECT, SECURE LINK) */}
      {actionModal.isOpen && actionModal.request && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h3 className="text-lg font-black text-[#1f0c3d] flex items-center gap-2">
                {actionModal.type === "APPROVE" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {actionModal.type === "REJECT" && <XCircle className="w-5 h-5 text-rose-600" />}
                {actionModal.type === "VIEW_LINK" && <ShieldCheck className="w-5 h-5 text-[#3b2075]" />}
                <span>
                  {actionModal.type === "APPROVE" && "Approve Registration Request"}
                  {actionModal.type === "REJECT" && "Reject Registration Request"}
                  {actionModal.type === "VIEW_LINK" && "Secure Portal Access Token"}
                </span>
              </h3>
              <button
                onClick={() => setActionModal({ isOpen: false, type: null, request: null, adminNotes: "" })}
                className="text-stone-400 hover:text-stone-700 font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Request Summary Box */}
            <div className="p-4 bg-purple-50/40 rounded-2xl border border-purple-100 text-xs space-y-1">
              <div className="font-extrabold text-[#1f0c3d] text-sm">{actionModal.request.collegeName}</div>
              <div className="text-stone-600 font-medium">
                Representative: {actionModal.request.contactPerson} ({actionModal.request.email})
              </div>
              <div className="text-stone-500 font-medium">Location: {actionModal.request.location}</div>
            </div>

            {/* APPROVE DIALOG */}
            {actionModal.type === "APPROVE" && (
              <div className="space-y-4">
                <p className="text-xs text-stone-600 leading-relaxed font-medium">
                  Approving this request generates an encrypted access token and automatically dispatches an official confirmation email to <strong>{actionModal.request.email}</strong>.
                </p>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-700 mb-1.5">
                    Admin Verification Notes
                  </label>
                  <textarea
                    rows={2}
                    value={actionModal.adminNotes}
                    onChange={(e) => setActionModal((prev) => ({ ...prev, adminNotes: e.target.value }))}
                    className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#3b2075] focus:ring-2 focus:ring-[#3b2075]/10 font-medium"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={executeApprove}
                    disabled={submitting}
                    className="w-full py-3 rounded-xl bg-[#3b2075] hover:bg-[#4c1d95] text-amber-300 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin text-amber-300" /> : <Send className="w-4 h-4 text-amber-300" />} Confirm Approval & Dispatch Email
                  </button>
                </div>
              </div>
            )}

            {/* REJECT DIALOG */}
            {actionModal.type === "REJECT" && (
              <div className="space-y-4">
                <p className="text-xs text-rose-700 leading-relaxed font-semibold">
                  Are you sure you want to mark this registration request as rejected?
                </p>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-700 mb-1.5">
                    Rejection Notes / Audit Reason
                  </label>
                  <textarea
                    rows={2}
                    value={actionModal.adminNotes}
                    onChange={(e) => setActionModal((prev) => ({ ...prev, adminNotes: e.target.value }))}
                    className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 font-medium"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={executeReject}
                    disabled={submitting}
                    className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Rejection"}
                  </button>
                </div>
              </div>
            )}

            {/* VIEW TOKEN LINK DIALOG */}
            {actionModal.type === "VIEW_LINK" && actionModal.accessUrl && (
              <div className="space-y-4">
                {actionModal.adminNotes && (
                  <div className={`p-3 rounded-xl border text-xs font-extrabold flex items-center gap-2 ${
                    actionModal.request?.emailSent
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}>
                    {actionModal.request?.emailSent ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span>{actionModal.adminNotes}</span>
                  </div>
                )}

                {actionModal.request && !actionModal.request.emailSent && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-100 text-xs text-purple-900">
                    <span className="font-medium">Deliver email to <strong>{actionModal.request.email}</strong>?</span>
                    <button
                      type="button"
                      onClick={() => handleResendEmail(actionModal.request)}
                      disabled={resendingId === actionModal.request?.id}
                      className="px-3 py-1.5 rounded-lg bg-[#3b2075] text-amber-300 font-bold text-xs cursor-pointer hover:bg-[#4c1d95] transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                    >
                      {resendingId === actionModal.request?.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      Send Email Now
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-extrabold text-[#3b2075] tracking-wider">
                    Encrypted College Access URL
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl text-xs font-mono text-stone-800 break-all border border-stone-200">
                    {actionModal.accessUrl}
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(actionModal.accessUrl || "");
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="flex-1 py-3 rounded-xl bg-[#3b2075] hover:bg-[#4c1d95] text-amber-300 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                    >
                      <Copy className="w-4 h-4 text-amber-300" /> {copied ? "Copied!" : "Copy Token Link"}
                    </button>
                    <a
                      href={actionModal.accessUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-xs flex items-center justify-center gap-1 transition-all border border-stone-200"
                    >
                      <span>Test Portal</span> <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                    </a>
                  </div>
                </div>

                <button
                  onClick={() => setActionModal({ isOpen: false, type: null, request: null, adminNotes: "" })}
                  className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POPUP NOTIFICATION MODAL */}
      <PopupModal
        isOpen={popup.isOpen}
        onClose={() => setPopup((prev) => ({ ...prev, isOpen: false }))}
        title={popup.title}
        message={popup.message}
        type={popup.type}
      />
    </div>
  );
}
