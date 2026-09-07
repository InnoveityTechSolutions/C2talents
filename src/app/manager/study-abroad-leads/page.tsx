"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Send,
  Loader2,
  BookOpen,
  Phone,
  Mail,
  Calendar,
  FileText,
  X,
  User,
  ShieldCheck,
  Award,
  DollarSign,
  UserCheck,
  Sparkles
} from "lucide-react";

export default function AdminStudyAbroadLeadsPage() {
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  async function fetchLeads() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/study-abroad-leads?status=${statusFilter}&query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      if (data.success) {
        setLeads(data.leads || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error("Fetch study abroad leads error:", err);
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
  }

  async function handleUpdateLeadStatus() {
    if (!selectedLead) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/admin/study-abroad-leads/${selectedLead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          adminNotes,
          assignedCounselor
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "Study abroad lead updated successfully.");
        setSelectedLead(null);
        fetchLeads();
      } else {
        alert(data.error || "Failed to update lead.");
      }
    } catch (err) {
      console.error("Update lead error:", err);
      alert("An unexpected error occurred while updating the lead.");
    } finally {
      setUpdating(false);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "NEW":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "CONTACTED":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "QUALIFIED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "FOLLOW-UP":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "CONVERTED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CLOSED":
        return "bg-stone-100 text-stone-600 border-stone-200";
      default:
        return "bg-stone-50 text-stone-700 border-stone-200";
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1f0c3d] text-white px-5 py-3 rounded-2xl shadow-2xl border border-purple-500/40 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-purple-900/5 text-[#3b2075] border border-purple-900/15 text-[11px] font-extrabold uppercase tracking-wider mb-1">
            <Globe className="w-3.5 h-3.5 text-[#ea580c]" />
            <span>International Education Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1f0c3d]">
            Study Abroad Leads
          </h1>
          <p className="text-xs text-stone-500 font-sans mt-0.5">
            Manage student eligibility assessments, assigned counselors, and lead conversion statuses.
          </p>
        </div>

        <button
          onClick={fetchLeads}
          className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-all self-start sm:self-auto cursor-pointer"
        >
          🔄 Refresh Leads
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: "ALL LEADS", key: "ALL", color: "text-[#3b2075]" },
          { label: "NEW", key: "NEW", color: "text-blue-600" },
          { label: "CONTACTED", key: "CONTACTED", color: "text-amber-600" },
          { label: "QUALIFIED", key: "QUALIFIED", color: "text-purple-600" },
          { label: "FOLLOW-UP", key: "FOLLOW-UP", color: "text-orange-600" },
          { label: "CONVERTED", key: "CONVERTED", color: "text-emerald-600" },
          { label: "CLOSED", key: "CLOSED", color: "text-stone-500" }
        ].map((m) => (
          <div
            key={m.key}
            onClick={() => setStatusFilter(m.key)}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
              statusFilter === m.key
                ? "bg-[#1f0c3d] text-white border-[#1f0c3d] shadow-md"
                : "bg-white border-stone-200 hover:border-purple-300 text-stone-800"
            }`}
          >
            <span className={`text-[10px] font-extrabold uppercase tracking-wider block ${statusFilter === m.key ? "text-purple-200" : "text-stone-500"}`}>
              {m.label}
            </span>
            <span className={`text-xl font-black ${statusFilter === m.key ? "text-white" : m.color}`}>
              {counts[m.key] || 0}
            </span>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchLeads()}
            placeholder="Search by student name, email, phone, country..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-xs font-semibold focus:border-[#3b2075] outline-none"
          />
        </div>

        <button
          onClick={fetchLeads}
          className="w-full sm:w-auto px-5 py-2 bg-[#3b2075] hover:bg-[#ea580c] text-white text-xs font-extrabold rounded-xl transition-all shadow-xs cursor-pointer"
        >
          Search
        </button>
      </div>

      {/* Leads Data Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#3b2075] animate-spin mx-auto" />
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Loading Study Abroad Leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Globe className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="font-bold text-stone-700 text-base">No Study Abroad Leads Found</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              No student submissions match the selected filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[10.5px] font-extrabold text-stone-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Selected Country</th>
                  <th className="py-3.5 px-4">Course & Qualification</th>
                  <th className="py-3.5 px-4">Score & English Test</th>
                  <th className="py-3.5 px-4">Budget & Intake</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs font-sans">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#1f0c3d]">{lead.studentName}</div>
                      <div className="text-[11px] text-stone-500 font-mono">{lead.email}</div>
                      <div className="text-[11px] text-stone-500">{lead.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-purple-900 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
                        {lead.selectedCountry}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{lead.preferredCourse}</div>
                      <div className="text-[11px] text-stone-500">{lead.qualification}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-800">Score: {lead.academicScore}</div>
                      <div className="text-[11px] text-stone-500">
                        {lead.englishTest}: {lead.englishScore || "N/A"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#ea580c]">{lead.budget}</div>
                      <div className="text-[11px] text-stone-500">{lead.preferredIntake}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-stone-500 text-[11px]">
                      {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openLeadDrawer(lead)}
                        className="px-3 py-1.5 bg-[#3b2075] hover:bg-[#ea580c] text-white text-[11px] font-extrabold rounded-lg transition-all cursor-pointer shadow-2xs"
                      >
                        Inspect Lead
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Drawer for Selected Lead */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250">
            {/* Drawer Header */}
            <div className="p-6 bg-[#1f0c3d] text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 block">
                  Study Abroad Candidate Profile
                </span>
                <h3 className="text-xl font-serif font-bold text-white">{selectedLead.studentName}</h3>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* Contact Information */}
              <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-2xl space-y-2">
                <h4 className="text-xs font-extrabold text-[#3b2075] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#ea580c]" />
                  <span>Student Contact Details</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-stone-500 font-semibold block">Email:</span>
                    <span className="font-bold text-stone-900">{selectedLead.email}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 font-semibold block">Phone:</span>
                    <span className="font-bold text-stone-900">{selectedLead.phone}</span>
                  </div>
                </div>
              </div>

              {/* Assessment Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#3b2075]" />
                  <span>Study Abroad Preferences & Qualifications</span>
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50 p-4 border border-stone-200 rounded-2xl">
                  <div>
                    <span className="text-stone-500 block">Target Country:</span>
                    <span className="font-extrabold text-[#1f0c3d]">{selectedLead.selectedCountry}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Preferred Course:</span>
                    <span className="font-extrabold text-[#1f0c3d]">{selectedLead.preferredCourse}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Highest Qualification:</span>
                    <span className="font-semibold text-stone-800">{selectedLead.qualification}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Academic Score:</span>
                    <span className="font-semibold text-stone-800">{selectedLead.academicScore}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">English Test:</span>
                    <span className="font-semibold text-stone-800">{selectedLead.englishTest} ({selectedLead.englishScore || "N/A"})</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Annual Budget:</span>
                    <span className="font-bold text-[#ea580c]">{selectedLead.budget}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Preferred Intake:</span>
                    <span className="font-semibold text-stone-800">{selectedLead.preferredIntake}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Submitted On:</span>
                    <span className="font-semibold text-stone-800">
                      {new Date(selectedLead.createdAt).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Counselor Action Controls */}
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <h4 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Counselor & Status Management</span>
                </h4>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Update Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold focus:border-[#3b2075] outline-none"
                  >
                    <option value="NEW">NEW - Fresh Assessment Submission</option>
                    <option value="CONTACTED">CONTACTED - Student Reach Out Completed</option>
                    <option value="QUALIFIED">QUALIFIED - Admission Requirements Verified</option>
                    <option value="FOLLOW-UP">FOLLOW-UP - Pending Document / Score Update</option>
                    <option value="CONVERTED">CONVERTED - University Application Submitted</option>
                    <option value="CLOSED">CLOSED - Inactive / Not Interested</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Assigned Study Abroad Counselor</label>
                  <input
                    type="text"
                    value={assignedCounselor}
                    onChange={(e) => setAssignedCounselor(e.target.value)}
                    placeholder="e.g. Senior Counselor Priya"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold focus:border-[#3b2075] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Admin / Counselor Internal Notes</label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add student counselling notes, preferred university shortlists, call outcome..."
                    className="w-full p-3 rounded-xl border border-stone-300 text-xs font-sans focus:border-[#3b2075] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-5 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-200/50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateLeadStatus}
                disabled={updating}
                className="px-6 py-2 bg-[#3b2075] hover:bg-[#ea580c] text-white text-xs font-extrabold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Save Lead Updates</span>
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
