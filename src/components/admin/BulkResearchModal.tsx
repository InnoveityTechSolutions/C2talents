"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Building2,
  Globe,
  Bell,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Play,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useAdminNotifications } from "./AdminNotificationProvider";

interface BulkResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BulkResearchModal({ isOpen, onClose }: BulkResearchModalProps) {
  const { permission, requestPermission } = useAdminNotifications();
  const [inputText, setInputText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [activeJob, setActiveJob] = useState<any>(null);
  const [pollingJobId, setPollingJobId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Poll active job status if one is currently being processed
  useEffect(() => {
    if (!pollingJobId) return;

    let timer: NodeJS.Timeout;
    async function checkJob() {
      try {
        const res = await fetch(`/api/admin/research/jobs?jobId=${pollingJobId}`);
        const data = await res.json();
        if (data.success && data.job) {
          setActiveJob(data.job);
          if (data.job.status === "COMPLETED" || data.job.status === "PARTIALLY_FAILED") {
            setPollingJobId(null);
          }
        }
      } catch (e) {
      } finally {
        if (pollingJobId) {
          timer = setTimeout(checkJob, 3000);
        }
      }
    }

    checkJob();

    return () => clearTimeout(timer);
  }, [pollingJobId]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim()) {
      setErrorMsg("Please enter at least one college name or website URL.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/research/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to start bulk research job.");
      }

      setActiveJob(data.job);
      setPollingJobId(data.job.jobId);
      setInputText("");
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred starting research.");
    } finally {
      setSubmitting(false);
    }
  }

  const sampleColleges = [
    "Loyola College Chennai\nhttps://www.loyolacollege.edu",
    "Madras Christian College\nhttps://mcc.edu.in",
    "PSG College of Technology Coimbatore",
    "Thiagarajar College of Engineering Madurai",
  ].join("\n");

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#120626] border border-purple-800/60 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-white animate-in fade-in zoom-in-95 my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-purple-800/50 p-4 sm:p-6 bg-[#16082d] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-stone-950 flex items-center justify-center font-extrabold shadow-md shrink-0">
              <Sparkles className="w-5 h-5 text-stone-950" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Bulk College Research Engine</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-900/60 text-amber-300 border border-purple-700/60 px-2 py-0.5 rounded-full">
                  AI Multi-Agent
                </span>
              </h2>
              <p className="text-xs text-purple-200/70 font-medium">
                Autonomous server-side research with desktop review alerts
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-purple-300 hover:text-white hover:bg-purple-900/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Permission Status Banner */}
          {permission !== "granted" && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-extrabold text-amber-300">
                    Desktop Notifications Not Yet Enabled
                  </p>
                  <p className="text-[11px] text-purple-200/80">
                    Enable notifications to get desktop alerts as soon as each college draft is ready for review.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={requestPermission}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-black shrink-0 transition-all cursor-pointer shadow-xs"
              >
                Enable Desktop Notifications
              </button>
            </div>
          )}

          {/* Background Job Guarantee Notice */}
          <div className="bg-purple-950/60 border border-purple-800/50 rounded-2xl p-4 text-xs text-purple-200/90 space-y-1.5 font-medium leading-relaxed">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Independent Server-Side Execution</span>
            </div>
            <p className="text-[11px] text-purple-200/80">
              Research runs on the background server and does <strong>not</strong> require this modal or tab to stay open. You can freely navigate to other admin pages or minimize your browser.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-purple-200">
                  Target Colleges or Official Website URLs (Up to 50):
                </label>
                <button
                  type="button"
                  onClick={() => setInputText(sampleColleges)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  Load Sample Institutions
                </button>
              </div>
              <textarea
                rows={5}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={"e.g.\nLoyola College Chennai\nhttps://mcc.edu.in\nPSG College of Technology"}
                className="w-full bg-[#180933] border border-purple-800/60 rounded-2xl p-3.5 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-amber-400/70 font-mono"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !inputText.trim()}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                  <span>Queueing Research Jobs...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-stone-950 fill-stone-950" />
                  <span>Start Bulk College Research</span>
                </>
              )}
            </button>
          </form>

          {/* Active Job Progress View */}
          {activeJob && (
            <div className="border-t border-purple-800/50 pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
                    Active Job: {activeJob.jobId}
                  </h4>
                  <p className="text-[11px] text-purple-200/70">
                    {activeJob.completedCount} of {activeJob.totalCount} completed • {activeJob.failedCount} failed
                  </p>
                </div>
                {pollingJobId && (
                  <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1.5 animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Researching in background...</span>
                  </span>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {activeJob.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#180933] border border-purple-800/40 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-white truncate">{item.collegeName}</p>
                      {item.url && <p className="text-[10px] text-purple-300/70 truncate">{item.url}</p>}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      {item.status === "QUEUED" && (
                        <span className="px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 text-[10px] font-bold">
                          Queued
                        </span>
                      )}
                      {item.status === "PROCESSING" && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-extrabold flex items-center gap-1">
                          <Loader2 className="w-2.5 h-2.5 animate-spin" /> Researching...
                        </span>
                      )}
                      {item.status === "READY_FOR_REVIEW" && (
                        <Link
                          href={item.reviewUrl || "/manager/submitted-colleges"}
                          onClick={onClose}
                          className="px-2.5 py-1 rounded-xl bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 hover:bg-emerald-400/30 text-[10px] font-black flex items-center gap-1 transition-all"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Review Draft</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                      {item.status === "FAILED" && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold" title={item.error}>
                          Failed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
