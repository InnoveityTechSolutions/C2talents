"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import {
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

export default function StandaloneLoginPage() {
  const router = useRouter();
  const { login, register, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Google Prompt State
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState("");
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  const isEmailValid = email.trim().length > 3 && email.includes("@") && email.includes(".");

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

  return (
    <div className="min-h-screen bg-[#f8fafd] flex items-center justify-center p-4 sm:p-8 font-sans selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Ambient background soft glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />

      {/* MAIN 2-PANEL CONTAINER (GOOGLE CARD DESIGN) */}
      <div className="w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px] border border-stone-200/80 my-auto relative z-10">
        
        {/* LEFT PANEL: FORM / GOOGLE AUTH AREA */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6 bg-white relative z-10">
          <div>
            {/* Header: Logo & Badge */}
            <div className="flex items-center justify-between mb-6">
              <Link href="/">
                <img src="/logo.png" alt="C2Talents Logo" loading="lazy" decoding="async" className="h-9 w-auto object-contain" />
              </Link>

              <span className="text-[11px] font-medium tracking-wide text-[#1a73e8] bg-blue-50/80 px-3.5 py-1 rounded-full border border-blue-100 shadow-2xs">
                User Portal
              </span>
            </div>

            {/* ERROR BANNER */}
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl bg-[#fdeded] border border-[#f5c2c2] text-[#5f2120] text-xs font-medium leading-relaxed flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1">
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
                    setShowCustomGoogleInput(false);
                    setError("");
                  }}
                  className="text-xs font-medium text-[#444746] hover:text-[#1f1f1f] flex items-center gap-1.5 cursor-pointer mb-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-[#747775]" />
                  <span>Back to standard login</span>
                </button>

                <div className="text-center space-y-2 bg-[#f8fafd] p-6 rounded-[24px] border border-stone-200/80 shadow-2xs">
                  <div className="w-12 h-12 bg-white rounded-full shadow-xs border border-stone-200/80 flex items-center justify-center mx-auto mb-1">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.98 1 12 1 7.35 1 3.37 3.65 1.43 7.54l3.87 3C6.24 7.62 8.91 5.04 12 5.04z" />
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.43c-.28 1.44-1.09 2.67-2.3 3.49l3.86 3c2.26-2.09 3.5-5.17 3.5-8.64z" />
                      <path fill="#FBBC05" d="M5.3 14.54c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3l-3.87-3C.56 8.78 0 10.33 0 12s.56 3.22 1.43 5.06l3.87-3z" />
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.86-3c-1.08.72-2.48 1.16-4.1 1.16-3.09 0-5.76-2.58-6.7-5.5l-3.87 3C3.37 20.35 7.35 23 12 23z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-normal text-[#1f1f1f]">Sign in with Google</h2>
                  <p className="text-xs text-[#444746] font-normal max-w-xs mx-auto">
                    Select an email account to authenticate with C2Talents
                  </p>
                </div>

                {showCustomGoogleInput ? (
                  <form onSubmit={handleCustomGoogleSubmit} className="space-y-4 pt-1">
                    <div>
                      <label className="block text-sm font-medium text-[#1f1f1f] mb-2">
                        Enter your Gmail / Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="yourname@gmail.com"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        className="w-full pl-5 pr-4 py-3.5 rounded-full bg-white border border-[#747775]/50 hover:border-[#1f1f1f] text-sm text-[#1f1f1f] placeholder:text-[#8e918f] focus:outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-blue-100 font-normal transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#0b57d0] text-white font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>AUTHENTICATING...</span>
                        </>
                      ) : (
                        <span>AUTHENTICATE & CONTINUE</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowCustomGoogleInput(false)}
                      className="w-full text-xs font-medium text-[#1a73e8] hover:underline text-center cursor-pointer pt-1"
                    >
                      Back to saved account list
                    </button>
                  </form>
                ) : (
                  <div className="space-y-2.5 pt-1">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => executeGoogleAuth("praveen.natarajan.in@gmail.com")}
                      className="w-full p-3.5 border border-stone-200/80 rounded-full hover:bg-[#f8fafd] hover:border-[#1a73e8] transition-all text-left flex items-center justify-between cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                          P
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[#1f1f1f] group-hover:text-[#1a73e8] transition-colors">Praveen Natarajan</p>
                          <p className="text-[11px] text-[#747775]">praveen.natarajan.in@gmail.com</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-[#1a73e8] group-hover:underline">
                        Sign in →
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => executeGoogleAuth("student@c2talents.com")}
                      className="w-full p-3.5 border border-stone-200/80 rounded-full hover:bg-[#f8fafd] hover:border-[#1a73e8] transition-all text-left flex items-center justify-between cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                          S
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[#1f1f1f] group-hover:text-[#1a73e8] transition-colors">Student Account</p>
                          <p className="text-[11px] text-[#747775]">student@c2talents.com</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-[#1a73e8] group-hover:underline">
                        Sign in →
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowCustomGoogleInput(true)}
                      className="w-full py-3 px-4 border border-dashed border-stone-300 rounded-full text-center text-xs font-medium text-[#444746] hover:bg-[#f8fafd] transition-all cursor-pointer"
                    >
                      + Use another Gmail / Email account
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Welcome Title (Clean Google Careers Styling) */}
                <div className="space-y-1.5 mb-6">
                  <h1 className="text-3xl sm:text-[32px] font-normal text-[#1f1f1f] tracking-tight leading-tight">
                    {mode === "login" ? "Welcome back" : "Create your account"}
                  </h1>
                  <p className="text-sm text-[#444746] font-normal leading-relaxed">
                    {mode === "login" 
                      ? "Enter your credentials to access your personalized AI counselor."
                      : "Sign up today to explore 250+ top accredited colleges."}
                  </p>
                </div>

                {/* Auth Form with Pill Outline Inputs & Vibrant Action Button */}
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* Username / Email */}
                  <div>
                    <label className="block text-sm font-medium text-[#1f1f1f] mb-1.5">
                      Username / Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#747775] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@example.com"
                        className={`w-full pl-11 pr-11 py-3.5 rounded-full bg-white border text-sm text-[#1f1f1f] placeholder:text-[#8e918f] font-normal focus:outline-none transition-all ${
                          isEmailValid
                            ? "border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            : "border-[#747775]/50 hover:border-[#1f1f1f] focus:border-[#1a73e8] focus:ring-2 focus:ring-blue-100"
                        }`}
                      />
                      {isEmailValid && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-4 top-1/2 -translate-y-1/2 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-[#1f1f1f] mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#747775] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-11 pr-11 py-3.5 rounded-full bg-white border border-[#747775]/50 hover:border-[#1f1f1f] text-sm text-[#1f1f1f] placeholder:text-[#8e918f] focus:outline-none focus:border-[#1a73e8] focus:ring-2 focus:ring-blue-100 font-normal transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#747775] hover:text-[#1f1f1f] transition-colors cursor-pointer p-1"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me & Forgot Password */}
                  <div className="flex items-center justify-between text-sm pt-1">
                    <label className="flex items-center gap-2 text-[#444746] font-normal cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded-md border-stone-300 text-[#1a73e8] focus:ring-[#1a73e8] cursor-pointer accent-[#1a73e8]"
                      />
                      <span>Remember me</span>
                    </label>

                    <a href="#" className="font-medium text-[#1a73e8] hover:text-[#1557b0] hover:underline transition-colors">
                      Forgot Password?
                    </a>
                  </div>

                  {/* Actions Row: Submit Button (Vibrant Blue Pill Style as in Reference Image) */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-8 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#0b57d0] text-white font-medium text-sm tracking-normal transition-all duration-150 shadow-sm hover:shadow active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                  </div>

                  {/* Divider */}
                  <div className="relative my-4 flex items-center justify-center">
                    <div className="border-t border-stone-200 w-full" />
                    <span className="bg-white px-3 text-xs text-[#747775] font-normal tracking-wide shrink-0 absolute">
                      or
                    </span>
                  </div>

                  {/* GOOGLE AUTHENTICATION BUTTON (Pill Design) */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowGooglePrompt(true);
                      setError("");
                    }}
                    disabled={loading}
                    className="w-full py-3.5 px-5 rounded-full bg-white hover:bg-[#f8fafd] text-[#1f1f1f] font-medium text-sm border border-[#747775]/40 hover:border-[#747775] flex items-center justify-center gap-3 transition-all shadow-2xs cursor-pointer"
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
                  <div className="text-center pt-2 text-sm font-normal text-[#444746]">
                    {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() => setMode(mode === "login" ? "signup" : "login")}
                      className="font-medium text-[#1a73e8] hover:text-[#1557b0] hover:underline cursor-pointer transition-colors"
                    >
                      {mode === "login" ? "Sign up now" : "Log in here"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Footer Links */}
          <div className="pt-4 text-center text-xs font-normal text-[#747775] border-t border-stone-100 flex items-center justify-center gap-3">
            <a href="#" className="hover:text-[#1f1f1f] transition-colors">FAQ</a>
            <span>•</span>
            <a href="#" className="hover:text-[#1f1f1f] transition-colors">Features</a>
            <span>•</span>
            <a href="#" className="hover:text-[#1f1f1f] transition-colors">Support & Help</a>
          </div>
        </div>

        {/* RIGHT PANEL: ROYAL DARK INDIGO/NAVY BRANDING & FEATURE PANEL */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#0c1024] via-[#151b3d] to-[#25124b] p-6 sm:p-9 text-white flex flex-col justify-between relative overflow-hidden">
          
          {/* Subtle Ambient Glowing Spheres */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          {/* Content */}
          <div className="space-y-6 relative z-20">
            <div className="flex items-center gap-2 bg-white/10 text-amber-300 px-3.5 py-1.5 rounded-full border border-white/15 text-[11px] font-semibold tracking-wide w-fit shadow-xs backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> AI Education Portal
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight leading-tight">
                About C2Talents
              </h2>
              <p className="text-xs sm:text-[13px] text-stone-300 leading-relaxed font-normal">
                India&apos;s leading AI-guided platform connecting students with top accredited engineering & autonomous colleges.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3 pt-1">
              <h3 className="text-[11px] font-bold text-amber-300/90 uppercase tracking-wider">
                Platform Highlights
              </h3>
              <div className="space-y-2.5">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">AI Matching Engine</p>
                    <p className="text-[11px] text-stone-300/80 font-normal leading-tight mt-0.5">Smart college predictor & fee estimator</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Verified Reviews & CTC</p>
                    <p className="text-[11px] text-stone-300/80 font-normal leading-tight mt-0.5">100% genuine campus placement statistics</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-400/20 border border-blue-400/30 flex items-center justify-center shrink-0 mt-0.5">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Scholarships & Cutoff Alerts</p>
                    <p className="text-[11px] text-stone-300/80 font-normal leading-tight mt-0.5">Real-time updates on eligibility & deadlines</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Stats Cards */}
          <div className="relative z-20 pt-4 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-400/15 flex items-center justify-center text-amber-300 font-bold shrink-0">
                <GraduationCap className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">25k+</p>
                <p className="text-[11px] text-stone-300 font-normal">Students</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-400/15 flex items-center justify-center text-blue-300 font-bold shrink-0">
                <Building2 className="w-4 h-4 text-blue-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">250+</p>
                <p className="text-[11px] text-stone-300 font-normal">Colleges</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
