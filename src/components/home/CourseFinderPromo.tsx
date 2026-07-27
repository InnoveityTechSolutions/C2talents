"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

export function CourseFinderPromo() {
  return (
    <section className="py-14 px-6 bg-[#FAF9F5] border-b border-stone-200/40 font-sans">
      <div className="max-w-7xl mx-auto bg-white border border-stone-200/60 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="space-y-3 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-bold tracking-wide uppercase text-indigo-900">
            <Sparkles className="w-3 h-3 text-indigo-700 animate-pulse" />
            <span>AI Course Evaluator</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-brand-navy leading-tight">
            Confused between specialized streams? Let AI model your path.
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed max-w-lg">
            Evaluate high-growth specializations in Computer Science, Business Analytics, or Bio-Tech. Learn which course yields the highest career conversion index.
          </p>
        </div>

        <Link
          href="/counselor"
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold rounded-xl shadow-md transition-all shrink-0 group"
        >
          <span>Find My Perfect Course</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
