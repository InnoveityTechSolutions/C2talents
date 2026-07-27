"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, Clock, Landmark, GraduationCap } from "lucide-react";

type CourseLevel = "bachelors" | "masters" | "doctorate" | "diploma";

const levelTabs = [
  { id: "bachelors", label: "Bachelors" },
  { id: "masters", label: "Masters" },
  { id: "doctorate", label: "Doctorate" },
  { id: "diploma", label: "Diploma / Certificate" },
];

const mockCoursesData: Record<CourseLevel, Array<{ name: string; duration: string; avgFees: string; collegesCount: number }>> = {
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
  ],
  diploma: [
    { name: "Diploma in Mechanical Engineering", duration: "3 Years", avgFees: "₹30K - ₹60K / yr", collegesCount: 65 },
    { name: "Diploma in Cyber Security", duration: "1 Year", avgFees: "₹45K - ₹90K / yr", collegesCount: 22 },
    { name: "PG Diploma in Business Analytics", duration: "1 Year", avgFees: "₹80K - ₹1.8L / yr", collegesCount: 28 },
  ],
};

export function ExploreCourses() {
  const [activeLevel, setActiveLevel] = React.useState<CourseLevel>("bachelors");

  const currentCourses = mockCoursesData[activeLevel] || [];

  return (
    <section className="py-20 px-6 bg-[#FAF9F5]/40 border-b border-stone-200/40 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-brand-navy font-semibold flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-indigo-900" />
              <span>Explore Courses by Level</span>
            </h2>
            <p className="text-sm text-stone-500 max-w-md">
              Unpack durations, fees range, and regional college availability filtered by degree level.
            </p>
          </div>

          {/* Level Tabs */}
          <div className="flex flex-wrap bg-white p-1 border border-stone-200/60 rounded-xl text-xs font-semibold">
            {levelTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveLevel(tab.id as CourseLevel)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeLevel === tab.id
                    ? "bg-indigo-900 text-white shadow-sm"
                    : "text-stone-600 hover:text-indigo-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Courses grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentCourses.map((course) => (
            <div
              key={course.name}
              className="bg-white border border-stone-200/50 rounded-2xl p-5 hover-card-trigger flex flex-col justify-between space-y-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.01)]"
            >
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-900">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-brand-navy text-[14px] leading-snug">
                  {course.name}
                </h3>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-100 text-xs font-semibold text-stone-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-stone-400" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Landmark className="w-3.5 h-3.5 text-stone-400" />
                  <span>{course.avgFees}</span>
                </div>
                <div className="text-[10px] text-indigo-900/80 font-bold uppercase tracking-wider mt-1">
                  Offered by {course.collegesCount} Colleges
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
