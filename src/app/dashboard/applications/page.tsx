"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building2,
  Calendar,
  Phone,
  Mail,
  User,
  ArrowRight,
  Loader2,
  FileCheck,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export default function StudentApplicationsDashboard() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState<any>(null);

  useEffect(() => {
    async function fetchUserAndApps() {
      try {
        const userRes = await fetch("/api/admin/auth/me");
        const userData = await userRes.json();

        let userEmail = "";
        if (userData.user && userData.user.email) {
          userEmail = userData.user.email;
          setEmail(userEmail);
        }

        if (userEmail) {
          const res = await fetch(`/api/admissions/my-applications?email=${encodeURIComponent(userEmail)}`);
          const data = await res.json();
          if (data.success && data.applications) {
            setApplications(data.applications);
            if (data.applications.length > 0) setSelectedApp(data.applications[0]);
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUserAndApps();
  }, []);

  async function handleManualSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admissions/my-applications?email=${encodeURIComponent(email)}&mobile=${encodeURIComponent(mobile)}`);
      const data = await res.json();
      if (data.success && data.applications) {
        setApplications(data.applications);
        if (data.applications.length > 0) setSelectedApp(data.applications[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "NEW":
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-full text-xs font-black">Application Received</span>;
      case "UNDER_REVIEW":
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-black">Under Review</span>;
      case "DOCUMENTS_PENDING":
        return <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-1 rounded-full text-xs font-black">Documents Pending</span>;
      case "VERIFIED":
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-black">Verified & Eligible</span>;
      case "APPROVED":
        return <span className="bg-teal-100 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-full text-xs font-black">Application Approved</span>;
      case "REJECTED":
        return <span className="bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1 rounded-full text-xs font-black">Application Rejected</span>;
      case "ADMISSION_CONFIRMED":
        return <span className="bg-amber-400 text-stone-950 px-3 py-1 rounded-full text-xs font-black">Admission Confirmed 🎉</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8ff] flex flex-col font-sans text-slate-900">
      {/* HEADER */}
      <header className="bg-[#1c0b36] text-white border-b border-purple-900/60 px-6 py-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3b2075] to-[#7c3aed] text-amber-300 flex items-center justify-center font-black shadow-md border border-amber-400/30">
              <GraduationCap className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white">
                C2<span className="text-amber-400">Talents</span>
              </span>
              <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider block">
                Student Applications Portal
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-bold transition-all"
          >
            ← Back to Main Platform
          </Link>
        </div>
      </header>

      {/* CONTENT WORKSPACE */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Search Bar if no applications automatically matched */}
        <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-base font-black text-[#1c0b36]">My Admission Applications</h1>
            <p className="text-xs text-slate-500 font-medium">View your submitted college applications and status updates in real-time.</p>
          </div>

          <form onSubmit={handleManualSearch} className="flex items-center gap-2">
            <input
              type="email"
              placeholder="Search by registered email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-purple-100 rounded-xl text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#1c0b36] hover:bg-[#2a104e] text-amber-300 font-black text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Fetch Applications</span>
            </button>
          </form>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-purple-100 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#1c0b36] mx-auto" />
            <p className="text-xs font-bold text-slate-600">Loading student applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-purple-100 space-y-3">
            <FileText className="w-12 h-12 text-purple-300 mx-auto" />
            <h3 className="text-base font-black text-[#1c0b36]">No Applications Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
              Enter your registered email address above or apply directly to any institution on the C2Talents platform.
            </p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-[#1c0b36] text-amber-300 font-black text-xs rounded-xl shadow-md"
            >
              Explore Colleges & Apply Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Applications List */}
            <div className="space-y-3 md:col-span-1">
              <span className="text-xs font-black text-[#1c0b36] uppercase tracking-wider block">Submitted Applications</span>
              {applications.map((app) => {
                const isSelected = selectedApp?.id === app.id;
                return (
                  <button
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#1c0b36] text-white border-amber-400 shadow-md border-l-4 border-l-amber-400"
                        : "bg-white hover:bg-slate-50 border-purple-100 text-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-mono font-bold ${isSelected ? "text-amber-300" : "text-purple-700"}`}>
                        {app.applicationId}
                      </span>
                      {getStatusBadge(app.status)}
                    </div>
                    <p className={`text-xs font-black truncate ${isSelected ? "text-white" : "text-[#1c0b36]"}`}>
                      {app.college?.name || "College Application"}
                    </p>
                    <p className={`text-[11px] mt-0.5 truncate ${isSelected ? "text-purple-200" : "text-slate-500 font-medium"}`}>
                      {app.course?.title || app.programme || "UG Programme"}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Right Application Detail */}
            {selectedApp && (
              <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-purple-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-purple-100 pb-4">
                  <div>
                    <span className="text-xs font-mono font-black text-purple-700 block">
                      Application ID: {selectedApp.applicationId}
                    </span>
                    <h2 className="text-lg font-black text-[#1c0b36]">{selectedApp.college?.name}</h2>
                  </div>
                  <div>{getStatusBadge(selectedApp.status)}</div>
                </div>

                {/* Progress Timeline Bar */}
                <div className="space-y-2 bg-purple-50/70 p-4 rounded-2xl border border-purple-100">
                  <span className="text-xs font-black text-[#1c0b36] block">Admission Process Timeline</span>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10.5px] font-bold">
                    <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl">1. Received ✓</div>
                    <div className={`p-2 rounded-xl ${selectedApp.status !== "NEW" ? "bg-emerald-100 text-emerald-900" : "bg-white text-slate-400"}`}>
                      2. Under Review
                    </div>
                    <div className={`p-2 rounded-xl ${["VERIFIED", "APPROVED", "ADMISSION_CONFIRMED"].includes(selectedApp.status) ? "bg-emerald-100 text-emerald-900" : "bg-white text-slate-400"}`}>
                      3. Verification
                    </div>
                    <div className={`p-2 rounded-xl ${selectedApp.status === "ADMISSION_CONFIRMED" ? "bg-amber-400 text-stone-950 font-black" : "bg-white text-slate-400"}`}>
                      4. Confirmed 🎉
                    </div>
                  </div>
                </div>

                {/* Information Sections */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-purple-100 space-y-1.5">
                    <span className="font-extrabold text-[#1c0b36] block border-b pb-1">Applicant Details</span>
                    <p><strong>Name:</strong> {selectedApp.firstName} {selectedApp.lastName}</p>
                    <p><strong>Email:</strong> {selectedApp.email}</p>
                    <p><strong>Mobile:</strong> {selectedApp.mobileNumber}</p>
                    <p><strong>City / State:</strong> {selectedApp.city || "Tamil Nadu"}, {selectedApp.state}</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-purple-100 space-y-1.5">
                    <span className="font-extrabold text-[#1c0b36] block border-b pb-1">Academic Scores</span>
                    <p><strong>10th Percentage:</strong> {selectedApp.percentage10th || "N/A"}%</p>
                    <p><strong>12th Percentage:</strong> {selectedApp.percentage12th || "N/A"}%</p>
                    {selectedApp.programme === "PG" && (
                      <p><strong>UG Degree:</strong> {selectedApp.ugDegree} ({selectedApp.ugPercentage}%)</p>
                    )}
                  </div>
                </div>

                {/* Counselor Notes / Notice */}
                {selectedApp.adminNotes && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
                    <span className="font-black block">Admissions Officer Note:</span>
                    <p className="font-medium">{selectedApp.adminNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
