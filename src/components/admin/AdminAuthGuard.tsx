"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import StandaloneLoginPage from "@/app/manager/login/page";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AppLoader } from "@/components/AppLoader";
import { AdminNotificationProvider } from "@/components/admin/AdminNotificationProvider";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isLoginPage = pathname === "/manager/login" || pathname === "/admin/login" || pathname === "/login";

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthenticated(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    async function checkAuthStatus() {
      try {
        const res = await fetch("/api/admin/auth/me", {
          cache: "no-store",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const data = await res.json().catch(() => ({ authenticated: false }));

        const ALLOWED_ROLES = ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"];
        if (isMounted) {
          if (res.ok && data.authenticated && data.user?.role && ALLOWED_ROLES.includes(data.user.role)) {
            setIsAuthenticated(true);
            setUser(data.user);
          } else {
            console.warn("[ADMIN AUTH GUARD]: Unverified or non-admin session detected. Redirecting to login.");
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn("[AUTH GUARD]: Auth verification timed out or failed. Falling back to login.");
          setIsAuthenticated(false);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    }

    checkAuthStatus();

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [pathname, isLoginPage]);

  // If visiting login page explicitly, render ONLY the standalone login page
  if (isLoginPage) {
    return <StandaloneLoginPage />;
  }

  // Loading state while checking authentication token
  if (isAuthenticated === null) {
    return <AppLoader submessage="Verifying Admin Manager Authentication..." />;
  }

  // If user is NOT authenticated: RENDER ONLY THE LOGIN PAGE!
  if (!isAuthenticated) {
    return <StandaloneLoginPage />;
  }

  // Authenticated User: Render Full Enterprise Admin Layout
  return (
    <AdminNotificationProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-[#FAF9F5] font-sans antialiased text-stone-900 relative">
        <AdminSidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <AdminHeader onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto w-full p-3 sm:p-5 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminNotificationProvider>
  );
}
