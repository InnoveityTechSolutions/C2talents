"use client";

import * as React from "react";
import Link from "next/link";
import { Newspaper, Calendar, ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

type NewsTab = "exams" | "admissions" | "general";

const tabs = [
  { id: "exams", label: "Exam Alerts" },
  { id: "admissions", label: "Admission Alerts" },
  { id: "general", label: "General News" },
];

const mockNews: Record<NewsTab, Array<{ date: string; title: string; desc: string }>> = {
  exams: [
    { date: "July 14, 2026", title: "JEE Main Counselling Dates Revised", desc: "JoSAA releases updated timeline for Round 3 seat allotment results." },
    { date: "July 12, 2026", title: "TNEA Choice Filling Window Active for Round 1", desc: "Candidates matching 190+ cutoffs can submit preferences until July 18." },
    { date: "July 10, 2026", title: "NEET PG 2026 Registrations to Close Soon", desc: "NBE will close registration portal by next week. Apply online." },
  ],
  admissions: [
    { date: "July 15, 2026", title: "Anna University Admission Portal Launched", desc: "Direct admissions open for sponsored industry seats across CEG campus." },
    { date: "July 11, 2026", title: "VIT Vellore Announces Integrated Program Cutoffs", desc: "Minimum eligibility scores announced for 5-Year Integrated M.Tech courses." },
    { date: "July 08, 2026", title: "Loyola College Releases Third Merit List", desc: "Selected students must lock seats and submit fees by July 20." },
  ],
  general: [
    { date: "July 13, 2026", title: "National Higher Education Budget Increases by 12%", desc: "Central funds to focus on AI research labs and rural infrastructure hubs." },
    { date: "July 09, 2026", title: "New UGC Norms on Dual Degrees Explained", desc: "Students can now pursue parallel online and offline programs simultaneously." },
  ],
};

export function NewsStories() {
  const { ref, hasRevealed } = useScrollReveal<HTMLDivElement>();
  const [activeTab, setActiveTab] = React.useState<NewsTab>("exams");

  const currentNews = mockNews[activeTab] || [];

  return (
    <section ref={ref} className={`py-20 px-6 bg-white border-b border-stone-200/40 font-sans scroll-reveal ${hasRevealed ? "revealed" : ""}`}>
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-brand-navy font-semibold flex items-center gap-2">
              <Newspaper className="w-6 h-6 text-indigo-900" />
              <span>Latest News & Editorial Stories</span>
            </h2>
            <p className="text-sm text-stone-500 max-w-md">
              Timely updates and structural changes in higher education admissions and national exams.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#FAF9F5] p-1 border border-stone-200/60 rounded-xl text-xs font-semibold">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as NewsTab)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-indigo-900 text-white shadow-sm"
                    : "text-stone-600 hover:text-indigo-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stories List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentNews.map((news) => (
            <div
              key={news.title}
              className="bg-[#FAF9F5]/40 border border-stone-200/50 rounded-2xl p-6 flex flex-col justify-between space-y-4 hover-card-trigger"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-stone-400 text-[10px] font-bold tracking-wider uppercase">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{news.date}</span>
                </div>
                <h3 className="font-serif font-bold text-brand-navy text-[15px] leading-snug">
                  {news.title}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {news.desc}
                </p>
              </div>

              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-900 hover:text-indigo-950 transition-colors uppercase tracking-wider group"
              >
                <span>Read More</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
