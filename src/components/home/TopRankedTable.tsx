"use client";

import * as React from "react";
import Link from "next/link";
import { Star, MapPin, ChevronRight, Loader2 } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { collegesData } from "@/data/colleges";

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
}

interface Props {
  colleges: College[];
}

const formatFees = (fees: number) => {
  if (fees >= 100000) {
    return `₹${(fees / 100000).toFixed(2)}L`;
  }
  return `₹${fees.toLocaleString()}`;
};

export function TopRankedTable({ colleges: dbColleges }: Props) {
  const [activeTab, setActiveTab] = React.useState<"btech" | "mba" | "mbbs">("btech");
  const [loading, setLoading] = React.useState(false);

  const handleTabChange = (tab: "btech" | "mba" | "mbbs") => {
    if (tab === activeTab) return;
    setLoading(true);
    setActiveTab(tab);
    setTimeout(() => {
      setLoading(false);
    }, 600); // Simulate network latency to demonstrate skeleton load
  };

  const currentColleges = React.useMemo(() => {
    return collegesData
      .filter((c) => c.stream === activeTab)
      .sort((a, b) => a.nirfRank - b.nirfRank);
  }, [activeTab]);

  const { ref, hasRevealed } = useScrollReveal<HTMLDivElement>();

  return (
    <section
      ref={ref}
      className={`py-20 px-6 bg-white border-b border-stone-200/40 scroll-reveal ${
        hasRevealed ? "revealed" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-brand-navy font-semibold">Top Ranked Institutions</h2>
            <p className="text-sm text-stone-500 font-sans max-w-md">
              A comprehensive view of cutoffs, annual fees, and admission criteria filtered by stream.
            </p>
          </div>

          {/* Program Tabs */}
          <div className="flex bg-[#FAF9F5] p-1 border border-stone-200/60 rounded-xl font-sans text-xs font-semibold">
            {[
              { id: "btech", label: "B.Tech" },
              { id: "mba", label: "MBA" },
              { id: "mbbs", label: "MBBS" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-indigo-900 text-white shadow-sm"
                    : "text-stone-600 hover:text-indigo-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table/Skeleton Area */}
        <div className="border border-stone-200/60 rounded-2xl overflow-hidden bg-white shadow-[0_8px_30px_rgb(0,0,0,0.015)] font-sans">
          {loading ? (
            /* Skeleton Loader */
            <div className="divide-y divide-stone-100">
              <div className="bg-[#FAF9F5]/70 h-14 animate-pulse-subtle" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-6 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-1/3">
                    <div className="w-6 h-6 bg-stone-100 rounded-full animate-pulse-subtle" />
                    <div className="w-12 h-12 bg-stone-100 rounded-xl animate-pulse-subtle" />
                    <div className="space-y-2 w-full">
                      <div className="h-4 bg-stone-100 rounded w-3/4 animate-pulse-subtle" />
                      <div className="h-3 bg-stone-100 rounded w-1/2 animate-pulse-subtle" />
                    </div>
                  </div>
                  <div className="h-4 bg-stone-100 rounded w-20 animate-pulse-subtle" />
                  <div className="h-4 bg-stone-100 rounded w-24 animate-pulse-subtle" />
                  <div className="h-4 bg-stone-100 rounded w-24 animate-pulse-subtle" />
                  <div className="h-4 bg-stone-100 rounded w-16 animate-pulse-subtle" />
                  <div className="h-8 bg-stone-100 rounded-lg w-20 animate-pulse-subtle" />
                </div>
              ))}
            </div>
          ) : (
            /* Active Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5]/70 border-b border-stone-200/50 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    <th className="py-4.5 px-6 w-16 text-center">Rank</th>
                    <th className="py-4.5 px-6">College</th>
                    <th className="py-4.5 px-6 w-28 text-center">Rating</th>
                    <th className="py-4.5 px-6 w-48">Expected Cutoff</th>
                    <th className="py-4.5 px-6 w-44">Deadline</th>
                    <th className="py-4.5 px-6 w-36">Total Fees</th>
                    <th className="py-4.5 px-6 w-36 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700 text-[13px] font-medium">
                  {currentColleges.map((college, idx) => (
                    <tr
                      key={college.id}
                      className="hover:bg-indigo-50/10 transition-colors"
                    >
                      {/* Rank */}
                      <td className="py-5 px-6 text-center font-bold text-stone-400">
                        #{college.nirfRank || idx + 1}
                      </td>

                      {/* College details */}
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl border border-stone-200/60 overflow-hidden bg-stone-50 flex-shrink-0">
                            <img
                              src={college.image}
                              alt={college.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="space-y-1">
                            <Link
                              href={`/colleges/${college.id}`}
                              className="font-serif font-bold text-[14px] text-brand-navy hover:text-indigo-900 leading-tight"
                            >
                              {college.name}
                            </Link>
                            <div className="flex items-center gap-1.5 text-stone-400 text-xs font-semibold">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{college.location}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-5 px-6 text-center">
                        <div className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg text-amber-700 font-bold text-[11px]">
                          <Star className="w-3 h-3 fill-amber-700" />
                          <span>{college.rating.toFixed(1)}</span>
                        </div>
                      </td>

                      {/* Cutoff */}
                      <td className="py-5 px-6 font-semibold text-stone-600">
                        {college.cutoff}
                      </td>

                      {/* Deadline */}
                      <td className="py-5 px-6 text-stone-500 font-semibold">
                        {college.deadline}
                      </td>

                      {/* Fees */}
                      <td className="py-5 px-6">
                        <div className="space-y-0.5">
                          <div className="font-extrabold text-stone-900">
                            {formatFees(college.feesPerYear)}
                          </div>
                          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                            Per Year
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-5 px-6 text-center">
                        <Link
                          href={`/colleges/${college.id}`}
                          className="inline-flex items-center justify-center px-4 py-2 border border-indigo-900/10 bg-indigo-900/5 hover:bg-indigo-900 hover:text-white text-indigo-900 text-xs font-bold rounded-xl transition-all"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
