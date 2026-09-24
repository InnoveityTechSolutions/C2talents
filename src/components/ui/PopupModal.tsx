"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted) return null;

  const typeConfig = {
    success: {
      iconWrapper: "bg-emerald-50 text-emerald-600 border-emerald-200/80 shadow-emerald-500/10",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: icon || <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      button:
        "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-500/20",
      defaultTitle: "Success",
    },
    error: {
      iconWrapper: "bg-rose-50 text-rose-600 border-rose-200/80 shadow-rose-500/10",
      badge: "bg-rose-50 text-rose-700 border-rose-200",
      icon: icon || <XCircle className="w-5 h-5 text-rose-600" />,
      button: "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20",
      defaultTitle: "Action Failed",
    },
    warning: {
      iconWrapper: "bg-amber-50 text-amber-600 border-amber-200/80 shadow-amber-500/10",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      icon: icon || <AlertTriangle className="w-5 h-5 text-amber-600" />,
      button:
        "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-amber-500/20",
      defaultTitle: "Attention Required",
    },
    info: {
      iconWrapper: "bg-purple-50 text-purple-700 border-purple-200/80 shadow-purple-500/10",
      badge: "bg-purple-50 text-purple-700 border-purple-200",
      icon: icon || <Info className="w-5 h-5 text-purple-600" />,
      button:
        "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-600/20",
      defaultTitle: "Portal Notice",
    },
  };

  const config = typeConfig[type];

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs font-sans">
          {/* Backdrop click listener */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.25, bounce: 0.15 }}
            className="w-full max-w-md bg-white text-slate-900 border border-slate-200/90 rounded-3xl p-6 shadow-2xl relative space-y-5 overflow-hidden mx-auto z-10"
          >
            {/* Ambient subtle brand decorative glow */}
            <div className="absolute -top-20 -right-20 w-44 h-44 bg-gradient-to-br from-orange-500/10 to-purple-600/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header with C2Talents Logo */}
            <div className="flex items-start justify-between gap-3 relative z-10 border-b border-slate-100/90 pb-3.5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs ${config.iconWrapper}`}
                >
                  {config.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <img
                      src="/logo.png"
                      alt="C2Talents Logo"
                      className="h-5 w-auto object-contain"
                    />
                    <span
                      className={`text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border inline-block ${config.badge}`}
                    >
                      {title || config.defaultTitle}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-500 mt-0.5 tracking-tight">
                    Portal Notification
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer border border-slate-200/60 shrink-0"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Body */}
            <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap relative z-10 shadow-2xs">
              {message}
            </div>

            {/* Action Button */}
            <div className="flex justify-end relative z-10 pt-1">
              <button
                onClick={onClose}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${config.button}`}
              >
                Got it, Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
