"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const streams = [
  {
    title: "Engineering",
    count: "142 Colleges",
    image: "/images/study-goals/engineering.jpg",
    degrees: ["B.Tech", "M.Tech", "Diploma"],
    href: "/colleges?stream=engineering",
  },
  {
    title: "Management",
    count: "98 Colleges",
    image: "/images/study-goals/management.jpg",
    degrees: ["MBA", "BBA", "Executive MBA"],
    href: "/colleges?stream=management",
  },
  {
    title: "Commerce",
    count: "115 Colleges",
    image: "/images/study-goals/commerce.jpg",
    degrees: ["B.Com", "M.Com", "CA/CS Paths"],
    href: "/colleges?stream=commerce",
  },
  {
    title: "Arts & Humanities",
    count: "128 Colleges",
    image: "/images/study-goals/arts.jpg",
    degrees: ["BA", "MA", "Fine Arts"],
    href: "/colleges?stream=arts",
  },
  {
    title: "Medical",
    count: "48 Colleges",
    image: "/images/study-goals/medical.jpg",
    degrees: ["MBBS", "BDS", "MD/MS"],
    href: "/colleges?stream=medical",
  },
  {
    title: "Law",
    count: "24 Colleges",
    image: "/images/study-goals/law.jpg",
    degrees: ["LLB", "BA LLB", "LLM"],
    href: "/colleges?stream=law",
  },
];

export function StudyGoals() {
  return (
    <section className="py-20 px-6 bg-white border-y border-stone-200/40">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-brand-navy font-semibold">Select Your Study Goal</h2>
            <p className="text-sm text-stone-500 font-sans max-w-md">
              Filter institutions and programs by your discipline interest. Dive directly into curated degree tracks.
            </p>
          </div>
          <Link
            href="/colleges"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-900 hover:text-indigo-950 transition-colors uppercase tracking-wider font-sans group"
          >
            <span>All Streams</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Stream Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {streams.map((stream, idx) => {
            const { ref, hasRevealed } = useScrollReveal<HTMLDivElement>({ delay: idx * 80 });
            return (
              <div
                ref={ref}
                key={stream.title}
                className={`group relative flex flex-col bg-white border border-stone-200/60 rounded-2xl overflow-hidden shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-md hover:scale-[1.01] scroll-reveal ${
                  hasRevealed ? "revealed" : ""
                }`}
              >
                {/* Photo Header */}
                <div className="relative h-36 w-full overflow-hidden bg-stone-100 flex-shrink-0">
                  <img
                    src={stream.image}
                    alt={stream.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-md bg-white/95 text-stone-900 border border-stone-200/30 shadow-sm backdrop-blur-sm">
                      {stream.count}
                    </span>
                  </div>
                </div>

                {/* Info Container */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3 relative z-10">
                  <div>
                    <h3 className="font-serif text-base font-bold text-brand-navy group-hover:text-indigo-950 transition-colors">
                      {stream.title}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-1.5 font-sans">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                      Popular Degrees
                    </span>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                      {stream.degrees.map((deg) => (
                        <Link
                          key={deg}
                          href={`${stream.href}&degree=${deg.toLowerCase()}`}
                          className="text-xs font-semibold text-stone-600 hover:text-indigo-900 transition-colors py-0.5 relative z-20"
                        >
                          {deg}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer Link */}
                <Link
                  href={stream.href}
                  className="absolute inset-0 z-0"
                  aria-label={`Explore ${stream.title} Colleges`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
