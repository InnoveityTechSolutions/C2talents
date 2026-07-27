"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, Sparkles, Globe, X } from "lucide-react";

export interface PopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  icon?: React.ReactNode;
}

export function PopupModal({
  isOpen,
  onClose,
  title,
  message,
  type = "success",
  icon,
}: PopupModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeConfig = {
    success: {
      bgGradient: "from-emerald-500/20 to-teal-500/10",
      borderColor: "border-emerald-500/30",
      badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      icon: icon || <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
      buttonBg: "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950",
      defaultTitle: "Success!",
    },
    error: {
      bgGradient: "from-rose-500/20 to-red-500/10",
      borderColor: "border-rose-500/30",
      badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      icon: icon || <XCircle className="w-6 h-6 text-rose-400" />,
      buttonBg: "bg-rose-600 hover:bg-rose-700 text-white",
      defaultTitle: "Action Failed",
    },
    warning: {
      bgGradient: "from-amber-500/20 to-yellow-500/10",
      borderColor: "border-amber-500/30",
      badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      icon: icon || <AlertTriangle className="w-6 h-6 text-amber-400" />,
      buttonBg: "bg-amber-500 hover:bg-amber-600 text-slate-950 font-black",
      defaultTitle: "Attention Required",
    },
    info: {
      bgGradient: "from-sky-500/20 to-indigo-500/10",
      borderColor: "border-sky-500/30",
      badgeBg: "bg-sky-500/20 text-sky-300 border-sky-500/30",
      icon: icon || <Info className="w-6 h-6 text-sky-400" />,
      buttonBg: "bg-sky-600 hover:bg-sky-700 text-white",
      defaultTitle: "Notice",
    },
  };

  const config = typeConfig[type];

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div
        className={`w-full max-w-md bg-slate-900/95 text-slate-100 border ${config.borderColor} rounded-3xl p-6 shadow-2xl backdrop-blur-2xl relative animate-slide-up space-y-5 overflow-hidden`}
      >
        {/* Background Ambient Glow */}
        <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${config.bgGradient} rounded-full blur-3xl pointer-events-none`}></div>

        {/* Header Bar */}
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl bg-slate-950 border ${config.borderColor} flex items-center justify-center shrink-0 shadow-md`}>
              {config.icon}
            </div>
            <div>
              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${config.badgeBg}`}>
                {title || config.defaultTitle}
              </span>
              <h3 className="text-sm font-extrabold text-white mt-1">C2Talents Portal Notification</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-700/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Body */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 text-xs font-medium text-slate-200 leading-relaxed whitespace-pre-wrap relative z-10">
          {message}
        </div>

        {/* Action Button */}
        <div className="flex justify-end relative z-10">
          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-lg transition-all hover:scale-[1.02] cursor-pointer ${config.buttonBg}`}
          >
            Got it, Continue
          </button>
        </div>
      </div>
    </div>
  );
}
