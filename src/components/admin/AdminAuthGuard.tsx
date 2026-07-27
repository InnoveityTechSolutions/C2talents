"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import StandaloneLoginPage from "@/app/manager/login/page";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Loader2, ShieldCheck } from "lucide-react";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);

  const isLoginPage = pathname === "/manager/login" || pathname === "/admin/login" || pathname === "/login";

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthenticated(false);
      return;
    }

    async function checkAuthStatus() {
      try {
        const res = await fetch("/api/admin/auth/me", { cache: "no-store" });
        const data = await res.json();

        if (res.ok && data.authenticated) {
          setIsAuthenticated(true);
          setUser(data.user);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    }

    checkAuthStatus();
  }, [pathname, isLoginPage]);

  // If visiting login page explicitly, render ONLY the standalone login page
  if (isLoginPage) {
    return <StandaloneLoginPage />;
  }

  // Loading state while checking authentication token
  if (isAuthenticated === null) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4 font-sans">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 animate-pulse">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-300 uppercase tracking-widest">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Verifying Admin Manager Authentication...</span>
        </div>
      </div>
    );
  }

  // If user is NOT authenticated: RENDER ONLY THE LOGIN PAGE!
  if (!isAuthenticated) {
    return <StandaloneLoginPage />;
  }

  // Authenticated User: Render Full Enterprise Admin Layout
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF9F5] font-sans antialiased text-stone-900">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
