"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Bell,
  Sparkles,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Settings,
  MailCheck,
  Lock,
  Key,
  Menu,
} from "lucide-react";

interface AdminHeaderProps {
  title?: string;
  onOpenMobileSidebar?: () => void;
}

export function AdminHeader({ title, onOpenMobileSidebar }: AdminHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [user, setUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/admin/auth/me");
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      } catch (e) {}
    }
    fetchUser();

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {}
    window.location.href = "/manager/login";
  }

  const roleFormatted = user?.role
    ? user.role.replace("_", " ").toUpperCase()
    : "SUPER ADMIN";

  const adminName = user?.name || "System Administrator";
  const adminEmail = user?.email || "admin@c2talents.com";

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-purple-100 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs font-sans shrink-0">
      {/* Title / Breadcrumb / Mobile Hamburger */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-xl text-stone-700 hover:bg-purple-50 hover:text-[#1c0b36] transition-colors flex items-center justify-center shrink-0 cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-[#1c0b36]" />
        </button>

        <div className="hidden sm:flex w-8.5 h-8.5 rounded-xl bg-[#1c0b36] text-amber-400 items-center justify-center font-extrabold text-xs shadow-xs border border-purple-900/30 shrink-0">
          <ShieldCheck className="w-4.5 h-4.5 text-amber-400" />
        </div>
        <div className="min-w-0">
          <h2 className="text-xs font-extrabold text-[#1c0b36] tracking-wide uppercase truncate max-w-[130px] sm:max-w-none">
            {title || "Admin Control Console"}
          </h2>
          <p className="text-[10px] text-purple-700/80 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0"></span>
            <span className="truncate hidden xs:inline">Private Enterprise Panel</span>
            <span className="truncate xs:hidden">Enterprise</span>
          </p>
        </div>
      </div>

      {/* Right Quick Actions */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <Link
          href="/manager/colleges/new"
          className="flex items-center gap-1.5 sm:gap-2 bg-[#1c0b36] hover:bg-[#2a104e] text-amber-300 font-extrabold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs border border-amber-500/30 shadow-xs transition-all transform hover:scale-[1.01] shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Add College</span>
          <span className="sm:hidden text-[11px]">Add</span>
          <span className="bg-amber-400 text-stone-950 px-1.5 py-0.5 rounded text-[9px] font-extrabold flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" /> AI
          </span>
        </Link>

        {/* Notification Icon */}
        <button className="hidden xs:flex w-8 h-8 rounded-xl border border-stone-200 hover:bg-purple-50 items-center justify-center text-stone-600 relative transition-colors">
          <Bell className="w-3.5 h-3.5" />
          <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
        </button>

        {/* Admin Profile Dropdown Badge */}
        <div className="relative pl-1.5 sm:pl-3 border-l border-stone-200" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-purple-50 transition-all cursor-pointer group"
            title="Administrator Account Settings"
          >
            <div className="w-8 h-8 rounded-full bg-[#1c0b36] text-amber-400 font-extrabold flex items-center justify-center text-xs ring-2 ring-amber-400/30 group-hover:ring-amber-400/60 transition-all shadow-xs">
              {adminName.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-extrabold text-[#1c0b36] leading-tight group-hover:text-purple-900 transition-colors">
                {adminName}
              </p>
              <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                {roleFormatted}
              </p>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180 text-[#1c0b36]" : ""
              }`}
            />
          </button>

          {/* Profile & Logout Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#1c0b36] text-white rounded-2xl p-2 shadow-2xl border border-purple-900/60 animate-in fade-in zoom-in-95 z-50">
              {/* Header Profile Card */}
              <div className="p-3 bg-purple-950/70 rounded-xl border border-purple-800/40 mb-1.5">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-full bg-amber-400 text-stone-950 font-black flex items-center justify-center text-xs shadow-md">
                    {adminName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-white truncate">{adminName}</p>
                    <p className="text-[10px] text-purple-200/80 font-mono truncate">{adminEmail}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-purple-800/40">
                  <span className="text-[9.5px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {roleFormatted}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Verified Session
                  </span>
                </div>
              </div>

              {/* Logout Button ONLY */}
              <div className="pt-1">
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 font-extrabold text-xs flex items-center gap-2.5 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>{loggingOut ? "Logging Out..." : "Log Out of Admin Panel"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
