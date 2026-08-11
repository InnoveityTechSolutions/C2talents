"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function CommunityBanner() {
  const { ref, hasRevealed } = useScrollReveal<HTMLDivElement>();

  return (
    <section
      ref={ref}
      className={`py-16 px-6 bg-gradient-to-r from-[#0e4eb5] via-[#125fdc] to-[#0a44a3] text-white relative overflow-hidden font-sans scroll-reveal ${
        hasRevealed ? "revealed" : ""
      }`}
    >
      {/* Background Student Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-10 relative z-10 text-center">
        {/* Title matching screenshot 2 */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm font-sans">
          Welcome to C2Talents Community!
        </h2>

        {/* 3 Column Stat Blocks with White Action Buttons matching screenshot 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center pt-2">
          {/* Column 1 */}
          <div className="space-y-4 flex flex-col items-center">
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
              500+
            </div>
            <p className="text-xs sm:text-sm text-blue-100 font-semibold max-w-[220px]">
              Verified Colleges Across India
            </p>
            <Link
              href="/colleges"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-stone-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer mt-2"
            >
              <span>Explore Colleges</span>
              <ArrowRight className="w-4 h-4 text-stone-900" />
            </Link>
          </div>

          {/* Column 2 */}
          <div className="space-y-4 flex flex-col items-center">
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
              25,000+
            </div>
            <p className="text-xs sm:text-sm text-blue-100 font-semibold max-w-[220px]">
              Students Guided Annually
            </p>
            <Link
              href="/exams"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-stone-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer mt-2"
            >
              <span>Check Cutoffs</span>
              <ArrowRight className="w-4 h-4 text-stone-900" />
            </Link>
          </div>

          {/* Column 3 */}
          <div className="space-y-4 flex flex-col items-center">
            <div className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
              ₹ 50 Cr +
            </div>
            <p className="text-xs sm:text-sm text-blue-100 font-semibold max-w-[220px]">
              Scholarships & Financial Aid
            </p>
            <Link
              href="/scholarships"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-stone-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-lg transition-all hover:scale-105 cursor-pointer mt-2"
            >
              <span>Scholarships & Aid</span>
              <ArrowRight className="w-4 h-4 text-stone-900" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Center Pointer Triangle matching screenshot 2 */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[14px] border-t-[#0a44a3] z-20" />
    </section>
  );
}
