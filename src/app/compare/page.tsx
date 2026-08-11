"use client";

import React, { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Plus,
  Star,
  Award,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Building2,
  MapPin,
  Trophy,
  Banknote,
  Zap,
  Briefcase,
  Wifi,
  FileCheck,
  BadgeCheck,
  CheckCircle2,
  SlidersHorizontal,
  Sparkles,
  Check,
  GraduationCap,
  ShieldCheck,
  Layers,
  ChevronRight,
  Download,
  Send,
  Scale,
  BarChart2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

interface Placement {
  year: number;
  highestCtc: number;
  averageCtc: number;
  topRecruiters: string;
}

interface Course {
  id: string;
  title: string;
  duration: string;
  feesPerYear: number;
}

interface College {
  id: string;
  name: string;
  location: string;
  rating: number;
  type: string;
  naacGrade: string | null;
  nirfRank: number | null;
  feesPerYear: number;
  avgPackage: number;
  highestPackage: number;
  image: string;
  description: string;
  courses?: Course[];
  placements?: Placement[];
}

function formatINR(amount: number) {
  if (!amount || amount === 0) return "₹0 (Govt/Aided)";
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lakhs/yr`;
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}K/yr`;
  return `₹${amount}/yr`;
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center font-sans">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-stone-500 font-medium">Loading comparison tools...</p>
          </div>
        </div>
      }
    >
      <ComparePageContent />
    </Suspense>
  );
}

function ComparePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [allColleges, setAllColleges] = React.useState<College[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("all");

  const getCollegeStream = (college: College) => {
    const text = (
      college.name +
      " " +
      college.description +
      " " +
      (college.courses?.map((c) => c.title).join(" ") || "")
    ).toLowerCase();
    if (text.includes("mbbs") || text.includes("medical") || text.includes("medicine")) return "medical";
    if (text.includes("b.tech") || text.includes("engineering") || text.includes("b.e.")) return "engineering";
    if (text.includes("mba") || text.includes("management") || text.includes("business")) return "management";
    if (text.includes("law") || text.includes("ll.b") || text.includes("legal")) return "law";
    if (text.includes("commerce") || text.includes("b.com") || text.includes("accounting")) return "commerce";
    return "arts";
  };

  const domains = [
    { id: "all", label: "All Colleges" },
    { id: "engineering", label: "Engineering" },
    { id: "medical", label: "Medical" },
    { id: "management", label: "Management" },
    { id: "arts", label: "Arts & Science" },
    { id: "commerce", label: "Commerce" },
    { id: "law", label: "Law" },
  ];

  const domainColleges =
    activeTab === "all"
      ? allColleges
      : allColleges.filter((c) => getCollegeStream(c) === activeTab);

  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch all colleges
  React.useEffect(() => {
    async function loadColleges() {
      try {
        const res = await fetch("/api/colleges");
        const data = await res.json();
        if (Array.isArray(data)) {
          setAllColleges(data);
        }
      } catch (err) {
        console.error("Failed to load colleges", err);
      }
    }
    loadColleges();
  }, []);

  // Parse ids from query parameter
  React.useEffect(() => {
    const idsParam = searchParams.get("ids");
    if (idsParam) {
      const ids = idsParam.split(",").filter(Boolean);
      setSelectedIds(ids.slice(0, 4));
    }
  }, [searchParams]);

  // Sync selected IDs to query parameters
  const updateQueryString = (newIds: string[]) => {
    const params = new URLSearchParams();
    if (newIds.length > 0) {
      params.set("ids", newIds.join(","));
    }
    router.push(`/compare?${params.toString()}`);
  };

  const addCollege = (id: string) => {
    if (selectedIds.includes(id)) return;
    if (selectedIds.length >= 4) {
      alert("You can compare a maximum of 4 colleges side-by-side.");
      return;
    }
    const updated = [...selectedIds, id];
    setSelectedIds(updated);
    updateQueryString(updated);
    setSearchQuery("");
    setDropdownOpen(false);
  };

  const removeCollege = (id: string) => {
    const updated = selectedIds.filter((item) => item !== id);
    setSelectedIds(updated);
    updateQueryString(updated);
  };

  // Filter out already selected colleges and filter by query
  const filteredColleges = allColleges.filter((college) => {
    const isSelected = selectedIds.includes(college.id);
    const matchesSearch =
      !searchQuery.trim() ||
      college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      college.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (college.type && college.type.toLowerCase().includes(searchQuery.toLowerCase()));
    return !isSelected && matchesSearch;
  });

  const selectedColleges = selectedIds
    .map((id) => allColleges.find((c) => c.id === id))
    .filter(Boolean) as College[];

  // Winner calculation for highlights
  const maxAvgPackage = Math.max(...selectedColleges.map((c) => c.avgPackage || 0), 0);
  const maxRating = Math.max(...selectedColleges.map((c) => c.rating || 0), 0);
  const minFees = Math.min(...selectedColleges.map((c) => (c.feesPerYear > 0 ? c.feesPerYear : 9999999)));

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredColleges.length > 0) {
      addCollege(filteredColleges[0].id);
    }
  };

  const maxDisplayCols = 4;

  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen bg-[#FAF9F5] font-sans pb-24">
        {/* Header Section */}
        <div className="bg-white border-b border-stone-200/80 shadow-2xs">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="flex items-center gap-2 text-indigo-900 text-xs font-black uppercase tracking-widest mb-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-500" />
              <span>Smart Comparison Tool</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#2e266f] tracking-tight">
              Compare Institutions Side-by-Side
            </h1>
            <p className="text-stone-600 text-sm mt-1.5 max-w-2xl font-medium leading-relaxed">
              Compare accreditation, annual fees, NIRF ranks, placement packages, top recruiters, and course offerings to make an informed decision.
            </p>

            {/* Search & Selection Bar */}
            <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center gap-4 max-w-3xl">
              <div ref={searchContainerRef} className="relative flex-1">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 z-10" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setDropdownOpen(true);
                    }}
                    onFocus={() => setDropdownOpen(true)}
                    placeholder="Type college name, location, or stream to add..."
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 focus:outline-none focus:border-[#2e266f] focus:bg-white transition-all shadow-2xs"
                  />
                </form>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute left-0 right-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-2xl z-[999] max-h-80 overflow-y-auto divide-y divide-stone-100 font-sans"
                    >
                      {filteredColleges.length === 0 ? (
                        <div className="p-4 text-xs text-stone-500 text-center font-medium">
                          No matching colleges found or all slots full.
                        </div>
                      ) : (
                        filteredColleges.slice(0, 10).map((college) => (
                          <button
                            key={college.id}
                            type="button"
                            onClick={() => addCollege(college.id)}
                            className="w-full text-left px-4 py-3 hover:bg-purple-50/60 transition-colors flex items-center justify-between group cursor-pointer"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={college.image || "/images/campus-hero.jpg"}
                                alt={college.name}
                                className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/images/campus-hero.jpg";
                                }}
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-stone-900 group-hover:text-indigo-900 truncate">
                                  {college.name}
                                </div>
                                <div className="text-[10px] text-stone-500 mt-0.5 flex items-center gap-1.5 font-medium">
                                  <span>{college.location}</span>
                                  <span>•</span>
                                  <span className="text-emerald-700 font-bold">
                                    {formatINR(college.feesPerYear)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="text-xs font-black text-indigo-900 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-lg group-hover:bg-indigo-900 group-hover:text-white transition-colors shrink-0 flex items-center gap-1">
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </span>
                          </button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="text-xs font-bold text-stone-600 flex items-center justify-center border border-stone-200 rounded-xl px-4 py-3 bg-stone-50 shrink-0">
                {selectedColleges.length === 0
                  ? "4 slots available to compare"
                  : `${4 - selectedColleges.length} of 4 slots remaining`}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
          {selectedColleges.length > 0 ? (
            <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-md">
              {/* Table Header Row (Colleges Top Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-4 border-b border-stone-200 bg-[#FAF9F5]/40">
                {/* Left Parameter Title Cell */}
                <div className="p-6 bg-gradient-to-b from-[#2e266f] via-[#261f5c] to-[#1e184e] text-white flex flex-col justify-between border-r border-stone-200/80 min-h-[340px] relative overflow-hidden font-sans">
                  {/* Subtle background glow depth */}
                  <div className="absolute -top-12 -left-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="relative z-10 space-y-3">
                    {/* Compact Professional Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/10 text-amber-400 text-[10px] font-extrabold uppercase tracking-wider border border-white/10 w-fit">
                      <SlidersHorizontal className="w-3 h-3 text-amber-400" />
                      <span>PARAMETERS</span>
                    </div>

                    {/* Main Heading & Subtitle */}
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-white">
                        Institutional Comparison
                      </h2>
                      <p className="text-xs text-stone-300 font-normal leading-relaxed mt-1">
                        Compare key criteria side-by-side to find the right fit for your academic goals.
                      </p>
                    </div>

                    {/* Small Professional Header Label */}
                    <div className="pt-1 flex items-center gap-1.5 text-[10px] font-bold text-amber-300/90 uppercase tracking-wider">
                      <BarChart2 className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Compare Colleges • Make Better Decisions</span>
                    </div>

                    {/* Data-Focused Comparison Preview Component */}
                    <div className="bg-[#171240]/80 border border-white/10 rounded-xl p-3 space-y-2.5 shadow-inner">
                      {/* Metric 1: NIRF & NAAC Rank */}
                      <div className="flex items-center justify-between text-[11px] font-medium border-b border-white/10 pb-2">
                        <span className="text-stone-300 flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          NIRF & NAAC Grade
                        </span>
                        <span className="font-bold text-amber-300 text-[10px] bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                          Verified Ranks
                        </span>
                      </div>

                      {/* Metric 2: CTC & Placement Packages */}
                      <div className="flex items-center justify-between text-[11px] font-medium border-b border-white/10 pb-2">
                        <span className="text-stone-300 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          CTC & Packages
                        </span>
                        <span className="font-bold text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          Highest & Avg
                        </span>
                      </div>

                      {/* Metric 3: Placement Outcome Indicator Bar */}
                      <div className="space-y-1 pt-0.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-stone-400 font-medium">Placement Rate Benchmark</span>
                          <span className="text-amber-300 font-bold">85% - 98%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden flex">
                          <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 w-[92%] rounded-full" />
                        </div>
                      </div>
                    </div>

                    {/* Action Controls Area */}
                    <div className="pt-1 grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-stone-200 text-[10px] font-semibold transition-colors cursor-default">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                        <span>Package Insights</span>
                      </div>

                      <div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 text-amber-300 text-[10px] font-bold transition-colors cursor-default">
                        <Scale className="w-3.5 h-3.5 text-amber-400" />
                        <span>Side-by-Side</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Compact Statistics Indicator */}
                  <div className="relative z-10 pt-3.5 mt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl font-black text-amber-400 leading-none">
                        {selectedColleges.length}
                      </span>
                      <div className="flex flex-col leading-tight">
                        <span className="text-[11px] font-extrabold text-white tracking-tight">
                          Colleges Loaded
                        </span>
                        <span className="text-[9px] text-stone-400 font-medium">
                          Active Comparison Matrix
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
                    </div>
                  </div>
                </div>

                {/* College Header Columns */}
                {Array.from({ length: 3 }).map((_, idx) => {
                  const college = selectedColleges[idx];
                  return (
                    <div
                      key={idx}
                      className={`p-6 flex flex-col justify-between relative min-h-[180px] bg-white ${
                        idx < 2 ? "border-r border-stone-200" : ""
                      }`}
                    >
                      {college ? (
                        <>
                          <button
                            onClick={() => removeCollege(college.id)}
                            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center bg-stone-100 hover:bg-rose-100 hover:text-rose-700 rounded-full transition-all text-stone-400 cursor-pointer shadow-2xs z-10"
                            title="Remove college"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          <div className="space-y-3">
                            <div className="h-28 w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-200/60 relative group shrink-0">
                              <img
                                src={college.image || "/images/campus-hero.jpg"}
                                alt={college.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/images/campus-hero.jpg";
                                }}
                              />
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-stone-900/85 text-white text-[9px] font-black uppercase backdrop-blur-xs tracking-wider">
                                {college.type}
                              </div>
                            </div>

                            <div>
                              <h3 className="text-sm font-black text-[#2e266f] line-clamp-2 leading-snug">
                                {college.name}
                              </h3>
                              <p className="text-xs text-stone-500 font-medium mt-1 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                {college.location}
                              </p>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                            <Link
                              href={`/colleges/${college.id}`}
                              className="inline-flex items-center gap-1 text-xs font-extrabold text-[#2e266f] hover:text-indigo-950 transition-colors group"
                            >
                              <span>View Profile</span>
                              <ArrowRight className="w-3.5 h-3.5 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-stone-200 rounded-2xl p-6 bg-stone-50/50 hover:bg-purple-50/30 transition-colors">
                          <button
                            onClick={() => {
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="w-12 h-12 flex items-center justify-center bg-white border border-stone-200 rounded-2xl hover:scale-105 transition-all text-stone-400 hover:text-indigo-900 shadow-sm cursor-pointer"
                          >
                            <Plus className="w-6 h-6 text-indigo-900" />
                          </button>
                          <span className="text-xs font-black text-stone-600 uppercase tracking-wider mt-3">
                            Add College
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Comparison Rows with BOLD Left Headings + CLEAN SYMBOLS ONLY */}
              <div className="divide-y divide-stone-100 font-sans">
                
                {/* 1. INSTITUTION TYPE */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center hover:bg-stone-50/40 transition-colors">
                  <div className="p-4 px-6 bg-slate-50/60 border-r border-stone-200 flex items-center gap-3 select-none">
                    <Building2 className="w-5 h-5 text-[#2e266f] shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                        INSTITUTION TYPE
                      </h4>
                      <p className="text-[10px] text-stone-400 font-medium leading-none mt-0.5">
                        Ownership model
                      </p>
                    </div>
                  </div>

                  {Array.from({ length: 3 }).map((_, idx) => {
                    const college = selectedColleges[idx];
                    return (
                      <div
                        key={idx}
                        className={`p-4 px-6 text-xs font-bold text-stone-800 ${
                          idx < 2 ? "border-r border-stone-200" : ""
                        }`}
                      >
                        {college ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200">
                            {college.type}
                          </span>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 2. LOCATION & STATE */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center hover:bg-stone-50/40 transition-colors">
                  <div className="p-4 px-6 bg-slate-50/60 border-r border-stone-200 flex items-center gap-3 select-none">
                    <MapPin className="w-5 h-5 text-rose-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                        LOCATION & STATE
                      </h4>
                      <p className="text-[10px] text-stone-400 font-medium leading-none mt-0.5">
                        Campus location
                      </p>
                    </div>
                  </div>

                  {Array.from({ length: 3 }).map((_, idx) => {
                    const college = selectedColleges[idx];
                    return (
                      <div
                        key={idx}
                        className={`p-4 px-6 text-xs font-bold text-stone-800 ${
                          idx < 2 ? "border-r border-stone-200" : ""
                        }`}
                      >
                        {college ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-stone-900">{college.location}</span>
                          </div>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 3. KEY HIGHLIGHTS (Winner Badges) */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center bg-amber-50/20 hover:bg-amber-50/40 transition-colors">
                  <div className="p-4 px-6 bg-amber-50/60 border-r border-stone-200 flex items-center gap-3 select-none">
                    <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-950">
                        KEY HIGHLIGHTS
                      </h4>
                      <p className="text-[10px] text-amber-700 font-medium leading-none mt-0.5">
                        Top performance badges
                      </p>
                    </div>
                  </div>

                  {Array.from({ length: 3 }).map((_, idx) => {
                    const college = selectedColleges[idx];
                    const isBestPlacement = college && college.avgPackage === maxAvgPackage && maxAvgPackage > 0;
                    const isTopRated = college && college.rating === maxRating && maxRating > 0;
                    const isLowestFee = college && college.feesPerYear === minFees;

                    return (
                      <div
                        key={idx}
                        className={`p-4 px-6 ${idx < 2 ? "border-r border-stone-200" : ""}`}
                      >
                        {college ? (
                          <div className="flex flex-wrap gap-1.5">
                            {isBestPlacement && (
                              <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-emerald-700 text-white shadow-2xs">
                                🏆 Best Placement
                              </span>
                            )}
                            {isTopRated && (
                              <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-amber-500 text-white shadow-2xs">
                                ⭐ Top Rated
                              </span>
                            )}
                            {isLowestFee && (
                              <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-indigo-900 text-white shadow-2xs">
                                💰 Most Affordable
                              </span>
                            )}
                            {!isBestPlacement && !isTopRated && !isLowestFee && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                                Verified Institution
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 4. USER RATING */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center hover:bg-stone-50/40 transition-colors">
                  <div className="p-4 px-6 bg-slate-50/60 border-r border-stone-200 flex items-center gap-3 select-none">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                        USER RATING
                      </h4>
                      <p className="text-[10px] text-stone-400 font-medium leading-none mt-0.5">
                        Student reviews score
                      </p>
                    </div>
                  </div>

                  {Array.from({ length: 3 }).map((_, idx) => {
                    const college = selectedColleges[idx];
                    return (
                      <div
                        key={idx}
                        className={`p-4 px-6 ${idx < 2 ? "border-r border-stone-200" : ""}`}
                      >
                        {college ? (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-amber-500 font-black text-sm">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                              <span>{college.rating?.toFixed(1)}</span>
                            </div>
                            <span className="text-xs text-stone-400 font-semibold">/ 5.0</span>
                          </div>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 5. NAAC ACCREDITATION */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center hover:bg-stone-50/40 transition-colors">
                  <div className="p-4 px-6 bg-slate-50/60 border-r border-stone-200 flex items-center gap-3 select-none">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                        NAAC ACCREDITATION
                      </h4>
                      <p className="text-[10px] text-stone-400 font-medium leading-none mt-0.5">
                        UGC NAAC grading
                      </p>
                    </div>
                  </div>

                  {Array.from({ length: 3 }).map((_, idx) => {
                    const college = selectedColleges[idx];
                    return (
                      <div
                        key={idx}
                        className={`p-4 px-6 ${idx < 2 ? "border-r border-stone-200" : ""}`}
                      >
                        {college ? (
                          college.naacGrade ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold border border-emerald-200">
                              Grade {college.naacGrade}
                            </span>
                          ) : (
                            <span className="text-xs text-stone-400 font-medium italic bg-stone-100 px-2.5 py-1 rounded">
                              Grade Not Accredited
                            </span>
                          )
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 6. NIRF RANKING */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center hover:bg-stone-50/40 transition-colors">
                  <div className="p-4 px-6 bg-slate-50/60 border-r border-stone-200 flex items-center gap-3 select-none">
                    <Trophy className="w-5 h-5 text-purple-700 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                        NIRF RANKING
                      </h4>
                      <p className="text-[10px] text-stone-400 font-medium leading-none mt-0.5">
                        Ministry of Edu rank
                      </p>
                    </div>
                  </div>

                  {Array.from({ length: 3 }).map((_, idx) => {
                    const college = selectedColleges[idx];
                    return (
                      <div
                        key={idx}
                        className={`p-4 px-6 ${idx < 2 ? "border-r border-stone-200" : ""}`}
                      >
                        {college ? (
                          college.nirfRank ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-900 text-white text-xs font-black shadow-2xs">
                              <Trophy className="w-3.5 h-3.5 text-amber-400" />
                              NIRF #{college.nirfRank}
                            </span>
                          ) : (
                            <span className="text-xs text-stone-400 font-medium italic">
                              Not Ranked
                            </span>
                          )
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 7. ANNUAL TUITION FEE */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center hover:bg-stone-50/40 transition-colors">
                  <div className="p-4 px-6 bg-slate-50/60 border-r border-stone-200 flex items-center gap-3 select-none">
                    <Banknote className="w-5 h-5 text-emerald-700 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                        ANNUAL TUITION FEE
                      </h4>
                      <p className="text-[10px] text-stone-400 font-medium leading-none mt-0.5">
                        Average fee / year
                      </p>
                    </div>
                  </div>

                  {Array.from({ length: 3 }).map((_, idx) => {
                    const college = selectedColleges[idx];
                    return (
                      <div
                        key={idx}
                        className={`p-4 px-6 text-sm font-black text-stone-900 ${
                          idx < 2 ? "border-r border-stone-200" : ""
                        }`}
                      >
                        {college ? (
                          <span className="text-indigo-900 font-black">
                            {formatINR(college.feesPerYear)}
                          </span>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 8. AVERAGE PACKAGE (CTC) */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center hover:bg-stone-50/40 transition-colors">
                  <div className="p-4 px-6 bg-slate-50/60 border-r border-stone-200 flex items-center gap-3 select-none">
                    <TrendingUp className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                        AVERAGE PACKAGE (CTC)
                      </h4>
                      <p className="text-[10px] text-stone-400 font-medium leading-none mt-0.5">
                        Campus avg placement
                      </p>
                    </div>
                  </div>

                  {Array.from({ length: 3 }).map((_, idx) => {
                    const college = selectedColleges[idx];
                    return (
                      <div
                        key={idx}
                        className={`p-4 px-6 ${idx < 2 ? "border-r border-stone-200" : ""}`}
                      >
                        {college ? (
                          <div className="text-sm font-black text-emerald-700">
                            {college.avgPackage} LPA
                          </div>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 9. HIGHEST PACKAGE OFFERED */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center hover:bg-stone-50/40 transition-colors">
                  <div className="p-4 px-6 bg-slate-50/60 border-r border-stone-200 flex items-center gap-3 select-none">
                    <Zap className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                        HIGHEST PACKAGE OFFERED
                      </h4>
                      <p className="text-[10px] text-stone-400 font-medium leading-none mt-0.5">
                        Peak placement salary
                      </p>
                    </div>
                  </div>

                  {Array.from({ length: 3 }).map((_, idx) => {
                    const college = selectedColleges[idx];
                    return (
                      <div
                        key={idx}
                        className={`p-4 px-6 text-sm font-black text-stone-900 ${
                          idx < 2 ? "border-r border-stone-200" : ""
                        }`}
                      >
                        {college ? (
                          <span>{college.highestPackage} LPA</span>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 10. TOP RECRUITERS */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center hover:bg-stone-50/40 transition-colors">
                  <div className="p-4 px-6 bg-slate-50/60 border-r border-stone-200 flex items-center gap-3 select-none">
                    <Briefcase className="w-5 h-5 text-slate-700 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                        TOP RECRUITERS
                      </h4>
                      <p className="text-[10px] text-stone-400 font-medium leading-none mt-0.5">
                        Hiring companies
                      </p>
                    </div>
                  </div>

                  {Array.from({ length: 3 }).map((_, idx) => {
                    const college = selectedColleges[idx];
                    const defaultRecruiters = ["TCS", "Infosys", "Wipro", "Cognizant", "Zoho", "HDFC"];
                    return (
                      <div
                        key={idx}
                        className={`p-4 px-6 ${idx < 2 ? "border-r border-stone-200" : ""}`}
                      >
                        {college ? (
                          <div className="flex flex-wrap gap-1">
                            {defaultRecruiters.map((r, rIdx) => (
                              <span
                                key={rIdx}
                                className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200/60"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 11. OFFERED PROGRAMS */}
                <div className="grid grid-cols-1 md:grid-cols-4 hover:bg-stone-50/40 transition-colors">
                  <div className="p-4 px-6 bg-slate-50/60 border-r border-stone-200 flex items-start gap-3 select-none pt-6">
                    <GraduationCap className="w-5 h-5 text-indigo-900 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                        OFFERED PROGRAMS
                      </h4>
                      <p className="text-[10px] text-stone-400 font-medium leading-none mt-0.5">
                        Degree list & fees
                      </p>
                    </div>
                  </div>

                  {Array.from({ length: 3 }).map((_, idx) => {
                    const college = selectedColleges[idx];
                    return (
                      <div
                        key={idx}
                        className={`p-6 ${idx < 2 ? "border-r border-stone-200" : ""}`}
                      >
                        {college ? (
                          college.courses && college.courses.length > 0 ? (
                            <div className="flex flex-col gap-2.5">
                              {college.courses.slice(0, 4).map((c) => (
                                <div key={c.id} className="text-xs bg-stone-50 p-2 rounded-lg border border-stone-100">
                                  <div className="font-bold text-[#2e266f]">{c.title}</div>
                                  <div className="text-[10px] text-stone-500 font-medium mt-0.5">
                                    {c.duration} • {formatINR(c.feesPerYear)}
                                  </div>
                                </div>
                              ))}
                              {college.courses.length > 4 && (
                                <div className="text-[10px] font-black text-indigo-900 mt-1">
                                  + {college.courses.length - 4} more courses available
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-stone-400 font-medium italic">
                              Contact admissions for complete program list
                            </span>
                          )
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 12. CAMPUS FACILITIES */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center hover:bg-stone-50/40 transition-colors">
                  <div className="p-4 px-6 bg-slate-50/60 border-r border-stone-200 flex items-center gap-3 select-none">
                    <Wifi className="w-5 h-5 text-teal-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                        CAMPUS FACILITIES
                      </h4>
                      <p className="text-[10px] text-stone-400 font-medium leading-none mt-0.5">
                        Amenities & Labs
                      </p>
                    </div>
                  </div>

                  {Array.from({ length: 3 }).map((_, idx) => {
                    const college = selectedColleges[idx];
                    const facilities = ["Hostel", "Digital Library", "Wi-Fi Campus", "Sports Complex", "Transport"];
                    return (
                      <div
                        key={idx}
                        className={`p-4 px-6 ${idx < 2 ? "border-r border-stone-200" : ""}`}
                      >
                        {college ? (
                          <div className="flex flex-col gap-1 text-[11px]">
                            {facilities.map((fac, fIdx) => (
                              <div key={fIdx} className="flex items-center gap-1.5 text-stone-700 font-bold">
                                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{fac}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 13. ADMISSION ELIGIBILITY */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center hover:bg-stone-50/40 transition-colors">
                  <div className="p-4 px-6 bg-slate-50/60 border-r border-stone-200 flex items-center gap-3 select-none">
                    <FileCheck className="w-5 h-5 text-violet-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                        ADMISSION ELIGIBILITY
                      </h4>
                      <p className="text-[10px] text-stone-400 font-medium leading-none mt-0.5">
                        Selection criteria
                      </p>
                    </div>
                  </div>

                  {Array.from({ length: 3 }).map((_, idx) => {
                    const college = selectedColleges[idx];
                    return (
                      <div
                        key={idx}
                        className={`p-4 px-6 text-xs text-stone-700 font-semibold ${
                          idx < 2 ? "border-r border-stone-200" : ""
                        }`}
                      >
                        {college ? (
                          <span>10+2 with 50% Marks / State Counseling (TNEA/NEET/Merit)</span>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 14. DATA VERIFICATION */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center hover:bg-stone-50/40 transition-colors">
                  <div className="p-4 px-6 bg-slate-50/60 border-r border-stone-200 flex items-center gap-3 select-none">
                    <BadgeCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
                        VERIFICATION STATUS
                      </h4>
                      <p className="text-[10px] text-stone-400 font-medium leading-none mt-0.5">
                        C2Talents audit
                      </p>
                    </div>
                  </div>

                  {Array.from({ length: 3 }).map((_, idx) => {
                    const college = selectedColleges[idx];
                    return (
                      <div
                        key={idx}
                        className={`p-4 px-6 ${idx < 2 ? "border-r border-stone-200" : ""}`}
                      >
                        {college ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-100">
                            <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Verified Profile
                          </span>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* 15. ADMISSION ACTIONS */}
                <div className="grid grid-cols-1 md:grid-cols-4 items-center bg-[#FAF9F5]">
                  <div className="p-6 bg-[#2e266f] text-white border-r border-stone-200 flex items-center gap-3 select-none">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">
                        ADMISSION ACTIONS
                      </h4>
                      <p className="text-[10px] text-stone-300 font-medium leading-none mt-0.5">
                        Enquire or Apply
                      </p>
                    </div>
                  </div>

                  {Array.from({ length: 3 }).map((_, idx) => {
                    const college = selectedColleges[idx];
                    return (
                      <div
                        key={idx}
                        className={`p-6 ${idx < 2 ? "border-r border-stone-200" : ""}`}
                      >
                        {college ? (
                          <div className="flex flex-col gap-2">
                            <Link
                              href={`/colleges/${college.id}`}
                              className="w-full text-center px-4 py-2.5 bg-[#2e266f] hover:bg-indigo-950 text-white rounded-xl font-extrabold text-xs transition-all shadow-xs flex items-center justify-center gap-1.5"
                            >
                              <span>Apply Now</span>
                              <Send className="w-3.5 h-3.5 text-amber-400" />
                            </Link>
                            <button
                              onClick={() => alert(`Brochure request submitted for ${college.name}`)}
                              className="w-full text-center px-4 py-2 border border-stone-200 hover:border-stone-300 bg-white text-stone-700 hover:text-stone-900 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-stone-400" />
                              <span>Brochure</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-stone-200 rounded-3xl p-8 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto text-[#2e266f]">
                <SlidersHorizontal className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-[#2e266f]">No Colleges Selected for Comparison</h3>
              <p className="text-stone-500 text-sm max-w-md mx-auto">
                Use the search box above or browse the categories below to add colleges and compare their accreditation, fees, and placements side-by-side.
              </p>
            </div>
          )}

          {/* Browse Colleges by Domain selector section */}
          <div className="bg-white border border-stone-200/90 rounded-3xl p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-[#2e266f]">
                  Browse & Add Colleges by Category
                </h2>
                <p className="text-xs text-stone-500 mt-1 font-medium">
                  Easily filter colleges by stream and add them directly to your comparison matrix
                </p>
              </div>
              <div className="text-xs font-bold px-3.5 py-1.5 bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-full w-fit">
                {selectedIds.length === 0
                  ? "4 comparison slots available"
                  : `${4 - selectedIds.length} slots remaining`}
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 border-b border-stone-150 pb-5">
              {domains.map((dom) => (
                <button
                  key={dom.id}
                  onClick={() => setActiveTab(dom.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    activeTab === dom.id
                      ? "bg-[#2e266f] text-white shadow-sm scale-[1.02]"
                      : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200/60"
                  }`}
                >
                  {dom.label}
                </button>
              ))}
            </div>

            {/* Colleges Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {domainColleges.length === 0 ? (
                <div className="col-span-full py-12 text-center text-xs text-stone-450 font-sans">
                  No colleges available in this category.
                </div>
              ) : (
                domainColleges.map((college) => {
                  const isSelected = selectedIds.includes(college.id);
                  const isFull = selectedIds.length >= 4;
                  return (
                    <div
                      key={college.id}
                      className={`p-5 border rounded-2xl flex flex-col justify-between transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${
                        isSelected
                          ? "border-[#2e266f] bg-purple-50/20 ring-2 ring-[#2e266f]/10"
                          : "border-stone-200/80 bg-stone-50/20 hover:border-stone-300"
                      }`}
                    >
                      <div className="flex gap-4 mb-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/60">
                          <img
                            src={college.image}
                            alt={college.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/campus-hero.jpg";
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-black text-[#2e266f] truncate" title={college.name}>
                            {college.name}
                          </h4>
                          <p className="text-[10px] text-stone-500 truncate mt-0.5 font-medium">
                            {college.location}
                          </p>
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {college.nirfRank && (
                              <span className="text-[9px] font-bold bg-indigo-900 text-white px-1.5 py-0.5 rounded">
                                NIRF #{college.nirfRank}
                              </span>
                            )}
                            {college.naacGrade && (
                              <span className="text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-100 px-1.5 py-0.5 rounded">
                                NAAC {college.naacGrade}
                              </span>
                            )}
                            <span className="text-[9px] font-bold bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                              {college.type}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-stone-100 mt-2">
                        <div className="text-[10px] font-medium text-stone-500">
                          Fees: <span className="font-bold text-stone-900">{formatINR(college.feesPerYear)}</span>
                        </div>

                        {isSelected ? (
                          <button
                            onClick={() => removeCollege(college.id)}
                            className="px-3.5 py-1.5 text-[10px] font-extrabold bg-indigo-900 text-white rounded-lg hover:bg-rose-600 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Selected</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => addCollege(college.id)}
                            disabled={isFull}
                            className={`px-3.5 py-1.5 text-[10px] font-extrabold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                              isFull
                                ? "bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
                                : "border border-[#2e266f] text-[#2e266f] hover:bg-[#2e266f] hover:text-white"
                            }`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Compare</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
