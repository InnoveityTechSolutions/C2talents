"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award, Plus, Search, Edit3, Trash2, Globe, ExternalLink,
  CheckCircle2, XCircle, RefreshCw, Sparkles,
  Calendar, Building2, AlertCircle, FileText, Check, Eye, EyeOff,
  Filter, Layers, ArrowUpRight, AlertTriangle
} from "lucide-react";
import Link from "next/link";

interface Scholarship {
  id: string;
  name: string;
  provider: string;
  category: string;
  scholarshipType: string;
  description: string;
  eligibilityCriteria: string;
  minPercentage?: number | null;
  eligibleCourses: string;
  eligibleStates: string;
  familyIncomeLimit?: number | null;
  familyIncomeLimitText?: string | null;
  amount: string;
  amountValue?: number | null;
  deadline?: string | null;
  deadlineDate?: string | Date | null;
  officialWebsite: string;
  applyLink: string;
  requiredDocuments: string;
  selectionProcess?: string | null;
  renewalAvailable: boolean;
  status: string;
  isPublished: boolean;
  isFeatured: boolean;
  faqs?: string | null;
  createdAt: string;
}

interface ConfirmDialogState {
  isOpen: boolean;
  type: "delete" | "reseed";
  title: string;
  description: string;
  itemBadge?: string;
  confirmText: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => Promise<void> | void;
}

export default function AdminScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Custom Center Popup Confirm Dialog
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);
  const [formData, setFormData] = useState<Partial<Scholarship>>({
    name: "",
    provider: "",
    category: "Central Government",
    scholarshipType: "Merit-Based",
    description: "",
    eligibilityCriteria: "",
    minPercentage: 60,
    eligibleCourses: "B.Tech, BE, B.Sc, B.Com, BA, MBBS",
    eligibleStates: "All India",
    familyIncomeLimitText: "Below ₹2.5 Lakhs per annum",
    amount: "₹50,000 / year",
    deadline: "December 31, 2026",
    deadlineDate: "2026-12-31",
    officialWebsite: "https://scholarships.gov.in",
    applyLink: "https://scholarships.gov.in",
    requiredDocuments: "Class 12th Marksheet, Aadhar Card, Income Certificate, Bank Passbook",
    selectionProcess: "Merit & Income document scrutiny",
    renewalAvailable: true,
    status: "OPEN",
    isPublished: true,
    isFeatured: false,
  });

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/scholarships", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setScholarships(data);
      }
    } catch (e) {
      console.error("Failed to fetch scholarships", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const handleOpenAddModal = () => {
    setEditingScholarship(null);
    setFormData({
      name: "",
      provider: "",
      category: "Central Government",
      scholarshipType: "Merit-Based",
      description: "",
      eligibilityCriteria: "",
      minPercentage: 60,
      eligibleCourses: "B.Tech, BE, B.Sc, B.Com, BA, MBBS",
      eligibleStates: "All India",
      familyIncomeLimitText: "Below ₹2.5 Lakhs per annum",
      amount: "₹50,000 / year",
      deadline: "December 31, 2026",
      deadlineDate: "2026-12-31",
      officialWebsite: "https://scholarships.gov.in",
      applyLink: "https://scholarships.gov.in",
      requiredDocuments: "Class 12th Marksheet, Aadhar Card, Income Certificate, Bank Passbook",
      selectionProcess: "Merit & Income document scrutiny",
      renewalAvailable: true,
      status: "OPEN",
      isPublished: true,
      isFeatured: false,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (s: Scholarship) => {
    setEditingScholarship(s);
    let dateStr = "2026-12-31";
    if (s.deadlineDate) {
      try {
        dateStr = new Date(s.deadlineDate).toISOString().split("T")[0];
      } catch (e) {}
    }
    setFormData({
      ...s,
      deadlineDate: dateStr,
    });
    setShowModal(true);
  };

  const handleSaveScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const url = editingScholarship
        ? `/api/admin/scholarships/${editingScholarship.id}`
        : "/api/admin/scholarships";

      const method = editingScholarship ? "PUT" : "POST";

      const payload = {
        ...formData,
        minPercentage: formData.minPercentage ? Number(formData.minPercentage) : null,
        familyIncomeLimit: formData.familyIncomeLimit ? Number(formData.familyIncomeLimit) : null,
        amountValue: formData.amountValue ? Number(formData.amountValue) : null,
        deadlineDate: formData.deadlineDate ? new Date(formData.deadlineDate as string).toISOString() : null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to save scholarship");
      }

      setNotification({
        type: "success",
        message: editingScholarship
          ? `Scholarship "${formData.name}" updated successfully! Changes are live on the front end.`
          : `New Scholarship "${formData.name}" created and published!`,
      });
      setShowModal(false);
      await fetchScholarships();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Failed to save scholarship" });
    } finally {
      setActionLoading(false);
    }
  };

  // Trigger Custom Center Delete Popup
  const promptDelete = (id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      type: "delete",
      title: "Delete Scholarship Scheme?",
      itemBadge: name,
      description: "This will permanently remove this scholarship scheme from both the Admin Console and the public front-end portal.",
      confirmText: "Yes, Delete Scheme",
      cancelText: "Cancel",
      isDestructive: true,
      onConfirm: async () => {
        setActionLoading(true);
        try {
          const res = await fetch(`/api/admin/scholarships/${id}`, { method: "DELETE" });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || "Failed to delete scholarship");
          }
          setNotification({
            type: "success",
            message: `Scholarship "${name}" deleted successfully. Removed from public front end.`,
          });
          setConfirmDialog(null);
          await fetchScholarships();
        } catch (err: any) {
          setNotification({ type: "error", message: err.message || "Failed to delete" });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Trigger Custom Center Reseed Popup
  const promptReseed = () => {
    setConfirmDialog({
      isOpen: true,
      type: "reseed",
      title: "Restore & Re-sync Official Scholarships?",
      itemBadge: "National & State Government Schemes",
      description: "This will load and restore verified Central, State, and Foundation scholarships into the database. All existing schemes will be synchronized with the public front end.",
      confirmText: "Restore Schemes Now",
      cancelText: "Cancel",
      isDestructive: false,
      onConfirm: async () => {
        setActionLoading(true);
        try {
          const res = await fetch("/api/admin/scholarships/seed", { method: "POST" });
          const data = await res.json();
          setNotification({ type: "success", message: data.message || "Database seeded successfully!" });
          setConfirmDialog(null);
          await fetchScholarships();
        } catch (e) {
          setNotification({ type: "error", message: "Failed to reseed database" });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleTogglePublish = async (s: Scholarship) => {
    try {
      const newStatus = !s.isPublished;
      const res = await fetch(`/api/admin/scholarships/${s.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: newStatus }),
      });
      if (res.ok) {
        setNotification({
          type: "success",
          message: `Scholarship "${s.name}" is now ${newStatus ? "PUBLISHED on front end" : "set to DRAFT (hidden from front end)"}.`,
        });
        fetchScholarships();
      }
    } catch (e) {}
  };

  const filtered = scholarships.filter((s) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.provider.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.scholarshipType.toLowerCase().includes(q);

    const matchesCategory = categoryFilter === "all" || s.category.toLowerCase().includes(categoryFilter.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalCount = scholarships.length;
  const publishedCount = scholarships.filter((s) => s.isPublished).length;
  const centralCount = scholarships.filter((s) => s.category === "Central Government").length;
  const stateCount = scholarships.filter((s) => s.category === "State Government").length;
  const privateCount = scholarships.filter((s) => s.category === "Private").length;

  return (
    <div className="space-y-6 font-sans min-h-screen bg-[#0f172a] text-slate-100 -m-6 p-6 sm:-m-8 sm:p-8 rounded-2xl">
      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between shadow-lg transition-all ${
            notification.type === "success"
              ? "bg-emerald-950 border border-emerald-700 text-emerald-300"
              : "bg-red-950 border border-red-700 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="hover:opacity-80 cursor-pointer p-1">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Header Banner */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Scholarship Directory CMS</span>
          </div>
          <h1 className="text-2xl font-black text-white">Manage National & State Scholarships</h1>
          <p className="text-slate-400 text-xs mt-1">
            Edit and delete scholarships with instant real-time synchronization on the public front end portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/scholarships"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Portal</span>
          </Link>

          <button
            onClick={promptReseed}
            disabled={actionLoading}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? "animate-spin" : ""}`} />
            <span>Restore Schemes</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Scholarship</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Total Schemes</div>
          <div className="text-xl font-black text-white mt-0.5">{totalCount}</div>
        </div>
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] font-bold text-emerald-400 uppercase">Live on Front End</div>
          <div className="text-xl font-black text-emerald-400 mt-0.5">{publishedCount}</div>
        </div>
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] font-bold text-indigo-400 uppercase">Central Govt</div>
          <div className="text-xl font-black text-indigo-300 mt-0.5">{centralCount}</div>
        </div>
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] font-bold text-amber-400 uppercase">State Govt</div>
          <div className="text-xl font-black text-amber-300 mt-0.5">{stateCount}</div>
        </div>
        <div className="bg-[#1e293b] border border-slate-800 rounded-xl p-3.5">
          <div className="text-[10px] font-bold text-purple-400 uppercase">Private / Trusts</div>
          <div className="text-xl font-black text-purple-300 mt-0.5">{privateCount}</div>
        </div>
      </div>

      {/* Search & Filter Tools */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search scholarship name, provider, category, course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b] border border-slate-800 rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-[#1e293b] border border-slate-800 rounded-xl text-xs font-bold text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="all">Category: All</option>
          <option value="central">Central Govt</option>
          <option value="state">State Govt</option>
          <option value="private">Private</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-[#1e293b] border border-slate-800 rounded-xl text-xs font-bold text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
        >
          <option value="all">Status: All</option>
          <option value="open">OPEN</option>
          <option value="closing_soon">CLOSING_SOON</option>
          <option value="closed">CLOSED</option>
          <option value="upcoming">UPCOMING</option>
        </select>
      </div>

      {/* Scholarships Data Table with Sticky Actions */}
      <div className="bg-[#1e293b] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Loading database scholarships...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-2">
            <Award className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="font-bold text-white">No scholarships match your filters</p>
            <p>Click "Restore Schemes" to load official scholarships or create a new one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto relative">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#0f172a] text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3.5 min-w-[220px]">Scholarship Scheme</th>
                  <th className="px-4 py-3.5 min-w-[160px]">Provider & Type</th>
                  <th className="px-4 py-3.5 min-w-[130px]">Award Amount</th>
                  <th className="px-4 py-3.5 min-w-[160px]">Courses & Criteria</th>
                  <th className="px-4 py-3.5 min-w-[110px]">Deadline</th>
                  <th className="px-4 py-3.5 min-w-[100px]">Status</th>
                  <th className="px-4 py-3.5 text-center sticky right-0 bg-[#0f172a] z-20 shadow-[-6px_0_12px_rgba(0,0,0,0.4)] min-w-[160px] border-l border-slate-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white text-xs leading-snug line-clamp-2">{s.name}</div>
                      <div className="text-[10px] text-amber-400 font-semibold mt-0.5">{s.category}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-300 text-xs line-clamp-1">{s.provider}</div>
                      <span className="text-[9.5px] font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 inline-block mt-1">
                        {s.scholarshipType}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="font-extrabold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/80 text-[11px] inline-block">
                        {s.amount}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-400">
                      <div className="line-clamp-1 text-slate-300 font-medium text-[11px]">{s.eligibleCourses}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{s.familyIncomeLimitText || "No Bar"}</div>
                    </td>

                    <td className="px-4 py-3.5 font-bold text-slate-300 text-[11px]">
                      {s.deadline || "Open"}
                    </td>

                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleTogglePublish(s)}
                        title="Click to toggle between Published & Draft on public portal"
                        className={`px-2.5 py-1 rounded-full text-[9.5px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                          s.isPublished
                            ? "bg-emerald-950 text-emerald-300 border-emerald-700 hover:bg-emerald-900"
                            : "bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700"
                        }`}
                      >
                        {s.isPublished ? "PUBLISHED" : "DRAFT"}
                      </button>
                    </td>

                    <td className="px-4 py-3.5 text-center sticky right-0 bg-[#1e293b] group-hover:bg-[#24334a] transition-colors z-10 shadow-[-6px_0_12px_rgba(0,0,0,0.4)] border-l border-slate-800">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(s)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-all font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          title="Edit this scholarship"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => promptDelete(s.id, s.name)}
                          className="px-2.5 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-800 transition-all font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          title="Delete this scholarship"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>

                        <a
                          href={s.applyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Test Official Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CUSTOM IN-APP CENTER POPUP CONFIRMATION MODAL */}
      <AnimatePresence>
        {confirmDialog && confirmDialog.isOpen && (
          <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 12 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="bg-[#1e293b] border border-slate-700 rounded-3xl p-6 sm:p-7 max-w-md w-full text-slate-100 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] space-y-5 relative"
            >
              {/* Close Icon Button */}
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>

              {/* Icon & Title */}
              <div className="flex items-start gap-4 pr-6">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                    confirmDialog.isDestructive
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  }`}
                >
                  {confirmDialog.isDestructive ? (
                    <AlertTriangle className="w-6 h-6" />
                  ) : (
                    <RefreshCw className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {confirmDialog.isDestructive ? "Confirm Deletion" : "System Action"}
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight">
                    {confirmDialog.title}
                  </h3>
                </div>
              </div>

              {/* Item Badge */}
              {confirmDialog.itemBadge && (
                <div className="p-3 bg-[#0f172a] rounded-xl border border-slate-800 text-xs font-semibold text-amber-300 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="line-clamp-2">{confirmDialog.itemBadge}</span>
                </div>
              )}

              {/* Description Body */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {confirmDialog.description}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {confirmDialog.cancelText || "Cancel"}
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={confirmDialog.onConfirm}
                  className={`px-5 py-2.5 rounded-xl text-white text-xs font-extrabold shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                    confirmDialog.isDestructive
                      ? "bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 shadow-rose-950/50"
                      : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-950/50"
                  }`}
                >
                  {actionLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{confirmDialog.confirmText}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD / EDIT SCHOLARSHIP MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1e293b] border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto text-slate-100 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>{editingScholarship ? "Edit Scholarship Scheme" : "Add New Scholarship Scheme"}</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white cursor-pointer p-1"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveScholarship} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Scholarship Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Reliance Foundation Undergraduate Scholarship"
                      className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Provider Agency / Ministry *</label>
                    <input
                      type="text"
                      required
                      value={formData.provider || ""}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      placeholder="e.g. Reliance Foundation / AICTE / DoTE"
                      className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Category</label>
                    <select
                      value={formData.category || "Central Government"}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Central Government">Central Government</option>
                      <option value="State Government">State Government</option>
                      <option value="Private">Private Foundation / Trust</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Scholarship Type</label>
                    <input
                      type="text"
                      value={formData.scholarshipType || "Merit-Based"}
                      onChange={(e) => setFormData({ ...formData, scholarshipType: e.target.value })}
                      placeholder="Merit-Based, Need-Based, Girl Students, SC/ST, BC/MBC"
                      className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Award Amount Text *</label>
                    <input
                      type="text"
                      required
                      value={formData.amount || ""}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="e.g. ₹2,00,000 / year"
                      className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Eligible Courses</label>
                    <input
                      type="text"
                      value={formData.eligibleCourses || ""}
                      onChange={(e) => setFormData({ ...formData, eligibleCourses: e.target.value })}
                      placeholder="B.Tech, BE, B.Sc, MBBS, Diploma"
                      className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Min Percentage %</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.minPercentage ?? ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minPercentage: e.target.value === "" ? null : parseFloat(e.target.value),
                        })
                      }
                      placeholder="60"
                      className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Family Income Limit Text</label>
                    <input
                      type="text"
                      value={formData.familyIncomeLimitText || ""}
                      onChange={(e) => setFormData({ ...formData, familyIncomeLimitText: e.target.value })}
                      placeholder="Below ₹2.5 Lakhs per annum"
                      className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Deadline Display Text</label>
                    <input
                      type="text"
                      value={formData.deadline || ""}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      placeholder="December 31, 2026"
                      className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Deadline Date (Auto-Status)</label>
                    <input
                      type="date"
                      value={formData.deadlineDate ? String(formData.deadlineDate).split("T")[0] : ""}
                      onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Status</label>
                    <select
                      value={formData.status || "OPEN"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="CLOSING_SOON">CLOSING_SOON</option>
                      <option value="CLOSED">CLOSED</option>
                      <option value="UPCOMING">UPCOMING</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Official Website URL *</label>
                    <input
                      type="url"
                      required
                      value={formData.officialWebsite || ""}
                      onChange={(e) => setFormData({ ...formData, officialWebsite: e.target.value })}
                      placeholder="https://scholarships.gov.in"
                      className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Direct Application Link *</label>
                    <input
                      type="url"
                      required
                      value={formData.applyLink || ""}
                      onChange={(e) => setFormData({ ...formData, applyLink: e.target.value })}
                      placeholder="https://scholarships.gov.in/register"
                      className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Scheme Description</label>
                  <textarea
                    rows={3}
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter detailed description of the scholarship..."
                    className="w-full p-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Eligibility Criteria</label>
                  <textarea
                    rows={2}
                    value={formData.eligibilityCriteria || ""}
                    onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })}
                    placeholder="Enter complete eligibility requirements..."
                    className="w-full p-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Required Documents</label>
                  <textarea
                    rows={2}
                    value={formData.requiredDocuments || ""}
                    onChange={(e) => setFormData({ ...formData, requiredDocuments: e.target.value })}
                    placeholder="Class 12th Marksheet, Income Certificate, Aadhar Card, Bank Passbook..."
                    className="w-full p-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isPublished)}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="w-4 h-4 accent-amber-500"
                    />
                    <span>Publish on Public Portal Immediately</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isFeatured)}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 accent-amber-500"
                    />
                    <span>Highlight as Featured Scheme</span>
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-700 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold hover:from-amber-600 cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {actionLoading ? "Saving..." : editingScholarship ? "Save Changes" : "Create Scholarship"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
