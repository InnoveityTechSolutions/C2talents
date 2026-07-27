"use client";

import * as React from "react";
import Link from "next/link";
import { Landmark, Compass } from "lucide-react";

const cities = [
  { name: "Chennai", count: "42 Colleges", code: "chennai" },
  { name: "Coimbatore", count: "28 Colleges", code: "coimbatore" },
  { name: "Vellore", count: "15 Colleges", code: "vellore" },
  { name: "Bangalore", count: "54 Colleges", code: "bangalore" },
  { name: "Trichy", count: "18 Colleges", code: "trichy" },
  { name: "Madurai", count: "12 Colleges", code: "madurai" },
];

export function TopDestinations() {
  return (
    <section className="py-16 px-6 bg-white border-b border-stone-200/40 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-2xl font-serif text-brand-navy font-semibold flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-900" />
            <span>Top Study Destinations</span>
          </h2>
          <p className="text-xs text-stone-500 max-w-md">
            Explore colleges based in top educational clusters with strong job recruitment networks.
          </p>
        </div>

        {/* Cities grid/scroll */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {cities.map((city) => (
            <Link
              key={city.name}
              href={`/colleges?location=${city.code}`}
              className="flex items-center gap-3 p-4 bg-[#FAF9F5]/60 border border-stone-200/50 rounded-2xl hover:bg-white hover:border-indigo-200/80 hover:shadow-sm transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-900 shrink-0 group-hover:bg-indigo-900 group-hover:text-white transition-colors">
                <Landmark className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-stone-800 group-hover:text-indigo-950 transition-colors">
                  {city.name}
                </div>
                <div className="text-[10px] text-stone-400 font-semibold">{city.count}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
