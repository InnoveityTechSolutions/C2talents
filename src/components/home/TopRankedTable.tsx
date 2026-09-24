"use client";

import * as React from "react";
import Link from "next/link";
import { Star, MapPin, ChevronRight, ArrowRight, ArrowUpRight, GitCompare, ChevronLeft } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { collegesData, RankedCollege } from "@/data/colleges";
import { TOP_NIRF_COLLEGES_BY_STREAM, NIRFCollege } from "@/data/nirfRankings";
import { useCompare } from "@/context/CompareContext";

interface Props {
  colleges?: any[];
}

const streamTabs = [
  { id: "btech", label: "B.Tech" },
  { id: "mba", label: "MBA" },
  { id: "mbbs", label: "MBBS" },
  { id: "arts", label: "Arts & Science" },
  { id: "commerce", label: "Commerce" },
  { id: "law", label: "Law" },
  { id: "bpharma", label: "B.Pharma" },
  { id: "bba", label: "BBA" },
  { id: "bca", label: "BCA" },
  { id: "mtech", label: "M.Tech" },
];

import { detectCourseFromQuery, isCollegeOfferingCourse } from "@/lib/courses/courseNormalizer";

function isCollegeInStream(college: any, streamId: string): boolean {
  if (!college) return false;

  const targetCourse = detectCourseFromQuery(streamId);
  if (targetCourse && Array.isArray(college.courses) && college.courses.length > 0) {
    return isCollegeOfferingCourse(college, targetCourse);
  }

  const name = (college.name || "").toLowerCase();
  const category = (college.category || "").toLowerCase();
  const rawStream = (college.stream || "").toLowerCase();

  // If college explicitly states a stream property
  if (rawStream) {
    if (streamId === "bba") return rawStream === "bba";
    if (streamId === "bca") return rawStream === "bca";
    if (streamId === "bpharma") return rawStream === "bpharma" || rawStream === "pharmacy";
    if (streamId === "mbbs") return rawStream === "mbbs" || rawStream === "medical";
    if (streamId === "law") return rawStream === "law";
    if (streamId === "commerce") return rawStream === "commerce";
    if (streamId === "mtech") return rawStream === "mtech";
    if (streamId === "mba") return rawStream === "mba";
    if (streamId === "btech") return rawStream === "btech";
    if (streamId === "arts") return rawStream === "arts" || rawStream === "arts_science";
  }

  // Fallback for mock items without stream field
  const isPharmacy = name.includes("pharm") || category.includes("pharm");
  if (streamId !== "bpharma" && isPharmacy) return false;

  const isMedical = name.includes("medic") || name.includes("dental") || name.includes("hospital") || name.includes("physio");
  if (streamId !== "mbbs" && isMedical) return false;

  const isEducation = name.includes("education") || name.includes("teacher") || name.includes("b.ed");
  if (isEducation) return false;

  switch (streamId) {
    case "btech":
      return (name.includes("engineering") || name.includes("technology") || category.includes("engineering")) && !isPharmacy && !isMedical;

    case "mba":
      return name.includes("business") || name.includes("management") || category.includes("management");

    case "mbbs":
      return isMedical;

    case "arts":
      return name.includes("arts") || name.includes("science") || category.includes("arts");

    case "commerce":
      return name.includes("commerce") || category.includes("commerce");

    case "law":
      return name.includes("law") || category.includes("law");

    case "bpharma":
      return isPharmacy;

    case "bba":
      // Never match pharmacy, engineering or medical. Only explicit BBA or business administration
      return /\bbba\b/i.test(name) || /bachelor of business administration/i.test(name);

    case "bca":
      return /\bbca\b/i.test(name) || /bachelor of computer applications/i.test(name);

    case "mtech":
      return (name.includes("engineering") || name.includes("technology")) && !isPharmacy && !isMedical;

    default:
      return false;
  }
}

export function TopRankedTable({ colleges: propColleges }: Props) {
  const [activeTab, setActiveTab] = React.useState<string>("btech");
  const [loading, setLoading] = React.useState(false);
  const { toggleCollege, isSelected } = useCompare();
  const tabsContainerRef = React.useRef<HTMLDivElement>(null);

  const handleTabChange = (tabId: string) => {
    if (tabId === activeTab) return;
    setLoading(true);
    setActiveTab(tabId);
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsContainerRef.current) {
      const scrollAmount = direction === "left" ? -200 : 200;
      tabsContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const currentColleges = React.useMemo(() => {
    const nirfList = TOP_NIRF_COLLEGES_BY_STREAM[activeTab] || [];

    if (Array.isArray(propColleges) && propColleges.length > 0) {
      return nirfList.map((item) => {
        const normNirf = item.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        const match = propColleges.find((c) => {
          const normC = (c.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
          return (
            normC === normNirf ||
            (normNirf.includes("iitmadras") && normC.includes("iitmadras")) ||
            (normNirf.includes("nittrichy") && (normC.includes("nittrichy") || normC.includes("tiruchirappalli"))) ||
            (normNirf.includes("cmcvellore") && (normC.includes("cmcvellore") || normC.includes("christianmedical"))) ||
            (normNirf.includes("madrasmedical") && normC.includes("madrasmedical")) ||
            (normNirf.includes("loyola") && normC.includes("loyola") && !normC.includes("icam")) ||
            (normNirf.includes("annauniversity") && normC === "annauniversity") ||
            (normNirf.includes("psgcollege") && normC.includes("psgcollege")) ||
            (normNirf.includes("presidency") && normC.includes("presidency")) ||
            (normNirf.includes("madraschristian") && normC.includes("madraschristian"))
          );
        });

        if (match) {
          return {
            ...item,
            id: match.id,
            image: match.image || item.image,
            feesPerYear: match.feesPerYear || item.feesPerYear,
            avgPackage: match.avgPackage || item.avgPackage,
            highestPackage: match.highestPackage || item.highestPackage,
          };
        }
        return item;
      });
    }

    return nirfList;
  }, [activeTab, propColleges]);

  const { ref, hasRevealed } = useScrollReveal<HTMLDivElement>();

  return (
    <section
      ref={ref}
      className={`py-20 px-6 bg-white border-b border-stone-200/40 font-sans scroll-reveal ${
        hasRevealed ? "revealed" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-serif text-brand-navy font-bold tracking-tight">
            Course wise <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-indigo-900 bg-clip-text text-transparent">Top Colleges in Tamil Nadu</span>
          </h2>

          <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mx-auto" />

          <p className="text-sm text-stone-500 font-sans max-w-xl mx-auto leading-relaxed">
            A comprehensive view of NIRF rankings, cutoffs, placements, and annual fees in Tamil Nadu filtered by discipline.
          </p>
        </div>

        {/* Stream Filter Pills Bar (matching Image 2 style) */}
        <div className="relative flex items-center max-w-5xl mx-auto">
          <button
            onClick={() => scrollTabs("left")}
            aria-label="Scroll left"
            className="hidden sm:flex shrink-0 w-8 h-8 items-center justify-center rounded-full bg-white border border-stone-200/80 text-stone-600 hover:text-orange-600 hover:border-orange-200 shadow-2xs mr-2 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={tabsContainerRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1 w-full scroll-smooth"
          >
            {streamTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#3b2075] text-white shadow-md shadow-purple-950/20 scale-[1.02]"
                      : "bg-[#FAF9F5] text-stone-600 border border-stone-200/70 hover:bg-orange-50/70 hover:text-orange-600 hover:border-orange-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scrollTabs("right")}
            aria-label="Scroll right"
            className="hidden sm:flex shrink-0 w-8 h-8 items-center justify-center rounded-full bg-white border border-stone-200/80 text-stone-600 hover:text-orange-600 hover:border-orange-200 shadow-2xs ml-2 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Table Container (matching Website UI Colors & Square Card Hover Effect) */}
        <div className="border border-stone-200/80 rounded-2xl overflow-hidden bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-2">
          {loading ? (
            /* Skeleton Loading State */
            <div className="divide-y divide-stone-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-6 flex items-center justify-between gap-4 animate-pulse">
                  <div className="w-8 h-6 bg-stone-100 rounded" />
                  <div className="w-12 h-12 bg-stone-100 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-stone-100 rounded w-2/3" />
                    <div className="h-3 bg-stone-100 rounded w-1/3" />
                  </div>
                  <div className="w-32 h-8 bg-stone-100 rounded-lg" />
                  <div className="w-28 h-8 bg-stone-100 rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-y-2.5 min-w-[920px]">
                <colgroup>
                  <col className="w-20" />
                  <col className="w-[36%]" />
                  <col className="w-[260px]" />
                  <col className="w-[200px]" />
                  <col className="w-28" />
                </colgroup>
                <thead>
                  <tr className="bg-[#FAF9F5] text-[11px] font-extrabold text-stone-500 uppercase tracking-wider rounded-xl select-none">
                    <th className="py-3.5 px-4 text-center rounded-l-xl border-y border-l border-stone-200/80">Rank</th>
                    <th className="py-3.5 px-6 text-left border-y border-stone-200/80">College</th>
                    <th className="py-3.5 px-4 text-center border-y border-stone-200/80">Compare / Actions</th>
                    <th className="py-3.5 px-4 text-center border-y border-stone-200/80">Placements</th>
                    <th className="py-3.5 px-4 text-center rounded-r-xl border-y border-r border-stone-200/80">Rating</th>
                  </tr>
                </thead>
                <tbody className="font-sans text-stone-700 text-xs font-medium">
                  {currentColleges.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-stone-400 font-medium">
                        No institutions currently listed for this discipline.
                      </td>
                    </tr>
                  ) : (
                    currentColleges.map((college, idx) => {
                      const isCompared = isSelected(college.id);
                      const rankNum = college.nirfRank || idx + 1;
                      
                      return (
                        <tr
                        key={college.id}
                        className="group bg-white border border-stone-200/80 rounded-xl shadow-xs transition-all duration-300 hover:shadow-xl hover:shadow-purple-950/10 hover:-translate-y-1 hover:ring-2 hover:ring-[#3b2075]/30 hover:border-transparent relative cursor-pointer"
                      >
                        {/* Rank Column */}
                        <td className="py-5 px-4 text-center border-y border-l border-stone-200/80 rounded-l-xl group-hover:border-transparent transition-all">
                          <span className="font-extrabold text-stone-400 text-sm group-hover:text-[#3b2075] group-hover:scale-110 transition-all duration-200 inline-block">
                            #{rankNum}
                          </span>
                        </td>

                        {/* College Info Column (Logo + Brand Title + Location + Animated Straight Arrow) */}
                        <td className="py-5 px-6 border-y border-stone-200/80 group-hover:border-transparent transition-all">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3.5">
                              <div className="w-12 h-12 rounded-xl border border-stone-200/80 overflow-hidden bg-white shrink-0 p-0.5 shadow-2xs group-hover:border-[#3b2075]/30 transition-colors">
                                <img
                                  src={college.image}
                                  alt={college.name}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              </div>
                              <div className="space-y-1">
                                <Link
                                  href={`/colleges/${college.id}`}
                                  className="font-bold text-[14px] text-[#1f0c3d] group-hover:text-[#ea580c] transition-colors leading-snug block"
                                >
                                  {college.name}
                                </Link>
                                <div className="flex items-center gap-1.5 text-stone-400 text-[11px] font-semibold">
                                  <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 group-hover:text-[#ea580c] transition-colors" />
                                  <span>{college.location}</span>
                                </div>
                              </div>
                            </div>

                            {/* Animated Straight Arrow (→) on Hover/Select */}
                            <Link
                              href={`/colleges/${college.id}`}
                              className="text-stone-300 group-hover:text-[#3b2075] group-hover:translate-x-1.5 transition-all duration-300 p-1 shrink-0"
                              aria-label={`View ${college.name}`}
                            >
                              <ArrowRight className="w-5 h-5 shrink-0 stroke-[2]" />
                            </Link>
                          </div>
                        </td>

                        {/* Compare / Actions Column (Apply Now + Compare buttons) */}
                        <td className="py-5 px-4 text-center border-y border-stone-200/80 group-hover:border-transparent transition-all">
                          <div className="flex items-center justify-center gap-2">
                            {/* Apply Now Button (Vibrant SRM Gold/Orange CTA) */}
                            <Link
                              href={`/colleges/${college.id}#apply`}
                              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#f59e0b] hover:bg-[#ea580c] text-white font-extrabold text-xs rounded-xl shadow-2xs transition-all duration-200 shrink-0 cursor-pointer hover:scale-[1.03]"
                            >
                              <span>Apply Now</span>
                              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            </Link>

                            {/* Compare Button (Royal Purple CTA) */}
                            <button
                              onClick={() =>
                                toggleCollege({
                                  id: college.id,
                                  name: college.name,
                                  location: college.location,
                                  rating: college.rating,
                                  type: college.type || "College",
                                  feesPerYear: college.feesPerYear,
                                  avgPackage: college.avgPackage,
                                  highestPackage: college.highestPackage,
                                  image: college.image,
                                })
                              }
                              className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 shrink-0 cursor-pointer hover:scale-[1.03] ${
                                isCompared
                                  ? "bg-emerald-600 text-white shadow-sm"
                                  : "bg-[#3b2075] hover:bg-[#2d1659] text-white shadow-2xs"
                              }`}
                            >
                              <GitCompare className="w-3.5 h-3.5" />
                              <span>{isCompared ? "Added" : "Compare"}</span>
                            </button>
                          </div>
                        </td>

                        {/* Placements Column (HIGHEST & AVERAGE LPA centered under header) */}
                        <td className="py-5 px-4 text-center border-y border-stone-200/80 group-hover:border-transparent transition-all">
                          <div className="flex flex-col items-center justify-center">
                            <div className="space-y-1 text-left inline-block">
                              <div className="text-[11px] font-bold">
                                <span className="text-stone-400 font-semibold mr-1.5 uppercase tracking-wider text-[10px]">HIGHEST:</span>
                                <span className="font-extrabold text-[#3b2075] text-[12.5px]">
                                  ₹{college.highestPackage >= 100 ? `${(college.highestPackage / 100).toFixed(2)} CPA` : `${college.highestPackage} LPA`}
                                </span>
                              </div>
                              <div className="text-[11px] font-bold">
                                <span className="text-stone-400 font-semibold mr-1.5 uppercase tracking-wider text-[10px]">AVERAGE:</span>
                                <span className="font-extrabold text-[#3b2075] text-[12.5px]">
                                  ₹{college.avgPackage >= 100 ? `${(college.avgPackage / 100).toFixed(2)} CPA` : `${college.avgPackage} LPA`}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Rating Column (Yellow Stars + Score centered under header) */}
                        <td className="py-5 px-4 text-center border-y border-r border-stone-200/80 rounded-r-xl group-hover:border-transparent transition-all">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= Math.round(college.rating)
                                      ? "fill-amber-400 text-amber-400"
                                      : "fill-stone-200 text-stone-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="font-extrabold text-stone-800 text-xs">
                              {college.rating.toFixed(1)}
                            </span>
                            <span className="text-[9.5px] font-extrabold text-stone-400 uppercase tracking-widest block">
                              RATING
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
