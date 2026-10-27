"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  PlusCircle,
  Bell,
  BellRing,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Settings,
  MailCheck,
  Lock,
  Menu,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight,
} from "lucide-react";
import { useAdminNotifications } from "@/components/admin/AdminNotificationProvider";
import { BulkResearchModal } from "@/components/admin/BulkResearchModal";

interface AdminHeaderProps {
  title?: string;
  onOpenMobileSidebar?: () => void;
}

export function AdminHeader({ title, onOpenMobileSidebar }: AdminHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [user, setUser] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const {
    permission,
    pendingReviewCount,
    recentPendingDrafts,
    requestPermission,
    sendTestNotification,
    showBulkModal,
    setShowBulkModal,
  } = useAdminNotifications();

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
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
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
          <h2 className="text-xs sm:text-sm font-extrabold text-[#1c0b36] tracking-wide uppercase truncate max-w-[160px] sm:max-w-none">
            {title || "Admin Control Console"}
          </h2>
        </div>
      </div>

      {/* Right Quick Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
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

        <button
          type="button"
          onClick={() => setShowBulkModal(true)}
          className="hidden md:flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-[#1c0b36] font-extrabold px-3 py-1.5 sm:py-2 rounded-xl text-xs border border-purple-200 shadow-2xs transition-all cursor-pointer shrink-0"
          title="Start background AI research for up to 50 colleges"
        >
          <Layers className="w-3.5 h-3.5 text-[#1c0b36]" />
          <span>Bulk Research</span>
        </button>

        {/* Visible Desktop Notification Status / Action in Header Bar */}
        {permission !== "granted" ? (
          <button
            type="button"
            id="header-enable-notifications-btn"
            onClick={async () => {
              await requestPermission();
            }}
            className="hidden sm:flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-2.5 sm:px-3 py-1.5 rounded-xl text-xs shadow-2xs transition-all cursor-pointer transform hover:scale-[1.01] shrink-0"
            title="Enable browser desktop notifications for college reviews"
          >
            <BellRing className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
            <span>Enable Notifications</span>
          </button>
        ) : (
          <div
            className="hidden lg:flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2.5 py-1.5 rounded-xl text-xs shrink-0"
            title="Desktop notifications are enabled"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Desktop Alerts Active</span>
          </div>
        )}

        {/* Interactive Notification Bell with Review-Ready Indicator */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            id="notification-center-toggle-btn"
            onClick={() => setNotificationOpen(!notificationOpen)}
            className={`flex w-8.5 h-8.5 rounded-xl border ${
              permission !== "granted"
                ? "border-amber-300 bg-amber-50/50 text-amber-900"
                : "border-stone-200 hover:bg-purple-50 text-stone-700"
            } items-center justify-center relative transition-colors cursor-pointer group`}
            title={
              pendingReviewCount > 0
                ? `${pendingReviewCount} college drafts awaiting review`
                : "College Review Notification Center"
            }
            aria-label="College Review Notification Center"
          >
            <Bell className="w-4 h-4 text-stone-700 group-hover:text-[#1c0b36] transition-colors" />
            {pendingReviewCount > 0 ? (
              <span className="min-w-4 h-4 px-1 rounded-full bg-amber-500 text-stone-950 font-black text-[9.5px] flex items-center justify-center absolute -top-1 -right-1 ring-2 ring-white shadow-xs animate-in zoom-in-75">
                {pendingReviewCount > 99 ? "99+" : pendingReviewCount}
              </span>
            ) : permission !== "granted" ? (
              <span
                className="w-2 h-2 rounded-full bg-amber-500 absolute top-1 right-1 ring-1 ring-white animate-pulse"
                title="Desktop notifications not enabled"
              />
            ) : null}
          </button>

          {/* Notification Dropdown Panel */}
          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-stone-900 rounded-2xl p-4 shadow-2xl border border-purple-200 animate-in fade-in zoom-in-95 z-50 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <div>
                  <h3 className="text-xs font-black text-[#1c0b36] uppercase tracking-wider flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-amber-500" />
                    <span>Review Alerts</span>
                  </h3>
                  <p className="text-[10px] text-stone-500 font-medium">
                    {pendingReviewCount} draft{pendingReviewCount === 1 ? "" : "s"} ready for review
                  </p>
                </div>
                {permission === "granted" ? (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Desktop Alerts Active
                  </span>
                ) : permission === "denied" ? (
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                    Blocked
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Action Needed
                  </span>
                )}
              </div>

              {/* Desktop Permission Action Card */}
              {permission !== "granted" ? (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-50 via-amber-50/70 to-purple-50 border border-amber-300 shadow-xs space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                      <BellRing className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-[#1c0b36]">Desktop Notifications</h4>
                      <p className="text-[11px] text-stone-600 font-medium leading-tight mt-0.5">
                        Receive real-time desktop popups on your laptop as soon as background AI college research is ready.
                      </p>
                    </div>
                  </div>
                  {permission === "denied" ? (
                    <div className="p-2.5 bg-amber-100/70 border border-amber-300/80 rounded-xl text-[10.5px] text-amber-900 flex items-start gap-1.5 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span>
                        Notifications are blocked in your browser settings. To enable, click the site settings/lock icon in your address bar and set Notifications to &quot;Allow&quot;.
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      id="dropdown-enable-notifications-btn"
                      onClick={async () => {
                        await requestPermission();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-[#1c0b36] hover:bg-[#2a104e] text-amber-300 font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:scale-[1.01]"
                    >
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                      <span>Enable Desktop Notifications</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-black text-emerald-950">Desktop Alerts Active</span>
                    </div>
                    <button
                      type="button"
                      onClick={sendTestNotification}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] transition-all cursor-pointer shadow-2xs"
                      title="Send a sample desktop notification to test popups"
                    >
                      Test Alert
                    </button>
                  </div>
                  <p className="text-[10.5px] text-emerald-800 leading-tight">
                    Your browser is permitted to show desktop alerts when individual college drafts are ready for review.
                  </p>
                </div>
              )}

              {/* List of Review-Ready Drafts */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
                {recentPendingDrafts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-stone-400 space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto opacity-70" />
                    <p className="font-semibold text-stone-600">All caught up!</p>
                    <p className="text-[10px]">No college drafts currently pending review.</p>
                  </div>
                ) : (
                  recentPendingDrafts.slice(0, 5).map((draft) => (
                    <div
                      key={draft.id}
                      className="p-2.5 rounded-xl bg-stone-50 hover:bg-purple-50/60 border border-stone-200/80 transition-colors flex items-center justify-between gap-2.5 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-stone-900 truncate leading-snug">
                          {draft.collegeName}
                        </p>
                        <p className="text-[10px] text-stone-500 truncate">
                          {draft.location || "Tamil Nadu"} • Ready for Review
                        </p>
                      </div>
                      <Link
                        href={draft.reviewUrl}
                        onClick={() => setNotificationOpen(false)}
                        className="px-2.5 py-1 rounded-lg bg-[#3b2075] hover:bg-[#4c1d95] text-amber-300 font-extrabold text-[10px] shrink-0 flex items-center gap-1 transition-all shadow-2xs"
                      >
                        <span>Review</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  ))
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationOpen(false);
                    setShowBulkModal(true);
                  }}
                  className="text-[#3b2075] hover:text-[#1c0b36] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Start Bulk Research</span>
                </button>
                <Link
                  href="/manager/submitted-colleges"
                  onClick={() => setNotificationOpen(false)}
                  className="text-stone-500 hover:text-stone-900 font-semibold flex items-center gap-0.5"
                >
                  <span>All Drafts ({pendingReviewCount})</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

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

      <BulkResearchModal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} />
    </header>
  );
}
