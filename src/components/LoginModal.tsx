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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity"
        onClick={() => {
          setIsOpen(false);
          setShowGooglePrompt(false);
        }}
      />

      {/* 2-PANEL DIALOG CARD WITH CURVED EDGE */}
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[94vh] overflow-hidden grid grid-cols-1 md:grid-cols-12 animate-in fade-in zoom-in-95 my-auto border border-stone-200">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setShowGooglePrompt(false);
          }}
          className="absolute top-4 right-4 z-30 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors cursor-pointer backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT PANEL: FORM / GOOGLE AUTH AREA */}
        <div className="md:col-span-7 p-6 sm:p-9 flex flex-col justify-between space-y-4 bg-white relative z-10">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.png" alt="C2Talents Logo" loading="lazy" decoding="async" className="h-10 w-auto" />
            </div>

            {/* ERROR BANNER */}
            {error && (
              <div className="mb-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold leading-relaxed">
                ⚠️ {error}
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
                  className="text-xs font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1.5 cursor-pointer mb-1"
                >
                  <ArrowLeft className="w-4 h-4 text-stone-500" />
                  <span>Back to standard login</span>
                </button>

                <div className="text-center space-y-1.5 bg-stone-50/80 p-4 rounded-2xl border border-stone-200/80">
                  {/* Official Google G Logo */}
                  <svg className="w-8 h-8 mx-auto mb-1" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.98 1 12 1 7.35 1 3.37 3.65 1.43 7.54l3.87 3C6.24 7.62 8.91 5.04 12 5.04z" />
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.43c-.28 1.44-1.09 2.67-2.3 3.49l3.86 3c2.26-2.09 3.5-5.17 3.5-8.64z" />
                    <path fill="#FBBC05" d="M5.3 14.54c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3l-3.87-3C.56 8.78 0 10.33 0 12s.56 3.22 1.43 5.06l3.87-3z" />
                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.86-3c-1.08.72-2.48 1.16-4.1 1.16-3.09 0-5.76-2.58-6.7-5.5l-3.87 3C3.37 20.35 7.35 23 12 23z" />
                  </svg>
                  <h3 className="text-base font-black text-stone-900">Sign in with Google</h3>
                  <p className="text-xs text-stone-500 font-medium">
                    Enter your official Gmail or Google account email to authenticate
                  </p>
                </div>

                {/* Primary Email Input Form */}
                <form onSubmit={handleCustomGoogleSubmit} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-extrabold text-stone-700 mb-1">
                      Your Gmail / Google Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. yourname@gmail.com"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#3b2075] focus:ring-2 focus:ring-purple-500/10 font-bold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !customGoogleEmail.trim()}
                    className="w-full py-3 rounded-xl bg-[#3b2075] hover:bg-[#4c1d95] text-amber-300 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                        <span>AUTHENTICATING WITH GOOGLE...</span>
                      </>
                    ) : (
                      <span>CONTINUE WITH GOOGLE →</span>
                    )}
                  </button>
                </form>

                {/* Quick One-Tap Suggestions */}
                <div className="pt-2 border-t border-stone-200/80 space-y-2">
                  <span className="text-[10.5px] font-black text-stone-400 uppercase tracking-wider block">
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
                      className="w-full p-2.5 border border-stone-200 rounded-2xl hover:bg-stone-50 hover:border-purple-300 transition-all text-left flex items-center justify-between cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-purple-700 text-white font-bold flex items-center justify-center text-xs">
                          P
                        </div>
                        <div>
                          <p className="text-xs font-black text-stone-900 group-hover:text-[#3b2075]">Praveen Natarajan</p>
                          <p className="text-[10.5px] text-stone-500 font-medium">praveen.natarajan.in@gmail.com</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-stone-400 group-hover:text-[#3b2075]">
                        Sign in →
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Welcome Title */}
                <div className="space-y-0.5 mb-4">
                  <p className="text-xs font-semibold text-stone-400">
                    {mode === "login" ? "Welcome to" : "Create Account at"}
                  </p>
                  <h2 className="text-2xl font-black text-[#1f0c3d] tracking-tight">
                    c2talents
                  </h2>
                </div>

                {/* Auth Form */}
                <form onSubmit={handleFormSubmit} className="space-y-3">
                  {/* Username / Email */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-stone-400 mb-1 tracking-wider">
                      Username / Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@example.com"
                        className={`w-full p-2.5 pr-10 rounded-xl bg-stone-50 border text-xs text-stone-900 focus:outline-none font-medium transition-all ${
                          isEmailValid
                            ? "border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            : "border-stone-200 focus:border-[#3b2075] focus:ring-2 focus:ring-[#3b2075]/10"
                        }`}
                      />
                      {isEmailValid && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-1/2 -translate-y-1/2 shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-stone-400 mb-1 tracking-wider">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full p-2.5 pr-10 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#3b2075] focus:ring-2 focus:ring-[#3b2075]/10 font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <label className="flex items-center gap-1.5 font-medium text-stone-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-[#3b2075] focus:ring-[#3b2075] cursor-pointer"
                      />
                      <span>Remember me</span>
                    </label>

                    <a href="#" className="font-extrabold text-[#3b2075] hover:underline">
                      Forgot Password ?
                    </a>
                  </div>

                  {/* PRIMARY LOGIN BUTTON */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-[#3b2075] hover:bg-[#4c1d95] text-amber-300 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                        <span>AUTHENTICATING...</span>
                      </>
                    ) : (
                      <span>{mode === "login" ? "LOGIN" : "SIGN UP"}</span>
                    )}
                  </button>

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
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-stone-50 text-stone-700 font-extrabold text-xs border border-stone-200 flex items-center justify-center gap-2.5 transition-all shadow-2xs cursor-pointer mt-2"
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
                  <div className="text-center pt-1 text-xs font-semibold text-stone-500">
                    {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() => setMode(mode === "login" ? "signup" : "login")}
                      className="font-extrabold text-[#3b2075] hover:underline cursor-pointer"
                    >
                      {mode === "login" ? "Sign up" : "Log in"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          {/* Footer Links */}
          <div className="pt-3 text-center text-xs font-semibold text-stone-400 border-t border-stone-100">
            <span className="hover:text-stone-700 cursor-pointer">FAQ</span> |{" "}
            <span className="hover:text-stone-700 cursor-pointer">Features</span> |{" "}
            <span className="hover:text-stone-700 cursor-pointer">Support</span>
          </div>
        </div>

        {/* RIGHT PANEL: ROYAL DARK PURPLE PANEL WITH SMOOTH CURVED EDGE */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#1f0c3d] via-[#2d1659] to-[#3b2075] p-6 sm:p-9 text-white flex flex-col justify-between relative overflow-hidden">
          
          {/* Smooth Curved Wave Edge SVG Overlay */}
          <div className="hidden md:block absolute top-0 -left-12 bottom-0 w-16 h-full pointer-events-none z-10 text-[#1f0c3d] fill-current">
            <svg className="w-full h-full" viewBox="0 0 100 1000" preserveAspectRatio="none" fill="currentColor">
              <path d="M 100 0 C 10 250, 0 450, 40 700 C 70 880, 85 960, 100 1000 Z" />
            </svg>
          </div>

          {/* Content */}
          <div className="space-y-5 relative z-20">
            <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 text-[10px] font-black uppercase tracking-wider w-fit">
              <Sparkles className="w-3 h-3 text-amber-300" /> AI Education Portal
            </div>

            <div>
              <h3 className="text-xl font-black text-white tracking-tight">About C2Talents</h3>
              <p className="text-xs text-purple-200/90 leading-relaxed font-medium mt-2">
                C2Talents is India&apos;s leading AI-guided platform connecting students with top accredited engineering & autonomous colleges.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <h4 className="text-xs font-black text-amber-300 uppercase tracking-wide">Features</h4>
              <ul className="space-y-2.5 text-xs text-purple-100 font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>AI College Matching Engine & Fee Estimator</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>100% Verified Campus Reviews & CTC Stats</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>Direct Admission Tracker & Application Management</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="relative z-20 pt-4 border-t border-purple-800/40 flex items-center justify-between text-[11px] text-purple-200/80 font-bold">
            <div className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-amber-300" />
              <span>25k+ Students</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-300" />
              <span>250+ Colleges</span>
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
        onClick={() => setIsOpen(true)}
        className={triggerClassName}
      >
        {triggerText}
      </button>
      {mounted && typeof document !== "undefined" ? createPortal(modalContent, document.body) : null}
    </>
  );
}
