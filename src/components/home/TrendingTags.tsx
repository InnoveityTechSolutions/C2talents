"use client";

import * as React from "react";
import Link from "next/link";
import { Flame } from "lucide-react";

const tags = [
  { label: "B.Tech CSE Artificial Intelligence", href: "/colleges?query=ai" },
  { label: "MBA Data Analytics", href: "/colleges?query=analytics" },
  { label: "B.Sc Biotechnology Colleges", href: "/colleges?query=biotechnology" },
  { label: "Top NIRF Engineering", href: "/colleges?sort=nirf" },
  { label: "Low Fee B.Tech Options", href: "/colleges?fee=low" },
  { label: "High Placement MBA", href: "/colleges?placement=high" },
  { label: "TNEA Choice Filling Rounds", href: "/exams" },
];

export function TrendingTags() {
  return (
    <section className="py-12 px-6 bg-white border-b border-stone-200/40 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-4">
        {/* Title */}
        <div className="flex items-center gap-2 shrink-0">
          <Flame className="w-4.5 h-4.5 text-amber-500 fill-amber-500/10" />
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Trending Searches:
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.label}
              href={tag.href}
              className="text-xs font-semibold text-stone-500 bg-[#FAF9F5] hover:bg-indigo-50 hover:text-indigo-900 border border-stone-200/40 hover:border-indigo-150 px-3 py-1 rounded-lg transition-all"
            >
              #{tag.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
