"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, Clock, Landmark, GraduationCap, ArrowRight } from "lucide-react";
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

  const currentCourses = mockCoursesData[activeLevel] || [];

  return (
    <section
      ref={ref}
      className={`py-20 px-6 bg-[#FAF9F5]/50 border-b border-stone-200/50 font-sans scroll-reveal ${
        hasRevealed ? "revealed" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header & Tabs Bar matching Screenshot */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-serif text-[#1f0c3d] font-bold tracking-tight flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-[#3b2075] shrink-0" />
              <span>Explore Courses by Level</span>
            </h2>
            <p className="text-sm md:text-base text-stone-500 font-sans leading-relaxed">
              Unpack durations, fees range, and regional college availability filtered by degree level.
            </p>
          </div>

          {/* Level Tabs Pill Container */}
          <div className="inline-flex flex-wrap items-center bg-white p-1.5 border border-stone-200/80 rounded-2xl shadow-2xs gap-1 shrink-0">
            {levelTabs.map((tab) => {
              const isActive = activeLevel === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveLevel(tab.id as CourseLevel)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#3b2075] text-white shadow-md shadow-purple-950/20 scale-[1.02]"
                      : "text-stone-600 hover:text-[#3b2075] hover:bg-stone-50 font-semibold"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Courses Grid matching Screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentCourses.map((course) => (
            <Link
              key={course.name}
              href={`/colleges?search=${encodeURIComponent(course.name)}`}
              className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.03)] hover:shadow-xl hover:shadow-purple-950/10 hover:-translate-y-1.5 hover:border-purple-300 transition-all duration-300 flex flex-col justify-between space-y-6 group relative overflow-hidden"
            >
              {/* Top Section: Book Icon & Title */}
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-[#f5f3ff] border border-purple-100 flex items-center justify-center text-[#3b2075] group-hover:bg-[#3b2075] group-hover:text-white transition-all duration-300 shadow-2xs">
                  <BookOpen className="w-5 h-5 stroke-[2]" />
                </div>
                <h3 className="font-bold text-[#1f0c3d] group-hover:text-[#ea580c] transition-colors text-[15px] leading-snug min-h-[2.8rem]">
                  {course.name}
                </h3>
              </div>

              {/* Bottom Section: Duration, Fees & Availability */}
              <div className="space-y-3 pt-3 border-t border-stone-100 text-xs font-semibold">
                <div className="flex items-center gap-2 text-stone-500">
                  <Clock className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-600">
                  <Landmark className="w-4 h-4 text-stone-400 shrink-0" />
                  <span>{course.avgFees}</span>
                </div>
                <div className="pt-2 text-[10.5px] font-extrabold text-[#3b2075] uppercase tracking-wider flex items-center justify-between">
                  <span>OFFERED BY {course.collegesCount} COLLEGES</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-[#3b2075] group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
