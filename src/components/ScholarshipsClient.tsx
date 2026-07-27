"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Award, Clock, Search, X, ExternalLink, Shield, Filter } from "lucide-react";

interface Scholarship {
  id: string;
  name: string;
  provider: string;
  eligibility: string;
  value: string;
  deadline: Date | string;
  type: string;
  applyLink: string;
}

interface Props {
  initialScholarships: Scholarship[];
}

export function ScholarshipsClient({ initialScholarships }: Props) {
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("");

  const filtered = initialScholarships.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !search || s.name.toLowerCase().includes(q) || s.provider.toLowerCase().includes(q) || s.eligibility.toLowerCase().includes(q);
    const matchType = !typeFilter || s.type === typeFilter;
    return matchSearch && matchType;
  });

  const daysLeft = (deadline: Date | string) => {
    const d = new Date(deadline);
    const now = new Date();
    const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="mb-2 text-xs font-bold text-amber-600 uppercase tracking-wider">Financial Aid</div>
          <h1 className="text-3xl font-bold text-stone-900">Scholarships Directory</h1>
          <p className="text-stone-500 text-sm mt-2 max-w-xl">
            Explore government and institutional scholarships available to Indian students. Verify eligibility and apply before deadlines.
          </p>

          {/* Search & Filter */}
          <div className="mt-6 flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                id="scholarship-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, provider, or eligibility..."
                className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-green bg-stone-50 focus:bg-white transition-all"
              />
            </div>
            <div className="flex gap-2">
              {["", "Government", "Private"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${typeFilter === t ? "bg-brand-green text-white border-brand-green" : "border-stone-200 text-stone-600 hover:border-brand-green"}`}
                >
                  {t || "All"}
                </button>
              ))}
            </div>
            {(search || typeFilter) && (
              <button onClick={() => { setSearch(""); setTypeFilter(""); }} className="flex items-center gap-1 px-3 py-2 text-xs text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-all">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-stone-500">No scholarships found matching your search.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((s, i) => {
              const days = daysLeft(s.deadline);
              return (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col justify-between h-full hover-card-trigger"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="font-semibold text-stone-900 text-[17px] leading-snug">{s.name}</div>
                        <div className="text-[11px] text-stone-400 font-medium">{s.provider}</div>
                      </div>
                      <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full ${s.type === "Government" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                        {s.type}
                      </span>
                    </div>

                    {/* Value */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-lg">
                      <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="text-xs font-bold text-amber-800">{s.value}</span>
                    </div>

                    {/* Eligibility */}
                    <div className="space-y-0.5">
                      <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">Eligibility</div>
                      <p className="text-xs text-stone-500 leading-relaxed">{s.eligibility}</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-4 shrink-0">
                    <div className={`flex items-center gap-1.5 text-[11px] font-bold ${days <= 7 ? "text-red-650" : days <= 30 ? "text-amber-650" : "text-stone-500"}`}>
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      {days > 0 ? `${days} days left` : "Deadline passed"}
                      <span className="font-normal text-stone-400">— {new Date(s.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                    <a
                      href={s.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      id={`apply-scholarship-${s.id}`}
                      className="flex items-center gap-1 text-[11px] font-bold text-brand-green hover:text-emerald-800 transition-colors"
                    >
                      Apply <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 flex items-start gap-3 px-5 py-4 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-500">
          <Shield className="w-4 h-4 shrink-0 mt-0.5 text-stone-400" />
          Always verify eligibility and deadlines on the official scholarship portal before applying. C2Talents is not responsible for inaccuracies.
        </div>
      </div>
    </div>
  );
}
