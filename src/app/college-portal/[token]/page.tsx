"use client";

import { useState, useEffect, use } from "react";
import { CollegeForm } from "@/components/admin/CollegeForm";
import {
  GraduationCap,
  ShieldCheck,
  Building2,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Send,
  FileCheck,
  Globe,
  Edit,
  X,
} from "lucide-react";

export default function CollegePortalTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestInfo, setRequestInfo] = useState<any>(null);
  const [submittedData, setSubmittedData] = useState<any>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetchPortalInfo();
  }, [token]);

  async function fetchPortalInfo() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/college-portal/${token}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to authenticate access token.");
      }

      setRequestInfo(data.request);
      setSubmittedData(data.submittedData);
    } catch (err: any) {
      setError(err.message || "Invalid or expired access token.");
    } finally {
      setLoading(false);
    }
  }

  // Pre-populated initial form data merging registration request info with any previously saved submittedData
  const initialFormData = {
    name: submittedData?.name || requestInfo?.collegeName || "",
    email: submittedData?.email || requestInfo?.email || "",
    mobile: submittedData?.mobile || requestInfo?.mobile || "",
    website: submittedData?.website || requestInfo?.website || "",
    location: submittedData?.location || requestInfo?.location || "",
    city: submittedData?.city || requestInfo?.location?.split(",")[0]?.trim() || "",
    ...submittedData,
  };

  async function handleCollegeProfileSave(formData: any) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/college-portal/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit profile data.");
      }

      setSubmitSuccess(true);
      fetchPortalInfo();
    } catch (err: any) {
      alert("Error submitting profile: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d041a] text-white flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
        <h2 className="text-lg font-extrabold tracking-tight">Authenticating Secure Token Access...</h2>
        <p className="text-xs text-purple-300/70 mt-1">Verifying college credentials for token access.</p>
      </div>
    );
  }

  if (error || !requestInfo) {
    return (
      <div className="min-h-screen bg-[#0d041a] text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#180933] border border-rose-500/40 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-rose-300">Access Restricted</h2>
          <p className="text-xs text-purple-200/80 leading-relaxed">{error || "Invalid security token."}</p>
          <div className="p-3 bg-purple-950/60 rounded-xl text-[11px] text-purple-300/70">
            Security Note: This link is restricted exclusively to authorized college profile submitters. If you believe this is an error, please contact support.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d041a] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* College Restricted Top Navbar (No Admin Controls) */}
      <header className="border-b border-purple-900/40 bg-[#16082d]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 to-amber-500 flex items-center justify-center shadow-md">
              <GraduationCap className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white block leading-tight">C2Talents College Self-Service Portal</span>
              <span className="text-[10px] text-amber-400 font-extrabold flex items-center gap-1 uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 text-amber-400" /> Authorized Access: {requestInfo.collegeName}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-900/60 border border-purple-700/50 text-purple-200">
              Contact: {requestInfo.contactPerson} ({requestInfo.email})
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Status Banner */}
        <div className="bg-[#180933]/90 border border-purple-700/50 rounded-2xl p-6 shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-amber-400" />
              <h1 className="text-xl font-black text-white">{requestInfo.collegeName}</h1>
            </div>
            <p className="text-xs text-purple-200/80">
              Location: {requestInfo.location} | Registered Email: {requestInfo.email}
            </p>
          </div>

          <div>
            {requestInfo.status === "DATA_SUBMITTED" ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold">
                <FileCheck className="w-4 h-4 text-emerald-400" /> Profile Data Submitted (Under Admin Verification)
              </span>
            ) : requestInfo.status === "NEEDS_REVISION" ? (
              <div className="space-y-1 text-right">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-extrabold">
                  <AlertCircle className="w-4 h-4 text-amber-400" /> Revision Requested by Admin
                </span>
                {requestInfo.adminNotes && (
                  <p className="text-[11px] text-amber-200 font-medium">Notes: "{requestInfo.adminNotes}"</p>
                )}
              </div>
            ) : requestInfo.status === "PUBLISHED" ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-extrabold">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Profile Verified & Live Published!
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 text-amber-300 border border-amber-500/40 text-xs font-extrabold">
                <Clock className="w-4 h-4 text-amber-400" /> Complete & Submit Profile Data Below
              </span>
            )}
          </div>
        </div>

        {/* Self-Service College Profile Form Component */}
        <div className="bg-[#16082d] border border-purple-800/40 rounded-3xl p-4 md:p-6 shadow-2xl">
          <div className="mb-6 p-4 rounded-2xl bg-purple-900/30 border border-purple-700/40 text-xs text-purple-200/90 leading-relaxed flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Self-Service Onboarding Guidelines:</strong> Fill out all relevant details for your institution including basic information, courses, fees, campus facilities, placement metrics, admission criteria, hostel availability, gallery images, and section overview text. Click <strong>"Save / Submit Profile"</strong> when complete.
            </div>
          </div>

          <CollegeForm
            initialData={initialFormData}
            isCollegePortal={true}
            onSubmitPortal={handleCollegeProfileSave}
          />
        </div>
      </main>

      {/* Submission Success Center Popup Modal */}
      {submitSuccess && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 text-stone-900 animate-in fade-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setSubmitSuccess(false)}
              className="absolute right-5 top-5 text-stone-400 hover:text-stone-700 transition-colors p-1"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-stone-900">Profile Details Saved & Submitted!</h3>
              <p className="text-xs text-stone-600 leading-relaxed font-medium">
                Your college profile details for <strong className="text-[#2e266f]">{requestInfo?.collegeName}</strong> have been saved successfully and submitted for Admin Verification.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2 font-medium">
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500">Submission Status:</span>
                <span className="font-extrabold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Under Admin Review
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-stone-500">Next Action:</span>
                <span className="font-bold text-stone-800">Admin Review & Live Publication</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSubmitSuccess(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#2e266f] font-extrabold text-xs transition-all border border-purple-200 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Edit className="w-4 h-4" /> Continue Editing
              </button>

              <button
                type="button"
                onClick={() => setSubmitSuccess(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#2e266f] hover:bg-[#3d338f] text-white font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer text-center"
              >
                Close & Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-purple-900/40 bg-[#120626] py-6 text-center text-xs text-purple-300/60">
        <p>© {new Date().getFullYear()} C2Talents Restricted College Onboarding Portal.</p>
      </footer>
    </div>
  );
}
