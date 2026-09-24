"use client";

import React from "react";
import Link from "next/link";
import { Building2, MapPin, Award, CheckCircle2, ChevronRight, Scale, Check } from "lucide-react";
import { useCompare } from "@/context/CompareContext";

interface Course {
  id?: string;
  title: string;
  feesPerYear?: number;
  duration?: string;
}

interface College {
  id: string;
  name: string;
  location: string;
  rating?: number;
  type?: string;
  ownership?: string;
  naacGrade?: string | null;
  nirfRank?: number | null;
  feesPerYear?: number;
  avgPackage?: number;
  highestPackage?: number;
  image?: string;
  courses?: Course[];
}

interface Props {
  colleges: College[];
}

export function CollegesGrid({ colleges }: Props) {
  const { toggleCollege, isSelected } = useCompare();

  const displayColleges = Array.isArray(colleges) ? colleges : [];
  const featured = displayColleges.slice(0, 6);

  return (
    <section className="py-20 px-6 bg-[#FAF9F5]/40 border-b border-stone-200/40">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3.5 max-w-2xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-serif text-brand-navy font-bold tracking-tight">
            Featured <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-indigo-900 bg-clip-text text-transparent">Colleges</span>
          </h2>

          <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mx-auto" />

          <p className="text-sm md:text-base text-stone-500 font-sans max-w-xl mx-auto leading-relaxed">
            Top institutions selected for high student outcomes, verified placements, and NAAC accreditation.
          </p>

          <div className="pt-1">
            <Link
              href="/colleges"
              className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline transition-all"
            >
              <span>Explore all verified institutions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Grid */}
        {featured.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white border border-stone-200/80 rounded-3xl max-w-md mx-auto space-y-3">
            <Building2 className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-bold text-stone-800">No Colleges Available</h3>
            <p className="text-xs text-stone-500">Check back soon or explore our complete college directory.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {featured.map((college) => {
              const selected = isSelected(college.id);

              return (
                <div
                  key={college.id}
                  className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-brand-navy/30 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Top Image Banner */}
                  <div className="relative h-48 overflow-hidden bg-stone-100">
                    <img
                      src={college.image || "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=1000"}
                      alt={college.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&q=80&w=1000";
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-transparent to-transparent opacity-80" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                      {college.naacGrade && college.naacGrade !== "Not Accredited" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-bold shadow-xs">
                          <Award className="w-3 h-3" /> NAAC {college.naacGrade}
                        </span>
                      )}
                      {college.nirfRank && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold shadow-xs">
                          NIRF #{college.nirfRank}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-0.5 rounded-md bg-stone-900/70 backdrop-blur-md text-white text-[10px] font-medium border border-white/20">
                        {college.ownership || college.type || "Institution"}
                      </span>
                    </div>

                    {/* Rating at bottom left of image */}
                    <div className="absolute bottom-3 left-3 text-white flex items-center gap-1.5">
                      <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded text-xs font-bold border border-white/30">
                        <span className="text-amber-300">★</span>
                        <span>{college.rating?.toFixed(1) || "4.5"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-stone-900 font-serif leading-snug group-hover:text-orange-600 transition-colors line-clamp-2">
                        {college.name}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-stone-500 font-sans">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{college.location}</span>
                      </div>
                    </div>

                    {/* Key Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 text-xs">
                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">Avg Package</span>
                        <span className="font-bold text-stone-900 text-sm">
                          {college.avgPackage ? `₹${college.avgPackage} LPA` : "N/A"}
                        </span>
                      </div>

                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        <span className="text-[10px] text-stone-400 font-bold block uppercase tracking-wider">Annual Fees</span>
                        <span className="font-bold text-stone-900 text-sm">
                          {college.feesPerYear ? `₹${(college.feesPerYear / 1000).toFixed(0)}K` : "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 flex items-center gap-2">
                      <Link
                        href={`/colleges/${college.id}`}
                        className="flex-1 text-center py-2.5 px-4 rounded-xl bg-brand-navy hover:bg-[#ea580c] active:bg-[#ea580c] focus:bg-[#ea580c] text-white text-xs font-bold transition-all duration-200 shadow-2xs cursor-pointer active:scale-[0.98]"
                      >
                        View Details
                      </Link>

                      <button
                        onClick={() =>
                          toggleCollege({
                            id: college.id,
                            name: college.name,
                            location: college.location,
                            rating: college.rating || 4.5,
                            type: college.type || "College",
                            naacGrade: college.naacGrade || "A",
                            nirfRank: college.nirfRank || null,
                            feesPerYear: college.feesPerYear || 50000,
                            avgPackage: college.avgPackage || 4.5,
                            highestPackage: college.highestPackage || 12.0,
                            image: college.image || "",
                          })
                        }
                        className={`p-2.5 rounded-xl border transition-all ${
                          selected
                            ? "bg-amber-50 border-amber-300 text-amber-700"
                            : "bg-white border-stone-200 text-stone-600 hover:border-stone-400"
                        }`}
                        title={selected ? "Remove from Compare" : "Add to Compare"}
                      >
                        {selected ? <Check className="w-4 h-4 text-amber-600" /> : <Scale className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
