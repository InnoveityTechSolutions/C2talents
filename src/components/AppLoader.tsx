"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AppLoaderProps {
  message?: string;
  submessage?: string;
  fullScreen?: boolean;
  className?: string;
}

const DEFAULT_LOADING_MESSAGES = [
  "Preparing Dashboard...",
  "Loading Workspace...",
  "Synchronizing Data...",
  "Fetching Configuration...",
  "Loading Colleges...",
  "Initializing Platform...",
  "Connecting Secure Services...",
  "Verifying Session...",
  "Checking Permissions...",
  "Loading Analytics...",
];

export function AppLoader({
  message,
  submessage = "Preparing your workspace...",
  fullScreen = true,
  className = "",
}: AppLoaderProps) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (message) return; // Don't rotate if fixed message is passed

    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % DEFAULT_LOADING_MESSAGES.length);
    }, 2400);

    return () => clearInterval(interval);
  }, [message]);

  const activeMessage = message || DEFAULT_LOADING_MESSAGES[msgIndex];

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative flex flex-col items-center justify-center font-sans select-none overflow-hidden ${
        fullScreen ? "fixed inset-0 z-[99999] w-screen h-screen bg-[#FFFFFF]" : "w-full py-16 bg-white"
      } ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Loading C2Talents Platform"
    >
      <style>{`
        @keyframes appleProgressSweep {
          0% {
            transform: translateX(-120%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(320%);
          }
        }

        .animate-apple-progress {
          animation: appleProgressSweep 1.8s cubic-bezier(0.65, 0, 0.35, 1) infinite;
          will-change: transform;
        }

        @keyframes subtleLogoBreathing {
          0%, 100% {
            transform: translateY(0px) scale(1);
            filter: drop-shadow(0 10px 20px rgba(109, 40, 217, 0.15));
          }
          50% {
            transform: translateY(-3px) scale(1.02);
            filter: drop-shadow(0 16px 28px rgba(109, 40, 217, 0.25));
          }
        }

        .animate-logo-float {
          animation: subtleLogoBreathing 3.6s ease-in-out infinite;
          will-change: transform, filter;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-apple-progress,
          .animate-logo-float {
            animation: none !important;
          }
        }
      `}</style>

      {/* SUBTLE LUXURY BACKGROUND MESH (Apple & Stripe style) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-purple-500/5 via-indigo-500/5 to-pink-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-purple-400/4 rounded-full blur-3xl pointer-events-none" />

      {/* CENTER CONTENT CONTAINER */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">
        
        {/* LOGO WITH LUXURY SCALING & BREATHING GLOW */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-5"
        >
          <div className="animate-logo-float flex items-center justify-center p-3 rounded-3xl bg-white/80 backdrop-blur-md border border-slate-100 shadow-xl shadow-purple-950/5">
            <img
              src="/logo.png"
              alt="C2Talents Logo"
              className="h-20 w-auto object-contain pointer-events-none"
              style={{ width: "auto", height: "80px" }}
            />
          </div>
        </motion.div>

        {/* BRAND TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-xl font-extrabold tracking-tight text-slate-900 leading-none"
        >
          C2Talents
        </motion.h1>

        {/* SUBTITLE */}
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="text-xs font-semibold text-slate-400 tracking-wide mt-1.5"
        >
          {submessage}
        </motion.p>

        {/* APPLE-STYLE THIN CONTINUOUS PROGRESS LINE TRACK */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-6 w-52 h-1.5 bg-slate-100/90 rounded-full overflow-hidden relative border border-slate-200/50 shadow-inner"
        >
          <div className="animate-apple-progress absolute top-0 bottom-0 left-0 w-[45%] rounded-full bg-gradient-to-r from-[#6D28D9] via-[#8B5CF6] to-[#EC4899] shadow-xs" />
        </motion.div>

        {/* ROTATING LOADING STATUS MESSAGES */}
        <div className="h-6 mt-4 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={activeMessage}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="text-[11.5px] font-bold text-purple-900/80 tracking-wider uppercase flex items-center gap-1.5 bg-purple-50/70 px-3 py-1 rounded-full border border-purple-100/80"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
              {activeMessage}
            </motion.span>
          </AnimatePresence>
        </div>

      </div>

      {/* ENTERPRISE FOOTER BRAND STATEMENT */}
      <div className="absolute bottom-8 text-[10.5px] text-slate-400 font-medium tracking-wide flex items-center gap-2">
        <span>C2Talents Enterprise Platform</span>
        <span className="text-slate-300">•</span>
        <span className="text-slate-400 font-semibold">Verified System</span>
      </div>

    </motion.div>
  );

  return content;
}
