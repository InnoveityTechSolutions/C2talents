"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award, Clock, Search, X, ExternalLink, Shield, Filter, CheckCircle2,
  Building2, GraduationCap, FileText, CalendarDays, DollarSign, Sparkles,
  HelpCircle, ChevronRight, UserCheck, Heart, AlertCircle, ArrowUpRight,
  ChevronLeft, RefreshCw, Check
} from "lucide-react";
import { REAL_SCHOLARSHIPS_100 } from "@/data/scholarships-data";

export interface ScholarshipItem {
  id: string;
  name: string;
  provider: string;
  category: string; // Central Government, State Government, Private
  scholarshipType: string; // Merit-Based, Need-Based, Minority, SC, ST, BC, MBC, Girl Students, Sports, EWS, Disabled Students
  description: string;
  eligibilityCriteria: string;
  minPercentage?: number | null;
  eligibleCourses: string;
  eligibleStates: string;
  familyIncomeLimit?: number | null;
  familyIncomeLimitText?: string | null;
  amount: string;
  amountValue?: number | null;
  deadline?: string | null;
  deadlineDate?: string | Date | null;
  officialWebsite: string;
  applyLink: string;
  requiredDocuments: string;
  selectionProcess?: string | null;
  renewalAvailable?: boolean;
  status: string; // OPEN | CLOSING_SOON | CLOSED | UPCOMING
  computedStatus?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  faqs?: string | null;
  bannerUrl?: string | null;
}

interface Props {
  initialScholarships: ScholarshipItem[];
}

const ITEMS_PER_PAGE = 12;

// Guaranteed static fallback if database/network is offline
const FALLBACK_SCHOLARSHIPS_LIST: ScholarshipItem[] = REAL_SCHOLARSHIPS_100.map((s, idx) => ({
  id: `fallback-${idx + 1}`,
  ...s,
  isPublished: true,
}));

export function ScholarshipsClient({ initialScholarships }: Props) {
  const [scholarships, setScholarships] = useState<ScholarshipItem[]>(
    Array.isArray(initialScholarships) ? initialScholarships : FALLBACK_SCHOLARSHIPS_LIST
  );
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedScholarship, setSelectedScholarship] = useState<ScholarshipItem | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (Array.isArray(initialScholarships)) {
      setScholarships(initialScholarships);
    } else {
      setLoading(true);
      fetch("/api/scholarships")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load scholarships");
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) throw new Error("Invalid response format");
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setScholarships(data);
          } else {
            setScholarships(FALLBACK_SCHOLARSHIPS_LIST);
          }
        })
        .catch(() => {
          setScholarships(FALLBACK_SCHOLARSHIPS_LIST);
        })
        .finally(() => setLoading(false));
    }
  }, [initialScholarships]);

  // Auto Status calculation function
  const calculateAutoStatus = (s: ScholarshipItem) => {
    if (s.computedStatus) return s.computedStatus;
    if (!s.deadlineDate) return s.status || "OPEN";
    const now = Date.now();
    const d = new Date(s.deadlineDate).getTime();
    const diffDays = Math.ceil((d - now) / (1000 * 3600 * 24));
    if (diffDays < 0) return "CLOSED";
    if (diffDays <= 7) return "CLOSING_SOON";
    return s.status || "OPEN";
  };

  // Filter logic
  const filteredScholarships = useMemo(() => {
    return scholarships.filter((s) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.provider.toLowerCase().includes(q) ||
        s.eligibleCourses.toLowerCase().includes(q) ||
        s.eligibleStates.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.scholarshipType.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.amount.toLowerCase().includes(q) ||
        s.eligibilityCriteria.toLowerCase().includes(q);

      const matchesProvider =
        providerFilter === "all" ||
        (providerFilter === "central" && s.category === "Central Government") ||
        (providerFilter === "state" && s.category === "State Government") ||
        (providerFilter === "private" && s.category === "Private") ||
        s.category.toLowerCase().includes(providerFilter.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" ||
        s.scholarshipType.toLowerCase().includes(categoryFilter.toLowerCase());

      const matchesCourse =
        courseFilter === "all" ||
        s.eligibleCourses.toLowerCase().includes(courseFilter.toLowerCase());

      const effStatus = calculateAutoStatus(s);
      const matchesStatus =
        statusFilter === "all" ||
        effStatus.toUpperCase() === statusFilter.toUpperCase();

      return matchesSearch && matchesProvider && matchesCategory && matchesCourse && matchesStatus;
    });
  }, [scholarships, search, providerFilter, categoryFilter, courseFilter, statusFilter]);

  // Recommended fallbacks if search returns 0 items
  const recommendedScholarships = useMemo(() => {
    return scholarships.filter((s) => s.isFeatured || s.category === "Central Government").slice(0, 6);
  }, [scholarships]);

  // Pagination logic
  const totalPages = Math.ceil(filteredScholarships.length / ITEMS_PER_PAGE) || 1;
  const paginatedScholarships = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredScholarships.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredScholarships, currentPage]);

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearch("");
    setProviderFilter("all");
    setCategoryFilter("all");
    setCourseFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    search || providerFilter !== "all" || categoryFilter !== "all" || courseFilter !== "all" || statusFilter !== "all"
  );

  const getStatusBadge = (status: string) => {
    const st = (status || "OPEN").toUpperCase();
    if (st === "CLOSING_SOON") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
          <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
          <span>Closing Soon (Within 7 Days)</span>
        </span>
      );
    }
    if (st === "CLOSED") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
          <X className="w-3 h-3 text-red-600" />
          <span>Application Closed</span>
        </span>
      );
    }
    if (st === "UPCOMING") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
          <CalendarDays className="w-3 h-3 text-blue-600" />
          <span>Upcoming</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>Open</span>
      </span>
    );
  };

  const getProviderBadgeStyle = (category: string) => {
    if (category === "Central Government") return "bg-indigo-50 text-indigo-800 border-indigo-200";
    if (category === "State Government") return "bg-amber-50 text-amber-900 border-amber-200";
    return "bg-purple-50 text-purple-900 border-purple-200";
  };

  return (
    <div className="font-sans pb-20 bg-stone-50/70 min-h-screen" suppressHydrationWarning>
      {/* Header Hero Banner */}
      <div className="bg-white border-b border-stone-200/90 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-extrabold uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-orange-500" />
                <span>Verified National & State Scholarship Portal</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-serif font-extrabold text-brand-navy tracking-tight">
                Scholarship Directory
              </h1>
              <p className="text-stone-500 text-xs sm:text-sm leading-relaxed font-medium">
                Explore real, verified scholarship schemes from Central Ministries, State Governments, AICTE, UGC, NSP, and reputed private foundations.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 bg-gradient-to-br from-stone-50 via-white to-stone-50 p-4 sm:p-5 rounded-3xl border border-stone-200/90 shrink-0 text-center shadow-xs">
              <div className="px-2">
                <div className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight" suppressHydrationWarning>
                  {scholarships.length}
                </div>
                <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mt-0.5">Live Schemes</div>
              </div>
              <div className="border-x border-stone-200/80 px-3 sm:px-4">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">100%</div>
                <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mt-0.5">Official Links</div>
              </div>
              <div className="px-2">
                <div className="text-2xl sm:text-3xl font-black text-orange-600 tracking-tight">Free</div>
                <div className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mt-0.5">Direct Apply</div>
              </div>
            </div>
          </div>

          {/* Unified Elevated Filter Dashboard Card */}
          <div className="mt-8 bg-gradient-to-br from-white via-stone-50/40 to-white border border-stone-200/90 rounded-3xl p-6 lg:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
            {/* Row 1: Search Bar & Deadline Status */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                <input
                  id="scholarship-search"
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  suppressHydrationWarning
                  placeholder="Search by scholarship name, provider, course (e.g. B.Tech, MBBS), state, or category..."
                  className="w-full pl-11 pr-10 py-3.5 bg-white border border-stone-200/90 rounded-2xl text-xs sm:text-sm text-stone-900 placeholder-stone-400 font-medium focus:outline-none focus:border-brand-navy focus:ring-4 focus:ring-indigo-900/10 transition-all shadow-xs"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    suppressHydrationWarning
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status Selector Dropdown */}
              <div className="shrink-0">
                <select
                  value={statusFilter}
                  onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
                  suppressHydrationWarning
                  className="w-full sm:w-auto px-4 py-3.5 bg-white border border-stone-200/90 rounded-2xl text-xs font-extrabold text-stone-800 focus:outline-none focus:border-brand-navy cursor-pointer shadow-xs"
                >
                  <option value="all">Status: All Deadlines</option>
                  <option value="open">Open Now</option>
                  <option value="closing_soon">Closing Soon (within 7 days)</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Row 2: Provider Tabs & Clear Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-stone-150">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-stone-400 shrink-0 sm:w-24">
                  Provider:
                </span>
                <div className="flex flex-wrap items-center gap-1.5 bg-stone-100/90 p-1.5 rounded-2xl border border-stone-200/80">
                  {[
                    { id: "all", label: "All Providers" },
                    { id: "central", label: "Central Govt" },
                    { id: "state", label: "State Govt (TN)" },
                    { id: "private", label: "Private Foundations" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleFilterChange(setProviderFilter, p.id)}
                      suppressHydrationWarning
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        providerFilter === p.id
                          ? "bg-brand-navy text-white shadow-sm scale-[1.02]"
                          : "text-stone-600 hover:text-stone-900 hover:bg-white/80"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  suppressHydrationWarning
                  className="px-4 py-2 text-xs font-extrabold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 self-start md:self-auto"
                >
                  <X className="w-3.5 h-3.5" /> Clear All Filters
                </button>
              )}
            </div>

            {/* Row 3: Category Filter Pills */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-stone-400 shrink-0 sm:w-24 sm:pt-2">
                Category:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "all", label: "All Categories" },
                  { id: "merit", label: "Merit Based" },
                  { id: "need", label: "Need Based" },
                  { id: "girl", label: "Girl Students" },
                  { id: "sc", label: "SC" },
                  { id: "st", label: "ST" },
                  { id: "bc", label: "BC" },
                  { id: "mbc", label: "MBC" },
                  { id: "minority", label: "Minority" },
                  { id: "ews", label: "EWS" },
                  { id: "sports", label: "Sports" },
                  { id: "disabled", label: "Disabled Students" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleFilterChange(setCategoryFilter, c.id)}
                    suppressHydrationWarning
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      categoryFilter === c.id
                        ? "bg-orange-600 text-white border-orange-600 shadow-xs"
                        : "bg-white text-stone-700 border-stone-200 hover:border-orange-400 hover:bg-orange-50/50"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 4: Course Filter Pills */}
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-stone-400 shrink-0 sm:w-24 sm:pt-2">
                Courses:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: "all", label: "All Degrees" },
                  { id: "b.tech", label: "Engineering" },
                  { id: "mbbs", label: "Medical" },
                  { id: "arts", label: "Arts" },
                  { id: "b.sc", label: "Science" },
                  { id: "b.com", label: "Commerce" },
                  { id: "mba", label: "MBA" },
                  { id: "law", label: "Law" },
                  { id: "diploma", label: "Polytechnic / Diploma" },
                ].map((crs) => (
                  <button
                    key={crs.id}
                    onClick={() => handleFilterChange(setCourseFilter, crs.id)}
                    suppressHydrationWarning
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      courseFilter === crs.id
                        ? "bg-indigo-950 text-white border-indigo-950 shadow-xs"
                        : "bg-white text-stone-700 border-stone-200 hover:border-indigo-400 hover:bg-indigo-50/50"
                    }`}
                  >
                    {crs.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Results Container */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Results Bar */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            Showing <span className="text-stone-900 font-black" suppressHydrationWarning>{filteredScholarships.length}</span> Verified Scholarships
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Verified Official Application Links</span>
          </div>
        </div>

        {/* Empty State Fallback with Recommended Schemes */}
        {filteredScholarships.length === 0 ? (
          <div className="space-y-12">
            <div className="bg-white border border-stone-200 rounded-3xl p-10 text-center space-y-4 max-w-xl mx-auto shadow-xs">
              <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-200 text-orange-500 flex items-center justify-center mx-auto">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-extrabold text-stone-900">No Specific Match for Current Filters</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                We couldn't find scholarships matching all your selected search criteria. You can reset filters or explore our top recommended national scholarship schemes below.
              </p>
              <button
                onClick={clearAllFilters}
                suppressHydrationWarning
                className="px-6 py-2.5 bg-indigo-900 text-white text-xs font-bold rounded-xl hover:bg-indigo-950 transition-all cursor-pointer shadow-xs"
              >
                Reset All Filters
              </button>
            </div>

            {/* Recommended Scholarships Section */}
            <div className="space-y-6 pt-4 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold text-orange-600 uppercase tracking-wider">Suggested For You</div>
                  <h2 className="text-xl font-bold text-stone-900">Top Recommended Scholarships</h2>
                </div>
                <button onClick={clearAllFilters} suppressHydrationWarning className="text-xs font-bold text-indigo-900 hover:underline">
                  Browse All Scholarships &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedScholarships.map((s) => (
                  <ScholarshipCard key={s.id} s={s} onSelect={setSelectedScholarship} getStatusBadge={getStatusBadge} getProviderBadgeStyle={getProviderBadgeStyle} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Primary Scholarship Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedScholarships.map((s, idx) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                >
                  <ScholarshipCard s={s} onSelect={setSelectedScholarship} getStatusBadge={getStatusBadge} getProviderBadgeStyle={getProviderBadgeStyle} />
                </motion.div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  suppressHydrationWarning
                  className="p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 text-stone-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setCurrentPage(pg)}
                      suppressHydrationWarning
                      className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                        currentPage === pg
                          ? "bg-indigo-900 text-white shadow-xs"
                          : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-100"
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  suppressHydrationWarning
                  className="p-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-40 text-stone-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* SCHOLARSHIP DETAILED MODAL */}
      <AnimatePresence>
        {selectedScholarship && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs font-sans overflow-y-auto" suppressHydrationWarning>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto flex flex-col justify-between relative my-auto"
            >
              {/* Modal Top Header */}
              <div className="p-6 md:p-8 bg-gradient-to-r from-indigo-950 via-brand-navy to-indigo-900 text-white relative">
                <button
                  onClick={() => setSelectedScholarship(null)}
                  suppressHydrationWarning
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-3 pr-10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-extrabold px-3 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30 uppercase tracking-wider">
                      {selectedScholarship.category}
                    </span>
                    <span className="text-[11px] font-extrabold px-3 py-0.5 rounded-full bg-white/15 text-white border border-white/20">
                      {selectedScholarship.scholarshipType}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      <Shield className="w-3 h-3 text-emerald-400" /> Official Scheme
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-extrabold leading-tight">{selectedScholarship.name}</h2>

                  <div className="text-white/80 text-xs font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>Provider: <strong>{selectedScholarship.provider}</strong></span>
                  </div>
                </div>
              </div>

              {/* Modal Body Content */}
              <div className="p-6 md:p-8 space-y-6 flex-1">
                {/* Scholarship Amount Banner */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Scholarship Award Amount</div>
                    <div className="text-2xl font-black text-emerald-950 mt-1">{selectedScholarship.amount}</div>
                  </div>
                  <div className="text-xs font-bold px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-800 w-fit">
                    Deadline: <span className="text-stone-900 font-extrabold">{selectedScholarship.deadline || "Open"}</span>
                  </div>
                </div>

                {/* Scheme Overview */}
                <div className="space-y-2">
                  <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-900" />
                    <span>Scheme Description</span>
                  </h3>
                  <p className="text-xs md:text-sm text-stone-700 leading-relaxed font-normal bg-stone-50 p-4 rounded-xl border border-stone-200/80">
                    {selectedScholarship.description}
                  </p>
                </div>

                {/* Detailed Eligibility */}
                <div className="space-y-2">
                  <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-orange-600" />
                    <span>Eligibility Criteria</span>
                  </h3>
                  <div className="bg-stone-50 border border-stone-200/80 p-4 rounded-xl text-xs md:text-sm text-stone-700 leading-relaxed">
                    {selectedScholarship.eligibilityCriteria}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                      <span className="text-[10px] font-bold text-indigo-900 uppercase block">Eligible Courses</span>
                      <span className="text-xs font-extrabold text-stone-900">{selectedScholarship.eligibleCourses}</span>
                    </div>

                    <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                      <span className="text-[10px] font-bold text-amber-900 uppercase block">Eligible States</span>
                      <span className="text-xs font-extrabold text-stone-900">{selectedScholarship.eligibleStates}</span>
                    </div>

                    <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                      <span className="text-[10px] font-bold text-emerald-900 uppercase block">Family Income Limit</span>
                      <span className="text-xs font-extrabold text-stone-900">{selectedScholarship.familyIncomeLimitText || "No Income Bar"}</span>
                    </div>
                  </div>
                </div>

                {/* Required Documents */}
                <div className="space-y-2">
                  <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Documents Required Checklist</span>
                  </h3>
                  <div className="bg-emerald-50/40 border border-emerald-200/80 p-4 rounded-xl text-xs md:text-sm text-stone-800 leading-relaxed">
                    {selectedScholarship.requiredDocuments}
                  </div>
                </div>

                {/* Selection & Renewal Details */}
                {selectedScholarship.selectionProcess && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>Selection Process & Renewal Details</span>
                    </h3>
                    <div className="bg-purple-50/40 border border-purple-200/80 p-4 rounded-xl text-xs text-purple-950 leading-relaxed">
                      {selectedScholarship.selectionProcess}
                      {selectedScholarship.renewalAvailable !== false && " Renewal available annually subject to academic progress."}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="p-6 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-3xl">
                <a
                  href={selectedScholarship.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-stone-600 hover:text-indigo-900 flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Official Website ({selectedScholarship.provider})</span>
                </a>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedScholarship(null)}
                    suppressHydrationWarning
                    className="px-5 py-2.5 bg-white border border-stone-300 text-stone-700 text-xs font-bold rounded-xl hover:bg-stone-100 transition-all cursor-pointer"
                  >
                    Close
                  </button>

                  <a
                    href={selectedScholarship.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-7 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>Apply Now (Official Portal)</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-component for clean card rendering
function ScholarshipCard({
  s,
  onSelect,
  getStatusBadge,
  getProviderBadgeStyle,
}: {
  s: ScholarshipItem;
  onSelect: (s: ScholarshipItem) => void;
  getStatusBadge: (st: string) => React.ReactNode;
  getProviderBadgeStyle: (cat: string) => string;
}) {
  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group h-full">
      {/* Card Header */}
      <div className="p-5 border-b border-stone-100 space-y-3 bg-gradient-to-b from-stone-50/50 to-white">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${getProviderBadgeStyle(s.category)}`}>
              {s.category}
            </span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
              {s.scholarshipType}
            </span>
          </div>
          {getStatusBadge(s.computedStatus || s.status)}
        </div>

        <div>
          <h3 className="font-extrabold text-stone-900 text-base leading-snug group-hover:text-orange-600 transition-colors line-clamp-2" title={s.name}>
            {s.name}
          </h3>
          <div className="text-xs text-stone-500 font-medium mt-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate">{s.provider}</span>
          </div>
        </div>
      </div>

      {/* Card Body Specs */}
      <div className="p-5 flex-1 space-y-4">
        {/* Highlighted Amount */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 p-3 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Scholarship Amount</div>
            <div className="text-base font-extrabold text-emerald-950 mt-0.5">{s.amount}</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
            ₹
          </div>
        </div>

        {/* Eligibility Details */}
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2 text-stone-700">
            <GraduationCap className="w-4 h-4 text-indigo-900 shrink-0 mt-0.5" />
            <div className="line-clamp-2">
              <span className="font-bold text-stone-900">Courses:</span> {s.eligibleCourses}
            </div>
          </div>

          {s.minPercentage && (
            <div className="flex items-center gap-2 text-stone-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-stone-900">Min Percentage:</span> {s.minPercentage}% in 12th
              </div>
            </div>
          )}

          {s.familyIncomeLimitText && (
            <div className="flex items-center gap-2 text-stone-700">
              <DollarSign className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-stone-900">Income Limit:</span> {s.familyIncomeLimitText}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 bg-stone-50/80 border-t border-stone-150 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1 font-medium">
            <CalendarDays className="w-3.5 h-3.5 text-stone-400" />
            <span>Deadline: <strong className="text-stone-800">{s.deadline || "Open"}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => onSelect(s)}
            suppressHydrationWarning
            className="w-full py-2 px-3 bg-white hover:bg-[#ea580c] hover:border-[#ea580c] hover:text-white active:bg-[#ea580c] active:border-[#ea580c] active:text-white focus:bg-[#ea580c] focus:border-[#ea580c] focus:text-white text-stone-800 font-extrabold text-xs rounded-xl border border-stone-200/90 transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs group active:scale-[0.98]"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-900 group-hover:text-white group-active:text-white transition-colors" />
            <span>View Details</span>
          </button>

          <a
            href={s.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-xs cursor-pointer"
          >
            <span>Apply Now</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
