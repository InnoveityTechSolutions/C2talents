"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const tools = [
  {
    title: "AI College Predictor",
    description: "Input your entrance scores (TNEA, JEE, CAT) to estimate admission chances instantly.",
    image: "/images/tools/ai_college_predictor.png",
    badge: "AI-Powered",
    href: "/counselor",
  },
  {
    title: "Compare Colleges",
    description: "Compare fees, average CTC, naac ratings side-by-side to make the smart final decision.",
    image: "/images/tools/compare_colleges.png",
    badge: "Interactive",
    href: "/compare",
  },
  {
    title: "Ranking Center",
    description: "Filter and compare national institute ranks by NIRF, Outlook, and our proprietary metrics.",
    image: "/images/tools/ranking_center.png",
    badge: "Trusted",
    href: "/colleges",
  },
  {
    title: "Cutoff & Exams Corner",
    description: "Examine detailed historical cutoffs and registration status updates for critical entrance exams.",
    image: "/images/tools/exams_corner.png",
    badge: "Real-time",
    href: "/exams",
  },
  {
    title: "Course Finder",
    description: "Uncover which courses map to your target career paths, salary outcomes, and skills demand.",
    image: "/images/tools/course_finder.png",
    badge: "Strategic",
    href: "/colleges",
  },
  {
    title: "Scholarship Matcher",
    description: "Check active government and corporate financial aid schemes mapped to your eligibility.",
    image: "/images/tools/scholarship_matcher.png",
    badge: "Aid-focused",
    href: "/scholarships",
  },
];

export function ExploreTools() {
  return (
    <section className="py-20 px-6 bg-[#FAF9F5] border-t border-stone-200/40">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-serif text-brand-navy font-semibold">Explore Academic Tools</h2>
          <p className="text-sm text-stone-500 font-sans max-w-xl mx-auto">
            Take control of your admissions journey with our data-driven decision-making widgets. Built to provide transparency.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, idx) => {
            const { ref, hasRevealed } = useScrollReveal<HTMLDivElement>({ delay: idx * 80 });
            return (
              <div
                ref={ref}
                key={tool.title}
                className={`group relative flex flex-col bg-white border border-stone-200/60 rounded-2xl overflow-hidden shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-md hover:scale-[1.01] scroll-reveal ${
                  hasRevealed ? "revealed" : ""
                }`}
              >
                {/* Mobile Layout (Static, no-hover needed) */}
                <div className="md:hidden flex flex-col w-full h-full">
                  <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                    <img
                      src={tool.image}
                      alt={tool.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md bg-indigo-900 text-white shadow-sm">
                        {tool.badge}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-serif text-base font-bold text-brand-navy">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-stone-500 leading-relaxed font-sans">
                        {tool.description}
                      </p>
                    </div>
                    <Link
                      href={tool.href}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-900 hover:text-indigo-950 pt-2 font-sans"
                    >
                      <span>Open Tool</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Desktop Layout (Image-led progressive reveal) */}
                <div className="hidden md:block relative w-full aspect-[4/3] overflow-hidden bg-stone-100 rounded-2xl">
                  {/* Background Photo */}
                  <img
                    src={tool.image}
                    alt={tool.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Progressive-Reveal White Panel */}
                  <div 
                    className="absolute bottom-0 left-0 w-full bg-white border-t border-stone-100 transition-transform duration-300 ease-out translate-y-[calc(100%-56px)] group-hover:translate-y-0 p-4 z-20 flex flex-col justify-between h-[82%] shadow-[0_-4px_20px_rgba(0,0,0,0.03)]"
                  >
                    {/* Collapsed view header (always stays visible at bottom) */}
                    <div className="flex items-center justify-between h-8 cursor-pointer shrink-0">
                      <h3 className="font-serif text-sm font-bold text-brand-navy pr-2 group-hover:text-indigo-900 transition-colors truncate">
                        {tool.title}
                      </h3>
                      <div className="w-6 h-6 flex items-center justify-center rounded-full bg-stone-50 group-hover:bg-indigo-50 border border-stone-200/60 group-hover:border-indigo-100 transition-all shadow-sm shrink-0">
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-indigo-900 group-hover:rotate-90 transition-transform duration-300" />
                      </div>
                    </div>

                    {/* Expanded content (reveals on hover) */}
                    <div className="flex-1 flex flex-col justify-between pt-3 border-t border-stone-100/60 mt-2 space-y-3 overflow-hidden">
                      <div className="space-y-2">
                        <div>
                          <span className="text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-900 border border-indigo-100">
                            {tool.badge}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 leading-relaxed font-sans line-clamp-3">
                          {tool.description}
                        </p>
                      </div>
                      
                      <div>
                        <Link
                          href={tool.href}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-900 hover:text-indigo-950 transition-colors uppercase tracking-wider font-sans border-b-2 border-transparent hover:border-indigo-900 pb-0.5"
                        >
                          <span>Open Tool</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
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
