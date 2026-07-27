"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { PlusCircle, Bell, Sparkles, ShieldCheck, LogOut, User, ChevronDown } from "lucide-react";

export function AdminHeader() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [user, setUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/admin/auth/me");
        const data = await res.json();
        if (data.user) setUser(data.user);
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

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-purple-100 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs font-sans">
      {/* Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#3b2075] text-amber-300 flex items-center justify-center font-extrabold text-xs shadow-xs">
          <ShieldCheck className="w-4 h-4 text-amber-300" />
        </div>
        <div>
          <h2 className="text-xs font-extrabold text-[#1f0c3d] tracking-wide uppercase">Admin Portal Control Center</h2>
          <p className="text-[10px] text-purple-600/70 font-medium">C2Talents CMS Manager</p>
        </div>
      </div>

      {/* Right Quick Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/manager/colleges/new"
          className="flex items-center gap-2 bg-[#3b2075] hover:bg-[#4c1d95] text-white font-extrabold px-3.5 py-2 rounded-xl text-xs shadow-sm transition-all hover:scale-[1.01]"
        >
          <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
          <span>Add College</span>
          <span className="bg-amber-400 text-stone-950 px-1.5 py-0.5 rounded text-[9px] font-extrabold flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" /> AI
          </span>
        </Link>

        {/* Notification Icon */}
        <button className="w-8 h-8 rounded-xl border border-stone-200 hover:bg-purple-50 flex items-center justify-center text-stone-600 relative transition-colors">
          <Bell className="w-3.5 h-3.5" />
          <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1.5 right-1.5 ring-2 ring-white"></span>
        </button>

        {/* User Profile Badge (Clicking triggers Logout / Dropdown) */}
        <div className="relative pl-3 border-l border-stone-200" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-purple-50 transition-all cursor-pointer group"
            title="Click to manage profile or log out"
          >
            <div className="w-8 h-8 rounded-full bg-[#3b2075] text-amber-300 font-extrabold flex items-center justify-center text-xs ring-2 ring-amber-500/20 group-hover:ring-amber-500/50 transition-all">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-[#1f0c3d] leading-tight group-hover:text-[#4c1d95] transition-colors">
                {user?.name || "Admin CMS"}
              </p>
              <p className="text-[10px] text-stone-400 font-medium">
                {user?.role || "Super Administrator"}
              </p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180 text-[#3b2075]" : ""}`} />
          </button>

          {/* Profile & Logout Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#1f0c3d] text-white rounded-2xl p-2 shadow-2xl border border-[#3b2075] animate-slide-up z-50">
              <div className="p-2.5 border-b border-[#3b2075] mb-1">
                <p className="text-xs font-extrabold text-white truncate">{user?.name || "Super Administrator"}</p>
                <p className="text-[10px] text-purple-200/70 font-medium truncate">{user?.email || "superadmin@c2talents.com"}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[9px] font-extrabold uppercase tracking-wider border border-amber-500/30">
                  {user?.role || "SUPER_ADMIN"}
                </span>
              </div>

              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>{loggingOut ? "Logging Out..." : "Log Out of Admin CMS"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
