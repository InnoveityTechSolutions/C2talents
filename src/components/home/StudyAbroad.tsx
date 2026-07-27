"use client";

import * as React from "react";
import Link from "next/link";
import { Globe, DollarSign, Landmark, ChevronRight } from "lucide-react";

const countries = [
  {
    name: "United States (USA)",
    collegesCount: "800+ Universities",
    avgCost: "₹25L - ₹45L / yr",
    popularDegree: "MS / MBA / BS",
    guideLink: "/",
    flag: "🇺🇸",
  },
  {
    name: "United Kingdom (UK)",
    collegesCount: "160+ Universities",
    avgCost: "₹18L - ₹32L / yr",
    popularDegree: "M.Sc / MBA / B.Sc",
    guideLink: "/",
    flag: "🇬🇧",
  },
  {
    name: "Canada",
    collegesCount: "220+ Universities",
    avgCost: "₹15L - ₹28L / yr",
    popularDegree: "MS / PG Diploma",
    guideLink: "/",
    flag: "🇨🇦",
  },
];

export function StudyAbroad() {
  return (
    <section className="py-20 px-6 bg-[#FAF9F5]/40 border-b border-stone-200/40 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-brand-navy font-semibold flex items-center gap-2">
              <Globe className="w-6 h-6 text-indigo-900 animate-spin-slow" />
              <span>Study Abroad Opportunities</span>
            </h2>
            <p className="text-sm text-stone-500 max-w-md">
              Compare premium global study destinations, costs, and placement visa guides.
            </p>
          </div>
          <Link
            href="/"
            className="text-xs font-bold text-indigo-900 hover:text-indigo-950 uppercase tracking-wider"
          >
            Study Abroad Hub &rarr;
          </Link>
        </div>

        {/* Countries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {countries.map((country) => (
            <div
              key={country.name}
              className="bg-white border border-stone-200/60 rounded-3xl p-6 flex flex-col justify-between space-y-5 hover-card-trigger"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{country.flag}</span>
                  <span className="text-[10px] font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                    Visa Path Verified
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-brand-navy text-lg leading-tight">
                    {country.name}
                  </h3>
                  <span className="text-xs text-stone-400 font-semibold">{country.popularDegree} tracks</span>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2 text-xs font-semibold text-stone-500 pt-3 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-stone-400" />
                  <span>{country.collegesCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-stone-400" />
                  <span>Avg Cost: {country.avgCost}</span>
                </div>
              </div>

              {/* Link */}
              <Link
                href={country.guideLink}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 border border-stone-250 hover:border-indigo-900 text-stone-605 hover:text-indigo-900 text-xs font-bold rounded-xl transition-all"
              >
                <span>Download Admission Guide</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
