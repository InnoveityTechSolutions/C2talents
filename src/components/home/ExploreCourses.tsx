"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Landmark,
  GraduationCap,
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type CourseLevel = "bachelors" | "masters" | "doctorate" | "diploma";

const levelTabs = [
  { id: "bachelors", label: "Bachelors" },
  { id: "masters", label: "Masters" },
  { id: "doctorate", label: "Doctorate" },
  { id: "diploma", label: "Diploma / Certificate" },
];

const mockCoursesData: Record<
  CourseLevel,
  Array<{ name: string; duration: string; avgFees: string; collegesCount: number }>
> = {
  bachelors: [
    { name: "B.Tech Computer Science & Engineering", duration: "4 Years", avgFees: "₹1.5L - ₹3L / yr", collegesCount: 142 },
    { name: "B.Tech AI & Data Science", duration: "4 Years", avgFees: "₹1.8L - ₹3.5L / yr", collegesCount: 95 },
    { name: "B.Com General / Honours", duration: "3 Years", avgFees: "₹40K - ₹1.2L / yr", collegesCount: 110 },
    { name: "BA English / Economics", duration: "3 Years", avgFees: "₹25K - ₹75K / yr", collegesCount: 125 },
  ],
  masters: [
    { name: "MBA Finance / HR / Systems", duration: "2 Years", avgFees: "₹1.2L - ₹4L / yr", collegesCount: 88 },
    { name: "M.Tech Software Engineering", duration: "2 Years", avgFees: "₹80K - ₹2L / yr", collegesCount: 34 },
    { name: "M.Sc Data Science", duration: "2 Years", avgFees: "₹60K - ₹1.8L / yr", collegesCount: 42 },
    { name: "MA Political Science", duration: "2 Years", avgFees: "₹20K - ₹60K / yr", collegesCount: 50 },
  ],
  doctorate: [
    { name: "Ph.D Computer Science & Engineering", duration: "3 - 5 Years", avgFees: "₹40K - ₹1L / yr", collegesCount: 18 },
    { name: "Ph.D Biotechnology", duration: "3 - 5 Years", avgFees: "₹50K - ₹1.2L / yr", collegesCount: 12 },
    { name: "Ph.D Management Studies", duration: "3 - 5 Years", avgFees: "₹60K - ₹1.5L / yr", collegesCount: 15 },
    { name: "Ph.D English Literature", duration: "3 - 5 Years", avgFees: "₹35K - ₹90K / yr", collegesCount: 14 },
  ],
  diploma: [
    { name: "Diploma in Mechanical Engineering", duration: "3 Years", avgFees: "₹30K - ₹60K / yr", collegesCount: 65 },
    { name: "Diploma in Cyber Security", duration: "1 Year", avgFees: "₹45K - ₹90K / yr", collegesCount: 22 },
    { name: "PG Diploma in Business Analytics", duration: "1 Year", avgFees: "₹80K - ₹1.8L / yr", collegesCount: 28 },
    { name: "Diploma in Digital Marketing", duration: "6 Months", avgFees: "₹20K - ₹50K / yr", collegesCount: 40 },
  ],
};

export function ExploreCourses() {
  const { ref, hasRevealed } = useScrollReveal<HTMLDivElement>();
  const [activeLevel, setActiveLevel] = React.useState<CourseLevel>("bachelors");
  const [activeCourseIndex, setActiveCourseIndex] = React.useState(0);

  const currentCourses = mockCoursesData[activeLevel] || [];

  // Reset carousel index when changing level tab
  const handleLevelChange = (level: CourseLevel) => {
    setActiveLevel(level);
    setActiveCourseIndex(0);
  };

  const handlePrev = () => {
    if (currentCourses.length === 0) return;
    setActiveCourseIndex((prev) => (prev - 1 + currentCourses.length) % currentCourses.length);
  };

  const handleNext = () => {
    if (currentCourses.length === 0) return;
    setActiveCourseIndex((prev) => (prev + 1) % currentCourses.length);
  };

  return (
    <section
      ref={ref}
      className={`py-12 sm:py-14 px-4 sm:px-6 bg-gradient-to-b from-[#0e0720] via-[#140a2d] to-[#0e0720] text-white border-b border-purple-900/30 font-sans relative overflow-hidden scroll-reveal ${
        hasRevealed ? "revealed" : ""
      }`}
    >
      {/* Ambient Radial Background Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-6 relative z-10">
        {/* Section Header & Segmented Selector Bar */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-1">
          {/* Header */}
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/10 text-amber-300 border border-white/15 text-[10.5px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>EDITORIAL SHOWCASE</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif text-white font-bold tracking-tight">
              Explore <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-purple-300 bg-clip-text text-transparent">Courses by Level</span>
            </h2>

            <p className="text-xs sm:text-sm text-purple-200/80 font-sans leading-relaxed">
              Unpack durations, fees range, and regional college availability filtered by degree level.
            </p>
          </div>

          {/* Premium Segmented Navigation Control */}
          <div className="inline-flex flex-wrap items-center bg-white/10 p-1 border border-white/15 rounded-2xl shadow-lg gap-1 shrink-0 backdrop-blur-md relative">
            {levelTabs.map((tab) => {
              const isActive = activeLevel === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleLevelChange(tab.id as CourseLevel)}
                  className={`relative z-10 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-colors duration-200 cursor-pointer ${
                    isActive ? "text-white" : "text-purple-200/70 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCourseLevelTab"
                      className="absolute inset-0 bg-gradient-to-r from-[#ea580c] to-[#f97316] rounded-xl shadow-md z-[-1]"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real Interactive Layered Showcase Carousel */}
        <div className="relative min-h-[290px] flex items-center justify-center my-2 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLevel}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex items-center justify-center relative"
            >
              {currentCourses.map((course, idx) => {
                const diff = idx - activeCourseIndex;
                const isActive = diff === 0;
                const isPrev = diff === -1 || (activeCourseIndex === 0 && idx === currentCourses.length - 1);
                const isNext = diff === 1 || (activeCourseIndex === currentCourses.length - 1 && idx === 0);

                // Calculate carousel depth position
                let transformClass = "scale-75 opacity-0 pointer-events-none z-0";
                if (isActive) {
                  transformClass = "scale-100 opacity-100 z-30 shadow-[0_20px_45px_-12px_rgba(0,0,0,0.6)] border-amber-400/40";
                } else if (isPrev) {
                  transformClass = "scale-90 opacity-40 -translate-x-[45%] md:-translate-x-[55%] z-10 cursor-pointer hover:opacity-75 hidden sm:flex";
                } else if (isNext) {
                  transformClass = "scale-90 opacity-40 translate-x-[45%] md:translate-x-[55%] z-10 cursor-pointer hover:opacity-75 hidden sm:flex";
                }

                if (!isActive && !isPrev && !isNext) return null;

                return (
                  <motion.div
                    key={course.name}
                    layout
                    onClick={() => {
                      if (isPrev) handlePrev();
                      if (isNext) handleNext();
                    }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className={`absolute w-full max-w-[500px] sm:max-w-[540px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${transformClass}`}
                  >
                    <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-stone-200 text-stone-900 shadow-2xl flex flex-col justify-between min-h-[260px] relative overflow-hidden group">
                      {/* Ambient Accent Light Inside Card */}
                      <div className="absolute -top-16 -right-16 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                      {/* Header Row: Icon + Program Badge + Index */}
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-[#f5f3ff] border border-[#ede9fe] flex items-center justify-center text-[#3b2075] shadow-2xs group-hover:bg-[#3b2075] group-hover:text-white transition-colors duration-300">
                            <BookOpen className="w-5 h-5 stroke-[2]" />
                          </div>
                          <div>
                            <span className="text-[9.5px] font-black uppercase tracking-widest text-[#ea580c] block">
                              PROGRAM TRACK
                            </span>
                            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider font-sans">
                              {activeLevel}
                            </span>
                          </div>
                        </div>

                        {/* Number Index */}
                        <div className="text-[11px] font-mono font-extrabold text-[#3b2075] bg-[#f5f3ff] px-3 py-1 rounded-full border border-[#ede9fe]">
                          0{idx + 1} / 0{currentCourses.length}
                        </div>
                      </div>

                      {/* Main Course Title */}
                      <div className="my-3 space-y-1.5 relative z-10">
                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1f0c3d] group-hover:text-[#ea580c] transition-colors leading-tight">
                          {course.name}
                        </h3>
                        <p className="text-xs text-stone-500 font-sans leading-relaxed line-clamp-2">
                          Comprehensive degree track with industry-aligned curriculum, placement outcome guarantees, and regional state cutoff rankings.
                        </p>
                      </div>

                      {/* Bottom Meta & Colleges CTA Row */}
                      <div className="pt-3.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 font-sans relative z-10 mt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200/60 text-stone-700 text-xs font-semibold">
                            <Clock className="w-3.5 h-3.5 text-[#3b2075] shrink-0" />
                            <span>{course.duration}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-200/60 text-stone-900 text-xs font-extrabold">
                            <Landmark className="w-3.5 h-3.5 text-[#ea580c] shrink-0" />
                            <span>{course.avgFees}</span>
                          </span>
                        </div>

                        <Link
                          href={`/colleges?search=${encodeURIComponent(course.name)}`}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#3b2075] hover:bg-[#2d1659] text-white text-[11px] font-extrabold transition-all shadow-sm hover:shadow-md hover:scale-[1.02] cursor-pointer shrink-0 uppercase tracking-wider"
                        >
                          <Building2 className="w-3.5 h-3.5 text-amber-300" />
                          <span>{course.collegesCount} Colleges</span>
                          <ArrowRight className="w-3.5 h-3.5 text-amber-300 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Minimal Editorial Navigation Controls (Prev / Next & Dots) */}
        <div className="flex items-center justify-center gap-5 pt-2 relative z-20">
          <button
            onClick={handlePrev}
            aria-label="Previous Course"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center shadow-md transition-all cursor-pointer hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-4.5 h-4.5 stroke-[2.5]" />
          </button>

          {/* Navigation Pill Indicator */}
          <div className="flex items-center gap-1.5">
            {currentCourses.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveCourseIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === activeCourseIndex
                    ? "w-6 bg-[#ea580c]"
                    : "w-1.5 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            aria-label="Next Course"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center shadow-md transition-all cursor-pointer hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-4.5 h-4.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </section>
  );
}
