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
  ArrowUpRight,
} from "lucide-react";

export default function AdminDashboardPage() {
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

  return (
    <div className="space-y-8 animate-slide-up pb-12 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#1f0c3d] via-[#2d1659] to-[#3b2075] text-white p-6 rounded-3xl shadow-xl border border-[#3b2075]/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-amber-300" /> Live Database Engine
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Enterprise Overview Metrics</h1>
          <p className="text-xs text-purple-200/80 font-medium mt-1">
            Real-time live database metrics, recent activities & portal statistics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#3b2075]/70 hover:bg-[#3b2075] text-purple-100 text-xs font-bold transition-all border border-purple-400/30 shadow-xs cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-300" : ""}`} />
            <span>Refresh Live DB</span>
          </button>

          <Link
            href="/manager/colleges/new"
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-extrabold px-4 py-2 rounded-xl text-xs shadow-md transition-all hover:scale-[1.01]"
          >
            <PlusCircle className="w-4 h-4 text-stone-950" />
            <span>Add College</span>
          </Link>
        </div>
      </div>

      {/* 8 Live Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Colleges */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-2 relative overflow-hidden group hover:border-[#3b2075]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-800">Total Colleges</span>
            <div className="w-9 h-9 rounded-xl bg-[#3b2075] text-amber-300 flex items-center justify-center font-bold text-sm shadow-xs">
              <Building2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900">
            {loading ? <span className="animate-pulse">...</span> : metrics?.totalColleges ?? 0}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#4c1d95]">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Live Database Count</span>
          </div>
        </div>

        {/* 2. Pending Colleges */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-2 relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">Pending Colleges</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-900 flex items-center justify-center font-bold text-sm shadow-xs">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900">
            {loading ? <span className="animate-pulse">...</span> : metrics?.pendingColleges ?? 0}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700">
            <Clock className="w-3.5 h-3.5" />
            <span>Awaiting Review</span>
          </div>
        </div>

        {/* 3. Published Colleges */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-2 relative overflow-hidden group hover:border-[#3b2075]/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-900">Published Colleges</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100/90 text-[#3b2075] flex items-center justify-center font-bold text-sm shadow-xs">
              <CheckCircle2 className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900">
            {loading ? <span className="animate-pulse">...</span> : metrics?.publishedColleges ?? 0}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#4c1d95]">
            <Check className="w-3.5 h-3.5" />
            <span>Live on Web Portal</span>
          </div>
        </div>

        {/* 4. Categories */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-2 relative overflow-hidden group hover:border-purple-400/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-800">Categories</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#3b2075] flex items-center justify-center font-bold text-sm shadow-xs">
              <FolderTree className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900">
            {loading ? <span className="animate-pulse">...</span> : metrics?.categories ?? 0}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#4c1d95]">
            <FolderTree className="w-3.5 h-3.5" />
            <span>Active Streams & Branches</span>
          </div>
        </div>

        {/* 5. Courses */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-2 relative overflow-hidden group hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-800">Courses</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#3b2075] flex items-center justify-center font-bold text-sm shadow-xs">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900">
            {loading ? <span className="animate-pulse">...</span> : metrics?.courses ?? 0}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#4c1d95]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Degrees & Diplomas</span>
          </div>
        </div>

        {/* 6. News & Articles */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-2 relative overflow-hidden group hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">News & Articles</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-sm shadow-xs">
              <Newspaper className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900">
            {loading ? <span className="animate-pulse">...</span> : metrics?.news ?? 0}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-600">
            <Newspaper className="w-3.5 h-3.5" />
            <span>Exam & Alert News</span>
          </div>
        </div>

        {/* 7. Users & Leads */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-2 relative overflow-hidden group hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-800">Users & Leads</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#3b2075] flex items-center justify-center font-bold text-sm shadow-xs">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900">
            {loading ? <span className="animate-pulse">...</span> : metrics?.usersAndLeads ?? 0}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#4c1d95]">
            <Users className="w-3.5 h-3.5" />
            <span>Registered Accounts & Inquiries</span>
          </div>
        </div>

        {/* 8. Analytics Reviews */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-2 relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">Analytics Reviews</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm shadow-xs">
              <Star className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-stone-900">
            {loading ? <span className="animate-pulse">...</span> : metrics?.reviews ?? 0}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>Verified Feedback</span>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-stone-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> Quick Actions
          </h2>
          <span className="text-[10px] text-stone-400 font-medium">Direct CMS Admin Controls</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs font-bold">
          <Link
            href="/manager/colleges/new"
            className="p-3.5 rounded-2xl bg-purple-50/70 hover:bg-purple-100/80 text-[#3b2075] border border-purple-200 flex flex-col items-center justify-center gap-2 text-center transition-all hover:scale-[1.02]"
          >
            <Building2 className="w-5 h-5 text-[#4c1d95]" />
            <span>Add College</span>
          </Link>

          <Link
            href="/manager/courses"
            className="p-3.5 rounded-2xl bg-purple-50/70 hover:bg-purple-100/80 text-[#3b2075] border border-purple-200 flex flex-col items-center justify-center gap-2 text-center transition-all hover:scale-[1.02]"
          >
            <BookOpen className="w-5 h-5 text-[#4c1d95]" />
            <span>Add Course</span>
          </Link>

          <Link
            href="/manager/news"
            className="p-3.5 rounded-2xl bg-rose-50/70 hover:bg-rose-100/80 text-rose-900 border border-rose-200 flex flex-col items-center justify-center gap-2 text-center transition-all hover:scale-[1.02]"
          >
            <Newspaper className="w-5 h-5 text-rose-700" />
            <span>Add News</span>
          </Link>

          <Link
            href="/manager/categories"
            className="p-3.5 rounded-2xl bg-purple-50/70 hover:bg-purple-100/80 text-[#3b2075] border border-purple-200 flex flex-col items-center justify-center gap-2 text-center transition-all hover:scale-[1.02]"
          >
            <FolderTree className="w-5 h-5 text-[#4c1d95]" />
            <span>Add Category</span>
          </Link>

          <Link
            href="/manager/colleges/new#sec10"
            className="p-3.5 rounded-2xl bg-amber-50/70 hover:bg-amber-100/80 text-amber-900 border border-amber-200 flex flex-col items-center justify-center gap-2 text-center transition-all hover:scale-[1.02]"
          >
            <ImageIcon className="w-5 h-5 text-amber-700" />
            <span>Upload Images</span>
          </Link>

          <Link
            href="/manager/users"
            className="p-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 flex flex-col items-center justify-center gap-2 text-center transition-all hover:scale-[1.02]"
          >
            <Users className="w-5 h-5 text-stone-700" />
            <span>Manage Users</span>
          </Link>
        </div>
      </div>

      {/* RECENT ACTIVITY STREAM */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-stone-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#3b2075]" /> Live Database Stream: Recent Activity
          </h2>
          <span className="text-[10px] text-stone-400 font-medium">Real-Time DB Queries</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Latest College */}
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3b2075] text-white flex items-center justify-center shrink-0 font-bold">
              <Building2 className="w-4.5 h-4.5 text-amber-300" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#4c1d95] block mb-0.5">
                Latest College Added
              </span>
              <p className="font-extrabold text-stone-900 truncate">
                {activities?.latestCollege?.name || "No colleges added yet"}
              </p>
              <p className="text-[11px] text-stone-500 font-medium">
                {activities?.latestCollege?.city || "Tamil Nadu"} • Status: {activities?.latestCollege?.status || "PUBLISHED"}
              </p>
            </div>
          </div>

          {/* Latest Registered User */}
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4c1d95] text-white flex items-center justify-center shrink-0 font-bold">
              <UserCheck className="w-4.5 h-4.5 text-amber-300" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#4c1d95] block mb-0.5">
                Latest User Registered
              </span>
              <p className="font-extrabold text-stone-900 truncate">
                {activities?.latestUser?.email || "superadmin@c2talents.com"}
              </p>
              <p className="text-[11px] text-stone-500 font-medium">
                Role: {activities?.latestUser?.role || "SUPER_ADMIN"}
              </p>
            </div>
          </div>

          {/* Latest News */}
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 font-bold">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 block mb-0.5">
                Latest News Article
              </span>
              <p className="font-extrabold text-stone-900 truncate">
                {activities?.latestNews?.title || "TNEA 2026 Counselling Dates Announced"}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Category: {activities?.latestNews?.category || "Admissions"}
              </p>
            </div>
          </div>

          {/* Latest Review */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 font-bold">
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block mb-0.5">
                Latest Review Submitted
              </span>
              <p className="font-extrabold text-stone-900 truncate">
                {activities?.latestReview?.content || "Excellent academic environment & placements"}
              </p>
              <p className="text-[11px] text-stone-500 font-medium">
                Rating: ⭐ {activities?.latestReview?.rating || 4.5}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
