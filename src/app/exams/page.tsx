"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, TrendingUp, AlertCircle, ExternalLink, CalendarDays,
  Search, Sparkles, Building2, GraduationCap, CheckCircle2, ChevronRight, Award
} from "lucide-react";
import Link from "next/link";

interface CutoffItem {
  category: string;
  value: string;
}

interface Exam {
  id: string;
  name: string;
  fullName: string;
  authority: string;
  category: "engineering" | "medical" | "management" | "law" | "design_other";
  categoryLabel: string;
  status: string;
  importantDates?: { label: string; date: string }[];
  cutoffTitle: string;
  cutoffs: CutoffItem[];
  topColleges: string[];
  officialWebsite: string;
  purposeOrBranch?: string;
  color: string;
  accentBadge: string;
}

const EXAMS_DATA: Exam[] = [
  {
    id: "jee-main",
    name: "JEE Main 2026",
    fullName: "Joint Entrance Examination (Main)",
    authority: "National Testing Agency (NTA)",
    category: "engineering",
    categoryLabel: "Engineering",
    status: "Notification Out Soon",
    color: "from-indigo-900 to-indigo-800",
    accentBadge: "bg-indigo-500/20 text-indigo-200 border-indigo-400/30",
    importantDates: [
      { label: "Notification", date: "November 2025" },
      { label: "Application Starts", date: "November 2025" },
      { label: "Session 1 Exam", date: "January 2026" },
      { label: "Session 2 Exam", date: "April 2026" },
    ],
    cutoffTitle: "Previous Year Closing Percentile (General)",
    cutoffs: [
      { category: "IIT Madras (CSE)", value: "99.90 Percentile" },
      { category: "IIT Bombay (CSE)", value: "99.89 Percentile" },
      { category: "IIT Delhi (CSE)", value: "99.87 Percentile" },
      { category: "NIT Trichy (CSE)", value: "99.55 Percentile" },
      { category: "NIT Surathkal (CSE)", value: "99.42 Percentile" },
    ],
    topColleges: ["IIT Madras", "IIT Bombay", "IIT Delhi", "NIT Trichy", "NIT Surathkal"],
    officialWebsite: "https://jeemain.nta.nic.in",
  },
  {
    id: "tnea",
    name: "TNEA 2026",
    fullName: "Tamil Nadu Engineering Admissions",
    authority: "Directorate of Technical Education (DoTE)",
    category: "engineering",
    categoryLabel: "Engineering",
    status: "Counselling Open",
    color: "from-amber-600 to-orange-700",
    accentBadge: "bg-amber-500/20 text-amber-200 border-amber-400/30",
    cutoffTitle: "Previous Year Expected Cutoff (OC)",
    cutoffs: [
      { category: "Anna University (CEG) — CSE", value: "199.50 Cutoff" },
      { category: "PSG Tech — CSE", value: "198.75 Cutoff" },
      { category: "CIT Coimbatore — CSE", value: "198.20 Cutoff" },
      { category: "Thiagarajar College — CSE", value: "197.60 Cutoff" },
      { category: "SSN College — CSE", value: "197.20 Cutoff" },
      { category: "Kumaraguru College (KCT)", value: "196.80 Cutoff" },
    ],
    topColleges: ["Anna Univ (CEG)", "PSG Tech", "CIT Coimbatore", "TCE Madurai", "SSN College", "KCT Coimbatore"],
    officialWebsite: "https://www.tneaonline.org",
  },
  {
    id: "neet-ug",
    name: "NEET UG 2026",
    fullName: "National Eligibility cum Entrance Test (UG)",
    authority: "National Testing Agency (NTA)",
    category: "medical",
    categoryLabel: "Medical",
    status: "Upcoming",
    color: "from-rose-800 to-red-900",
    accentBadge: "bg-rose-500/20 text-rose-200 border-rose-400/30",
    cutoffTitle: "Previous Year Expected Cutoff",
    cutoffs: [
      { category: "General (Open)", value: "686 - 144 Marks" },
      { category: "OBC Category", value: "143 - 113 Marks" },
      { category: "SC Category", value: "143 - 113 Marks" },
      { category: "ST Category", value: "143 - 113 Marks" },
      { category: "EWS Category", value: "143 - 113 Marks" },
    ],
    topColleges: ["AIIMS Delhi", "JIPMER Puducherry", "Madras Medical College", "Stanley Medical College", "CMC Vellore"],
    officialWebsite: "https://neet.nta.nic.in",
  },
  {
    id: "cat",
    name: "CAT 2026",
    fullName: "Common Admission Test",
    authority: "Indian Institutes of Management (Rotates among IIMs)",
    category: "management",
    categoryLabel: "Management",
    status: "Registration Open",
    color: "from-purple-900 to-indigo-900",
    accentBadge: "bg-purple-500/20 text-purple-200 border-purple-400/30",
    cutoffTitle: "Previous Year Percentile",
    cutoffs: [
      { category: "IIM Ahmedabad", value: "99.80+ Percentile" },
      { category: "IIM Bangalore", value: "99.70+ Percentile" },
      { category: "IIM Calcutta", value: "99.65+ Percentile" },
      { category: "IIM Lucknow", value: "98.80+ Percentile" },
      { category: "IIM Kozhikode", value: "98.50+ Percentile" },
    ],
    topColleges: ["IIM Ahmedabad", "IIM Bangalore", "IIM Calcutta", "IIM Lucknow", "IIM Kozhikode"],
    officialWebsite: "https://iimcat.ac.in",
  },
  {
    id: "clat",
    name: "CLAT 2026",
    fullName: "Common Law Admission Test",
    authority: "Consortium of National Law Universities (NLUs)",
    category: "law",
    categoryLabel: "Law",
    status: "Registration Soon",
    color: "from-emerald-900 to-teal-900",
    accentBadge: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
    cutoffTitle: "Previous Year Closing Rank",
    cutoffs: [
      { category: "NLSIU Bangalore", value: "Rank 95" },
      { category: "NALSAR Hyderabad", value: "Rank 165" },
      { category: "WBNUJS Kolkata", value: "Rank 260" },
      { category: "NLU Jodhpur", value: "Rank 370" },
      { category: "GNLU Gandhinagar", value: "Rank 420" },
    ],
    topColleges: ["NLSIU Bangalore", "NALSAR Hyderabad", "WBNUJS Kolkata", "NLU Jodhpur", "GNLU Gandhinagar"],
    officialWebsite: "https://consortiumofnlus.ac.in",
  },
  {
    id: "cuet-ug",
    name: "CUET UG 2026",
    fullName: "Common University Entrance Test (UG)",
    authority: "National Testing Agency (NTA)",
    category: "design_other",
    categoryLabel: "Central Varsities",
    status: "Notification Soon",
    color: "from-sky-900 to-blue-900",
    accentBadge: "bg-sky-500/20 text-sky-200 border-sky-400/30",
    cutoffTitle: "Popular Participating Universities",
    cutoffs: [
      { category: "Delhi University (DU)", value: "780+ / 800 (Top Courses)" },
      { category: "Banaras Hindu Univ (BHU)", value: "720+ Marks" },
      { category: "Jawaharlal Nehru Univ (JNU)", value: "740+ Marks" },
      { category: "Univ of Hyderabad (UoH)", value: "680+ Marks" },
      { category: "Allahabad University", value: "650+ Marks" },
    ],
    topColleges: ["Delhi University", "Banaras Hindu University", "Jawaharlal Nehru University", "University of Hyderabad", "Allahabad University"],
    officialWebsite: "https://cuet.nta.nic.in",
  },
  {
    id: "gate",
    name: "GATE 2026",
    fullName: "Graduate Aptitude Test in Engineering",
    authority: "IISc Bangalore & IITs (Rotates among IITs)",
    category: "engineering",
    categoryLabel: "Engineering PG",
    status: "Upcoming",
    color: "from-slate-900 to-indigo-950",
    accentBadge: "bg-slate-500/20 text-slate-200 border-slate-400/30",
    purposeOrBranch: "Computer Science, Mechanical, Civil, Electronics, Electrical",
    cutoffTitle: "Top Participating Institutes",
    cutoffs: [
      { category: "IISc Bangalore", value: "GATE Score 850+" },
      { category: "IIT Madras", value: "GATE Score 820+" },
      { category: "IIT Bombay", value: "GATE Score 815+" },
      { category: "IIT Delhi", value: "GATE Score 810+" },
      { category: "IIT Kanpur", value: "GATE Score 790+" },
    ],
    topColleges: ["IISc Bangalore", "IIT Madras", "IIT Bombay", "IIT Delhi", "IIT Kanpur"],
    officialWebsite: "https://gate2026.iitr.ac.in",
  },
  {
    id: "ugc-net",
    name: "UGC NET 2026",
    fullName: "University Grants Commission National Eligibility Test",
    authority: "National Testing Agency (NTA)",
    category: "design_other",
    categoryLabel: "Research & Teaching",
    status: "Notification Out",
    color: "from-amber-900 to-yellow-950",
    accentBadge: "bg-amber-500/20 text-amber-200 border-amber-400/30",
    purposeOrBranch: "Assistant Professor & Junior Research Fellowship (JRF)",
    cutoffTitle: "Key Fellowship Outcomes",
    cutoffs: [
      { category: "Assistant Professor (JRF)", value: "Top 0.5% Candidates" },
      { category: "Assistant Professor Only", value: "Top 6% Candidates" },
      { category: "Ph.D Admission Only", value: "Qualifying Score" },
    ],
    topColleges: ["Central Universities", "State Universities", "IITs Humanities", "IIMs Doctoral"],
    officialWebsite: "https://ugcnet.nta.ac.in",
  },
  {
    id: "gpat",
    name: "GPAT 2026",
    fullName: "Graduate Pharmacy Aptitude Test",
    authority: "National Board of Examinations in Medical Sciences (NBEMS)",
    category: "medical",
    categoryLabel: "Pharmacy PG",
    status: "Upcoming",
    color: "from-teal-900 to-cyan-950",
    accentBadge: "bg-teal-500/20 text-teal-200 border-teal-400/30",
    purposeOrBranch: "M.Pharm & Pharmaceutical Sciences Admissions",
    cutoffTitle: "Top Pharmacy Institutions",
    cutoffs: [
      { category: "NIPER Mohali", value: "GPAT Score 240+" },
      { category: "JSS College of Pharmacy", value: "GPAT Score 200+" },
      { category: "Manipal College of Pharm", value: "GPAT Score 190+" },
    ],
    topColleges: ["NIPER Mohali", "JSS College of Pharmacy", "Manipal College of Pharmaceutical Sciences"],
    officialWebsite: "https://natboard.edu.in",
  },
  {
    id: "jee-advanced",
    name: "JEE Advanced 2026",
    fullName: "Joint Entrance Examination (Advanced)",
    authority: "IIT Zone Committee",
    category: "engineering",
    categoryLabel: "Engineering",
    status: "Qualifying Mains Required",
    color: "from-blue-950 to-indigo-900",
    accentBadge: "bg-blue-500/20 text-blue-200 border-blue-400/30",
    cutoffTitle: "Indicative Rank Cuts (General)",
    cutoffs: [
      { category: "IIT Bombay (CSE)", value: "Closing Rank 67" },
      { category: "IIT Delhi (CSE)", value: "Closing Rank 118" },
      { category: "IIT Madras (CSE)", value: "Closing Rank 145" },
    ],
    topColleges: ["IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kharagpur", "IIT Roorkee"],
    officialWebsite: "https://jeeadv.ac.in",
  },
  {
    id: "tancet",
    name: "TANCET 2026",
    fullName: "Tamil Nadu Common Entrance Test",
    authority: "Anna University, Chennai",
    category: "management",
    categoryLabel: "Tamil Nadu PG",
    status: "Upcoming March 2026",
    color: "from-orange-900 to-amber-900",
    accentBadge: "bg-orange-500/20 text-orange-200 border-orange-400/30",
    cutoffTitle: "Top TN Business Schools",
    cutoffs: [
      { category: "Anna Univ (CEG) — MBA", value: "99.2 Percentile" },
      { category: "PSG College of Technology", value: "98.5 Percentile" },
      { category: "SSN School of Mgmt", value: "97.1 Percentile" },
    ],
    topColleges: ["Anna University (CEG)", "PSG College of Technology", "SSN School of Management"],
    officialWebsite: "https://tancet.annauniv.edu",
  },
  {
    id: "cmat",
    name: "CMAT 2026",
    fullName: "Common Management Admission Test",
    authority: "National Testing Agency (NTA)",
    category: "management",
    categoryLabel: "Management",
    status: "Notification Out Soon",
    color: "from-purple-950 to-indigo-950",
    accentBadge: "bg-purple-500/20 text-purple-200 border-purple-400/30",
    cutoffTitle: "Top Accepting Institutes",
    cutoffs: [
      { category: "JBIMS Mumbai", value: "99.9+ Percentile" },
      { category: "SIMSREE Mumbai", value: "99.7+ Percentile" },
      { category: "K J Somaiya Mumbai", value: "98.0+ Percentile" },
    ],
    topColleges: ["JBIMS Mumbai", "SIMSREE Mumbai", "K J Somaiya", "Great Lakes Chennai"],
    officialWebsite: "https://cmat.nta.nic.in",
  },
  {
    id: "xat",
    name: "XAT 2026",
    fullName: "Xavier Aptitude Test",
    authority: "XLRI Jamshedpur",
    category: "management",
    categoryLabel: "Management",
    status: "Registration Open",
    color: "from-red-950 to-rose-900",
    accentBadge: "bg-red-500/20 text-red-200 border-red-400/30",
    cutoffTitle: "XLRI BM & HRM Cutoffs",
    cutoffs: [
      { category: "XLRI Jamshedpur (BM)", value: "96.0 Percentile" },
      { category: "XLRI Jamshedpur (HRM)", value: "95.0 Percentile" },
      { category: "XIMB Bhubaneswar", value: "91.0 Percentile" },
    ],
    topColleges: ["XLRI Jamshedpur", "XLRI Delhi", "XIMB Bhubaneswar", "IMT Ghaziabad"],
    officialWebsite: "https://xatonline.in",
  },
  {
    id: "snap",
    name: "SNAP 2026",
    fullName: "Symbiosis National Aptitude Test",
    authority: "Symbiosis International University (SIU)",
    category: "management",
    categoryLabel: "Management",
    status: "Upcoming",
    color: "from-blue-900 to-sky-950",
    accentBadge: "bg-blue-500/20 text-blue-200 border-blue-400/30",
    cutoffTitle: "Symbiosis B-Schools Cutoffs",
    cutoffs: [
      { category: "SIBM Pune", value: "98.5 Percentile" },
      { category: "SCMHRD Pune", value: "97.0 Percentile" },
      { category: "SIIB Pune", value: "93.0 Percentile" },
    ],
    topColleges: ["SIBM Pune", "SCMHRD Pune", "SIIB Pune", "SIBM Bangalore"],
    officialWebsite: "https://snaptest.org",
  },
  {
    id: "nift",
    name: "NIFT 2026",
    fullName: "National Institute of Fashion Technology Entrance",
    authority: "National Institute of Fashion Technology",
    category: "design_other",
    categoryLabel: "Design & Fashion",
    status: "Upcoming",
    color: "from-pink-900 to-rose-950",
    accentBadge: "bg-pink-500/20 text-pink-200 border-pink-400/30",
    cutoffTitle: "Top NIFT Campuses",
    cutoffs: [
      { category: "NIFT New Delhi (B.Des)", value: "Rank 1 - 80" },
      { category: "NIFT Mumbai (B.Des)", value: "Rank 81 - 180" },
      { category: "NIFT Chennai (B.Des)", value: "Rank 181 - 350" },
    ],
    topColleges: ["NIFT Delhi", "NIFT Mumbai", "NIFT Chennai", "NIFT NIFT Bengaluru"],
    officialWebsite: "https://nift.ac.in",
  },
  {
    id: "nid-dat",
    name: "NID DAT 2026",
    fullName: "National Institute of Design Design Aptitude Test",
    authority: "National Institute of Design (NID)",
    category: "design_other",
    categoryLabel: "Design & Innovation",
    status: "Upcoming",
    color: "from-amber-950 to-orange-950",
    accentBadge: "bg-amber-500/20 text-amber-200 border-amber-400/30",
    cutoffTitle: "NID Cutoff Percentiles",
    cutoffs: [
      { category: "NID Ahmedabad (B.Des)", value: "95+ Percentile" },
      { category: "NID Bengaluru", value: "92+ Percentile" },
      { category: "NID Gandhinagar", value: "90+ Percentile" },
    ],
    topColleges: ["NID Ahmedabad", "NID Bengaluru", "NID Gandhinagar", "NID Kurukshetra"],
    officialWebsite: "https://admissions.nid.edu",
  },
];

export default function ExamsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    { id: "all", label: "All Entrance Exams" },
    { id: "engineering", label: "Engineering (JEE / TNEA / GATE)" },
    { id: "medical", label: "Medical & Pharmacy (NEET / GPAT)" },
    { id: "management", label: "Management (CAT / CMAT / XAT / SNAP)" },
    { id: "law", label: "Law (CLAT)" },
    { id: "design_other", label: "CUET, Design & Teaching" },
  ];

  const filteredExams = EXAMS_DATA.filter((exam) => {
    const matchesCategory = selectedCategory === "all" || exam.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.topColleges.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-screen bg-stone-50 font-sans pb-20">
        {/* Header Hero Section */}
        <div className="bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5 text-orange-500" />
                  <span>Exam Corner & Admission Cutoffs 2026</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-navy">
                  Entrance Exams, Dates & Cutoffs
                </h1>
                <p className="text-stone-500 text-sm leading-relaxed">
                  Real-time cutoff trends, conducting authorities, official portals, and top accepting colleges across India.
                </p>
              </div>

              {/* Search Bar */}
              <div className="w-full md:w-80 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search exam (JEE, NEET, CAT, TNEA)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-900 focus:bg-white transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="mt-8 flex flex-wrap gap-2 pt-2 border-t border-stone-100">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-indigo-900 text-white shadow-sm scale-[1.02]"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200/80 border border-stone-200/60"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Important Notice Disclaimer */}
          <div className="flex items-start gap-3 px-5 py-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-900 shadow-2xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div className="space-y-1">
              <span className="font-bold">Official Verification Notice:</span>
              <p className="leading-relaxed text-amber-800">
                Cutoff scores, percentiles, and ranks are compiled based on previous academic years and official release trends. Please cross-reference with official testing agency portals before submitting admission forms.
              </p>
            </div>
          </div>

          {/* Exam Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam, i) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                {/* Header Banner */}
                <div className={`bg-gradient-to-r ${exam.color} p-5 text-white relative overflow-hidden`}>
                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${exam.accentBadge}`}>
                        {exam.categoryLabel}
                      </span>
                      <h2 className="text-xl font-extrabold mt-1.5 leading-snug">{exam.name}</h2>
                      <div className="text-white/80 text-xs font-medium mt-0.5 line-clamp-1">
                        {exam.fullName}
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/15 text-white backdrop-blur-xs border border-white/20">
                      {exam.status}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/15 text-[11px] text-white/90 flex items-center gap-1.5 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="truncate">{exam.authority}</span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  {/* Expected Dates Section if available */}
                  {exam.importantDates && exam.importantDates.length > 0 && (
                    <div className="bg-stone-50/80 border border-stone-200/60 rounded-xl p-3 space-y-1.5">
                      <div className="text-[10px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1">
                        <CalendarDays className="w-3 h-3 text-stone-500" />
                        <span>Expected Important Dates</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold text-stone-700">
                        {exam.importantDates.map((d) => (
                          <div key={d.label} className="bg-white px-2 py-1 rounded border border-stone-150">
                            <span className="text-[10px] text-stone-400 block font-normal">{d.label}</span>
                            <span className="text-brand-navy font-bold text-[11px]">{d.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cutoffs Table */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-black uppercase tracking-wider text-stone-500 flex items-center justify-between">
                      <span>{exam.cutoffTitle}</span>
                    </div>
                    <div className="bg-stone-50/50 border border-stone-200/50 rounded-xl divide-y divide-stone-100 overflow-hidden">
                      {exam.cutoffs.map((c) => (
                        <div key={c.category} className="px-3.5 py-2 flex items-center justify-between text-xs">
                          <span className="font-semibold text-stone-700 truncate max-w-[170px]" title={c.category}>
                            {c.category}
                          </span>
                          <span className="font-extrabold text-indigo-950 bg-white px-2 py-0.5 rounded border border-stone-200 shadow-2xs">
                            {c.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Purpose / Popular Branches if any */}
                  {exam.purposeOrBranch && (
                    <div className="text-xs space-y-1 bg-indigo-50/50 border border-indigo-100/70 p-2.5 rounded-xl">
                      <span className="text-[10px] font-bold uppercase text-indigo-900 tracking-wider block">Scope / Specializations</span>
                      <p className="text-stone-700 font-semibold leading-tight">{exam.purposeOrBranch}</p>
                    </div>
                  )}

                  {/* Top Colleges Tags */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-stone-400" />
                      <span>Top Accepting Institutes</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {exam.topColleges.map((col) => (
                        <span
                          key={col}
                          className="text-[10.5px] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200/60"
                        >
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Official Website Button Link */}
                  <div className="pt-2 border-t border-stone-100">
                    <a
                      href={exam.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-between w-full px-3.5 py-2 rounded-xl bg-stone-50 hover:bg-orange-50 text-stone-700 hover:text-orange-600 border border-stone-200 hover:border-orange-200 text-xs font-bold transition-all group cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-orange-500 shrink-0" />
                        <span className="truncate">Official Portal</span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* PROFESSIONAL BOTTOM CTA: GET YOUR ADMISSION PREDICTION */}
          <div className="mt-16 bg-gradient-to-br from-indigo-950 via-indigo-900 to-stone-900 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border border-indigo-800/40">
            {/* Background Glow Overlay */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-500/20 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl mx-auto text-center space-y-6 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30 text-xs font-extrabold uppercase tracking-widest backdrop-blur-md shadow-xs">
                <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
                <span>AI Admission Predictor</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
                Get Your <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-white bg-clip-text text-transparent">Admission Prediction</span>
              </h2>

              <p className="text-stone-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-sans">
                Enter your entrance exam score and preferred course to receive AI-powered college predictions, expected cutoff analysis, admission probability, and personalized counselling recommendations.
              </p>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/counselor"
                  id="predict-my-college-cta"
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-sm shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] flex items-center gap-2.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Predict My College</span>
                </Link>

                <Link
                  href="/colleges"
                  className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-stone-200 border border-white/20 font-bold text-sm transition-all flex items-center gap-2 cursor-pointer backdrop-blur-xs"
                >
                  <Building2 className="w-4 h-4 text-amber-300" />
                  <span>Explore 25,000+ Colleges</span>
                </Link>
              </div>

              <div className="pt-4 flex items-center justify-center gap-6 text-xs text-stone-400 font-medium border-t border-white/10 max-w-lg mx-auto">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Instant Analysis
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Free
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Based on 2026 Cutoffs
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
