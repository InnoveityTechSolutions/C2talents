"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Lock, Mail, ShieldCheck, ArrowRight, Loader2, AlertTriangle } from "lucide-react";

export default function StandaloneManagerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("superadmin@c2talents.com");
  const [password, setPassword] = useState("Admin@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        // Successful login -> Redirect to /manager/dashboard
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

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center p-4 font-sans text-slate-100 overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/95 border border-slate-800/90 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Admin Portal Manager</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Protected Portal Access • Enterprise RBAC Engine
            </p>
          </div>
        </div>

        {/* Credentials Info Box */}
        <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-amber-300 font-extrabold text-[10px] uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Default Super Admin
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
              Active DB Credentials
            </span>
          </div>
          <p className="text-[11px] text-slate-300 font-mono">
            Email: <span className="text-emerald-300">superadmin@c2talents.com</span>
          </p>
          <p className="text-[11px] text-slate-300 font-mono">
            Password: <span className="text-emerald-300">Admin@123</span>
          </p>
        </div>

        {/* Specific Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold text-center flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@c2talents.com"
                required
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium transition-all"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 font-medium transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black py-3 px-4 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Authenticating Admin Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In to Admin Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-2 text-center text-[10px] text-slate-500 border-t border-slate-800/80 font-mono">
          C2Talents Higher Education System • Restricted Admin Access
        </div>
      </div>
    </div>
  );
}
