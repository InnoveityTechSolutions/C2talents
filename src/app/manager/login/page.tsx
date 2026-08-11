"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Lock, Mail, ShieldCheck, ArrowRight,
  Loader2, AlertCircle, Sparkles, Zap, CheckCircle2, Eye, EyeOff
} from "lucide-react";

export default function StandaloneManagerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("superadmin@c2talents.com");
  const [password, setPassword] = useState("Admin@123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        window.location.href = "/manager/dashboard";
      } else {
        setError(data.error || "Invalid login credentials.");
      }
    } catch (err: any) {
      setError("Network connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleAutoFill() {
    setEmail("superadmin@c2talents.com");
    setPassword("Admin@123");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[#F8FAFC] flex items-center justify-center p-6 sm:p-10 font-sans text-[#111827] overflow-hidden selection:bg-[#6D28D9] selection:text-white">
      
      {/* Background Soft Radial Glows */}
      <div className="absolute top-10 left-1/3 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/3 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* DUAL-LAYER OFFSET CARD FRAME */}
      <div className="relative w-full max-w-5xl max-h-[92vh] sm:max-h-[660px] flex items-center justify-center">
        
        {/* 1. BACKDROP SOLID COLOR PANEL */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4C1D95] via-[#6D28D9] to-[#311075] rounded-tl-[54px] rounded-br-[54px] rounded-tr-[24px] rounded-bl-[24px] shadow-2xl transform translate-x-5 translate-y-5 sm:translate-x-8 sm:translate-y-8" />

        {/* 2. FOREGROUND CARD */}
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full bg-white border border-slate-200/90 rounded-[32px] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 z-10"
        >

          {/* LEFT COLUMN: Form Container */}
          <div className="md:col-span-6 p-7 sm:p-9 flex flex-col justify-between space-y-4.5 bg-white overflow-y-auto">
            
            {/* Header */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#6D28D9] via-indigo-600 to-[#8B5CF6] text-white flex items-center justify-center shadow-md shadow-purple-500/25 shrink-0">
                  <GraduationCap className="w-5.5 h-5.5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D28D9] bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100 inline-flex items-center gap-1">
                    <Zap className="w-3 h-3 text-[#8B5CF6]" /> Enterprise Portal
                  </span>
                  <h1 className="text-xl font-bold text-[#111827] tracking-tight">Admin Portal Manager</h1>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Protected Management Access & Enterprise Engine
              </p>
            </div>

            {/* 2-Column Aligned Credential Card */}
            <div className="bg-gradient-to-r from-purple-50/70 via-indigo-50/30 to-slate-50/70 p-3.5 rounded-2xl border border-purple-100/90 text-xs space-y-2 hover:border-purple-200 transition-colors shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Default Credentials
                </span>
                
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="h-6.5 bg-white hover:bg-purple-50 text-[#6D28D9] text-[10.5px] font-bold px-2.5 rounded-xl border border-purple-200 transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Filled</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Auto Fill</span>
                    </>
                  )}
                </button>
              </div>

              {/* Email & Password Display */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-700 bg-white p-2.5 rounded-xl border border-purple-100/60 shadow-2xs">
                <div>
                  <div className="text-[9px] uppercase font-sans font-semibold text-slate-400">Email</div>
                  <div className="font-semibold text-slate-900 truncate" title={email}>{email}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase font-sans font-semibold text-slate-400">Password</div>
                  <div className="font-semibold text-slate-900">{password}</div>
                </div>
              </div>
            </div>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Controls */}
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="superadmin@c2talents.com"
                    required
                    className="w-full h-10.5 bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#6D28D9] font-medium transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full h-10.5 bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#6D28D9] font-medium transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-700 transition-colors p-1 rounded-md focus:outline-none cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-purple-700" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-[#6D28D9] via-indigo-900 to-purple-800 hover:from-purple-800 hover:to-indigo-950 text-white font-semibold rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-purple-300" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin Portal</span>
                    <ArrowRight className="w-4 h-4 text-purple-300" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer Single Line Alignment */}
            <div className="pt-2 text-[11px] text-slate-400 font-mono border-t border-slate-100 flex items-center justify-between">
              <span>C2Talents Admin Engine</span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> System Ready
              </span>
            </div>

          </div>

          {/* RIGHT COLUMN: Flat 2D Vector Workspace with Website Logo Embedded inside both Laptop Screen AND Mobile Screen */}
          <div className="md:col-span-6 bg-white border-t md:border-t-0 md:border-l border-slate-200/70 p-6 sm:p-8 flex items-center justify-center relative overflow-hidden">
            <div className="w-full max-w-lg flex items-center justify-center">
              
              <svg viewBox="0 0 740 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-h-[500px]">
                <defs>
                  {/* Laptop Screen Strict Clip Path */}
                  <clipPath id="laptopScreenClipPath">
                    <rect x="298" y="113" width="144" height="79" rx="6" />
                  </clipPath>

                  {/* Mobile Screen Strict Clip Path */}
                  <clipPath id="mobileScreenClipPath">
                    <rect x="7" y="14" width="56" height="102" rx="4" />
                  </clipPath>
                </defs>

                {/* 1. LEFT SIDE: STACK OF PAPERS */}
                <g transform="translate(25, 60) rotate(-16)">
                  <rect x="-8" y="8" width="130" height="175" rx="3" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1" />
                  <rect x="-4" y="4" width="130" height="175" rx="3" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1" />
                  <rect x="0" y="0" width="130" height="175" rx="3" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
                  
                  {/* Lined Document Text */}
                  <line x1="22" y1="28" x2="108" y2="28" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="22" y1="44" x2="112" y2="44" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
                  <line x1="22" y1="60" x2="96" y2="60" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
                  <line x1="22" y1="76" x2="106" y2="76" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
                  <line x1="22" y1="92" x2="88" y2="92" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
                  <line x1="22" y1="108" x2="102" y2="108" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
                  <line x1="22" y1="124" x2="92" y2="124" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
                  <line x1="22" y1="140" x2="72" y2="140" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
                </g>

                {/* Red Pencil & Blue Pen lying diagonally on paper stack */}
                <g transform="translate(118, 85) rotate(16)">
                  <rect x="0" y="0" width="7" height="115" rx="1.5" fill="#EF4444" />
                  <rect x="0" y="0" width="7" height="15" fill="#374151" />
                  <polygon points="0,115 7,115 3.5,128" fill="#F59E0B" />
                  <polygon points="2,122 5,122 3.5,128" fill="#1F2937" />
                </g>
                <g transform="translate(133, 88) rotate(10)">
                  <rect x="0" y="0" width="8" height="120" rx="2" fill="#0284C7" />
                  <rect x="1" y="8" width="6" height="22" rx="1" fill="#0369A1" />
                  <polygon points="0,120 8,120 4,133" fill="#0F172A" />
                </g>

                {/* Smartphone lying flat below papers with WEBSITE LOGO EMBEDDED INSIDE SCREEN */}
                <g transform="translate(135, 235) rotate(-22)">
                  <rect x="0" y="0" width="70" height="130" rx="12" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="3" />
                  
                  {/* Mobile Display Area Base */}
                  <rect x="7" y="14" width="56" height="102" rx="4" fill="#FFFFFF" />

                  {/* EMBEDDED CONTENT INSIDE MOBILE SCREEN (STRICTLY CLIPPED) */}
                  <g clipPath="url(#mobileScreenClipPath)">
                    {/* Screen Background */}
                    <rect x="7" y="14" width="56" height="102" fill="#FFFFFF" />
                    
                    {/* Mobile Header Bar */}
                    <rect x="7" y="14" width="56" height="10" fill="#F1F5F9" />

                    {/* WEBSITE LOGO IMAGE EMBEDDED INSIDE MOBILE SCREEN */}
                    <image
                      href="/logo.png"
                      x="10"
                      y="30"
                      width="50"
                      height="65"
                      preserveAspectRatio="xMidYMid contain"
                    />
                  </g>

                  {/* Top Speaker Notch */}
                  <ellipse cx="35" cy="7" rx="7" ry="2" fill="#9CA3AF" />
                </g>

                {/* 2. CENTER: OPEN LAPTOP WITH PAPER SHEET PEEKING FROM TOP SCREEN */}
                {/* ANIMATED PRINTING PAPER SHEET SLIDING UPWARD */}
                <g transform="translate(305, 15)">
                  <rect x="0" y="0" width="130" height="70" rx="4" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1" />
                  
                  <motion.g
                    animate={{ y: [0, -12, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  >
                    <rect x="10" y="30" width="110" height="145" rx="6" fill="#FFFFFF" stroke="#D1D5DB" strokeWidth="1.5" />
                    <line x1="28" y1="65" x2="102" y2="65" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="28" y1="80" x2="102" y2="80" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
                    <line x1="28" y1="95" x2="88" y2="95" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
                    <line x1="28" y1="110" x2="92" y2="110" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
                    <line x1="28" y1="125" x2="75" y2="125" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" />
                  </motion.g>
                </g>

                {/* Laptop Screen Outer Dark Bezel */}
                <rect x="290" y="105" width="160" height="95" rx="10" fill="#1F2937" />

                {/* Laptop Screen Display Area Base */}
                <rect x="298" y="113" width="144" height="79" rx="6" fill="#FFFFFF" />

                {/* EMBEDDED CONTENT INSIDE LAPTOP SCREEN (STRICTLY CLIPPED) */}
                <g clipPath="url(#laptopScreenClipPath)">
                  {/* Clean Screen Background */}
                  <rect x="298" y="113" width="144" height="79" fill="#FFFFFF" />
                  
                  {/* Top Address Bar */}
                  <rect x="298" y="113" width="144" height="14" fill="#F1F5F9" />
                  <circle cx="304" cy="120" r="2" fill="#EF4444" />
                  <circle cx="310" cy="120" r="2" fill="#F59E0B" />
                  <circle cx="316" cy="120" r="2" fill="#10B981" />
                  <rect x="325" y="116" width="110" height="8" rx="2" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.5" />

                  {/* WEBSITE LOGO IMAGE EMBEDDED INSIDE LAPTOP SCREEN */}
                  <image
                    href="/logo.png"
                    x="308"
                    y="129"
                    width="124"
                    height="58"
                    preserveAspectRatio="xMidYMid contain"
                  />
                </g>

                {/* Laptop White Base Body */}
                <rect x="275" y="190" width="190" height="140" rx="14" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="2" />
                
                {/* Keyboard Dark Deck */}
                <rect x="287" y="200" width="166" height="70" rx="6" fill="#1F2937" />

                {/* Keycaps Grid */}
                <g transform="translate(292, 205)">
                  {Array.from({ length: 4 }).map((_, r) => (
                    <g key={r} transform={`translate(0, ${r * 15})`}>
                      {Array.from({ length: 11 }).map((_, c) => (
                        <rect key={c} x={c * 14} y="0" width="11" height="11" rx="2.5" fill="#FFFFFF" />
                      ))}
                    </g>
                  ))}
                </g>

                {/* Trackpad */}
                <rect x="345" y="280" width="50" height="25" rx="4" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="1" />

                {/* 3. RIGHT SIDE: COFFEE CUP */}
                <g transform="translate(540, 105)">
                  <motion.circle
                    cx="35" cy="35" r="42"
                    fill="#D1FAE5"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.9, 0.5] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    style={{ transformOrigin: "35px 35px" }}
                  />
                  <circle cx="35" cy="35" r="32" fill="#FFFFFF" stroke="#E5E7EB" strokeWidth="2" />
                  <circle cx="35" cy="35" r="23" fill="#4A2E16" />
                  <ellipse cx="30" cy="28" rx="5" ry="2.5" fill="#653818" />

                  <motion.path
                    d="M 30 15 Q 34 5 30 -8"
                    stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" fill="none"
                    animate={{ y: [0, -10, -20], opacity: [0, 0.7, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut" }}
                  />
                  <motion.path
                    d="M 40 18 Q 44 8 40 -5"
                    stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" fill="none"
                    animate={{ y: [0, -10, -20], opacity: [0, 0.7, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut", delay: 0.8 }}
                  />
                </g>

                {/* EYEGLASSES */}
                <g transform="translate(500, 235)">
                  <circle cx="22" cy="20" r="18" fill="none" stroke="#1F2937" strokeWidth="3" />
                  <circle cx="68" cy="20" r="18" fill="none" stroke="#1F2937" strokeWidth="3" />
                  <path d="M 40 20 Q 45 13 50 20" stroke="#1F2937" strokeWidth="3" fill="none" />
                  <line x1="4" y1="18" x2="-18" y2="10" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
                  <line x1="86" y1="18" x2="108" y2="10" stroke="#1F2937" strokeWidth="3" strokeLinecap="round" />
                </g>
              </svg>

            </div>
          </div>

        </motion.div>
      </div>

    </div>
  );
}
