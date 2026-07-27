"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/providers/AuthProvider";
import { CheckCircle, Clock, FileText, XCircle, ArrowRight, Sparkles, MapPin } from "lucide-react";
import { LoginModal } from "@/components/LoginModal";

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  SUBMITTED: { label: "Submitted", icon: <FileText className="w-4 h-4" />, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  UNDER_REVIEW: { label: "Under Review", icon: <Clock className="w-4 h-4" />, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  ACCEPTED: { label: "Accepted", icon: <CheckCircle className="w-4 h-4" />, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  REJECTED: { label: "Not Selected", icon: <XCircle className="w-4 h-4" />, color: "text-red-600", bg: "bg-red-50 border-red-200" },
};

const STAGES = ["SUBMITTED", "UNDER_REVIEW", "ACCEPTED"];

export default function TrackerPage() {
  const { user, loading } = useAuth();
  const [applications, setApplications] = React.useState<any[]>([]);
  const [fetching, setFetching] = React.useState(true);

  React.useEffect(() => {
    if (!user || user.role !== "STUDENT") { setFetching(false); return; }
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/applications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setApplications(Array.isArray(data) ? data : []);
      } catch {} finally { setFetching(false); }
    };
    load();
  }, [user]);

  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen bg-stone-50">
        <div className="bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-xs font-bold text-brand-green uppercase tracking-wider mb-1.5">My Applications</div>
            <h1 className="text-3xl font-bold text-stone-900">Application Tracker</h1>
            <p className="text-stone-500 text-sm mt-2">Monitor the status of every college application in one place</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {loading || fetching ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-stone-200 rounded-2xl h-28 animate-pulse-subtle" />
              ))}
            </div>
          ) : !user ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-brand-green mx-auto flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-bold text-stone-800 text-xl">Sign In to Track Applications</h2>
              <p className="text-sm text-stone-500 max-w-md mx-auto">
                Create a free account or sign in to track your college applications, document checklists, and admission status updates.
              </p>
              <LoginModal
                triggerClassName="inline-flex items-center gap-2 px-6 py-3 bg-brand-green text-white text-sm font-bold rounded-xl hover:bg-emerald-800 transition-all cursor-pointer"
                triggerText="Login / Register"
              />
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 mx-auto flex items-center justify-center">
                <FileText className="w-8 h-8 text-stone-400" />
              </div>
              <h2 className="font-bold text-stone-700 text-xl">No Applications Yet</h2>
              <p className="text-sm text-stone-500">You haven't applied to any colleges yet. Browse institutions and click "Apply" to start tracking.</p>
              <Link href="/colleges" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-green text-white text-sm font-bold rounded-xl hover:bg-emerald-800 transition-all">
                Browse Colleges <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {applications.map((app, i) => {
                const status = STATUS_CONFIG[app.status] || STATUS_CONFIG["SUBMITTED"];
                const stageIndex = STAGES.indexOf(app.status);

                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 hover-card-trigger"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-bold text-stone-900 text-[16px]">{app.college?.name}</h2>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-stone-500">
                          <MapPin className="w-3 h-3" />
                          {app.college?.location}
                        </div>
                        <div className="mt-2 text-xs font-semibold text-stone-600">
                          Course: <span className="text-stone-800">{app.course?.title}</span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${status.color} ${status.bg}`}>
                        {status.icon}
                        {status.label}
                      </div>
                    </div>

                    {/* Progress Pipeline */}
                    {app.status !== "REJECTED" && (
                      <div className="flex items-center gap-0 overflow-x-auto">
                        {STAGES.map((stage, si) => {
                          const cfg = STATUS_CONFIG[stage];
                          const isCompleted = si <= stageIndex;
                          const isActive = si === stageIndex;
                          return (
                            <React.Fragment key={stage}>
                              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                                isActive ? `${cfg.bg} ${cfg.color} border` : isCompleted ? "bg-emerald-50 text-emerald-700" : "bg-stone-50 text-stone-400"
                              }`}>
                                {isCompleted && si < stageIndex && <CheckCircle className="w-3 h-3" />}
                                {cfg.label}
                              </div>
                              {si < STAGES.length - 1 && (
                                <div className={`h-0.5 flex-1 min-w-[20px] mx-1 ${si < stageIndex ? "bg-emerald-300" : "bg-stone-200"}`} />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs text-stone-500">
                      <span>Applied: {new Date(app.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <Link href={`/colleges/${app.collegeId}`} className="text-brand-green font-bold hover:underline flex items-center gap-1">
                        College Profile <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
