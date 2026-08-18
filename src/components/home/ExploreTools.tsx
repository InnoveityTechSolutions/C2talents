"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const tools = [
  {
    title: "AI College Predictor",
    description: "Input your entrance scores (TNEA, JEE, CAT) to estimate admission chances instantly.",
    image: "/images/tools/ai_college_predictor_v4.jpg",
    href: "/counselor",
  },
  {
    title: "Compare Colleges",
    description: "Compare fees, average CTC, NAAC ratings side-by-side to make the smart final decision.",
    image: "/images/tools/compare_colleges_v4.jpg",
    href: "/compare",
  },
  {
    title: "Ranking Center",
    description: "Filter and compare national institute ranks by NIRF, Outlook, and our proprietary metrics.",
    image: "/images/tools/ranking_center_v4.jpg",
    href: "/colleges",
  },
  {
    title: "Cutoff & Exams Corner",
    description: "Examine detailed historical cutoffs and registration status updates for critical entrance exams.",
    image: "/images/tools/exams_corner_v4.jpg",
    href: "/exams",
  },
  {
    title: "Course Finder",
    description: "Uncover which courses map to your target career paths, salary outcomes, and skills demand.",
    image: "/images/tools/course_finder_v4.jpg",
    href: "/colleges",
  },
  {
    title: "Scholarship Matcher",
    description: "Check active government and corporate financial aid schemes mapped to your eligibility.",
    image: "/images/tools/scholarship_matcher_v4.jpg",
    href: "/scholarships",
  },
];

export function ExploreTools() {
  return (
    <section className="py-20 px-6 bg-[#FAF9F5] border-t border-stone-200/40 relative overflow-hidden font-sans">
      <div className="max-w-[1100px] mx-auto space-y-10">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto flex flex-col items-center">
          {/* Top Sparkle Accent */}
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-[2px] bg-gradient-to-r from-transparent to-[#ea580c]" />
            <Sparkles className="w-4 h-4 text-[#ea580c]" />
            <div className="w-8 h-[2px] bg-gradient-to-l from-transparent to-[#ea580c]" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif text-[#24104F] font-bold tracking-tight">
            Explore <span className="bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#24104F] bg-clip-text text-transparent">Academic Tools</span>
          </h2>

          <p className="text-sm sm:text-base text-stone-500 font-sans leading-relaxed max-w-xl mx-auto">
            Take control of your admissions journey with our data-driven decision-making widgets. Built to provide transparency.
          </p>
        </div>

        {/* 3x2 Grid of Large Rich Educational Illustration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {tools.map((tool, idx) => {
            const { ref, hasRevealed } = useScrollReveal<HTMLAnchorElement>({ delay: idx * 50 });

            return (
              <Link
                ref={ref}
                key={tool.title}
                href={tool.href}
                className={`group flex flex-col bg-white border border-stone-200/80 rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_35px_-8px_rgba(36,16,79,0.14)] hover:border-[#24104F]/30 scroll-reveal ${
                  hasRevealed ? "revealed" : ""
                }`}
              >
                {/* Large Rich Illustration Container (Fills ~85-90%+ frame) */}
                <div className="relative h-48 sm:h-52 md:h-56 w-full overflow-hidden bg-stone-100/60 border-b border-stone-100 shrink-0">
                  <img
                    src={tool.image}
                    alt={tool.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  />
                </div>

                {/* Card Content Area - strictly Title + Circular Arrow, then Short Description */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-2">
                  {/* Title + Circular Arrow Button */}
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#24104F] group-hover:text-[#ea580c] transition-colors leading-snug">
                      {tool.title}
                    </h3>

                    {/* Circular Arrow Button */}
                    <div className="w-9 h-9 rounded-full bg-[#f5f3ff] border border-[#ede9fe] shadow-2xs flex items-center justify-center text-[#24104F] group-hover:bg-[#fff7ed] group-hover:border-[#ea580c]/50 group-hover:text-[#ea580c] group-hover:scale-105 transition-all duration-300 shrink-0">
                      <ChevronRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </div>
                  </div>

                  {/* Short 1-2 Line Description */}
                  <p className="text-xs sm:text-sm text-stone-500 leading-relaxed line-clamp-2">
                    {tool.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
