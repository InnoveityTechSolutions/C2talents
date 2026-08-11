"use client";

import * as React from "react";
import Link from "next/link";
import {
  Trophy,
  Award,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Info,
  HelpCircle,
  Building2,
  MapPin,
  TrendingUp,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const rankingSources = [
  { id: "c2talents", name: "C2Talents ROI Index", badge: "Proprietary", icon: Sparkles },
  { id: "nirf", name: "NIRF 2024 Ranks", badge: "Govt. MoE", icon: ShieldCheck },
  { id: "outlook", name: "Outlook I-CARE", badge: "National Survey", icon: Award },
  { id: "theweek", name: "The Week Hansa", badge: "Perceptual", icon: Trophy },
];

interface RankItem {
  name: string;
  rank: number;
  score: number;
  scoreLabel?: string;
  type: "Government" | "Private" | "Govt-Aided";
  metric: string;
  location: string;
  href: string;
}

const mockRankData: Record<string, RankItem[]> = {
  c2talents: [
    { name: "Anna University, Guindy", rank: 1, score: 94.8, type: "Government", metric: "12.4x ROI", location: "Chennai, TN", href: "/colleges" },
    { name: "Vellore Institute of Technology (VIT)", rank: 2, score: 92.5, type: "Private", metric: "8.9x ROI", location: "Vellore, TN", href: "/colleges" },
    { name: "PSG College of Technology", rank: 3, score: 91.8, type: "Govt-Aided", metric: "11.2x ROI", location: "Coimbatore, TN", href: "/colleges" },
    { name: "Loyola College", rank: 4, score: 91.0, type: "Private", metric: "9.5x ROI", location: "Chennai, TN", href: "/colleges" },
    { name: "Amrita Vishwa Vidyapeetham", rank: 5, score: 89.6, type: "Private", metric: "8.1x ROI", location: "Coimbatore, TN", href: "/colleges" },
    { name: "Madras Christian College (MCC)", rank: 6, score: 88.4, type: "Private", metric: "8.7x ROI", location: "Chennai, TN", href: "/colleges" },
  ],
  nirf: [
    { name: "IIT Madras - Indian Institute of Technology", rank: 1, score: 89.7, type: "Government", metric: "NIRF #1 Overall", location: "Chennai, TN", href: "/colleges" },
    { name: "Loyola College", rank: 7, score: 76.5, type: "Private", metric: "NIRF #7 College", location: "Chennai, TN", href: "/colleges" },
    { name: "Vellore Institute of Technology (VIT)", rank: 11, score: 72.8, type: "Private", metric: "NIRF #11 Univ", location: "Vellore, TN", href: "/colleges" },
    { name: "Anna University", rank: 13, score: 71.4, type: "Government", metric: "NIRF #13 Univ", location: "Chennai, TN", href: "/colleges" },
    { name: "SASTRA Deemed University", rank: 34, score: 62.1, type: "Private", metric: "NIRF #34 Univ", location: "Thanjavur, TN", href: "/colleges" },
    { name: "PSG College of Technology", rank: 63, score: 58.2, type: "Govt-Aided", metric: "NIRF #63 Engg", location: "Coimbatore, TN", href: "/colleges" },
  ],
  outlook: [
    { name: "Anna University", rank: 3, score: 92.0, type: "Government", metric: "Top Govt Tech", location: "Chennai, TN", href: "/colleges" },
    { name: "Vellore Institute of Technology (VIT)", rank: 5, score: 90.4, type: "Private", metric: "Top Pvt Univ", location: "Vellore, TN", href: "/colleges" },
    { name: "PSG College of Technology", rank: 8, score: 88.1, type: "Govt-Aided", metric: "Top Tech Inst", location: "Coimbatore, TN", href: "/colleges" },
    { name: "Loyola College", rank: 10, score: 86.5, type: "Private", metric: "Top Arts College", location: "Chennai, TN", href: "/colleges" },
    { name: "SSN College of Engineering", rank: 14, score: 84.9, type: "Private", metric: "Top Engg College", location: "Chennai, TN", href: "/colleges" },
  ],
  theweek: [
    { name: "Vellore Institute of Technology (VIT)", rank: 4, score: 91.2, type: "Private", metric: "Top 5 National", location: "Vellore, TN", href: "/colleges" },
    { name: "Anna University", rank: 6, score: 89.8, type: "Government", metric: "Top 10 State", location: "Chennai, TN", href: "/colleges" },
    { name: "Loyola College", rank: 9, score: 87.3, type: "Private", metric: "Top 10 Arts", location: "Chennai, TN", href: "/colleges" },
    { name: "PSG College of Technology", rank: 12, score: 85.6, type: "Govt-Aided", metric: "Top 15 Engg", location: "Coimbatore, TN", href: "/colleges" },
  ],
};

export function RankingsCompare() {
  const [activeSource, setActiveSource] = React.useState("c2talents");
  const { ref, hasRevealed } = useScrollReveal<HTMLDivElement>();

  const currentRanks = mockRankData[activeSource] || [];

  return (
    <section
      ref={ref}
      className={`py-24 px-6 bg-[#FAF9F5] border-b border-stone-200/50 scroll-reveal relative overflow-hidden ${
        hasRevealed ? "revealed" : ""
      }`}
    >
      {/* Decorative ambient background blur */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Area */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/5 text-indigo-900 border border-indigo-900/15 text-[11px] font-extrabold uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              <span>Multi-Agency Benchmark</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 font-bold tracking-tight">
              Cross-Agency <span className="bg-gradient-to-r from-[#1f0c3d] via-indigo-900 to-purple-800 bg-clip-text text-transparent">College Ranks</span>
            </h2>
            <p className="text-sm text-stone-500 font-sans max-w-xl leading-relaxed">
              Compare institutional standing across government NIRF data, national surveys, and our objective ROI match algorithm to bypass single-source ranking bias.
            </p>
          </div>

          {/* Source Tabs */}
          <div className="inline-flex max-w-full items-center gap-1 sm:gap-1.5 bg-white p-1.5 border border-stone-200/80 rounded-2xl shadow-xs font-sans overflow-x-auto no-scrollbar whitespace-nowrap">
            {rankingSources.map((source) => {
              const Icon = source.icon;
              const isActive = activeSource === source.id;
              return (
                <button
                  key={source.id}
                  onClick={() => setActiveSource(source.id)}
                  className={`shrink-0 flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-[#1f0c3d] text-amber-300 shadow-md scale-[1.02]"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/80"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-300" : "text-stone-400"}`} />
                  <span>{source.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Table + Methodology Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Rankings Table */}
          <div className="lg:col-span-2 bg-white border border-stone-200/80 rounded-3xl overflow-hidden shadow-sm font-sans">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50/80 border-b border-stone-200/70 text-[10.5px] font-black text-stone-500 uppercase tracking-widest">
                    <th className="py-4 px-6 w-20 text-center">Rank</th>
                    <th className="py-4 px-6">Institution</th>
                    <th className="py-4 px-6 w-32">Type</th>
                    <th className="py-4 px-6 w-44">Score & Metric</th>
                    <th className="py-4 px-4 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700 text-xs">
                  {currentRanks.map((item) => {
                    const isTop1 = item.rank === 1;
                    const isTop2 = item.rank === 2;
                    const isTop3 = item.rank === 3;

                    return (
                      <tr
                        key={item.name}
                        className="group hover:bg-amber-500/5 transition-all duration-200"
                      >
                        {/* Rank Badge */}
                        <td className="py-4.5 px-6 text-center">
                          <div
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-black shadow-xs ${
                              isTop1
                                ? "bg-gradient-to-tr from-amber-500 to-yellow-300 text-stone-950 ring-2 ring-amber-400/40"
                                : isTop2
                                ? "bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-800 ring-1 ring-slate-300"
                                : isTop3
                                ? "bg-gradient-to-tr from-amber-700 to-amber-500 text-white ring-1 ring-amber-600"
                                : "bg-stone-100 text-stone-700 border border-stone-200"
                            }`}
                          >
                            #{item.rank}
                          </div>
                        </td>

                        {/* Institution Name & Location */}
                        <td className="py-4.5 px-6">
                          <div className="flex flex-col space-y-0.5">
                            <span className="font-serif font-bold text-stone-900 text-sm group-hover:text-indigo-900 transition-colors">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-stone-400 flex items-center gap-1 font-sans">
                              <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                              <span>{item.location}</span>
                            </span>
                          </div>
                        </td>

                        {/* Institution Type Pill */}
                        <td className="py-4.5 px-6">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-wide border ${
                              item.type === "Government"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : item.type === "Govt-Aided"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-purple-50 text-purple-800 border-purple-200"
                            }`}
                          >
                            {item.type}
                          </span>
                        </td>

                        {/* Score Bar & Metric */}
                        <td className="py-4.5 px-6">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-extrabold text-stone-900">{item.score}/100</span>
                              <span className="text-[10px] font-bold text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                {item.metric}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-900 to-amber-500 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(item.score, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* External Link */}
                        <td className="py-4.5 px-4 text-center">
                          <Link
                            href={item.href}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-stone-400 hover:text-indigo-900 hover:bg-stone-100 transition-colors"
                            title="View College Profile"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 bg-stone-50/80 border-t border-stone-200/70 flex items-center justify-between text-xs text-stone-500 font-sans">
              <span>Showing top verified institutional ranks in Tamil Nadu</span>
              <Link
                href="/colleges"
                className="font-bold text-indigo-900 hover:text-indigo-950 flex items-center gap-1 group"
              >
                <span>Browse All 500+ Colleges</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Methodology Legend Box */}
          <div className="bg-gradient-to-br from-[#1f0c3d] via-[#170830] to-[#0e041f] text-purple-100 border border-[#3b2075]/60 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-xl font-sans relative overflow-hidden">
            {/* Background Accent Glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-5 relative z-10">
              <div className="flex items-center gap-2.5 border-b border-[#3b2075]/60 pb-4">
                <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-300">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white leading-tight">
                    Methodology Legend
                  </h3>
                  <p className="text-[11px] text-purple-300/70">
                    How each national ranking is calculated
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#2a1352]/50 border border-[#3b2075]/60 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>NIRF (MoE Govt. India)</span>
                  </div>
                  <p className="text-[11.5px] text-purple-200/80 leading-relaxed">
                    Evaluates Teaching & Learning (30%), Research (30%), Graduation Outcomes (20%), Outreach (10%) & Perception (10%).
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#2a1352]/50 border border-[#3b2075]/60 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-purple-200">
                    <Award className="w-4 h-4 text-purple-300" />
                    <span>Outlook & The Week</span>
                  </div>
                  <p className="text-[11.5px] text-purple-200/80 leading-relaxed">
                    Surveys perception among recruiters, faculty, infrastructure assets, academic excellence, and campus placement records.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>C2Talents ROI Index</span>
                  </div>
                  <p className="text-[11.5px] text-amber-100/90 leading-relaxed">
                    Our data model matching average CTC placement salary against total 4-year tuition fees to give students true return on investment.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#3b2075]/60 relative z-10">
              <Link
                href="/colleges"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-extrabold text-xs transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Explore Full Methodology Guide</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

