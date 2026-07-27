"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { BookOpen, TrendingUp, AlertCircle, ExternalLink, CalendarDays } from "lucide-react";

const EXAMS = [
  {
    name: "JEE Main 2026",
    fullName: "Joint Entrance Examination (Main)",
    authority: "National Testing Agency (NTA)",
    status: "Cutoff Released",
    date: "Results: July 22, 2026",
    color: "bg-blue-600",
    link: "https://jeemain.nta.nic.in",
    cutoffs: [
      { category: "General (Open)", cutoffPercentile: 89.75 },
      { category: "OBC-NCL", cutoffPercentile: 74.31 },
      { category: "SC", cutoffPercentile: 52.18 },
      { category: "ST", cutoffPercentile: 39.62 },
    ],
    topColleges: ["IIT Bombay (1)", "IIT Delhi (2)", "IIT Madras (3)", "NIT Trichy (10)"],
  },
  {
    name: "TNEA 2026",
    fullName: "Tamil Nadu Engineering Admissions",
    authority: "Anna University, Tamil Nadu",
    status: "Counselling Open",
    date: "Round 1 Choice Filling: July 15–20, 2026",
    color: "bg-brand-green",
    link: "https://tneaonline.org",
    cutoffs: [
      { category: "Anna University (CEG) — CSE", cutoffPercentile: 99.1 },
      { category: "VIT Vellore — CSE (VITEEE)", cutoffPercentile: 97.5 },
      { category: "PSG Tech — CSE", cutoffPercentile: 96.2 },
      { category: "SSN College — CSE", cutoffPercentile: 94.8 },
    ],
    topColleges: ["Anna University (13)", "VIT Vellore (11)", "PSG Tech (63)", "SSN (45)"],
  },
  {
    name: "NEET UG 2026",
    fullName: "National Eligibility cum Entrance Test (UG)",
    authority: "National Testing Agency (NTA)",
    status: "Counselling Soon",
    date: "Counselling Starts: August 5, 2026",
    color: "bg-red-600",
    link: "https://neet.nta.nic.in",
    cutoffs: [
      { category: "General — Government College", cutoffPercentile: 620 },
      { category: "OBC — Government College", cutoffPercentile: 580 },
      { category: "SC — Government College", cutoffPercentile: 500 },
      { category: "Private College (Open)", cutoffPercentile: 420 },
    ],
    topColleges: ["JIPMER Puducherry", "AFMC Pune", "Madras Medical College", "Stanley Medical"],
  },
  {
    name: "CAT 2026",
    fullName: "Common Admission Test",
    authority: "IIM — Indian Institutes of Management",
    status: "Registration Open",
    date: "Registration Closes: Sept 20, 2026",
    color: "bg-purple-600",
    link: "https://iimcat.ac.in",
    cutoffs: [
      { category: "IIM Ahmedabad", cutoffPercentile: 99.5 },
      { category: "IIM Bangalore", cutoffPercentile: 99.0 },
      { category: "IIM Calcutta", cutoffPercentile: 98.5 },
      { category: "IIM Kozhikode", cutoffPercentile: 95.0 },
    ],
    topColleges: ["IIM Ahmedabad", "IIM Bangalore", "IIM Calcutta", "XLRI Jamshedpur"],
  },
];

export default function ExamsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen bg-stone-50">
        <div className="bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1.5">Exam Corner</div>
            <h1 className="text-3xl font-bold text-stone-900">Cutoffs & Exam Predictor</h1>
            <p className="text-stone-500 text-sm mt-2 max-w-xl">
              Reference cutoff trends, dates, and top college cutoffs for major Indian entrance exams. Updated regularly.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* Disclaimer */}
          <div className="flex items-start gap-3 px-5 py-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              Cutoff figures are historical estimates based on previous years and should be verified on official authority websites before making decisions. Not a guarantee of admission.
            </span>
          </div>

          {/* Exam Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {EXAMS.map((exam, i) => (
              <motion.div
                key={exam.name}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover-card-trigger"
              >
                {/* Card Header */}
                <div className={`${exam.color} px-6 py-4`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-[17px] font-bold text-white">{exam.name}</h2>
                      <div className="text-white/70 text-xs mt-0.5">{exam.fullName}</div>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/20 text-white border border-white/30">
                      {exam.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-white/80 text-xs">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {exam.date}
                  </div>
                </div>

                {/* Cutoff Table */}
                <div className="p-5 space-y-4">
                  <div>
                    <div className="text-xs font-bold text-stone-500 uppercase mb-2">Indicative Cutoffs 2026</div>
                    <div className="space-y-2">
                      {exam.cutoffs.map((c) => (
                        <div key={c.category} className="flex items-center justify-between text-sm">
                          <span className="text-stone-600">{c.category}</span>
                          <span className="font-extrabold text-stone-900">{c.cutoffPercentile}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-stone-100 pt-4">
                    <div className="text-xs font-bold text-stone-500 uppercase mb-2">Top Accepting Colleges</div>
                    <div className="flex flex-wrap gap-2">
                      {exam.topColleges.map((c) => (
                        <span key={c} className="text-[11px] font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <a
                    href={exam.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    id={`exam-official-${exam.name.toLowerCase().replace(/ /g, "-")}`}
                    className="flex items-center gap-2 text-xs font-bold text-brand-green hover:text-emerald-800 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Visit Official Website — {exam.authority}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI Predictor Callout */}
          <div className="bg-gradient-to-r from-brand-green to-emerald-600 rounded-2xl p-8 text-center text-white space-y-4">
            <TrendingUp className="w-10 h-10 text-emerald-300 mx-auto" />
            <h2 className="text-xl font-bold">Get a Personalized Placement Prediction</h2>
            <p className="text-emerald-200 text-sm max-w-lg mx-auto">
              Share your entrance exam score with our AI Counselor to see which specific colleges you are likely to get admission at and what package range to expect.
            </p>
            <a
              href="/counselor"
              id="exam-to-counselor"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-green text-sm font-bold rounded-xl hover:bg-emerald-50 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Ask AI Counselor
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
