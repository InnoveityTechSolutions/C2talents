"use client";

import * as React from "react";
import Link from "next/link";
import { Star, MapPin, Award, CheckCircle } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

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
  // Use first 6 colleges
  const featured = colleges.slice(0, 6);

  return (
    <section className="py-20 px-6 bg-[#FAF9F5]/40 border-b border-stone-200/40">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-brand-navy font-semibold">Featured Colleges</h2>
            <p className="text-sm text-stone-500 font-sans max-w-md">
              Top institutions selected for high student outcomes, verified placements, and NAAC accreditation.
            </p>
          </div>
          <Link
            href="/colleges"
            className="text-xs font-bold text-indigo-900 hover:text-indigo-950 uppercase tracking-wider font-sans"
          >
            Browse All Colleges &rarr;
          </Link>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((college, idx) => {
            const displayCourse = college.courses?.[0]?.title || "B.Tech Computer Science";
            const displayCourseFee = college.courses?.[0]?.feesPerYear || college.feesPerYear;
            const { ref, hasRevealed } = useScrollReveal<HTMLDivElement>({ delay: idx * 80 });

            return (
              <div
                ref={ref}
                key={college.id}
                className={`group flex flex-col bg-white border border-stone-200/60 rounded-2xl overflow-hidden shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-md hover:scale-[1.01] scroll-reveal ${
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
                      <label className="flex items-center gap-2 cursor-pointer font-sans select-none shrink-0">
                        <input
                          type="checkbox"
                          className="w-4.5 h-4.5 rounded border-stone-300 text-indigo-900 focus:ring-indigo-900/10 cursor-pointer"
                        />
                        <span className="text-xs font-semibold text-stone-500 hover:text-stone-700">Compare</span>
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
                          className="px-3.5 py-2 bg-indigo-900 hover:bg-indigo-950 text-white text-[11px] font-bold rounded-xl transition-all"
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
