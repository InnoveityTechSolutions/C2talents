"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";

interface LoginModalProps {
  triggerClassName?: string;
  triggerText?: string;
}

export function LoginModal({ triggerClassName = "login-trigger-btn", triggerText = "Login" }: LoginModalProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"login" | "signup">("login");
  const [form, setForm] = React.useState({ email: "", password: "" });
  const [status, setStatus] = React.useState({ loading: false, error: "" });
  const [mounted, setMounted] = React.useState(false);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  
  const [showGooglePrompt, setShowGooglePrompt] = React.useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = React.useState("");
  const [showCustomGoogleInput, setShowCustomGoogleInput] = React.useState(false);
  
  const { login, register, loginWithGoogle } = useAuth();
  const router = useRouter();

  async function handleGoogleLoginClick(email: string) {
    setStatus({ loading: true, error: "" });
    try {
      await loginWithGoogle(email);
      setStatus({ loading: false, error: "" });
      setIsOpen(false);
      setShowGooglePrompt(false);
      setShowCustomGoogleInput(false);
      router.push("/counselor");
    } catch (err: any) {
      setStatus({ 
        loading: false, 
        error: err.message || "Google authentication failed. Please try again." 
      });
    }
  }

  async function handleCustomGoogleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (customGoogleEmail.trim()) {
      await handleGoogleLoginClick(customGoogleEmail.trim());
    }
  }

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) setIsOpen(false);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ loading: true, error: "" });
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.email, form.password, "STUDENT");
      }
      setStatus({ loading: false, error: "" });
      setIsOpen(false);
      router.push("/counselor");
    } catch (err: any) {
      setStatus({ 
        loading: false, 
        error: err.message || "Authentication failed. Please check your credentials and try again." 
      });
    }
  }

  const modalContent = isOpen && (
    <div ref={overlayRef} onClick={handleOverlayClick} className="login-modal-overlay active">
      <div className="login-modal-box">
        <button
          type="button"
          aria-label="Close"
          className="login-modal-close"
          onClick={() => setIsOpen(false)}
        >
          &times;
        </button>

        {/* Left panel — campus image */}
        <div className="login-modal-image-panel">
          <img
            src="/images/campus-hero.jpg"
            alt="University campus"
            className="login-modal-image"
          />
          <div className="login-modal-image-overlay">
            <p className="login-modal-image-quote">
              Join thousands of students who found their right-fit college with C2Talents.
            </p>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="login-modal-form-panel">
          {showGooglePrompt ? (
            <div className="w-full flex flex-col font-sans">
              <button 
                type="button" 
                onClick={() => {
                  setShowGooglePrompt(false);
                  setShowCustomGoogleInput(false);
                  setStatus({ loading: false, error: "" });
                }}
                className="self-start text-xs font-bold text-stone-500 hover:text-stone-700 mb-4 flex items-center gap-1.5 cursor-pointer"
              >
                &larr; Back to login
              </button>

              <div className="text-center mb-5">
                {/* Google Logo */}
                <svg className="w-8 h-8 mx-auto mb-2" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.98 1 12 1 7.35 1 3.37 3.65 1.43 7.54l3.87 3C6.24 7.62 8.91 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.43c-.28 1.44-1.09 2.67-2.3 3.49l3.86 3c2.26-2.09 3.5-5.17 3.5-8.64z" />
                  <path fill="#FBBC05" d="M5.3 14.54c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3l-3.87-3C.56 8.78 0 10.33 0 12s.56 3.22 1.43 5.06l3.87-3z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.86-3c-1.08.72-2.48 1.16-4.1 1.16-3.09 0-5.76-2.58-6.7-5.5l-3.87 3C3.37 20.35 7.35 23 12 23z" />
                </svg>
                <h2 className="text-base font-bold text-stone-800">Sign in with Google</h2>
                <p className="text-[11px] text-stone-400 mt-0.5">Choose an account to continue to C2Talents</p>
              </div>

              {status.error && (
                <div className="bg-red-50 border border-red-200 text-red-650 text-xs p-3 rounded-xl mb-4 font-medium">
                  {status.error}
                </div>
              )}

              {showCustomGoogleInput ? (
                <form onSubmit={handleCustomGoogleSubmit} className="space-y-4">
                  <label className="block text-xs font-bold text-stone-700">
                    Enter any Gmail / Email
                    <input
                      type="email"
                      required
                      placeholder="name@gmail.com"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      className="w-full mt-1.5 px-3 py-2 text-xs border border-stone-250 rounded-xl focus:outline-none focus:border-indigo-900 focus:bg-white transition-all text-stone-700 font-medium h-9"
                    />
                  </label>
                  <button 
                    type="submit" 
                    disabled={status.loading}
                    className="w-full py-2 bg-indigo-900 text-white font-bold text-xs rounded-xl hover:bg-indigo-950 transition-all cursor-pointer h-9"
                  >
                    {status.loading ? "Signing in..." : "Continue"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomGoogleInput(false)}
                    className="w-full text-[11px] font-bold text-stone-500 hover:underline text-center mt-2 cursor-pointer"
                  >
                    Back to account list
                  </button>
                </form>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {[
                    { name: "Praveen N", email: "praveen@gmail.com", initial: "P", color: "bg-blue-600" },
                    { name: "C2 Student", email: "student@c2talents.com", initial: "S", color: "bg-emerald-600" },
                  ].map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      disabled={status.loading}
                      onClick={() => handleGoogleLoginClick(account.email)}
                      className="w-full flex items-center justify-between p-2.5 border border-stone-200 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-7.5 h-7.5 rounded-full ${account.color} text-white flex items-center justify-center font-bold text-xs`}>
                          {account.initial}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11.5px] font-bold text-stone-800 truncate">{account.name}</p>
                          <p className="text-[10px] text-stone-400 truncate">{account.email}</p>
                        </div>
                      </div>
                      <span className="text-[9.5px] font-bold text-stone-400 group-hover:text-indigo-900 transition-colors mr-1">
                        Signed out
                      </span>
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setShowCustomGoogleInput(true)}
                    className="w-full py-2 px-3 border border-dashed border-stone-300 rounded-xl text-center text-xs font-bold text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-all cursor-pointer mt-1"
                  >
                    Use another account
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <h2 className="login-modal-title">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="login-modal-subtitle">
                {mode === "login"
                  ? "Log in to continue your college search."
                  : "Sign up to get your personalized shortlist."}
              </p>

              <form onSubmit={handleSubmit} className="login-modal-form">
                <label className="login-modal-label">
                  Email
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="login-modal-input"
                  />
                </label>

                <label className="login-modal-label">
                  Password
                  <input
                    type="password"
                    name="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="login-modal-input"
                  />
                </label>

                {status.error && <p className="login-modal-error">{status.error}</p>}

                <button type="submit" className="login-modal-submit" disabled={status.loading}>
                  {status.loading ? "Please wait..." : mode === "login" ? "Log In" : "Sign Up"}
                </button>
              </form>

              <div className="login-modal-divider">or</div>

              <button 
                type="button" 
                className="login-modal-google cursor-pointer"
                onClick={() => {
                  setShowGooglePrompt(true);
                  setStatus({ loading: false, error: "" });
                }}
              >
                Continue with Google
              </button>

              <p className="login-modal-switch">
                {mode === "login" ? "New here?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  className="login-modal-switch-link cursor-pointer"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                >
                  {mode === "login" ? "Create an account" : "Log in"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className={triggerClassName}>
        {triggerText}
      </button>
      {mounted && typeof document !== "undefined" ? createPortal(modalContent, document.body) : null}
    </>
  );
}
