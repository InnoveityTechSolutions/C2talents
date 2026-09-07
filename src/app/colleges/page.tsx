"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HighlightText } from "@/components/common/HighlightText";
import {
  Search,
  Filter,
  SlidersHorizontal,
  MapPin,
  Award,
  BookOpen,
  ArrowUpDown,
  Building2,
  Navigation,
  Sparkles,
  ChevronRight,
  X,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

interface College {
  id: string;
  name: string;
  shortName?: string;
  location: string;
  city?: string;
  type?: string;
  ownership?: string;
  category?: string;
  accreditation?: string;
  naacGrade?: string;
  nirfRank?: number;
  rating?: number;
  feesPerYear?: number;
  avgPackage?: number;
  highestPackage?: number;
  image?: string;
  isAutonomous?: boolean;
  distance?: number | null;
  distanceText?: string | null;
  matchReasons?: string[];
}

function CollegesContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || searchParams.get("stream") || "";
  const initialLocation = searchParams.get("location") || "";
  const initialSearch = searchParams.get("search") || searchParams.get("q") || "";

  const [search, setSearch] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [locationFilter, setLocationFilter] = useState(initialLocation);
  const [ownershipFilter, setOwnershipFilter] = useState("");
  const [feesFilter, setFeesFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const requestLocation = (setSearchQuery = false) => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          if (setSearchQuery) {
            setSearch("colleges near me");
          }
          setGpsLoading(false);
        },
        (err) => {
          console.warn("Geolocation access denied or unavailable:", err.message);
          if (setSearchQuery) {
            alert("Please enable location permissions in your browser so we can calculate the distance to colleges.");
          }
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    }
  };

  // Auto-request location on mount for distance calculations
  useEffect(() => {
    requestLocation(false);
  }, []);

  // Sync state with URL Search Params
  useEffect(() => {
    const qParam = searchParams.get("search") || searchParams.get("q");
    if (qParam !== null) setSearch(qParam);
    const catParam = searchParams.get("category") || searchParams.get("stream");
    if (catParam !== null) setCategoryFilter(catParam);
    const locParam = searchParams.get("location");
    if (locParam !== null) setLocationFilter(locParam);
  }, [searchParams]);

  // Fetch real colleges from Database API route
  useEffect(() => {
    let isCancelled = false;
    async function fetchColleges() {
      setLoading(true);
      setErrorMessage("");

      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (categoryFilter) params.set("category", categoryFilter);
        if (locationFilter) params.set("location", locationFilter);
        if (ownershipFilter) params.set("ownership", ownershipFilter);
        if (feesFilter) params.set("maxFees", feesFilter);
        if (userCoords) {
          params.set("lat", userCoords.lat.toString());
          params.set("lng", userCoords.lng.toString());
        }

        const res = await fetch(`/api/colleges?${params.toString()}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`Failed to load colleges: ${res.statusText}`);
        }

        const data = await res.json();
        if (!isCancelled) {
          if (Array.isArray(data)) {
            setColleges(data);
          } else if (data.results && Array.isArray(data.results)) {
            setColleges(data.results);
          } else {
            setColleges([]);
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error("Colleges page fetch error:", err);
          setErrorMessage("Search service is temporarily unavailable. Please try again.");
          setColleges([]);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    const timer = setTimeout(fetchColleges, 250);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [search, categoryFilter, locationFilter, ownershipFilter, feesFilter, userCoords]);

  const categoryOptions = [
    { value: "", label: "All Streams" },
    { value: "Engineering", label: "Engineering & Tech" },
    { value: "Arts & Science", label: "Arts & Science" },
    { value: "Management", label: "Management (MBA/BBA)" },
    { value: "Medical", label: "Medical & Healthcare" },
    { value: "Dental", label: "Dental" },
    { value: "Physiotherapy", label: "Physiotherapy" },
    { value: "Law", label: "Law" },
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
                  <Building2 className="w-3.5 h-3.5 text-amber-500" /> Global Smart Search Directory
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-[#2e266f] tracking-tight">Find Your Ideal Institution</h1>
                <p className="text-stone-600 text-xs md:text-sm mt-1 font-medium">
                  Search across verified colleges, locations, NAAC accreditation, government/private status, rankings, and distance radius.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => requestLocation(true)}
                  disabled={gpsLoading}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all shadow-md cursor-pointer ${
                    userCoords
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-orange-500 hover:bg-orange-600 text-white"
                  }`}
                >
                  <Navigation className={`w-4 h-4 fill-white ${gpsLoading ? "animate-spin" : ""}`} />
                  <span>{gpsLoading ? "Locating..." : userCoords ? "GPS Active (Near Me)" : "Near Me Search"}</span>
                </button>

                <Link
                  href="/register-college"
                  id="register-college-header"
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#2e266f] text-white text-xs font-extrabold rounded-xl hover:bg-[#3d338f] transition-all shadow-md"
                >
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>Register College</span>
                </Link>
              </div>
            </div>

            {/* Search + Filter Action Bar */}
            <div className="mt-6 flex gap-3 flex-wrap items-center">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  id="college-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Natural search e.g. best government colleges in Chennai, NAAC A++, 150 km near me..."
                  className="w-full pl-10 pr-10 py-2.5 border border-stone-200 rounded-xl text-xs font-bold text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#2e266f] bg-stone-50 focus:bg-white transition-all shadow-2xs"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                id="toggle-filters"
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-xs font-bold transition-all cursor-pointer ${showFilters ? "border-[#2e266f] text-[#2e266f] bg-purple-50" : "border-stone-200 text-stone-700 bg-white hover:border-[#2e266f]"}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {(ownershipFilter || feesFilter) && (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>

              {(ownershipFilter || feesFilter || categoryFilter || locationFilter || search) && (
                <button
                  onClick={() => { setOwnershipFilter(""); setFeesFilter(""); setCategoryFilter(""); setLocationFilter(""); setSearch(""); }}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold text-rose-600 border border-rose-200 rounded-xl bg-rose-50/50 hover:bg-rose-100 transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Clear All
                </button>
              )}
            </div>

            {/* Academic Stream Filter Pills */}
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

            {/* Advanced Filters */}
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

        {/* Results Banner */}
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full ${colleges.length > 0 ? "bg-emerald-500 animate-pulse" : "bg-amber-500"} shrink-0`} />
              <div className="flex items-center gap-2 flex-wrap text-sm sm:text-base font-extrabold text-[#2e266f] tracking-tight">
                {search ? (
                  <>
                    <span>SEARCH RESULTS</span>
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200/80 font-black text-xs sm:text-sm shadow-2xs">
                      {colleges.length} {colleges.length === 1 ? "COLLEGE FOUND" : "COLLEGES FOUND"}
                    </span>
                    <span className="text-stone-600 font-medium text-xs sm:text-sm">
                      FOR &quot;<span className="text-stone-900 font-extrabold">{search}</span>&quot;
                    </span>
                  </>
                ) : categoryFilter ? (
                  <>
                    <span>SHOWING</span>
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200/80 font-black text-xs sm:text-sm shadow-2xs">
                      {colleges.length} {categoryFilter.toUpperCase()} COLLEGES
                    </span>
                    <span className="text-stone-600 font-medium text-xs sm:text-sm">IN DATABASE</span>
                  </>
                ) : (
                  <>
                    <span>SHOWING</span>
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200/80 font-black text-xs sm:text-sm shadow-2xs">
                      {colleges.length} TOTAL VERIFIED COLLEGES
                    </span>
                    <span className="text-stone-600 font-medium text-xs sm:text-sm">IN DATABASE</span>
                  </>
                )}
              </div>
            </div>

            {userCoords && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 shrink-0 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                Sorted by Distance (User Location Active)
              </span>
            )}
          </div>
        </div>

        {/* College Grid */}
        <div className="max-w-7xl mx-auto px-6 py-6">
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
          ) : errorMessage ? (
            <div className="text-center py-20 bg-rose-50 border border-rose-200 rounded-3xl p-8 max-w-xl mx-auto space-y-3">
              <h3 className="text-lg font-bold text-rose-700">{errorMessage}</h3>
              <p className="text-xs text-rose-600">The server or database is temporarily unreachable. Please check connection.</p>
            </div>
          ) : colleges.length === 0 ? (
            <div className="text-center py-20 px-6 bg-white border border-stone-200/80 rounded-3xl max-w-lg mx-auto space-y-4 shadow-sm my-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-[#2e266f] tracking-tight uppercase">NO COLLEGES FOUND</h3>
              <p className="text-sm text-stone-600 font-medium leading-relaxed">
                No colleges matching &quot;<strong>{search || categoryFilter || locationFilter}</strong>&quot; were found{locationFilter ? ` in ${locationFilter}` : ""}.
              </p>
              <div className="pt-2 flex flex-col gap-1.5 text-xs font-semibold text-stone-500 bg-stone-50 p-4 rounded-xl border border-stone-100 text-left">
                <span className="font-bold text-stone-700">Suggestions:</span>
                <span>• Search for another city or broader region</span>
                <span>• Check spelling or try a different academic stream</span>
                <span>• Clear specific ownership or budget filters</span>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => { setCategoryFilter(""); setOwnershipFilter(""); setFeesFilter(""); setSearch(""); setLocationFilter(""); }}
                  className="px-5 py-2.5 bg-[#2e266f] text-white text-xs font-extrabold rounded-xl hover:bg-[#3d338f] transition-all shadow-md cursor-pointer"
                >
                  Clear Search & Filters
                </button>
              </div>
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
                    className="flex flex-col h-full bg-white border border-stone-200 rounded-2xl overflow-hidden hover-card-trigger group shadow-2xs hover:shadow-lg transition-all"
                  >
                    <div className="relative h-44 overflow-hidden bg-stone-100">
                      <img
                        src={college.image}
                        alt={college.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=1000";
                        }}
                      />
                      <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                        {college.naacGrade && college.naacGrade !== "Not Accredited" && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-white shadow-xs">
                            NAAC {college.naacGrade}
                          </span>
                        )}
                        {college.nirfRank && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-brand-green text-white shadow-xs">
                            NIRF #{college.nirfRank}
                          </span>
                        )}
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs ${college.type === "Government" ? "bg-blue-600 text-white" : college.type === "Govt-Aided" ? "bg-purple-600 text-white" : "bg-stone-800 text-white"}`}>
                          {college.ownership || college.type}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <div className="font-bold text-stone-900 text-[16px] leading-snug group-hover:text-indigo-900 transition-colors min-h-[44px] flex items-center line-clamp-2">
                          <HighlightText text={college.name} query={search} />
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-2">
                          <div className="flex items-center gap-1 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="text-xs text-stone-500 truncate">{college.city || college.location}</span>
                          </div>
                          {college.distanceText ? (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 border border-orange-200 shrink-0 flex items-center gap-1">
                              <Navigation className="w-2.5 h-2.5 fill-orange-600 text-orange-600" />
                              {college.distanceText}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                requestLocation(false);
                              }}
                              className="text-[10px] text-orange-600 hover:text-orange-800 font-extrabold flex items-center gap-0.5 cursor-pointer bg-orange-50 hover:bg-orange-100 px-2 py-0.5 rounded border border-orange-200/60 transition-colors shrink-0"
                              title="Click to calculate distance using your browser GPS location"
                            >
                              <Navigation className="w-2.5 h-2.5 text-orange-500 fill-orange-500" />
                              <span>Distance</span>
                            </button>
                          )}
                        </div>

                        {/* Why This Matches Badges (Requirement 19) */}
                        {college.matchReasons && college.matchReasons.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-wrap gap-1">
                            {college.matchReasons.map((reason, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                              >
                                {reason}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                        <div>
                          <span className="text-[10px] font-bold text-stone-400 block uppercase">Fees / Yr</span>
                          <span className="font-bold text-stone-900">{college.feesPerYear ? `₹${(college.feesPerYear / 1000).toFixed(0)}K` : "N/A"}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-stone-400 block uppercase">Avg Package</span>
                          <span className="font-bold text-stone-900">{college.avgPackage ? `₹${college.avgPackage} LPA` : "N/A"}</span>
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

export default function CollegesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-bold text-stone-500">Loading Global Search...</div>}>
      <CollegesContent />
    </Suspense>
  );
}
