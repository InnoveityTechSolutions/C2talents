"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Clock,
  FolderTree,
  BookOpen,
  Newspaper,
  Users,
  Star,
  PlusCircle,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Image as ImageIcon,
  UserCheck,
  FileText,
  MessageSquare,
  ShieldCheck,
  Check,
} from "lucide-react";

export function AdminDashboardView() {
  const [metrics, setMetrics] = useState<any>(null);
  const [activities, setActivities] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const [mRes, aRes] = await Promise.all([
        fetch("/api/admin/dashboard/metrics"),
        fetch("/api/admin/dashboard/recent-activity"),
      ]);

      const mData = await mRes.json();
      const aData = await aRes.json();

      if (mData.metrics) setMetrics(mData.metrics);
      if (aData.activities) setActivities(aData.activities);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const cardList = [
    {
      title: "Total Colleges",
      count: metrics?.totalColleges ?? 0,
      sublabel: "Live Database Count",
      href: "/manager/colleges",
      icon: <Building2 className="w-7 h-7 text-amber-300 shrink-0" />,
      gradient: "from-[#1f0c3d] via-[#2d1659] to-[#3b2075]",
    },
    {
      title: "Pending Colleges",
      count: metrics?.pendingColleges ?? 0,
      sublabel: "Awaiting Review",
      href: "/manager/submitted-colleges",
      icon: <Clock className="w-7 h-7 text-white/90 shrink-0" />,
      gradient: "from-amber-500 to-orange-600",
    },
    {
      title: "Published Colleges",
      count: metrics?.publishedColleges ?? 0,
      sublabel: "Live on Web Portal",
      href: "/manager/colleges",
      icon: <CheckCircle2 className="w-7 h-7 text-white/90 shrink-0" />,
      gradient: "from-blue-600 to-indigo-700",
    },
    {
      title: "Categories",
      count: metrics?.categories ?? 0,
      sublabel: "Active Streams & Branches",
      href: "/manager/categories",
      icon: <FolderTree className="w-7 h-7 text-white/90 shrink-0" />,
      gradient: "from-purple-600 to-indigo-800",
    },
    {
      title: "Courses",
      count: metrics?.courses ?? 0,
      sublabel: "Degrees & Diplomas",
      href: "/manager/courses",
      icon: <BookOpen className="w-7 h-7 text-white/90 shrink-0" />,
      gradient: "from-cyan-600 to-teal-700",
    },
    {
      title: "News & Articles",
      count: metrics?.news ?? 0,
      sublabel: "Exam & Alert News",
      href: "/manager/news",
      icon: <Newspaper className="w-7 h-7 text-white/90 shrink-0" />,
      gradient: "from-rose-600 to-red-700",
    },
    {
      title: "Users & Leads",
      count: metrics?.usersAndLeads ?? 0,
      sublabel: "Registered Accounts & Inquiries",
      href: "/manager/users",
      icon: <Users className="w-7 h-7 text-white/90 shrink-0" />,
      gradient: "from-emerald-600 to-green-700",
    },
    {
      title: "Analytics Reviews",
      count: metrics?.reviews ?? 0,
      sublabel: "Verified Feedback",
      href: "/manager/analytics",
      icon: <Star className="w-7 h-7 text-white/90 shrink-0 fill-amber-300" />,
      gradient: "from-amber-600 to-yellow-600",
    },
  ];

  return (
    <div className="space-y-8 pb-12 font-sans text-stone-900 w-full max-w-none">
      {/* 1. HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#1f0c3d] via-[#2d1659] to-[#3b2075] text-white p-6 rounded-3xl shadow-lg border border-[#3b2075]/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-300" /> Live Database Engine
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Enterprise Overview Metrics</h1>
          <p className="text-xs text-purple-200/80 font-medium mt-0.5">
            Real-time live database metrics, recent activities & portal statistics across C2Talents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#3b2075]/70 hover:bg-[#3b2075] text-purple-100 text-xs font-bold transition-all border border-purple-400/30 shadow-2xs cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-300" : ""}`} />
            <span>Refresh Live DB</span>
          </button>

          <Link
            href="/manager/colleges/new"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs shadow-md transition-all hover:scale-[1.01]"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>Add College</span>
          </Link>
        </div>
      </div>

      {/* 2. 8 VIBRANT GRADIENT METRIC CARDS (INTERACTIVE & CLICKABLE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {cardList.map((card, idx) => (
          <Link
            key={idx}
            href={card.href}
            className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-5 text-white shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-200 flex flex-col justify-between border border-white/10 cursor-pointer group`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-white/90 tracking-tight group-hover:text-amber-200 transition-colors">
                  {card.title}
                </div>
                <div className="text-3xl font-extrabold text-white mt-1 tracking-tight">
                  {loading ? <span className="animate-pulse">...</span> : card.count}
                </div>
              </div>
              <div className="group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
            </div>

            <div className="border-t border-white/20 my-3"></div>

            <div className="flex items-center justify-between text-[11px] text-white/90 font-medium">
              <span>{card.sublabel}</span>
              <span className="font-bold text-white bg-white/20 group-hover:bg-white/30 px-2 py-0.5 rounded-md transition-colors flex items-center gap-1">
                {loading ? "..." : card.count}
                <span className="text-[10px] opacity-70 group-hover:translate-x-0.5 transition-transform">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* 3. QUICK ACTIONS */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#1f0c3d] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> Quick Actions
          </h2>
          <span className="text-[10px] text-stone-400 font-medium">Direct CMS Admin Controls</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs font-extrabold">
          <Link
            href="/manager/colleges/new"
            className="p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 text-[#3b2075] border border-purple-200 flex flex-col items-center justify-center gap-2 text-center transition-all hover:scale-[1.02] shadow-2xs"
          >
            <Building2 className="w-5 h-5 text-[#3b2075]" />
            <span>Add College</span>
          </Link>

          <Link
            href="/manager/courses"
            className="p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 text-[#3b2075] border border-purple-200 flex flex-col items-center justify-center gap-2 text-center transition-all hover:scale-[1.02] shadow-2xs"
          >
            <BookOpen className="w-5 h-5 text-[#3b2075]" />
            <span>Add Course</span>
          </Link>

          <Link
            href="/manager/news"
            className="p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 flex flex-col items-center justify-center gap-2 text-center transition-all hover:scale-[1.02] shadow-2xs"
          >
            <Newspaper className="w-5 h-5 text-rose-700" />
            <span>Add News</span>
          </Link>

          <Link
            href="/manager/categories"
            className="p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 text-[#3b2075] border border-purple-200 flex flex-col items-center justify-center gap-2 text-center transition-all hover:scale-[1.02] shadow-2xs"
          >
            <FolderTree className="w-5 h-5 text-[#3b2075]" />
            <span>Add Category</span>
          </Link>

          <Link
            href="/manager/colleges/new#sec10"
            className="p-4 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 flex flex-col items-center justify-center gap-2 text-center transition-all hover:scale-[1.02] shadow-2xs"
          >
            <ImageIcon className="w-5 h-5 text-amber-700" />
            <span>Upload Images</span>
          </Link>

          <Link
            href="/manager/users"
            className="p-4 rounded-2xl bg-stone-50 hover:bg-stone-100 text-stone-900 border border-stone-300 flex flex-col items-center justify-center gap-2 text-center transition-all hover:scale-[1.02] shadow-2xs"
          >
            <Users className="w-5 h-5 text-stone-700" />
            <span>Manage Users</span>
          </Link>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY STREAM */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#1f0c3d] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#3b2075]" /> Live Database Stream: Recent Activity
          </h2>
          <span className="text-[10px] text-stone-400 font-medium">Real-Time DB Queries</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Latest College */}
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3b2075] text-amber-300 flex items-center justify-center shrink-0 font-bold shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3b2075] block mb-0.5">
                Latest College Added
              </span>
              <p className="font-extrabold text-[#1f0c3d] truncate text-sm">
                {activities?.latestCollege?.name || "No colleges added yet"}
              </p>
              <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                {activities?.latestCollege?.city || "Tamil Nadu"} • Status: {activities?.latestCollege?.status || "PUBLISHED"}
              </p>
            </div>
          </div>

          {/* Latest Registered User */}
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4c1d95] text-amber-300 flex items-center justify-center shrink-0 font-bold shadow-2xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#4c1d95] block mb-0.5">
                Latest User Registered
              </span>
              <p className="font-extrabold text-[#1f0c3d] truncate text-sm">
                {activities?.latestUser?.email || "superadmin@c2talents.com"}
              </p>
              <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                Role: {activities?.latestUser?.role || "SUPER_ADMIN"}
              </p>
            </div>
          </div>

          {/* Latest News */}
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 font-bold shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 block mb-0.5">
                Latest News Article
              </span>
              <p className="font-extrabold text-stone-900 truncate text-sm">
                {activities?.latestNews?.title || "TNEA 2026 Counselling Dates Announced"}
              </p>
              <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                Category: {activities?.latestNews?.category || "Admissions"}
              </p>
            </div>
          </div>

          {/* Latest Review */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold shadow-2xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block mb-0.5">
                Latest Review Submitted
              </span>
              <p className="font-extrabold text-stone-900 truncate text-sm">
                {activities?.latestReview?.content || "Excellent academic environment & placements"}
              </p>
              <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                Rating: ⭐ {activities?.latestReview?.rating || 4.5}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
