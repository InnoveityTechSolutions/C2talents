"use client";

import * as React from "react";
import Link from "next/link";
import { Star, MapPin, Award, CheckCircle, ChevronRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
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
  courses: any[];
}

interface Props {
  colleges: College[];
}

export function CollegesGrid({ colleges }: Props) {
  const { toggleCollege, isSelected } = useCompare();
  // Use first 6 colleges
  const featured = colleges.slice(0, 6);

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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-orange-50 hover:text-orange-600 text-xs font-bold text-stone-700 transition-all border border-stone-200/80 hover:border-orange-200 font-sans group shadow-2xs cursor-pointer uppercase tracking-wider"
            >
              <span>Browse All Colleges</span>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-orange-500 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((college, idx) => {
            const displayCourse = college.courses?.[0]?.title || "B.Tech Computer Science";
            const displayCourseFee = college.courses?.[0]?.feesPerYear || college.feesPerYear;
            const { ref, hasRevealed } = useScrollReveal<HTMLDivElement>({ delay: idx * 80 });
            const checked = isSelected(college.id);

            return (
              <div
                ref={ref}
                key={college.id}
                className={`group flex flex-col bg-white border ${checked ? "border-indigo-600 ring-2 ring-indigo-500/20" : "border-stone-200/60"} rounded-2xl overflow-hidden shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-md hover:scale-[1.01] scroll-reveal ${
                  hasRevealed ? "revealed" : ""
                }`}
              >
                {/* College Image */}
                <div className="relative h-48 overflow-hidden bg-stone-100 flex-shrink-0">
                  <img
                    src={college.image}
                    alt={college.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/campus-hero.jpg";
                    }}
                  />

                  {/* Premium Ribbon Style Badge */}
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    {college.nirfRank && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 bg-indigo-900 text-white rounded-lg shadow-sm">
                        <Award className="w-3.5 h-3.5 text-amber-300" />
                        NIRF #{college.nirfRank}
                      </span>
                    )}
                    {college.naacGrade && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-900/90 text-stone-100 backdrop-blur-sm self-start">
                        NAAC {college.naacGrade}
                      </span>
                    )}
                  </div>

                  {/* Status Indicator */}
                  <div className="absolute top-4 right-4">
                    <span className="text-[9px] font-extrabold tracking-wider uppercase px-2 py-1 rounded-md bg-white text-stone-900 border border-stone-200/30 shadow-sm">
                      {college.type}
                    </span>
                  </div>

                  {/* Circular Rating Badge */}
                  <div className="absolute bottom-4 right-4 w-11 h-11 rounded-full bg-white flex items-center justify-center border border-stone-100 shadow-md">
                    <div className="relative flex flex-col items-center justify-center leading-none">
                      <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500 mb-0.5" />
                      <span className="text-xs font-bold text-stone-800">{college.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-stone-400 text-[11px] font-bold uppercase tracking-wider">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{college.location}</span>
                    </div>
                    <Link
                      href={`/colleges/${college.id}`}
                      className="block font-serif text-base font-semibold text-brand-navy hover:text-indigo-900 leading-snug group-hover:underline min-h-[44px] flex items-center line-clamp-2"
                    >
                      {college.name}
                    </Link>
                    <div className="bg-[#FAF9F5] rounded-xl p-3 border border-stone-100 mt-2">
                      <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                        Top Program
                      </div>
                      <div className="text-xs font-bold text-stone-800 mt-0.5 truncate">
                        {displayCourse}
                      </div>
                      <div className="text-xs text-indigo-900 font-semibold mt-1">
                        ₹{(displayCourseFee / 100000).toFixed(2)}L / Year
                      </div>
                    </div>
                  </div>

                  {/* Actions & Compare Checkbox */}
                  <div className="pt-4 border-t border-stone-100 flex flex-col space-y-3">
                    {/* Stats Strip */}
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-stone-500 pb-1">
                      <div>
                        <div className="text-[9px] font-bold text-stone-400 uppercase">Avg CTC</div>
                        <span className="text-stone-850 font-bold text-xs">{college.avgPackage} LPA</span>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-stone-400 uppercase">Highest CTC</div>
                        <span className="text-stone-850 font-bold text-xs">{college.highestPackage} LPA</span>
                      </div>
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center justify-between gap-3">
                      <label className="flex items-center gap-2 cursor-pointer font-sans select-none shrink-0 group/cmp">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCollege(college)}
                          className="w-4.5 h-4.5 rounded border-stone-300 text-indigo-900 focus:ring-indigo-900/10 cursor-pointer accent-indigo-900"
                        />
                        <span className={`text-xs font-semibold ${checked ? "text-indigo-900 font-bold" : "text-stone-500 group-hover/cmp:text-stone-700"}`}>
                          {checked ? "Comparing" : "Compare"}
                        </span>
                      </label>
                      <div className="flex gap-2 w-full justify-end">
                        <Link
                          href={`/colleges/${college.id}`}
                          className="px-3.5 py-2 border border-stone-200 hover:border-stone-300 text-stone-650 hover:text-stone-800 text-[11px] font-bold rounded-xl transition-all"
                        >
                          View Courses
                        </Link>
                        <button
                          onClick={() => alert("Brochure download details would be opened.")}
                          className="px-3.5 py-2 bg-indigo-900 hover:bg-indigo-950 text-white text-[11px] font-bold rounded-xl transition-all cursor-pointer"
                        >
                          Brochure
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
