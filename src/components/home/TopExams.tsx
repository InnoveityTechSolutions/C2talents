"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, Calendar, Landmark, Activity, GraduationCap } from "lucide-react";

const exams = [
  {
    name: "JEE Main 2026",
    mode: "Online / Computer Based",
    collegesCount: 120,
    date: "July 22, 2026",
    level: "National",
    status: "Result Declared",
    statusColor: "bg-emerald-50 text-emerald-700 border-emerald-250",
  },
  {
    name: "CAT 2026",
    mode: "Online / CBT",
    collegesCount: 98,
    date: "Nov 29, 2026",
    level: "National",
    status: "Registration Open",
    statusColor: "bg-indigo-50 text-indigo-700 border-indigo-250",
  },
  {
    name: "NEET UG 2026",
    mode: "Offline / Pen & Paper",
    collegesCount: 48,
    date: "Aug 05, 2026",
    level: "National",
    status: "Counselling Open",
    statusColor: "bg-amber-50 text-amber-700 border-amber-250",
  },
  {
    name: "TNEA Counselling",
    mode: "Online Choice Filling",
    collegesCount: 440,
    date: "July 15, 2026",
    level: "State (Tamil Nadu)",
    status: "Ongoing Round 1",
    statusColor: "bg-rose-50 text-rose-700 border-rose-250",
  },
];

export function TopExams() {
  return (
    <section className="py-20 px-6 bg-white border-b border-stone-200/40 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-brand-navy font-semibold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-900" />
              <span>National & State Entrance Exams</span>
            </h2>
            <p className="text-sm text-stone-500 max-w-md">
              Stay ahead with accurate registration windows, exam modes, and participating college metrics.
            </p>
          </div>
          <Link
            href="/exams"
            className="text-xs font-bold text-indigo-900 hover:text-indigo-950 uppercase tracking-wider"
          >
            All Exam Guides &rarr;
          </Link>
        </div>

        {/* Exam Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {exams.map((exam) => (
            <div
              key={exam.name}
              className="bg-[#FAF9F5]/50 border border-stone-200/50 rounded-2xl p-5 hover-card-trigger flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3.5">
                {/* Status Pill */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    {exam.level}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${exam.statusColor}`}>
                    {exam.status}
                  </span>
                </div>

                {/* Exam Title */}
                <h3 className="font-serif font-bold text-brand-navy text-base leading-tight">
                  {exam.name}
                </h3>
              </div>

              {/* Specs */}
              <div className="space-y-2 text-xs font-semibold text-stone-500 pt-3 border-t border-stone-200/40">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>Date: {exam.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Landmark className="w-3.5 h-3.5 text-stone-400" />
                  <span>{exam.collegesCount}+ Participating Colleges</span>
                </div>
                <div className="text-[10px] text-stone-450 font-semibold italic mt-1.5 truncate">
                  Mode: {exam.mode}
                </div>
              </div>

              {/* Action Button */}
              <Link
                href="/exams"
                className="w-full text-center py-2 border border-indigo-900/10 hover:border-indigo-900 text-indigo-900 hover:bg-indigo-900 hover:text-white text-xs font-bold rounded-xl transition-all"
              >
                View Exam Guide
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
