"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WriteReviewModal } from "@/components/WriteReviewModal";
import {
  Wand2, Search, CheckCircle2, Award, ShieldCheck, Flame, Play,
  ChevronDown, ChevronUp, Star, Users, Trophy, Sparkles, Building2,
  Check, ArrowRight, HelpCircle, Gift, Mail, Phone, BookOpen, Camera, X
} from "lucide-react";

interface CollegeSearchResult {
  id: string;
  name: string;
  location?: string;
  category?: string;
}

export default function WriteReviewPage() {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [videoModalOpen, setVideoModalOpen] = React.useState(false);
  const [selectedCollege, setSelectedCollege] = React.useState<{ id: string; name: string } | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<CollegeSearchResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);

  // FAQ open states
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = React.useState("");
  const [newsletterMobile, setNewsletterMobile] = React.useState("");
  const [newsletterCourse, setNewsletterCourse] = React.useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = React.useState(false);

  // Auto-search colleges
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/colleges?search=${encodeURIComponent(searchQuery)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.colleges || [];
          setSearchResults(list);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Failed to search colleges:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectCollege = (college: CollegeSearchResult) => {
    setSelectedCollege({ id: college.id, name: college.name });
    setShowDropdown(false);
    setSearchQuery(college.name);
    setModalOpen(true);
  };

  const handleStartReview = () => {
    setModalOpen(true);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail || newsletterMobile) {
      setNewsletterSubscribed(true);
      setTimeout(() => setNewsletterSubscribed(false), 5000);
      setNewsletterEmail("");
      setNewsletterMobile("");
      setNewsletterCourse("");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900 font-sans flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#1b082c] via-[#2a0e45] to-[#160824] text-white pt-12 pb-20 overflow-hidden">
        {/* Campus Background Photo Overlay */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          <img
            src="/images/hero-campus-bg.jpg"
            alt="University Campus Background"
            className="w-full h-full object-cover opacity-25 mix-blend-overlay"
          />
        </motion.div>
        
        {/* Gradient Vignette Dark Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1b082c]/90 via-[#2a0e45]/85 to-[#160824] pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#160824_100%)] pointer-events-none z-0" />

        {/* Subtle decorative animated background lights */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl pointer-events-none z-0"
        />
        <motion.div
          animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none z-0"
        />
        
        {/* Background outline graphic */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none z-0" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold mb-6 shadow-xl"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Share Your College Experience & Earn Cash Rewards</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight font-serif"
          >
            Your College Journey Can <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 drop-shadow-md">
              Guide The Next One
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-stone-300 text-sm md:text-base max-w-2xl mx-auto mb-8 font-normal"
          >
            Answering a few simple questions will help thousands of students choose the right college.
          </motion.p>

          {/* Search College Input Box */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl mx-auto relative mb-6"
          >
            <div className="flex items-center bg-white rounded-2xl p-2 shadow-[0_10px_35px_rgba(0,0,0,0.3)] border border-stone-200 text-slate-800 transition-all focus-within:ring-4 focus-within:ring-amber-400/40">
              <Search className="w-5 h-5 text-stone-400 ml-3 shrink-0" />
              <input
                type="text"
                placeholder="Search College / School / Course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowDropdown(true)}
                className="w-full px-3 py-2 text-sm bg-transparent border-none outline-none font-medium text-slate-800 placeholder-stone-400"
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (searchResults.length > 0) {
                    handleSelectCollege(searchResults[0]);
                  } else {
                    handleStartReview();
                  }
                }}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0 cursor-pointer flex items-center gap-2"
              >
                <span>Write Review</span>
                <Wand2 className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Dropdown search results */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-50 text-left">
                {isSearching ? (
                  <div className="p-4 text-xs text-stone-500 text-center">Searching colleges...</div>
                ) : searchResults.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto divide-y divide-stone-100">
                    {searchResults.map((college) => (
                      <button
                        key={college.id}
                        onClick={() => handleSelectCollege(college)}
                        className="w-full px-4 py-3 hover:bg-orange-50 text-left transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{college.name}</div>
                            {college.location && (
                              <div className="text-[11px] text-stone-500">{college.location}</div>
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full group-hover:bg-orange-600 group-hover:text-white transition-colors">
                          Select
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-xs text-stone-500 text-center">
                    No colleges found. Click &quot;Write Review&quot; to choose manually.
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Quick Trending Searches */}
          <div className="flex flex-wrap justify-center items-center gap-2 mb-10 text-[11px] font-semibold text-stone-300">
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Popular:
            </span>
            {["IIT Madras", "Anna University", "PSG Tech", "VIT Vellore", "SRM Chennai"].map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setSearchQuery(tag);
                  setShowDropdown(true);
                }}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-amber-500/20 hover:text-amber-300 border border-white/10 hover:border-amber-400/50 transition-all cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Top Reviewer Avatars / Highlights Pill Badges */}
          <div className="flex flex-wrap justify-center items-center gap-4 text-xs">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 text-stone-200 shadow-md">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold text-white">Honest Reviews</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 text-stone-200 shadow-md">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-white">Trusted Community</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 text-stone-200 shadow-md">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="font-semibold text-white">Done in Just 2 Minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars: Good Or Bad, Every Story Matters */}
      <section className="py-16 bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-serif mb-2">
              Good Or Bad, Every Story Matters.
            </h2>
            <p className="text-stone-500 text-xs md:text-sm font-medium">
              Rewards await when you share your genuine campus experience.
            </p>
          </div>

          {/* 3 Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
            {/* Card 1 */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-6 text-center hover:shadow-xl hover:border-amber-400/40 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-600 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                <CrownIcon className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">Honest Reviews</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Real student reviews stay on top. Help future applicants know the ground reality of campus life, faculty, hostel, and placements.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-6 text-center hover:shadow-xl hover:border-indigo-400/40 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">Trusted Community</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Verified reviews from real students across 500+ Indian universities. Empowering thousands of students every single day.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="bg-stone-50/80 border border-stone-200/80 rounded-2xl p-6 text-center hover:shadow-xl hover:border-orange-400/40 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-600 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                <Flame className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">Done In Just 2 Minutes</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Writing your review is fast & easy. Rate your college, share highlights & upload campus photos in less than 2 minutes.
              </p>
            </motion.div>
          </div>

          {/* Hero Banner CTA Card */}
          <div className="relative bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-8 md:p-12 text-white overflow-hidden shadow-xl">
            <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
              <div className="md:col-span-7 max-w-xl">
                <span className="inline-block bg-white/20 text-white font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full mb-3 backdrop-blur-md">
                  Earn Up to ₹500 Rewards
                </span>
                <h3 className="text-2xl md:text-4xl font-extrabold font-serif mb-3 leading-tight">
                  Share Your College Journey, In Your Words
                </h3>
                <p className="text-white/90 text-xs md:text-sm mb-6 leading-relaxed">
                  Receive gift cards, cash vouchers, and placement counseling perks upon successful moderation of your review.
                </p>
                <button
                  onClick={handleStartReview}
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center gap-2.5"
                >
                  <span>Write a Review Today</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>

              {/* Right Side Illustration Image */}
              <div className="md:col-span-5 relative group">
                <div className="relative rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl bg-white/10 backdrop-blur-md">
                  <img
                    src="/images/review-rewards-banner.jpg"
                    alt="College Student Reviewer & Reward Vouchers"
                    className="w-full h-64 md:h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold text-amber-300 border border-amber-400/30">
                    Verified Rewards 🎁
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Section: Top Influencers of the Month */}
      <section className="py-16 bg-stone-100/70 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-serif mb-1">
                Top Influencer of the Month
              </h2>
              <p className="text-stone-500 text-xs md:text-sm font-medium">
                Inspiring Students to Share Their College Reviews
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 text-xs font-semibold shadow-2xs self-start md:self-auto">
              <span>From 1 to 31 Aug, 2026</span>
            </div>
          </div>

          {/* Rankings Table */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-500 font-bold uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="py-3.5 px-4 w-16">Rank</th>
                    <th className="py-3.5 px-4">Student Name & College</th>
                    <th className="py-3.5 px-4 text-center">Reviews Written</th>
                    <th className="py-3.5 px-4 text-right">Points Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {/* Rank 1 */}
                  <tr className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-extrabold flex items-center justify-center border border-amber-300 shadow-2xs">
                        👑 1
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src="/images/student-avatar-male.jpg"
                          alt="Nitesh Verma"
                          className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shadow-sm"
                        />
                        <div>
                          <div className="font-bold text-slate-900">Nitesh Verma</div>
                          <div className="text-[11px] text-stone-500">Computer Science & Engineering (2024)</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">12 Reviews</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs">
                        500 Points
                      </span>
                    </td>
                  </tr>

                  {/* Rank 2 */}
                  <tr className="hover:bg-stone-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-extrabold flex items-center justify-center border border-slate-300">
                        🥈 2
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src="/images/student-avatar-female.jpg"
                          alt="S Rajanand"
                          className="w-10 h-10 rounded-full object-cover border-2 border-slate-300 shadow-sm"
                        />
                        <div>
                          <div className="font-bold text-slate-900">S Rajanand</div>
                          <div className="text-[11px] text-stone-500">Electronics & Comm, IIT Madras (2025)</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">10 Reviews</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-800 font-extrabold text-xs">
                        250 Points
                      </span>
                    </td>
                  </tr>

                  {/* Rank 3 */}
                  <tr className="hover:bg-amber-50/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="w-8 h-8 rounded-full bg-amber-800/10 text-amber-900 font-extrabold flex items-center justify-center border border-amber-800/20">
                        🥉 3
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src="/images/student-avatar-male.jpg"
                          alt="Dev Verma"
                          className="w-10 h-10 rounded-full object-cover border-2 border-amber-700/40 shadow-sm"
                        />
                        <div>
                          <div className="font-bold text-slate-900">Dev Verma</div>
                          <div className="text-[11px] text-stone-500">Mechanical Engg, BITS Pilani</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">8 Reviews</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-900 font-extrabold text-xs">
                        150 Points
                      </span>
                    </td>
                  </tr>

                  {/* Rank 4 */}
                  <tr className="hover:bg-stone-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-500 text-center">#4</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                          NP
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">Nida Parveen</div>
                          <div className="text-[11px] text-stone-500">Bachelor of Technology (2023)</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">6 Reviews</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-block px-3 py-1 rounded-full bg-stone-100 text-stone-700 font-bold text-xs">
                        100 Points
                      </span>
                    </td>
                  </tr>

                  {/* Rank 5 */}
                  <tr className="hover:bg-stone-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-500 text-center">#5</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                          AM
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">Alphonsa Mary John</div>
                          <div className="text-[11px] text-stone-500">B.Tech CSE (2024)</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">5 Reviews</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-block px-3 py-1 rounded-full bg-stone-100 text-stone-700 font-bold text-xs">
                        100 Points
                      </span>
                    </td>
                  </tr>

                  {/* Rank 6 */}
                  <tr className="hover:bg-stone-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-500 text-center">#6</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-xs">
                          SS
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">Satya Swaroop Senapati</div>
                          <div className="text-[11px] text-stone-500">Civil Engineering (2025)</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">4 Reviews</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-block px-3 py-1 rounded-full bg-stone-100 text-stone-700 font-bold text-xs">
                        50 Points
                      </span>
                    </td>
                  </tr>

                  {/* Rank 7 */}
                  <tr className="hover:bg-stone-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-stone-500 text-center">#7</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">
                          RC
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">Rajneesh Chaudhary</div>
                          <div className="text-[11px] text-stone-500">Safety & Fire Engineering</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">4 Reviews</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-block px-3 py-1 rounded-full bg-stone-100 text-stone-700 font-bold text-xs">
                        50 Points
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 text-center">
              <button
                onClick={handleStartReview}
                className="px-5 py-2 bg-white border border-stone-300 hover:border-orange-500 text-orange-600 hover:bg-orange-50 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                Write a Review & Join Leaderboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Do's & Don'ts Section */}
      <section className="py-16 bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-serif mb-2">
              Do&apos;s & Don&apos;ts - Points to Consider While Writing a Review
            </h2>
            <p className="text-stone-500 text-xs md:text-sm">
              Follow these simple guidelines to make sure your review passes moderation quickly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            {/* Checklist */}
            <div className="space-y-4 text-xs md:text-sm text-slate-700 font-medium">
              <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-bold">Do Be Honest:</strong> Provide genuine feedback about your college experience, campus life, infrastructure, faculty, and placement data.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-bold">Do Detail:</strong> Talk about your course, fee structure, hostel facilities, exam pattern, and campus atmosphere.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-bold">Be Original:</strong> Write your own experience. Don&apos;t copy from other websites. Original content helps prospective students best.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-bold">Be Polite:</strong> Respect your institution and staff. Constructive feedback is far more useful than offensive language.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-bold">Do Review:</strong> Provide a complete overview so future students can make a confident decision.
                </div>
              </div>
            </div>

            {/* Video Tutorial Preview Box */}
            <div
              className="relative rounded-3xl overflow-hidden border border-stone-700/80 shadow-2xl aspect-video flex flex-col items-center justify-center p-6 text-center group cursor-pointer bg-slate-900"
              onClick={() => setVideoModalOpen(true)}
            >
              {/* Background Thumbnail Image */}
              <img
                src="/write-review-video.jpg"
                alt="How to Write a High Impact Review Tutorial Video"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />

              {/* Duration Badge */}
              <div className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white text-[11px] font-extrabold flex items-center gap-1.5 shadow-md">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>1:30 Guide</span>
              </div>
              
              {/* Glowing Play Icon */}
              <div className="relative z-10 w-16 h-16 rounded-full bg-orange-600 group-hover:bg-orange-500 text-white flex items-center justify-center shadow-[0_0_25px_rgba(234,88,12,0.8)] group-hover:scale-110 transition-transform mb-3 border-2 border-white/30">
                <Play className="w-7 h-7 fill-current ml-1" />
              </div>

              <div className="relative z-10">
                <h4 className="text-base md:text-lg font-extrabold text-white mb-1 drop-shadow-md">
                  Watch Video Tutorial: How to Write a High Impact Review
                </h4>
                <p className="text-xs text-amber-300 font-semibold drop-shadow-xs">
                  Click to watch 1-minute step-by-step video guide & get verified rewards
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="py-16 bg-stone-50 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-slate-900 font-serif mb-6">
            Rules & Guidelines
          </h2>

          <div className="bg-white rounded-2xl p-6 md:p-8 border border-stone-200/80 shadow-2xs space-y-3.5 text-xs md:text-sm text-slate-700 font-medium">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>All reviews will be evaluated by our moderation panel for quality, relevance, and authenticity.</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Reward points and cash vouchers are credited automatically upon successful approval of the review.</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Plagiarized, AI-generated spam, or promotional reviews will be automatically rejected.</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Multiple reviews from the same IP/user for different colleges require verification via student ID card or marksheet.</span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>All decision rights regarding review approval and reward points distribution remain with C2Talents.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Section */}
      <section className="py-16 bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-serif mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-stone-500 text-xs md:text-sm">
              Got questions about writing a review or redeeming rewards? We&apos;re here to help.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                    isOpen
                      ? "border-orange-400/80 bg-white shadow-md ring-2 ring-orange-400/20"
                      : "border-stone-200 bg-stone-50/70 hover:bg-white hover:border-stone-300"
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full py-4 px-5 text-left text-xs md:text-sm font-extrabold text-slate-900 flex items-center justify-between gap-4 transition-colors cursor-pointer"
                  >
                    <span className={isOpen ? "text-orange-600 font-bold" : "text-slate-900"}>{faq.question}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0"
                    >
                      <ChevronDown className={`w-4 h-4 ${isOpen ? "text-orange-600" : "text-stone-400"}`} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-3 bg-white">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Subscribe to Newsletter Banner */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-xl md:text-2xl font-extrabold tracking-wider uppercase mb-1 font-serif">
            SUBSCRIBE TO OUR NEWSLETTER
          </h2>
          <p className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-6">
            COLLEGE NOTIFICATIONS &bull; EXAM NOTIFICATIONS &bull; NEWS UPDATES
          </p>

          {newsletterSubscribed ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Thank you for subscribing! You will receive updates shortly.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <input
                type="email"
                placeholder="ENTER YOUR EMAIL"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="px-4 py-3 bg-slate-800 text-white rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-amber-400 placeholder-slate-400"
              />
              <input
                type="tel"
                placeholder="ENTER YOUR MOBILE NO"
                value={newsletterMobile}
                onChange={(e) => setNewsletterMobile(e.target.value)}
                className="px-4 py-3 bg-slate-800 text-white rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-amber-400 placeholder-slate-400"
              />
              <select
                value={newsletterCourse}
                onChange={(e) => setNewsletterCourse(e.target.value)}
                className="px-4 py-3 bg-slate-800 text-slate-300 rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="">CHOOSE YOUR COURSE</option>
                <option value="B.Tech">B.Tech / B.E.</option>
                <option value="MBA">MBA / PGDM</option>
                <option value="MBBS">MBBS / Medical</option>
                <option value="B.Sc">B.Sc / Science</option>
                <option value="Law">Law (BA LLB)</option>
              </select>
              <button
                type="submit"
                className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
              >
                SUBSCRIBE
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />

      {/* Review Modal */}
      <WriteReviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        preselectedCollegeId={selectedCollege?.id}
        preselectedCollegeName={selectedCollege?.name}
      />

      {/* Video Tutorial Interactive Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 font-sans">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-fade-in"
            onClick={() => setVideoModalOpen(false)}
          />
          <div className="relative w-full max-w-3xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 z-10">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-950 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-orange-600/20 text-orange-400 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">How to Write a High Impact Review</h3>
                  <p className="text-[11px] text-slate-400">Step-by-step video guide to maximize points & rewards</p>
                </div>
              </div>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Container */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              <video
                poster="/write-review-video.jpg"
                controls
                autoPlay
                preload="metadata"
                className="w-full h-full object-cover z-10"
              >
                <source src="/videos/write-review-tutorial.mp4" type="video/mp4" />
                <source src="/videos/create_the_video_format_.mp4" type="video/mp4" />
                <track
                  src="/videos/write-review-tutorial.vtt"
                  kind="subtitles"
                  srcLang="en"
                  label="English Subtitles"
                  default
                />
                Your browser does not support HTML5 video playback.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Crown icon helper
function CrownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M2 19h20v2H2v-2zm1.5-3l2.5-9.5 4.5 4 4.5-7 4.5 7 4.5-4 2.5 9.5h-21z" />
    </svg>
  );
}

// FAQs Data
const faqs = [
  {
    question: "Why fill out the College Review on C2Talents?",
    answer: "Your review helps thousands of prospective students make unbiased higher education choices. Additionally, verified reviewers receive reward points, cash vouchers, and exclusive access to placement insights."
  },
  {
    question: "How do I get cash rewards for writing a review?",
    answer: "Once your review is submitted, our moderation team verifies its authenticity. Upon approval, reward points or cash vouchers are automatically credited to your C2Talents account."
  },
  {
    question: "My college or course is not listed in the review form?",
    answer: "You can type the custom college name directly into the search field. If it does not appear in the dropdown, our team will review and add your institution to the database upon submission."
  },
  {
    question: "How long does it take to get the review approved?",
    answer: "Review moderation typically takes 24 to 48 business hours. You will receive an email notification once your review status is updated."
  },
  {
    question: "How to write an authentic review?",
    answer: "Focus on your true personal experience regarding faculty quality, campus infrastructure, hostel accommodation, fee structures, and placement opportunities."
  },
  {
    question: "How to withdraw reward points?",
    answer: "You can redeem your accumulated points for Amazon Gift Cards, UPI transfers, or educational counseling vouchers directly from your user dashboard."
  },
  {
    question: "What happens if my review gets rejected?",
    answer: "If a review is rejected due to insufficient details or policy violation, you will receive feedback detailing the reasons and can resubmit an edited version."
  },
  {
    question: "How to contact the support team regarding review issues?",
    answer: "You can contact our review support desk via email at support@c2talents.com or call our student helpline."
  }
];
