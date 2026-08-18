"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight, GraduationCap } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const streams = [
  {
    title: "Engineering",
    count: "65 Colleges",
    image: "/images/study-goals/engineering.jpg",
    degrees: ["B.Tech", "M.Tech", "Diploma"],
    href: "/colleges?category=Engineering",
  },
  {
    title: "Medical",
    count: "14 Colleges",
    image: "/images/study-goals/medical.jpg",
    degrees: ["MBBS", "BDS", "MD/MS"],
    href: "/colleges?category=Medical",
  },
  {
    title: "Arts & Science",
    count: "57 Colleges",
    image: "/images/study-goals/arts.jpg",
    degrees: ["BA", "MA", "B.Sc"],
    href: "/colleges?category=Arts%20%26%20Science",
  },
  {
    title: "Commerce",
    count: "8 Colleges",
    image: "/images/study-goals/commerce-v4.png",
    degrees: ["B.Com", "M.Com", "CA/CS Paths"],
    href: "/colleges?category=Commerce",
  },
  {
    title: "Management",
    count: "8 Colleges",
    image: "/images/study-goals/management-v1.png",
    degrees: ["MBA", "BBA", "Executive MBA"],
    href: "/colleges?category=Management",
  },
  {
    title: "Law",
    count: "24 Colleges",
    image: "/images/study-goals/law-v1.png",
    degrees: ["LL.B", "BA LL.B", "LL.M"],
    href: "/colleges?category=Law",
  },
];

export function StudyGoals() {
  return (
    <section className="py-20 px-6 bg-white border-y border-stone-200/40">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3.5 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif text-brand-navy font-bold tracking-tight">
            Select Your <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-indigo-900 bg-clip-text text-transparent">Study Goal</span>
          </h2>

          <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full mx-auto" />

          <p className="text-sm md:text-base text-stone-500 font-sans max-w-xl mx-auto leading-relaxed">
            Filter institutions and programs by your discipline interest. Dive directly into curated degree tracks.
          </p>

          <div className="pt-1">
            <Link
              href="/colleges"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-orange-50 hover:text-orange-600 text-xs font-bold text-stone-700 transition-all border border-stone-200/80 hover:border-orange-200 font-sans group shadow-2xs cursor-pointer"
            >
              <span>Explore All Streams & Colleges</span>
              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-orange-500 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Stream Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {streams.map((stream, idx) => {
            const { ref, hasRevealed } = useScrollReveal<HTMLDivElement>({ delay: idx * 80 });
            return (
              <div
                ref={ref}
                key={stream.title}
                className={`group relative flex flex-col bg-white border border-stone-200/80 rounded-[22px] overflow-hidden shadow-[0_4px_22px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-xl hover:-translate-y-1 scroll-reveal ${
                  hasRevealed ? "revealed" : ""
                }`}
              >
                {/* Photo Header */}
                <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-stone-100 shrink-0">
                  <img
                    src={stream.image}
                    alt={stream.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-top grayscale contrast-[1.05] group-hover:grayscale-0 group-active:grayscale-0 group-focus:grayscale-0 transition-all duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="absolute top-3.5 left-3.5 z-10">
                    <span className="text-[11px] font-black tracking-wider uppercase px-3 py-1 rounded-lg bg-white/95 text-stone-900 border border-stone-200/50 shadow-sm backdrop-blur-sm font-sans">
                      {stream.count}
                    </span>
                  </div>
                </div>

                {/* Info Container */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3 relative z-10">
                  <div>
                    <h3 className="font-sans text-xl font-extrabold text-[#1c0b36] group-hover:text-indigo-900 transition-colors tracking-tight">
                      {stream.title}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-1 font-sans">
                    <span className="text-[10px] text-stone-400 font-extrabold uppercase tracking-widest">
                      Popular Degrees
                    </span>
                    <div className="flex flex-wrap gap-x-3.5 gap-y-1 pt-1">
                      {stream.degrees.map((deg) => (
                        <Link
                          key={deg}
                          href={`${stream.href}&degree=${deg.toLowerCase()}`}
                          className="text-xs font-bold text-stone-700 hover:text-indigo-900 transition-colors relative z-20"
                        >
                          {deg}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Link Overlay */}
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
