"use client";

import { useState, useEffect } from "react";
import {
  UserCheck,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Send,
  Loader2,
  Building2,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  X,
  User,
  ShieldCheck,
  Award,
} from "lucide-react";

export default function AdminAdmissionLeadsPage() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Selected Lead for Detail Drawer
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [assignedCounselor, setAssignedCounselor] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  async function fetchLeads() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/admission-leads?status=${statusFilter}&query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      if (data.success) {
        setLeads(data.leads || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error("Fetch leads error:", err);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  }

  function openLeadDrawer(lead: any) {
    setSelectedLead(lead);
    setNewStatus(lead.status);
    setAdminNotes(lead.adminNotes || "");
    setAssignedCounselor(lead.assignedCounselor || "");
    setRejectionReason(lead.rejectionReason || "");
  }

  async function handleUpdateLeadStatus() {
    if (!selectedLead) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/admin/admission-leads/${selectedLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          adminNotes,
          assignedCounselor,
          rejectionReason,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "Admission lead updated successfully.");
        setSelectedLead(null);
        fetchLeads();
      } else {
        alert(data.error || "Failed to update lead.");
      }
    } catch (err) {
      alert("Network error updating admission lead.");
    } finally {
      setUpdating(false);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "NEW":
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-full text-xs font-black">NEW LEAD</span>;
      case "UNDER_REVIEW":
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-black">UNDER REVIEW</span>;
      case "DOCUMENTS_PENDING":
        return <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-full text-xs font-black">DOCS PENDING</span>;
      case "VERIFIED":
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-black">VERIFIED</span>;
      case "APPROVED":
        return <span className="bg-teal-100 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-full text-xs font-black">APPROVED</span>;
      case "REJECTED":
        return <span className="bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-full text-xs font-black">REJECTED</span>;
      case "ADMISSION_CONFIRMED":
        return <span className="bg-amber-400 text-stone-950 px-3 py-1 rounded-full text-xs font-black">CONFIRMED 🎉</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  }

  return (
    <div className="p-6 space-y-6 bg-slate-100 min-h-screen font-sans text-slate-900">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#1c0b36] text-amber-300 border border-amber-500/50 px-4 py-3 rounded-2xl shadow-xl text-xs font-extrabold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1c0b36] text-amber-400 flex items-center justify-center font-black shadow-md">
            <UserCheck className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-base font-black text-[#1c0b36]">Student Admission Lead Management</h1>
            <p className="text-xs text-slate-500 font-medium">
              Enterprise Lead CMS • Real-time student verification & status updates
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchLeads()}
              placeholder="Search Application ID, Name, Mobile..."
              className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium w-64 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <button
            onClick={fetchLeads}
            className="px-4 py-2 bg-[#1c0b36] text-amber-300 text-xs font-black rounded-xl hover:bg-[#2a104e] transition-all cursor-pointer"
          >
            Search
          </button>
        </div>
      </div>

      {/* STATUS FILTER PILL TABS */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs text-xs font-bold">
        {[
          { key: "ALL", label: "All Leads", count: counts.all || 0 },
          { key: "NEW", label: "New", count: counts.new || 0 },
          { key: "UNDER_REVIEW", label: "Under Review", count: counts.underReview || 0 },
          { key: "DOCUMENTS_PENDING", label: "Docs Pending", count: counts.documentsPending || 0 },
          { key: "VERIFIED", label: "Verified", count: counts.verified || 0 },
          { key: "APPROVED", label: "Approved", count: counts.approved || 0 },
          { key: "REJECTED", label: "Rejected", count: counts.rejected || 0 },
          { key: "ADMISSION_CONFIRMED", label: "Confirmed", count: counts.admissionConfirmed || 0 },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === tab.key
                ? "bg-[#1c0b36] text-amber-300 font-black shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 text-[10px] rounded-full font-black ${
                statusFilter === tab.key ? "bg-amber-400 text-stone-950" : "bg-slate-200 text-slate-700"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* LEADS DATA TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#1c0b36] mx-auto" />
            <p className="text-xs font-bold text-slate-500">Fetching admission leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-slate-600">No admission leads found matching filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1c0b36] text-white border-b border-purple-900/60 uppercase tracking-wider text-[10.5px]">
                <tr>
                  <th className="p-3.5 pl-5 font-black">Application ID</th>
                  <th className="p-3.5 font-black">Student Name</th>
                  <th className="p-3.5 font-black">Target Institution</th>
                  <th className="p-3.5 font-black">Selected Course</th>
                  <th className="p-3.5 font-black">Prog.</th>
                  <th className="p-3.5 font-black">Mobile / Email</th>
                  <th className="p-3.5 font-black">City</th>
                  <th className="p-3.5 font-black">Status</th>
                  <th className="p-3.5 pr-5 text-right font-black">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="p-3.5 pl-5 font-mono font-extrabold text-purple-950">
                      {lead.applicationId}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {lead.firstName} {lead.lastName}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700 max-w-[180px] truncate">
                      {lead.college?.name || "Institution"}
                    </td>
                    <td className="p-3.5 text-slate-600 font-medium max-w-[160px] truncate">
                      {lead.course?.title || "General Course"}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-extrabold text-[10px]">
                        {lead.programme}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      <p className="font-bold text-slate-900">{lead.mobileNumber}</p>
                      <p className="text-[10.5px] text-slate-500 truncate max-w-[140px]">{lead.email}</p>
                    </td>
                    <td className="p-3.5 text-slate-600 font-medium">
                      {lead.city || "Tamil Nadu"}
                    </td>
                    <td className="p-3.5">{getStatusBadge(lead.status)}</td>
                    <td className="p-3.5 pr-5 text-right">
                      <button
                        onClick={() => openLeadDrawer(lead)}
                        className="px-3 py-1.5 bg-[#1c0b36] hover:bg-[#2a104e] text-amber-300 font-bold text-[11px] rounded-xl shadow-2xs transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Manage Lead</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LEAD DETAILS DRAWER MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 bg-[#1c0b36]/70 backdrop-blur-xs flex items-center justify-end z-50 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl overflow-y-auto p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-mono font-black text-purple-700 block">
                    ID: {selectedLead.applicationId}
                  </span>
                  <h2 className="text-lg font-black text-[#1c0b36]">
                    {selectedLead.firstName} {selectedLead.lastName}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lead Information Tabs */}
              <div className="space-y-4 text-xs">
                {/* College & Course */}
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 space-y-1">
                  <span className="font-extrabold text-[#1c0b36] block">Selected College & Degree Course</span>
                  <p className="text-sm font-black text-[#1c0b36]">{selectedLead.college?.name}</p>
                  <p className="font-bold text-purple-900">
                    Course: {selectedLead.course?.title || "General Course"} ({selectedLead.programme})
                  </p>
                </div>

                {/* Personal & Contact Details */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-black text-[#1c0b36] block border-b pb-1">Personal Details</span>
                  <div className="grid grid-cols-2 gap-2">
                    <p><strong>Mobile:</strong> {selectedLead.mobileNumber}</p>
                    <p><strong>Email:</strong> {selectedLead.email}</p>
                    <p><strong>Gender:</strong> {selectedLead.gender}</p>
                    <p><strong>DOB:</strong> {selectedLead.dob}</p>
                    <p><strong>Father:</strong> {selectedLead.fatherName || "N/A"}</p>
                    <p><strong>Community:</strong> {selectedLead.community || "OC"}</p>
                    <p className="col-span-2"><strong>Address:</strong> {selectedLead.address || "N/A"}, {selectedLead.city}, {selectedLead.state}</p>
                  </div>
                </div>

                {/* Academic Scores */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-black text-[#1c0b36] block border-b pb-1">Academic Records</span>
                  <p><strong>10th Standard:</strong> {selectedLead.percentage10th}% ({selectedLead.board10th} - {selectedLead.year10th})</p>
                  <p><strong>12th Standard:</strong> {selectedLead.percentage12th}% ({selectedLead.group12th} - {selectedLead.year12th})</p>
                  {selectedLead.programme === "PG" && (
                    <p><strong>UG Degree:</strong> {selectedLead.ugDegree} - {selectedLead.ugPercentage}% ({selectedLead.ugCollege})</p>
                  )}
                </div>

                {/* Attached Document Links */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-black text-[#1c0b36] block border-b pb-1">Uploaded Documents</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedLead.marksheet10thUrl && (
                      <a href={selectedLead.marksheet10thUrl} download className="px-3 py-1.5 bg-purple-100 text-purple-900 rounded-xl font-bold flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" /> 10th Marksheet
                      </a>
                    )}
                    {selectedLead.marksheet12thUrl && (
                      <a href={selectedLead.marksheet12thUrl} download className="px-3 py-1.5 bg-purple-100 text-purple-900 rounded-xl font-bold flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" /> 12th Marksheet
                      </a>
                    )}
                    {selectedLead.tcUrl && (
                      <a href={selectedLead.tcUrl} download className="px-3 py-1.5 bg-purple-100 text-purple-900 rounded-xl font-bold flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" /> Transfer Cert (TC)
                      </a>
                    )}
                  </div>
                </div>

                {/* Status & Counselor Controls */}
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-3">
                  <span className="font-black text-[#1c0b36] block">Update Status & Counselor Notes</span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Application Status</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                      >
                        <option value="NEW">NEW LEAD</option>
                        <option value="UNDER_REVIEW">UNDER REVIEW</option>
                        <option value="DOCUMENTS_PENDING">DOCUMENTS PENDING</option>
                        <option value="VERIFIED">VERIFIED</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="REJECTED">REJECTED</option>
                        <option value="ADMISSION_CONFIRMED">ADMISSION CONFIRMED</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Assign Counselor</label>
                      <input
                        type="text"
                        value={assignedCounselor}
                        onChange={(e) => setAssignedCounselor(e.target.value)}
                        placeholder="e.g. Counseler Admin"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Counselor Notes / Feedback</label>
                    <textarea
                      rows={3}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add administrative notes..."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLeadStatus}
                disabled={updating}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-xs shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {updating ? <Loader2 className="w-4 h-4 animate-spin text-stone-950" /> : <Send className="w-3.5 h-3.5 text-stone-950" />}
                <span>Save Status & Send Email</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
