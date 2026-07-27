"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  FolderTree,
  BookOpen,
  Newspaper,
  Users,
  BarChart3,
  Globe,
  Sparkles,
  ChevronRight,
  GraduationCap,
  LogOut,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/manager/dashboard", icon: LayoutDashboard },
  { name: "All Colleges", href: "/manager/colleges", icon: Building2 },
  { name: "Add College (AI)", href: "/manager/colleges/new", icon: PlusCircle, highlight: true },
  { name: "Categories", href: "/manager/categories", icon: FolderTree },
  { name: "Courses", href: "/manager/courses", icon: BookOpen },
  { name: "News & Alerts", href: "/manager/news", icon: Newspaper },
  { name: "Users & Leads", href: "/manager/users", icon: Users },
  { name: "Analytics", href: "/manager/analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  async function handleLogout() {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {}
    window.location.href = "/manager/login";
  }

  return (
    <aside className="w-60 bg-[#1f0c3d] text-purple-200 flex flex-col border-r border-[#3b2075]/40 shrink-0 h-full z-30 font-sans shadow-xl select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#3b2075]/40 flex items-center justify-between shrink-0 bg-[#16082d]">
        <Link href="/manager/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3b2075] to-[#7c3aed] flex items-center justify-center text-white shadow-md shadow-purple-900/40 group-hover:scale-105 transition-transform font-bold">
            <GraduationCap className="w-4.5 h-4.5 text-amber-300" />
          </div>
          <div>
            <span className="font-extrabold text-white tracking-tight text-sm block leading-tight">C2Talents</span>
            <span className="text-[9px] uppercase tracking-wider text-amber-400 font-extrabold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-300 animate-pulse" /> Admin Portal
            </span>
          </div>
        </Link>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-2 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-purple-300/60">
          Management CMS
        </div>

        {navItems.map((item) => {
          const isActive =
            item.href === "/manager/dashboard"
              ? pathname === "/manager/dashboard" || pathname === "/manager"
              : item.href === "/manager/colleges"
              ? pathname === "/manager/colleges"
              : pathname === item.href || (item.href !== "/manager/dashboard" && pathname.startsWith(item.href + "/"));

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-[#3b2075]/60 text-amber-300 border border-amber-500/40 shadow-xs"
                  : item.highlight
                  ? "bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold shadow-sm"
                  : "text-purple-200/80 hover:text-white hover:bg-[#3b2075]/40"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? "text-amber-300" : item.highlight ? "text-stone-950" : "text-purple-300/70"}`} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-300" />}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Log Out */}
      <div className="p-3 border-t border-[#3b2075]/40 bg-[#16082d] space-y-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-[#2d1659] hover:bg-rose-600/90 text-purple-100 hover:text-white text-xs font-extrabold transition-all border border-[#3b2075] hover:border-rose-500 cursor-pointer shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-purple-300/70 hover:text-amber-300 transition-colors py-1"
        >
          <Globe className="w-3 h-3" />
          <span>View Public Website ↗</span>
        </a>
      </div>
    </aside>
  );
}
