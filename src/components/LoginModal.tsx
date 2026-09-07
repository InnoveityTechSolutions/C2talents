"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import {
  X,
  CheckCircle2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  Building2,
  GraduationCap,
  ArrowLeft,
} from "lucide-react";

interface LoginModalProps {
  triggerClassName?: string;
  triggerText?: string;
}

export function LoginModal({
  triggerClassName = "px-5 py-1.5 text-xs font-bold border border-indigo-900 text-indigo-900 hover:bg-indigo-50 rounded-xl transition-all h-9 inline-flex items-center justify-center cursor-pointer",
  triggerText = "Login",
}: LoginModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  // Google Prompt State
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  const { login, register, loginWithGoogle } = useAuth();
  const router = useRouter();

  const isEmailValid = email.trim().length > 3 && email.includes("@") && email.includes(".");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, "STUDENT");
      }
      setIsOpen(false);
      window.location.href = "/counselor";
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  async function executeGoogleAuth(targetEmail: string) {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle(targetEmail);
      setIsOpen(false);
      setShowGooglePrompt(false);
      setShowCustomGoogleInput(false);
      window.location.href = "/counselor";
    } catch (err: any) {
      setError(err.message || "Google authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCustomGoogleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (customGoogleEmail.trim()) {
      await executeGoogleAuth(customGoogleEmail.trim());
    }
  }

  const modalContent = isOpen && (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 font-sans selection:bg-purple-600 selection:text-white">
      {/* Backdrop with Blur */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={() => {
          setIsOpen(false);
          setShowGooglePrompt(false);
        }}
      />

      {/* 2-PANEL DIALOG CARD WITH ELEGANT SHADOW & ROUNDED CORNERS */}
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[94vh] overflow-hidden grid grid-cols-1 md:grid-cols-12 animate-in fade-in zoom-in-95 duration-200 my-auto border border-stone-200/80">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setShowGooglePrompt(false);
          }}
          className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-white md:bg-white/10 md:hover:bg-white/25 flex items-center justify-center transition-all cursor-pointer backdrop-blur-md border border-white/20"
          title="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT PANEL: AUTH FORM AREA */}
        <div className="md:col-span-7 p-6 sm:p-9 flex flex-col justify-between space-y-5 bg-white relative z-10 overflow-y-auto max-h-[88vh]">
          <div>
            {/* Header: Logo & Badge */}
            <div className="flex items-center justify-between mb-5">
              <img src="/logo.png" alt="C2Talents Logo" loading="lazy" decoding="async" className="h-10 w-auto object-contain" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100/80 shadow-2xs">
                Student & Partner Portal
              </span>
            </div>

            {/* ERROR BANNER */}
            {error && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold leading-relaxed flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <span className="text-sm shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* CONDITIONAL VIEW: GOOGLE ACCOUNT PROMPT VS STANDARD FORM */}
            {showGooglePrompt ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowGooglePrompt(false);
                    setError("");
                  }}
                  className="text-xs font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1.5 cursor-pointer mb-1 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-stone-500" />
                  <span>Back to standard login</span>
                </button>

                <div className="text-center space-y-2 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                  {/* Official Google G Logo */}
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-center mx-auto mb-1">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.98 1 12 1 7.35 1 3.37 3.65 1.43 7.54l3.87 3C6.24 7.62 8.91 5.04 12 5.04z" />
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.43c-.28 1.44-1.09 2.67-2.3 3.49l3.86 3c2.26-2.09 3.5-5.17 3.5-8.64z" />
                      <path fill="#FBBC05" d="M5.3 14.54c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3l-3.87-3C.56 8.78 0 10.33 0 12s.56 3.22 1.43 5.06l3.87-3z" />
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.86-3c-1.08.72-2.48 1.16-4.1 1.16-3.09 0-5.76-2.58-6.7-5.5l-3.87 3C3.37 20.35 7.35 23 12 23z" />
                    </svg>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">Sign in with Google</h3>
                  <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
                    Enter your official Gmail or Google account email to authenticate with C2Talents
                  </p>
                </div>

                {/* Primary Email Input Form */}
                <form onSubmit={handleCustomGoogleSubmit} className="space-y-3.5 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Your Gmail / Google Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. yourname@gmail.com"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-slate-50/80 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 font-medium transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !customGoogleEmail.trim()}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 hover:from-purple-800 hover:to-indigo-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-900/20 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>AUTHENTICATING WITH GOOGLE...</span>
                      </>
                    ) : (
                      <span>CONTINUE WITH GOOGLE →</span>
                    )}
                  </button>
                </form>

                {/* Quick One-Tap Suggestions */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Or select a quick account:
                  </span>
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setCustomGoogleEmail("praveen.natarajan.in@gmail.com");
                        executeGoogleAuth("praveen.natarajan.in@gmail.com");
                      }}
                      className="w-full p-3 border border-slate-200/80 rounded-2xl hover:bg-purple-50/50 hover:border-purple-300 transition-all text-left flex items-center justify-between cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-700 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                          P
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors">Praveen Natarajan</p>
                          <p className="text-[11px] text-slate-500 font-medium">praveen.natarajan.in@gmail.com</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-400 group-hover:text-purple-700 transition-colors">
                        Sign in →
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Welcome Title */}
                <div className="space-y-1 mb-5">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {mode === "login" ? "Welcome back" : "Create your account"}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    {mode === "login" 
                      ? "Enter your credentials to access your personalized AI counselor."
                      : "Sign up today to explore 250+ top accredited colleges."}
                  </p>
                </div>

                {/* Auth Form */}
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* Username / Email */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1.5 tracking-wider">
                      Username / Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@example.com"
                        className={`w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50/80 border text-xs text-slate-900 focus:outline-none focus:bg-white font-medium transition-all ${
                          isEmailValid
                            ? "border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                            : "border-slate-200 focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10"
                        }`}
                      />
                      {isEmailValid && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3.5 top-1/2 -translate-y-1/2 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1.5 tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-50/80 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 font-medium transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-2 font-semibold text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded-md border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                      />
                      <span>Remember me</span>
                    </label>

                    <a href="#" className="font-extrabold text-purple-700 hover:text-purple-900 hover:underline transition-colors">
                      Forgot Password?
                    </a>
                  </div>

                  {/* PRIMARY LOGIN BUTTON */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 hover:from-purple-800 hover:to-indigo-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-900/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>AUTHENTICATING...</span>
                      </>
                    ) : (
                      <span>{mode === "login" ? "LOG IN TO ACCOUNT" : "CREATE FREE ACCOUNT"}</span>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative my-3 flex items-center justify-center">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-3 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider shrink-0 absolute">
                      or
                    </span>
                  </div>

                  {/* GOOGLE AUTHENTICATION BUTTON */}
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "644367989078-o33a0omdes99lofgq6smo0odf2d81b6b.apps.googleusercontent.com";
                      if (googleClientId && !googleClientId.includes("paste_your")) {
                        const redirectUri = encodeURIComponent(
                          window.location.origin + "/api/auth/callback/google"
                        );
                        const targetUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${googleClientId}&redirect_uri=${redirectUri}&scope=openid%20profile%20email&prompt=select_account`;
                        window.location.href = targetUrl;
                      } else {
                        executeGoogleAuth("praveen.natarajan.in@gmail.com");
                      }
                    }}
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs border border-slate-200/90 flex items-center justify-center gap-3 transition-all shadow-xs hover:shadow-sm cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.98 1 12 1 7.35 1 3.37 3.65 1.43 7.54l3.87 3C6.24 7.62 8.91 5.04 12 5.04z" />
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.43c-.28 1.44-1.09 2.67-2.3 3.49l3.86 3c2.26-2.09 3.5-5.17 3.5-8.64z" />
                      <path fill="#FBBC05" d="M5.3 14.54c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3l-3.87-3C.56 8.78 0 10.33 0 12s.56 3.22 1.43 5.06l3.87-3z" />
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.86-3c-1.08.72-2.48 1.16-4.1 1.16-3.09 0-5.76-2.58-6.7-5.5l-3.87 3C3.37 20.35 7.35 23 12 23z" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  {/* Switch Sign Up / Login */}
                  <div className="text-center pt-2 text-xs font-semibold text-slate-500">
                    {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() => setMode(mode === "login" ? "signup" : "login")}
                      className="font-extrabold text-purple-700 hover:text-purple-900 hover:underline cursor-pointer transition-colors"
                    >
                      {mode === "login" ? "Sign up now" : "Log in here"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Footer Links */}
          <div className="pt-4 text-center text-[11px] font-semibold text-slate-400 border-t border-slate-100 flex items-center justify-center gap-3">
            <a href="#" className="hover:text-slate-700 transition-colors">FAQ</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-700 transition-colors">Features</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-700 transition-colors">Support & Help</a>
          </div>
        </div>

        {/* RIGHT PANEL: ROYAL DARK PURPLE BRANDING & FEATURE PANEL */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#0e0622] via-[#1b0c3a] to-[#2e135b] p-6 sm:p-9 text-white flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Ambient Glowing Spheres */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Content */}
          <div className="space-y-6 relative z-20">
            <div className="flex items-center gap-2 bg-amber-400/15 text-amber-300 px-3.5 py-1.5 rounded-full border border-amber-400/25 text-[10px] font-extrabold uppercase tracking-wider w-fit shadow-xs backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> AI Education Portal
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                About C2Talents
              </h3>
              <p className="text-xs text-purple-200/90 leading-relaxed font-medium">
                India&apos;s leading AI-guided platform connecting students with top accredited engineering & autonomous colleges.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3 pt-1">
              <h4 className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider">
                Platform Highlights
              </h4>
              <div className="space-y-2.5">
                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">AI Matching Engine</p>
                    <p className="text-[11px] text-purple-200/70 font-medium leading-tight">Smart college predictor & fee estimator</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Verified Reviews & CTC</p>
                    <p className="text-[11px] text-purple-200/70 font-medium leading-tight">100% genuine campus placement statistics</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-purple-400/20 border border-purple-400/30 flex items-center justify-center shrink-0 mt-0.5">
                    <GraduationCap className="w-3.5 h-3.5 text-purple-300" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Direct Admission Tracker</p>
                    <p className="text-[11px] text-purple-200/70 font-medium leading-tight">Seamless seat booking & application manager</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Stats Cards */}
          <div className="relative z-20 pt-4 border-t border-purple-800/40 grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/15 flex items-center justify-center text-amber-300 font-bold shrink-0">
                <GraduationCap className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <p className="text-xs font-black text-white">25k+</p>
                <p className="text-[10px] text-purple-200/70 font-medium">Students</p>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/15 flex items-center justify-center text-amber-300 font-bold shrink-0">
                <Building2 className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <p className="text-xs font-black text-white">250+</p>
                <p className="text-[10px] text-purple-200/70 font-medium">Colleges</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        suppressHydrationWarning
        onClick={() => setIsOpen(true)}
        className={triggerClassName}
      >
        {triggerText}
      </button>
      {mounted && typeof document !== "undefined" ? createPortal(modalContent, document.body) : null}
    </>
  );
}
