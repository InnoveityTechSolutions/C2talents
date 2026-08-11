"use client";

import { useState, useEffect } from "react";
import { CollegeForm } from "@/components/admin/CollegeForm";
import { PopupModal } from "@/components/ui/PopupModal";
import {
  CheckSquare,
  Building2,
  MapPin,
  CheckCircle2,
  Eye,
  Loader2,
  Send,
  RefreshCcw,
  Edit,
  Sparkles,
  Save,
  Globe,
  ArrowLeft,
  X,
  AlertTriangle,
  FileText,
  Clock,
  ShieldCheck,
} from "lucide-react";

// Helper function to sanitize any malformed or duplicated title text in stored DB records
function sanitizeCollegeName(rawName: string = ""): string {
  if (!rawName) return "College Profile";
  return rawName
    .replace(/PSG COLLEGE OF COLLEGE OF TECHNOLOGYNYNOLOGY/gi, "PSG College of Technology")
    .replace(/PSG COLLEGE OF TECHNOLOGYNYNOLOGY/gi, "PSG College of Technology")
    .replace(/PSG College of TECHNOLOGYNOLOGY/gi, "PSG College of Technology")
    .replace(/TECHNOLOGYNYNOLOGY/gi, "Technology")
    .replace(/TECHNOLOGYNOLOGY/gi, "Technology")
    .replace(/TECHNOLOGYOLOGY/gi, "Technology")
    .replace(/COLLEGE OF COLLEGE OF/gi, "College of")
    .replace(/\s+/g, " ")
    .trim();
}

export default function AdminSubmittedCollegesPage() {
  const [loading, setLoading] = useState(true);
  const [colleges, setColleges] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<string>("ALL");

  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    item: any | null;
    mode: "EDIT" | "REQUEST_CHANGES" | null;
    adminNotes: string;
  }>({
    isOpen: false,
    item: null,
    mode: null,
    adminNotes: "",
  });

  // Custom Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: (() => void) | null;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Publish Live",
    onConfirm: null,
  });

  const [notificationModal, setNotificationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSubmittedColleges();
  }, [activeTab]);

  async function fetchSubmittedColleges() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/submitted-colleges?status=${activeTab}`);
      const data = await res.json();
      if (data.success) {
        setColleges(data.colleges || []);
      }
    } catch (err) {
      console.error("Failed to fetch submitted colleges:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdminSaveSubmittedData(formData: any) {
    if (!reviewModal.item) return;
    setSubmitting(true);
    try {
      const sanitizedName = sanitizeCollegeName(formData.name || reviewModal.item.collegeName);
      formData.name = sanitizedName;

      const res = await fetch(`/api/admin/submitted-colleges/${reviewModal.item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update submitted college profile.");
      }

      setNotificationModal({
        isOpen: true,
        title: "Corrections Saved Successfully",
        message: `Submitted profile details for "${sanitizedName}" have been updated by Admin.`,
        type: "success",
      });

      setReviewModal((prev) => ({
        ...prev,
        item: {
          ...prev.item,
          collegeName: sanitizedName,
          submittedDataParsed: formData,
        },
      }));

      fetchSubmittedColleges();
    } catch (err: any) {
      setNotificationModal({
        isOpen: true,
        title: "Save Error",
        message: err.message || "Failed to save profile corrections.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function triggerPublishConfirmation(id: string, collegeName?: string) {
    const cleanName = sanitizeCollegeName(collegeName);
    setConfirmModal({
      isOpen: true,
      title: "Approve & Publish Live",
      message: `Are you sure you want to approve and publish "${cleanName}" live onto the C2Talents platform?`,
      confirmText: "Approve & Publish Live",
      onConfirm: () => executePublish(id),
    });
  }

  async function executePublish(id: string) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/submitted-colleges/${id}/publish`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        const cleanName = sanitizeCollegeName(data.publishedCollege?.name);
        setNotificationModal({
          isOpen: true,
          title: "College Published Live!",
          message: `${cleanName} has been published live and is now visible across the C2Talents platform.`,
          type: "success",
        });
        setReviewModal({ isOpen: false, item: null, mode: null, adminNotes: "" });
        fetchSubmittedColleges();
      } else {
        setNotificationModal({
          isOpen: true,
          title: "Publishing Failed",
          message: data.error || "Failed to publish college.",
          type: "error",
        });
      }
    } catch (err: any) {
      setNotificationModal({
        isOpen: true,
        title: "Error",
        message: err.message || "An unexpected error occurred while publishing.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function executeRequestChanges() {
    if (!reviewModal.item) return;
    if (!reviewModal.adminNotes.trim()) {
      setNotificationModal({
        isOpen: true,
        title: "Missing Revision Notes",
        message: "Please enter revision details or specific requested changes before sending.",
        type: "warning",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/submitted-colleges/${reviewModal.item.id}/request-changes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes: reviewModal.adminNotes }),
      });
      const data = await res.json();
      if (data.success) {
        const cleanName = sanitizeCollegeName(reviewModal.item.collegeName);
        setNotificationModal({
          isOpen: true,
          title: "Revision Request Sent",
          message: `Revision request sent successfully to ${cleanName}.`,
          type: "success",
        });
        setReviewModal({ isOpen: false, item: null, mode: null, adminNotes: "" });
        fetchSubmittedColleges();
      } else {
        setNotificationModal({
          isOpen: true,
          title: "Revision Request Failed",
          message: data.error || "Failed to send revision request.",
          type: "error",
        });
      }
    } catch (err: any) {
      setNotificationModal({
        isOpen: true,
        title: "Error",
        message: err.message || "An unexpected error occurred.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 font-sans text-stone-900 p-6 bg-[#FAF9F5] min-h-screen w-full max-w-none">
      {/* HEADER BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-[#1f0c3d] via-[#2d1659] to-[#3b2075] text-white p-6 rounded-3xl shadow-lg border border-[#3b2075]/60">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight">Submitted Colleges (Profile Data Review & Editing)</h1>
            <p className="text-xs text-purple-200/80 font-medium mt-0.5">
              Inspect & edit completed profiles submitted by colleges. Correct details and click Publish Live to launch.
            </p>
          </div>
        </div>

        {/* STATUS FILTER BUTTONS */}
        <div className="flex flex-wrap items-center gap-2 bg-[#16082d] p-2 rounded-2xl border border-[#3b2075]/50 text-xs font-bold shrink-0">
          <span className="text-purple-300 px-2 text-[11px] font-extrabold uppercase tracking-wider">Status Filter:</span>
          {["ALL", "DATA_SUBMITTED", "NEEDS_REVISION", "PUBLISHED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                  : "text-purple-200 hover:text-white hover:bg-purple-900/40"
              }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* SUBMITTED COLLEGES GRID */}
      {loading ? (
        <div className="p-16 text-center text-stone-500 text-xs flex flex-col items-center gap-3 bg-white rounded-3xl border border-stone-200 shadow-xs">
          <Loader2 className="w-8 h-8 text-[#3b2075] animate-spin" />
          <span className="font-extrabold text-[#1f0c3d] text-sm">Loading submitted college profiles...</span>
        </div>
      ) : colleges.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-16 text-center text-stone-500 text-xs shadow-xs space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#3b2075] flex items-center justify-center mx-auto border border-purple-100">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-[#1f0c3d]">No submitted college profiles found</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto font-medium">
            There are currently no college submissions matching the selected status filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {colleges.map((item) => {
            const data = item.submittedDataParsed || {};
            const collegeName = sanitizeCollegeName(data.name || item.collegeName);
            return (
              <div
                key={item.id}
                className="bg-white border border-stone-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-[#3b2075]/40 hover:shadow-md transition-all duration-200 relative"
              >
                <div className="space-y-4">
                  {/* CARD HEADER */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <h3 className="font-black text-[#1f0c3d] text-base leading-snug break-normal">
                        {collegeName}
                      </h3>
                      <div className="text-xs text-stone-500 flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">{data.location || item.location || "Location N/A"}</span>
                      </div>
                    </div>

                    {/* STATUS BADGE */}
                    <div className="shrink-0 pt-0.5">
                      {item.status === "DATA_SUBMITTED" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-2xs">
                          <FileText className="w-3 h-3 text-indigo-600" /> SUBMITTED
                        </span>
                      )}
                      {item.status === "NEEDS_REVISION" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-2xs">
                          <Clock className="w-3 h-3 text-amber-600" /> REVISION
                        </span>
                      )}
                      {item.status === "PUBLISHED" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 text-[#3b2075] border border-purple-200 text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-2xs">
                          <ShieldCheck className="w-3 h-3 text-[#3b2075]" /> LIVE PUBLISHED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* DATA SUMMARY CONTAINER */}
                  <div className="p-4 rounded-2xl bg-stone-50/80 border border-stone-200/80 text-xs space-y-2.5 font-medium">
                    <div className="flex justify-between items-center text-[11px] gap-2">
                      <span className="text-stone-500 shrink-0">Type & Category:</span>
                      <span className="font-bold text-stone-900 truncate text-right">
                        {data.type || "Autonomous"} • {data.category || "Engineering"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] gap-2">
                      <span className="text-stone-500 shrink-0">Annual Fees:</span>
                      <span className="font-extrabold text-[#3b2075]">
                        ₹{data.feesPerYear && !isNaN(Number(data.feesPerYear)) ? Number(data.feesPerYear).toLocaleString() : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] gap-2">
                      <span className="text-stone-500 shrink-0">Courses Included:</span>
                      <span className="font-extrabold text-stone-900">
                        {Array.isArray(data.courses) ? `${data.courses.length} Courses` : "0 Courses"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] gap-2">
                      <span className="text-stone-500 shrink-0">Avg Package:</span>
                      <span className="font-extrabold text-emerald-700">
                        {data.avgPackage ? `${data.avgPackage} LPA` : "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* ADMIN REVISION NOTE */}
                  {item.adminNotes && (
                    <div className="text-[11px] bg-amber-50 border border-amber-200/80 p-3 rounded-2xl text-amber-900 font-medium leading-relaxed">
                      <strong className="font-bold text-amber-950">Admin Note:</strong> "{item.adminNotes}"
                    </div>
                  )}
                </div>

                {/* CLEAN 2-ROW ACTION BUTTON LAYOUT */}
                <div className="pt-4 border-t border-stone-100 space-y-2.5">
                  <button
                    onClick={() => setReviewModal({ isOpen: true, item, mode: "EDIT", adminNotes: item.adminNotes || "" })}
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#3b2075] font-extrabold text-xs flex items-center justify-center gap-2 transition-all border border-purple-200 cursor-pointer shadow-2xs"
                  >
                    <Edit className="w-4 h-4 text-[#3b2075]" /> Inspect & Edit Profile Form
                  </button>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setReviewModal({ isOpen: true, item, mode: "REQUEST_CHANGES", adminNotes: "" })}
                      className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs transition-all border border-amber-200 cursor-pointer flex items-center justify-center gap-1.5"
                      title="Request Revision from College"
                    >
                      <RefreshCcw className="w-3.5 h-3.5 text-amber-700" />
                      <span>Revision</span>
                    </button>

                    <button
                      onClick={() => triggerPublishConfirmation(item.id, collegeName)}
                      disabled={submitting}
                      className="py-2.5 px-3 rounded-xl bg-[#3b2075] hover:bg-[#4c1d95] text-amber-300 font-black text-xs transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5 text-amber-300" />
                      <span>Publish Live</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL EDIT MODAL */}
      {reviewModal.isOpen && reviewModal.item && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#120626] border border-purple-800/60 rounded-3xl w-full max-w-6xl max-h-[92vh] overflow-y-auto shadow-2xl space-y-4 text-white p-4 md:p-6 animate-in fade-in zoom-in-95 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-purple-800/50 pb-4 sticky top-0 bg-[#120626]/95 backdrop-blur-md z-30 pt-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>{sanitizeCollegeName(reviewModal.item.submittedDataParsed?.name || reviewModal.item.collegeName)}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                      Admin Edit & Review Mode
                    </span>
                  </h3>
                  <p className="text-xs text-purple-200/80 font-medium">
                    Edit any submitted fields below before publishing live on C2Talents.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => triggerPublishConfirmation(reviewModal.item.id, reviewModal.item.submittedDataParsed?.name || reviewModal.item.collegeName)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 text-slate-950" />} Publish Live
                </button>

                <button
                  onClick={() => setReviewModal({ isOpen: false, item: null, mode: null, adminNotes: "" })}
                  className="w-8 h-8 rounded-full bg-purple-900/60 hover:bg-purple-800 text-purple-200 hover:text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {reviewModal.mode === "EDIT" && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-purple-900/40 border border-purple-700/50 text-xs text-purple-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Modifying form fields updates the profile submission data for <strong>{sanitizeCollegeName(reviewModal.item.collegeName)}</strong>. Click <strong>"Save Corrections & Update Data"</strong> below.
                    </span>
                  </div>

                  <button
                    onClick={() => setReviewModal({ ...reviewModal, mode: "REQUEST_CHANGES" })}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-extrabold text-[11px] shrink-0 hover:bg-amber-500/30 cursor-pointer"
                  >
                    Request Revision from College
                  </button>
                </div>

                {/* Render the full 12-section CollegeForm */}
                <div className="bg-[#16082d] border border-purple-800/40 rounded-3xl p-4 md:p-6 shadow-xl">
                  <CollegeForm
                    initialData={reviewModal.item.submittedDataParsed || {
                      name: sanitizeCollegeName(reviewModal.item.collegeName),
                      location: reviewModal.item.location,
                      email: reviewModal.item.email,
                      mobile: reviewModal.item.mobile,
                      website: reviewModal.item.website,
                    }}
                    isCollegePortal={true}
                    onSubmitPortal={handleAdminSaveSubmittedData}
                  />
                </div>
              </div>
            )}

            {reviewModal.mode === "REQUEST_CHANGES" && (
              <div className="space-y-4 p-4 bg-[#16082d] rounded-2xl border border-purple-800/40">
                <p className="text-xs text-purple-200 leading-relaxed font-medium">
                  Provide specific comments or requested revisions for <strong>{sanitizeCollegeName(reviewModal.item.collegeName)}</strong>. The college status will be updated to <code>NEEDS_REVISION</code> allowing them to update their submission.
                </p>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-purple-300 mb-1">
                    Requested Revisions / Revision Notes <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={reviewModal.adminNotes}
                    onChange={(e) => setReviewModal((prev) => ({ ...prev, adminNotes: e.target.value }))}
                    placeholder="e.g. Please update hostel fee structure and upload high-resolution campus banner images."
                    className="w-full p-3 rounded-xl bg-[#0d041a] border border-purple-800 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setReviewModal({ ...reviewModal, mode: "EDIT" })}
                    className="py-3 px-5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 font-bold text-xs cursor-pointer"
                  >
                    ← Back to Edit Form
                  </button>
                  <button
                    onClick={executeRequestChanges}
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Revision Request to College"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#180933] border border-purple-800/60 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 text-white text-center animate-in fade-in zoom-in-95 relative">
            <button
              onClick={() => setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null })}
              className="absolute right-5 top-5 text-purple-300/60 hover:text-white transition-colors p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto shadow-md">
              <Building2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white">{confirmModal.title || "Confirm Publishing"}</h3>
              <p className="text-xs text-purple-200/80 leading-relaxed font-medium">
                {confirmModal.message}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-purple-950/60 border border-purple-800/60 text-xs text-purple-200 space-y-1 font-medium">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Action Notice</span>
              </div>
              <p className="text-[11px] text-purple-300/80">
                Publishing will create the live college record in MySQL and make it immediately visible to students on C2Talents.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null })}
                className="flex-1 py-3 px-4 rounded-xl bg-purple-950/80 hover:bg-purple-900/80 text-purple-200 font-extrabold text-xs transition-all border border-purple-800/60 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirmModal.onConfirm) confirmModal.onConfirm();
                  setConfirmModal({ isOpen: false, title: "", message: "", onConfirm: null });
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer text-center"
              >
                {confirmModal.confirmText || "Publish Live"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP NOTIFICATION MODAL */}
      <PopupModal
        isOpen={notificationModal.isOpen}
        onClose={() => setNotificationModal((prev) => ({ ...prev, isOpen: false }))}
        title={notificationModal.title}
        message={notificationModal.message}
        type={notificationModal.type}
      />
    </div>
  );
}
