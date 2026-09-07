"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, Calendar, Landmark, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const exams = [
  {
    name: "JEE Main 2026",
    mode: "Online / Computer Based",
    collegesCount: 120,
    date: "July 22, 2026",
    level: "National",
    status: "Result Declared",
    statusColor: "bg-emerald-50 text-emerald-700 border-emerald-250",
    hasPulse: false,
  },
  {
    name: "CAT 2026",
    mode: "Online / CBT",
    collegesCount: 98,
    date: "Nov 29, 2026",
    level: "National",
    status: "Registration Open",
    statusColor: "bg-indigo-50 text-indigo-700 border-indigo-250",
    hasPulse: true,
    pulseColor: "bg-indigo-500",
  },
  {
    name: "NEET UG 2026",
    mode: "Offline / Pen & Paper",
    collegesCount: 48,
    date: "Aug 05, 2026",
    level: "National",
    status: "Counselling Open",
    statusColor: "bg-amber-50 text-amber-700 border-amber-250",
    hasPulse: true,
    pulseColor: "bg-amber-500",
  },
  {
    name: "TNEA Counselling",
    mode: "Online Choice Filling",
    collegesCount: 440,
    date: "July 15, 2026",
    level: "State (Tamil Nadu)",
    status: "Ongoing Round 1",
    statusColor: "bg-rose-50 text-rose-700 border-rose-250",
    hasPulse: true,
    pulseColor: "bg-rose-500",
  },
];

export function TopExams() {
  const { ref, hasRevealed } = useScrollReveal<HTMLDivElement>();

  return (
    <section
      ref={ref}
      className={`py-20 px-6 bg-white border-b border-stone-200/40 font-sans relative overflow-hidden scroll-reveal ${
        hasRevealed ? "revealed" : ""
      }`}
    >
      {/* Subtle Background Motion Lighting (Motion.dev ambient glow) */}
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.35, 0.55, 0.35],
        }}
        transition={{
          repeat: Infinity,
          duration: 8,
          ease: "easeInOut",
        }}
        className="absolute -top-32 -right-32 w-[480px] h-[480px] bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.25, 0.45, 0.25],
        }}
        transition={{
          repeat: Infinity,
          duration: 10,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute -bottom-32 -left-32 w-[480px] h-[480px] bg-gradient-to-tr from-amber-500/5 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none"
      />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        {/* Header with Staggered Entrance Animation */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div className="space-y-2">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-3xl font-serif text-brand-navy font-semibold flex items-center gap-2.5 group cursor-default"
            >
              <motion.div
                whileHover={{ rotate: 8, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-900 shrink-0"
              >
                <BookOpen className="w-5 h-5 text-indigo-900" />
              </motion.div>
              <span>National & State Entrance Exams</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-sm text-stone-500 max-w-md"
            >
              Stay ahead with accurate registration windows, exam modes, and participating college metrics.
            </motion.p>
          </div>

          {/* ALL EXAM GUIDES → Link Micro-interaction */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Link
              href="/exams"
              className="group inline-flex items-center gap-1.5 text-xs font-bold text-indigo-900 hover:text-indigo-950 uppercase tracking-wider transition-colors py-1"
            >
              <span>All Exam Guides</span>
              <motion.span
                className="inline-block"
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <ArrowRight className="w-3.5 h-3.5 text-indigo-900 group-hover:translate-x-1 transition-transform" />
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Exam Cards Grid with Staggered Entrance & Hover Physics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {exams.map((exam, idx) => (
            <motion.div
              key={exam.name}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{
                duration: 0.5,
                delay: idx * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{
                y: -6,
                scale: 1.01,
                transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
              }}
              className="group bg-[#FAF9F5]/60 hover:bg-white border border-stone-200/60 hover:border-indigo-900/30 rounded-2xl p-5 flex flex-col justify-between space-y-5 shadow-2xs hover:shadow-xl hover:shadow-indigo-950/5 transition-all duration-300 relative overflow-hidden"
            >
              {/* Subtle Card Accent Highlight Bar on Hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="space-y-3.5 relative z-10">
                {/* Level & Status Pill Row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    {exam.level}
                  </span>

                  {/* Status Badge with Micro-interaction */}
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border inline-flex items-center gap-1.5 ${exam.statusColor} shadow-2xs`}
                  >
                    {exam.hasPulse && (
                      <span className={`w-1.5 h-1.5 rounded-full ${exam.pulseColor} animate-pulse`} />
                    )}
                    <span>{exam.status}</span>
                  </motion.span>
                </div>

                {/* Exam Title */}
                <h3 className="font-serif font-bold text-brand-navy text-base leading-tight group-hover:text-indigo-950 transition-colors">
                  {exam.name}
                </h3>
              </div>

              {/* Specs */}
              <div className="space-y-2 text-xs font-semibold text-stone-500 pt-3 border-t border-stone-200/50 relative z-10">
                <div className="flex items-center gap-2 text-stone-600">
                  <Calendar className="w-3.5 h-3.5 text-indigo-700/70 group-hover:text-indigo-900 transition-colors shrink-0" />
                  <span>Date: {exam.date}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-600">
                  <Landmark className="w-3.5 h-3.5 text-indigo-700/70 group-hover:text-indigo-900 transition-colors shrink-0" />
                  <span>{exam.collegesCount}+ Participating Colleges</span>
                </div>
                <div className="text-[10px] text-stone-450 font-semibold italic mt-1.5 truncate">
                  Mode: {exam.mode}
                </div>
              </div>

              {/* Action Button Micro-interaction */}
              <motion.div whileTap={{ scale: 0.97 }} className="pt-1 relative z-10">
                <Link
                  href="/exams"
                  className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 border border-indigo-900/15 group-hover:border-indigo-900 text-indigo-900 group-hover:bg-indigo-900 group-hover:text-white text-xs font-bold rounded-xl transition-all duration-200 shadow-2xs group-hover:shadow-md"
                >
                  <span>View Exam Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-900 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
