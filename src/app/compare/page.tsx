"use client";

import React, { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Plus, Star, Award, Landmark, TrendingUp, ShieldAlert, ArrowRight, BookOpen } from "lucide-react";
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
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lakhs`;
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}K`;
  return `₹${amount}`;
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-stone-500 font-medium">Loading comparison tools...</p>
        </div>
      </div>
    }>
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

  const [activeTab, setActiveTab] = React.useState("engineering");

  const getCollegeStream = (college: College) => {
    const text = (college.name + " " + college.description + " " + (college.courses?.map(c => c.title).join(" ") || "")).toLowerCase();
    if (text.includes("mbbs") || text.includes("medical") || text.includes("medicine")) return "medical";
    if (text.includes("b.tech") || text.includes("engineering") || text.includes("b.e.")) return "engineering";
    if (text.includes("mba") || text.includes("management") || text.includes("business")) return "management";
    if (text.includes("law") || text.includes("ll.b") || text.includes("legal")) return "law";
    if (text.includes("commerce") || text.includes("b.com") || text.includes("accounting")) return "commerce";
    return "arts";
  };

  const domains = [
    { id: "engineering", label: "Engineering" },
    { id: "medical", label: "Medical" },
    { id: "management", label: "Management" },
    { id: "arts", label: "Arts & Science" },
    { id: "commerce", label: "Commerce" },
    { id: "law", label: "Law" },
  ];

  const domainColleges = allColleges.filter(c => getCollegeStream(c) === activeTab);

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
      // Keep up to 3
      setSelectedIds(ids.slice(0, 3));
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
    if (selectedIds.length >= 3) {
      alert("You can compare a maximum of 3 colleges side-by-side.");
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
    const matchesSearch = college.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      college.location.toLowerCase().includes(searchQuery.toLowerCase());
    return !isSelected && matchesSearch;
  });

  const selectedColleges = selectedIds
    .map((id) => allColleges.find((c) => c.id === id))
    .filter(Boolean) as College[];

  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen bg-stone-50 font-sans pb-20">
        {/* Hero Section */}
        <div className="bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <span className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-1.5 block">Decision helper</span>
            <h1 className="text-3xl font-serif text-brand-navy font-bold">Compare Colleges Side-by-Side</h1>
            <p className="text-stone-500 text-sm mt-2 max-w-xl leading-relaxed">
              Analyze fees structure, NIRF ranks, average package packages, and list of programs across up to three campuses simultaneously.
            </p>

            {/* Selection bar */}
            <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center gap-4 max-w-3xl">
              <div ref={searchContainerRef} className="relative flex-1">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setDropdownOpen(true);
                    }}
                    onFocus={() => setDropdownOpen(true)}
                    placeholder="Search and add a college to compare..."
                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900 focus:bg-white transition-all font-sans"
                  />
                </div>

                <AnimatePresence>
                  {dropdownOpen && searchQuery && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 right-0 mt-2 bg-white border border-stone-200 rounded-xl shadow-lg z-50 max-h-72 overflow-y-auto"
                    >
                      {filteredColleges.length === 0 ? (
                        <div className="p-4 text-xs text-stone-500 text-center font-sans">
                          No matching colleges found or all are selected.
                        </div>
                      ) : (
                        filteredColleges.map((college) => (
                          <button
                            key={college.id}
                            onClick={() => addCollege(college.id)}
                            className="w-full text-left px-4 py-3 hover:bg-stone-50 transition-colors flex items-center justify-between border-b border-stone-100 last:border-0"
                          >
                            <div>
                              <div className="text-sm font-bold text-brand-navy">{college.name}</div>
                              <div className="text-xs text-stone-500">{college.location}</div>
                            </div>
                            <Plus className="w-4 h-4 text-indigo-900" />
                          </button>
                        ))
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {selectedColleges.length < 3 && (
                <div className="text-xs text-stone-500 flex items-center justify-center border border-dashed border-stone-300 rounded-xl px-4 py-3 bg-white">
                  {3 - selectedColleges.length} slots remaining to compare.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
          {/* Main comparison grid (only if colleges are selected) */}
          {selectedColleges.length > 0 && (
            <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-sm">
              {/* College Card Headers */}
              <div className="grid grid-cols-4 border-b border-stone-200">
                <div className="p-6 bg-stone-50/50 flex flex-col justify-end border-r border-stone-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">Comparison Parameters</h3>
                </div>
                {Array.from({ length: 3 }).map((_, idx) => {
                  const college = selectedColleges[idx];
                  return (
                    <div key={idx} className={`p-6 flex flex-col justify-between relative min-h-[220px] ${idx < 2 ? "border-r border-stone-200" : ""}`}>
                      {college ? (
                        <>
                          <button
                            onClick={() => removeCollege(college.id)}
                            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center bg-stone-100 hover:bg-red-50 hover:text-red-650 rounded-full transition-all text-stone-500 cursor-pointer"
                            title="Remove"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          
                          <div className="space-y-3">
                            <div className="h-20 w-full rounded-lg overflow-hidden bg-stone-100">
                              <img src={college.image} alt={college.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-brand-navy line-clamp-2 leading-snug">
                                {college.name}
                              </h4>
                              <p className="text-xs text-stone-500 mt-1">{college.location}</p>
                            </div>
                          </div>

                          <Link
                            href={`/colleges/${college.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-900 hover:text-indigo-950 mt-4 transition-colors font-sans hover:underline"
                          >
                            <span>View Profile</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-stone-200 rounded-xl p-4 bg-stone-50/30">
                          <button
                            onClick={() => {
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="w-10 h-10 flex items-center justify-center bg-white border border-stone-200 rounded-full hover:scale-105 transition-all text-stone-400 hover:text-indigo-900 shadow-sm cursor-pointer"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mt-2.5">
                            Add College
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Overview Rows */}
              <div className="divide-y divide-stone-100">
                {/* Row: University Type */}
                <div className="grid grid-cols-4 items-center">
                  <div className="p-4 px-6 bg-stone-50/30 font-medium text-xs text-stone-500 uppercase tracking-wider border-r border-stone-200">
                    Type
                  </div>
                  {Array.from({ length: 3 }).map((_, idx) => {
                    const college = selectedColleges[idx];
                    return (
                      <div key={idx} className={`p-4 px-6 text-sm font-semibold text-brand-navy ${idx < 2 ? "border-r border-stone-200" : ""}`}>
                        {college ? college.type : <span className="text-stone-300">—</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Row: Rating */}
                <div className="grid grid-cols-4 items-center">
                  <div className="p-4 px-6 bg-stone-50/30 font-medium text-xs text-stone-500 uppercase tracking-wider border-r border-stone-200">
                    User Rating
                  </div>
                  {Array.from({ length: 3 }).map((_, idx) => {
                    const college = selectedColleges[idx];
                    return (
                      <div key={idx} className={`p-4 px-6 flex items-center gap-1.5 text-sm font-bold text-brand-navy ${idx < 2 ? "border-r border-stone-200" : ""}`}>
                        {college ? (
                          <>
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span>{college.rating} / 5.0</span>
                          </>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Row: NAAC Grade */}
                <div className="grid grid-cols-4 items-center">
                  <div className="p-4 px-6 bg-stone-50/30 font-medium text-xs text-stone-500 uppercase tracking-wider border-r border-stone-200">
                    NAAC Accreditation
                  </div>
                  {Array.from({ length: 3 }).map((_, idx) => {
                    const college = selectedColleges[idx];
                    return (
                      <div key={idx} className={`p-4 px-6 flex items-center gap-1.5 text-sm font-semibold text-brand-navy ${idx < 2 ? "border-r border-stone-200" : ""}`}>
                        {college ? (
                          college.naacGrade ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-100">
                              Grade {college.naacGrade}
                            </span>
                          ) : (
                            <span className="text-stone-400 italic">Unaccredited / UGC State</span>
                          )
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Row: NIRF Rank */}
                <div className="grid grid-cols-4 items-center">
                  <div className="p-4 px-6 bg-stone-50/30 font-medium text-xs text-stone-500 uppercase tracking-wider border-r border-stone-200">
                    NIRF Ranking
                  </div>
                  {Array.from({ length: 3 }).map((_, idx) => {
                    const college = selectedColleges[idx];
                    return (
                      <div key={idx} className={`p-4 px-6 flex items-center gap-1.5 text-sm font-bold text-brand-navy ${idx < 2 ? "border-r border-stone-200" : ""}`}>
                        {college ? (
                          college.nirfRank ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 text-xs font-bold border border-amber-100">
                              Rank #{college.nirfRank}
                            </span>
                          ) : (
                            <span className="text-stone-400 italic">Not Ranked</span>
                          )
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Row: Annual Fees */}
                <div className="grid grid-cols-4 items-center">
                  <div className="p-4 px-6 bg-stone-50/30 font-medium text-xs text-stone-500 uppercase tracking-wider border-r border-stone-200">
                    Annual Tuition Fee
                  </div>
                  {Array.from({ length: 3 }).map((_, idx) => {
                    const college = selectedColleges[idx];
                    return (
                      <div key={idx} className={`p-4 px-6 text-sm font-bold text-brand-navy ${idx < 2 ? "border-r border-stone-200" : ""}`}>
                        {college ? formatINR(college.feesPerYear) : <span className="text-stone-300">—</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Row: Average Placement Package */}
                <div className="grid grid-cols-4 items-center">
                  <div className="p-4 px-6 bg-stone-50/30 font-medium text-xs text-stone-500 uppercase tracking-wider border-r border-stone-200">
                    Average Package (CTC)
                  </div>
                  {Array.from({ length: 3 }).map((_, idx) => {
                    const college = selectedColleges[idx];
                    return (
                      <div key={idx} className={`p-4 px-6 text-sm font-bold text-emerald-600 ${idx < 2 ? "border-r border-stone-200" : ""}`}>
                        {college ? `${college.avgPackage} LPA` : <span className="text-stone-300">—</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Row: Highest Placement Package */}
                <div className="grid grid-cols-4 items-center">
                  <div className="p-4 px-6 bg-stone-50/30 font-medium text-xs text-stone-500 uppercase tracking-wider border-r border-stone-200">
                    Highest Package Offered
                  </div>
                  {Array.from({ length: 3 }).map((_, idx) => {
                    const college = selectedColleges[idx];
                    return (
                      <div key={idx} className={`p-4 px-6 text-sm font-bold text-brand-navy ${idx < 2 ? "border-r border-stone-200" : ""}`}>
                        {college ? `${college.highestPackage} LPA` : <span className="text-stone-300">—</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Row: Offered Programs */}
                <div className="grid grid-cols-4">
                  <div className="p-4 px-6 bg-stone-50/30 font-medium text-xs text-stone-500 uppercase tracking-wider border-r border-stone-200 flex items-start pt-6">
                    Offered Programs
                  </div>
                  {Array.from({ length: 3 }).map((_, idx) => {
                    const college = selectedColleges[idx];
                    return (
                      <div key={idx} className={`p-6 ${idx < 2 ? "border-r border-stone-200" : ""}`}>
                        {college ? (
                          college.courses && college.courses.length > 0 ? (
                            <div className="flex flex-col gap-2">
                              {college.courses.slice(0, 4).map((c) => (
                                <div key={c.id} className="text-xs">
                                  <div className="font-bold text-brand-navy">{c.title}</div>
                                  <div className="text-[10px] text-stone-400 mt-0.5">{c.duration} • {formatINR(c.feesPerYear)}/yr</div>
                                </div>
                              ))}
                              {college.courses.length > 4 && (
                                <div className="text-[10px] font-bold text-indigo-900 mt-1">
                                  + {college.courses.length - 4} more courses
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-stone-400 italic">Call admission center for course details</span>
                          )
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Browse Colleges by Domain selector section */}
          <div className="bg-white border border-stone-200 rounded-3xl p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-brand-navy">Browse & Select Colleges by Category</h2>
                <p className="text-xs text-stone-500 mt-1">Easily filter colleges by stream and select them to compare side-by-side</p>
              </div>
              <div className="text-xs font-semibold px-3.5 py-1.5 bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-full w-fit">
                {selectedIds.length === 0 ? "3 slots available" : `${3 - selectedIds.length} slots remaining`}
              </div>
            </div>
            
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 border-b border-stone-150 pb-5">
              {domains.map((dom) => (
                <button
                  key={dom.id}
                  onClick={() => setActiveTab(dom.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === dom.id
                      ? "bg-indigo-900 text-white shadow-sm scale-[1.02]"
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
                  const isFull = selectedIds.length >= 3;
                  return (
                    <div
                      key={college.id}
                      className={`p-5 border rounded-2xl flex flex-col justify-between transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] ${
                        isSelected
                          ? "border-indigo-900 bg-indigo-50/15"
                          : "border-stone-200/80 bg-stone-50/20 hover:border-stone-300"
                      }`}
                    >
                      <div className="flex gap-4 mb-4">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200/60">
                          <img src={college.image} alt={college.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-brand-navy truncate" title={college.name}>
                            {college.name}
                          </h4>
                          <p className="text-[10px] text-stone-400 truncate mt-0.5">{college.location}</p>
                          <div className="flex items-center gap-1.5 mt-2">
                            {college.nirfRank && (
                              <span className="text-[9px] font-bold bg-amber-50 text-amber-850 border border-amber-100 px-1.5 py-0.5 rounded">
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
                          Fees: <span className="font-bold text-stone-750">{formatINR(college.feesPerYear)}/yr</span>
                        </div>
                        
                        {isSelected ? (
                          <button
                            onClick={() => removeCollege(college.id)}
                            className="px-3.5 py-1.5 text-[10px] font-bold bg-indigo-900 text-white rounded-lg hover:bg-red-600 hover:border-red-650 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Selected</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => addCollege(college.id)}
                            disabled={isFull}
                            className={`px-3.5 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                              isFull
                                ? "bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
                                : "border border-indigo-900 text-indigo-900 hover:bg-indigo-50 hover:text-indigo-950"
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
