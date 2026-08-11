"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MapPin, Star, Award, SlidersHorizontal, X, ArrowRight, Shield, TrendingUp, Building2, PlusCircle, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useCompare } from "@/context/CompareContext";

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
  featured: boolean;
}

function formatINR(amount: number) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}K`;
  return `₹${amount}`;
}

export default function CollegesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#2e266f] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-stone-500 font-medium">Loading colleges database...</p>
        </div>
      </div>
    }>
      <CollegesPageContent />
    </Suspense>
  );
}

function CollegesPageContent() {
  const { toggleCollege, isSelected } = useCompare();
  const [colleges, setColleges] = React.useState<College[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("");
  const [ownershipFilter, setOwnershipFilter] = React.useState("");
  const [feesFilter, setFeesFilter] = React.useState("");
  const [showFilters, setShowFilters] = React.useState(false);

  const searchParams = useSearchParams();

  React.useEffect(() => {
    const s = searchParams.get("search") || "";
    setSearch(s);
    const cat = searchParams.get("category") || searchParams.get("stream") || "";
    setCategoryFilter(cat);
    const own = searchParams.get("ownership") || searchParams.get("type") || "";
    setOwnershipFilter(own);
  }, [searchParams]);

  const fetchColleges = React.useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryFilter) params.set("category", categoryFilter);
    if (ownershipFilter) params.set("ownership", ownershipFilter);
    if (feesFilter) params.set("maxFees", feesFilter);
    try {
      const res = await fetch(`/api/colleges?${params.toString()}`);
      const data = await res.json();
      setColleges(Array.isArray(data) ? data : []);
    } catch {
      setColleges([]);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, ownershipFilter, feesFilter]);

  React.useEffect(() => {
    const timer = setTimeout(fetchColleges, 300);
    return () => clearTimeout(timer);
  }, [fetchColleges]);

  const categoryOptions = [
    { value: "", label: "All Streams" },
    { value: "Engineering", label: "Engineering" },
    { value: "Arts & Science", label: "Arts & Science" },
    { value: "Medical", label: "Medical" },
    { value: "Management", label: "Management" },
    { value: "Commerce", label: "Commerce" },
    { value: "Law", label: "Law" },
    { value: "Polytechnic", label: "Polytechnic" },
    { value: "Dental", label: "Dental" },
    { value: "Pharmacy", label: "Pharmacy" },
    { value: "Nursing", label: "Nursing" },
    { value: "Education", label: "Education" },
  ];

  const ownershipOptions = [
    { value: "", label: "All Ownerships" },
    { value: "Government", label: "Government" },
    { value: "Private", label: "Private" },
    { value: "Aided", label: "Aided" },
    { value: "Autonomous", label: "Autonomous" },
    { value: "Deemed", label: "Deemed" },
  ];

  const feesOptions = [
    { value: "", label: "Any Budget" },
    { value: "50000", label: "Under ₹50K/yr" },
    { value: "100000", label: "Under ₹1L/yr" },
    { value: "200000", label: "Under ₹2L/yr" },
    { value: "400000", label: "Under ₹4L/yr" },
  ];

  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen bg-[#FAF9F5]">
        {/* Header Section */}
        <div className="bg-white border-b border-stone-200/80 shadow-2xs">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100/70 border border-purple-200 text-[#2e266f] text-xs font-black uppercase tracking-wider mb-2">
                  <Building2 className="w-3.5 h-3.5 text-amber-500" /> College Directory
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-[#2e266f] tracking-tight">Find Your Ideal Institution</h1>
                <p className="text-stone-600 text-xs md:text-sm mt-1 font-medium">Browse verified colleges by academic stream, fees, and ownership across Tamil Nadu and India</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/register-college"
                  id="register-college-header"
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#2e266f] text-white text-xs font-extrabold rounded-xl hover:bg-[#3d338f] transition-all shadow-md"
                >
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>Register College</span>
                </Link>

                <Link
                  href="/counselor"
                  id="counselor-from-listing"
                  className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-brand-green text-white text-xs font-extrabold rounded-xl hover:bg-emerald-800 transition-all shadow-md"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-300" />
                  <span>AI Match</span>
                </Link>
              </div>
            </div>

            {/* Search + Filter Action Bar */}
            <div className="mt-6 flex gap-3 flex-wrap items-center">
              <div className="relative flex-1 min-w-[260px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  id="college-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by college name, location, courses..."
                  className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#2e266f] bg-stone-50 focus:bg-white transition-all shadow-2xs"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                id="toggle-filters"
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-xs font-bold transition-all cursor-pointer ${showFilters ? "border-[#2e266f] text-[#2e266f] bg-purple-50" : "border-stone-200 text-stone-700 bg-white hover:border-[#2e266f]"}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Advanced Filters
                {(ownershipFilter || feesFilter) && (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>

              {(ownershipFilter || feesFilter || categoryFilter || search) && (
                <button
                  onClick={() => { setOwnershipFilter(""); setFeesFilter(""); setCategoryFilter(""); setSearch(""); }}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-rose-600 border border-rose-200 rounded-xl bg-rose-50/50 hover:bg-rose-100 transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Clear All
                </button>
              )}
            </div>

            {/* PROMINENT ALWAYS-VISIBLE STREAM/CATEGORY FILTER PILLS */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-stone-500">
                <span>Filter by Academic Stream:</span>
                {categoryFilter && (
                  <span className="text-[#2e266f]">Selected: <strong>{categoryFilter}</strong></span>
                )}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar flex-wrap">
                {categoryOptions.map((opt) => {
                  const isSelected = categoryFilter.toLowerCase() === opt.value.toLowerCase() || (opt.value === "" && !categoryFilter);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setCategoryFilter(opt.value)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all duration-200 border cursor-pointer shrink-0 flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-indigo-900 text-white border-indigo-900 shadow-md ring-2 ring-orange-300/50"
                          : "bg-white text-stone-700 border-stone-200 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50/60 active:bg-orange-100 active:text-orange-600 shadow-2xs"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && opt.value && (
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Expanded Advanced Filters */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 pt-4 border-t border-stone-200/60 flex flex-col gap-4"
              >
                <div className="flex flex-wrap gap-6">
                  {/* Ownership Filter */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Ownership Type</label>
                    <div className="flex gap-2 flex-wrap">
                      {ownershipOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setOwnershipFilter(opt.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${ownershipFilter === opt.value ? "bg-[#2e266f] text-white border-[#2e266f]" : "bg-white border-stone-200 text-stone-600 hover:border-[#2e266f]"}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fees Filter */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-extrabold text-stone-500 uppercase tracking-wider">Maximum Annual Fees</label>
                    <div className="flex gap-2 flex-wrap">
                      {feesOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setFeesFilter(opt.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${feesFilter === opt.value ? "bg-[#2e266f] text-white border-[#2e266f]" : "bg-white border-stone-200 text-stone-600 hover:border-[#2e266f]"}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* College Grid */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-stone-200 rounded-2xl overflow-hidden animate-pulse-subtle">
                  <div className="h-40 bg-stone-100" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-stone-100 rounded w-3/4" />
                    <div className="h-3 bg-stone-100 rounded w-1/2" />
                    <div className="h-3 bg-stone-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : colleges.length === 0 ? (
            <div className="text-center py-24 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto">
                <Search className="w-7 h-7 text-stone-400" />
              </div>
              <h3 className="text-lg font-bold text-stone-700">No colleges found</h3>
              <p className="text-sm text-stone-500">Try adjusting your filters or search terms</p>
              <button onClick={() => { setCategoryFilter(""); setOwnershipFilter(""); setFeesFilter(""); setSearch(""); }} className="text-brand-green text-sm font-bold hover:underline">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {colleges.map((college, i) => (
                <motion.div
                  key={college.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                >
                  <Link
                    href={`/colleges/${college.id}`}
                    id={`college-listing-${college.id}`}
                    className="flex flex-col h-full bg-white border border-stone-200 rounded-2xl overflow-hidden hover-card-trigger group"
                  >
                    <div className="relative h-44 overflow-hidden bg-stone-100">
                      <img
                        src={college.image}
                        alt={college.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/campus-hero.jpg";
                        }}
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        {college.naacGrade && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                            NAAC {college.naacGrade}
                          </span>
                        )}
                        {college.nirfRank && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-green text-white">
                            NIRF #{college.nirfRank}
                          </span>
                        )}
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${college.type === "Government" ? "bg-blue-600 text-white" : college.type === "Govt-Aided" ? "bg-purple-600 text-white" : "bg-stone-800 text-white"}`}>
                          {college.type}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <div className="font-semibold text-stone-900 text-[16px] leading-snug group-hover:text-brand-green transition-colors min-h-[44px] flex items-center line-clamp-2">
                          {college.name}
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-2">
                          <div className="flex items-center gap-1 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="text-xs text-stone-500 truncate">{college.location}</span>
                          </div>
                          
                          <div className="flex items-center gap-0.5 shrink-0">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3 h-3 ${s <= Math.round(college.rating) ? "fill-amber-500 text-amber-500" : "text-stone-200 fill-stone-200"}`} />
                            ))}
                            <span className="text-[11px] font-bold text-stone-700 ml-1">{college.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100">
                        <div>
                          <div className="text-[9px] text-stone-400 font-bold uppercase">Fee/yr</div>
                          <div className="text-xs font-bold text-stone-900 mt-0.5">{formatINR(college.feesPerYear)}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-stone-400 font-bold uppercase">Avg Pkg</div>
                          <div className="text-xs font-bold text-brand-green mt-0.5">{college.avgPackage} LPA</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-stone-400 font-bold uppercase">Highest</div>
                          <div className="text-xs font-bold text-stone-900 mt-0.5">{college.highestPackage} LPA</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 cursor-pointer font-sans select-none shrink-0 group/cmp"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected(college.id)}
                            onChange={() => toggleCollege(college)}
                            className="w-4 h-4 rounded border-stone-300 text-[#2e266f] focus:ring-[#2e266f]/10 cursor-pointer accent-[#2e266f]"
                          />
                          <span className={`text-[11px] font-semibold ${isSelected(college.id) ? "text-[#2e266f] font-bold" : "text-stone-500 group-hover/cmp:text-stone-700"}`}>
                            {isSelected(college.id) ? "Comparing" : "Compare"}
                          </span>
                        </label>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-brand-green group-hover:translate-x-1 transition-transform">
                          View <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
