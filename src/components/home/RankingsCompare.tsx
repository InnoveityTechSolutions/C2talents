"use client";

import * as React from "react";
import Link from "next/link";
import { Info, HelpCircle } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const rankingSources = [
  { id: "c2talents", name: "C2Talents Rank" },
  { id: "nirf", name: "NIRF Rank" },
  { id: "outlook", name: "Outlook Rank" },
  { id: "theweek", name: "The Week Rank" },
];

const mockRankData: Record<string, Array<{ name: string; rank: number; score: string; type: string }>> = {
  c2talents: [
    { name: "Anna University", rank: 1, score: "94.8/100", type: "Government" },
    { name: "Vellore Institute of Technology (VIT)", rank: 2, score: "92.5/100", type: "Private" },
    { name: "Loyola College", rank: 3, score: "91.0/100", type: "Private" },
    { name: "PSG College of Technology", rank: 4, score: "89.2/100", type: "Govt-Aided" },
  ],
  nirf: [
    { name: "Loyola College", rank: 7, score: "NIRF Rank", type: "Arts/Commerce" },
    { name: "Vellore Institute of Technology (VIT)", rank: 11, score: "NIRF Rank", type: "University/Eng" },
    { name: "Anna University", rank: 13, score: "NIRF Rank", type: "University/Eng" },
    { name: "Madras Christian College (MCC)", rank: 16, score: "NIRF Rank", type: "Arts/Science" },
  ],
  outlook: [
    { name: "Anna University", rank: 5, score: "Outlook Rank", type: "Government" },
    { name: "Vellore Institute of Technology (VIT)", rank: 9, score: "Outlook Rank", type: "Private" },
    { name: "PSG College of Technology", rank: 12, score: "Outlook Rank", type: "Govt-Aided" },
    { name: "Loyola College", rank: 15, score: "Outlook Rank", type: "Private" },
  ],
  theweek: [
    { name: "Vellore Institute of Technology (VIT)", rank: 4, score: "The Week", type: "Private" },
    { name: "Anna University", rank: 6, score: "The Week", type: "Government" },
    { name: "Loyola College", rank: 10, score: "The Week", type: "Private" },
    { name: "PSG College of Technology", rank: 14, score: "The Week", type: "Govt-Aided" },
  ],
};

export function RankingsCompare() {
  const [activeSource, setActiveSource] = React.useState("c2talents");
  const { ref, hasRevealed } = useScrollReveal<HTMLDivElement>();

  const currentRanks = mockRankData[activeSource] || [];

  return (
    <section
      ref={ref}
      className={`py-20 px-6 bg-white border-b border-stone-200/40 scroll-reveal ${
        hasRevealed ? "revealed" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-serif text-brand-navy font-semibold">Multi-Agency College Rankings</h2>
            <p className="text-sm text-stone-500 font-sans max-w-md">
              Compare institutional positions across different national agencies to bypass singular ranking bias.
            </p>
          </div>

          {/* Source Tabs */}
          <div className="flex flex-wrap bg-[#FAF9F5] p-1 border border-stone-200/60 rounded-xl font-sans text-xs font-semibold">
            {rankingSources.map((source) => (
              <button
                key={source.id}
                onClick={() => setActiveSource(source.id)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeSource === source.id
                    ? "bg-indigo-900 text-white shadow-sm"
                    : "text-stone-600 hover:text-indigo-900"
                }`}
              >
                {source.name}
              </button>
            ))}
          </div>
        </div>

        {/* Table + Legend grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Table */}
          <div className="lg:col-span-2 border border-stone-200/60 rounded-2xl overflow-hidden bg-[#FAF9F5]/20 font-sans">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5]/70 border-b border-stone-200/50 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                  <th className="py-4 px-6 w-20 text-center">Rank</th>
                  <th className="py-4 px-6">Institution</th>
                  <th className="py-4 px-6 w-32">Type</th>
                  <th className="py-4 px-6 w-28 text-center">Score / Metric</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700 text-xs font-medium">
                {currentRanks.map((item) => (
                  <tr key={item.name} className="hover:bg-indigo-50/10 transition-colors">
                    <td className="py-4 px-6 text-center font-bold text-indigo-900">
                      #{item.rank}
                    </td>
                    <td className="py-4 px-6 font-serif font-bold text-brand-navy text-[13px]">
                      {item.name}
                    </td>
                    <td className="py-4 px-6 text-stone-500 font-semibold">
                      {item.type}
                    </td>
                    <td className="py-4 px-6 text-center font-semibold text-stone-600">
                      {item.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend and Methodology */}
          <div className="bg-[#FAF9F5] border border-stone-200/60 rounded-2xl p-6 flex flex-col justify-between space-y-6 font-sans">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-indigo-900" />
                <h3 className="font-serif text-lg font-bold text-brand-navy">Methodology Legend</h3>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                Rankings represent multi-dimensional data inputs:
              </p>
              <ul className="space-y-3 text-xs text-stone-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-900 shrink-0 mt-1.5" />
                  <span><strong>NIRF:</strong> Ministry of Education criteria focusing on Teaching, Learning, and graduation outcomes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-900 shrink-0 mt-1.5" />
                  <span><strong>Outlook & The Week:</strong> Survey-based rankings measuring perceptual reputation, infrastructure, and campus assets.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-900 shrink-0 mt-1.5" />
                  <span><strong>C2Talents Metric:</strong> Objective data modeling placement yields vs. fees paid (ROI matching).</span>
                </li>
              </ul>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-900 hover:text-indigo-950 transition-colors uppercase tracking-wider pt-2 border-t border-stone-200/60"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Full Methodology Guide</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
