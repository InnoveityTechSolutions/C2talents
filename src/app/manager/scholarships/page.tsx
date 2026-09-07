"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award, Plus, Search, Edit3, Trash2, Globe, ExternalLink,
  CheckCircle2, XCircle, RefreshCw, Upload, Download, Sparkles,
  Calendar, Building2, AlertCircle, FileText, Check, Eye, EyeOff
} from "lucide-react";

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

export default function AdminScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal State
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
      const res = await fetch("/api/admin/scholarships");
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
    setFormData({ ...s });
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

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save scholarship");

      setNotification({
        type: "success",
        message: editingScholarship ? "Scholarship updated successfully!" : "New Scholarship created successfully!",
      });
      setShowModal(false);
      fetchScholarships();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Failed to save scholarship" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete scholarship "${name}"?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/scholarships/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setNotification({ type: "success", message: "Scholarship deleted successfully." });
      fetchScholarships();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePublish = async (s: Scholarship) => {
    try {
      const res = await fetch(`/api/admin/scholarships/${s.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !s.isPublished }),
      });
      if (res.ok) {
        fetchScholarships();
      }
    } catch (e) {}
  };

  const handleReseedData = async () => {
    if (!confirm("This will load/restore 26 Real Government & Private Scholarships into the database. Continue?")) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/scholarships/seed", { method: "POST" });
      const data = await res.json();
      setNotification({ type: "success", message: data.message });
      fetchScholarships();
    } catch (e) {
      setNotification({ type: "error", message: "Failed to reseed database" });
    } finally {
      setActionLoading(false);
    }
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

  return (
    <div className="space-y-6 font-sans min-h-screen bg-[#0f172a] text-slate-100 -m-6 p-6 sm:-m-8 sm:p-8 rounded-2xl">
          {/* Notification Toast */}
          {notification && (
            <div
              className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between shadow-lg ${
                notification.type === "success"
                  ? "bg-emerald-950 border border-emerald-700 text-emerald-300"
                  : "bg-red-950 border border-red-700 text-red-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{notification.message}</span>
              </div>
              <button onClick={() => setNotification(null)} className="hover:opacity-80">
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Action Header Banner */}
          <div className="bg-[#1e293b] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-extrabold uppercase tracking-wider mb-2">
                <Award className="w-3.5 h-3.5" />
                <span>Scholarship Directory CMS</span>
              </div>
              <h1 className="text-2xl font-black text-white">Manage National & State Scholarships</h1>
              <p className="text-slate-400 text-xs mt-1">
                Add, edit, publish, extend deadlines, and manage real government & private foundation scholarships.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleReseedData}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? "animate-spin" : ""}`} />
                <span>Restore 26 Real Schemes</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Scholarship</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Tools */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search scholarship name, provider, course..."
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
            </select>
          </div>

          {/* Scholarships Data Table */}
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
                <p>Click "Restore 26 Real Schemes" to seed official scholarships.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#0f172a]/80 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-5 py-3.5">Scholarship Scheme</th>
                      <th className="px-5 py-3.5">Provider & Type</th>
                      <th className="px-5 py-3.5">Award Amount</th>
                      <th className="px-5 py-3.5">Courses & Income</th>
                      <th className="px-5 py-3.5">Deadline</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {filtered.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-4 min-w-[240px]">
                          <div className="font-bold text-white text-sm line-clamp-1">{s.name}</div>
                          <div className="text-[11px] text-amber-400 mt-0.5 font-medium">{s.category}</div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-300 line-clamp-1">{s.provider}</div>
                          <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 inline-block mt-1">
                            {s.scholarshipType}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-extrabold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/80">
                            {s.amount}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-slate-400">
                          <div className="line-clamp-1 text-slate-300 font-medium">{s.eligibleCourses}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{s.familyIncomeLimitText || "No Bar"}</div>
                        </td>

                        <td className="px-5 py-4 font-bold text-slate-300">
                          {s.deadline || "Open"}
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleTogglePublish(s)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
                              s.isPublished
                                ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            {s.isPublished ? "PUBLISHED" : "DRAFT"}
                          </button>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={s.applyLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                              title="Test Apply Link"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>

                            <button
                              onClick={() => handleOpenEditModal(s)}
                              className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors cursor-pointer"
                              title="Edit Scholarship"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDelete(s.id, s.name)}
                              className="p-1.5 rounded-lg bg-red-950/60 text-red-400 hover:bg-red-900 transition-colors cursor-pointer"
                              title="Delete Scholarship"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

      {/* ADD / EDIT SCHOLARSHIP MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
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
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
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
                      placeholder="e.g. Reliance Foundation Scholarship"
                      className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Provider Agency *</label>
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
                      className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none"
                    >
                      <option value="Central Government">Central Government</option>
                      <option value="State Government">State Government</option>
                      <option value="Private">Private Foundation</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Scholarship Type</label>
                    <input
                      type="text"
                      value={formData.scholarshipType || "Merit-Based"}
                      onChange={(e) => setFormData({ ...formData, scholarshipType: e.target.value })}
                      placeholder="Merit-Based, Need-Based, Girl Students, SC/ST, BC/MBC"
                      className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Award Amount *</label>
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
                      className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Min Percentage %</label>
                    <input
                      type="number"
                      value={formData.minPercentage || ""}
                      onChange={(e) => setFormData({ ...formData, minPercentage: parseFloat(e.target.value) })}
                      placeholder="60"
                      className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Family Income Limit Text</label>
                    <input
                      type="text"
                      value={formData.familyIncomeLimitText || ""}
                      onChange={(e) => setFormData({ ...formData, familyIncomeLimitText: e.target.value })}
                      placeholder="Below ₹2.5 Lakhs per annum"
                      className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none"
                    />
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
                      className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Official Apply Link *</label>
                    <input
                      type="url"
                      required
                      value={formData.applyLink || ""}
                      onChange={(e) => setFormData({ ...formData, applyLink: e.target.value })}
                      placeholder="https://scholarships.gov.in/register"
                      className="w-full px-3.5 py-2.5 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none"
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
                    className="w-full p-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Eligibility Criteria</label>
                  <textarea
                    rows={2}
                    value={formData.eligibilityCriteria || ""}
                    onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })}
                    placeholder="Enter complete eligibility requirements..."
                    className="w-full p-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Required Documents</label>
                  <textarea
                    rows={2}
                    value={formData.requiredDocuments || ""}
                    onChange={(e) => setFormData({ ...formData, requiredDocuments: e.target.value })}
                    placeholder="Class 12th Marksheet, Income Certificate, Aadhar Card, Bank Passbook..."
                    className="w-full p-3 bg-[#0f172a] border border-slate-700 rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isPublished)}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="w-4 h-4 accent-amber-500"
                    />
                    <span>Publish Immediately</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-300">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isFeatured)}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 accent-amber-500"
                    />
                    <span>Highlight as Featured</span>
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
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold hover:from-amber-600 cursor-pointer"
                  >
                    {actionLoading ? "Saving..." : editingScholarship ? "Update Scholarship" : "Create Scholarship"}
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
