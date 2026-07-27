"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { HeroSlider } from "./HeroSlider";
import { SearchBar } from "./SearchBar";
import { QuickCategories } from "./QuickCategories";

export function Hero() {
  return (
    <div className="relative w-full bg-white pb-6">
      {/* 1. Main Background Slider */}
      <HeroSlider>
        {/* Centered Overlay Content inside the Slider container */}
        <div className="text-center space-y-6 max-w-4xl mx-auto w-full">
          {/* Trust Badge / Sub-heading */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-stone-200 backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-pulse" />
            <span>AI-Guided Admission Portal</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-serif text-white font-bold leading-[1.15] tracking-tight drop-shadow-md"
          >
            Find the Right College for Your Future
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-stone-200 font-sans text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-normal"
          >
            Search, compare and discover the best colleges, courses, scholarships and placements across India with AI-powered guidance. Join over{" "}
            <span className="text-[#C9A227] font-bold border-b border-[#C9A227]/30 pb-0.5">
              25,000+
            </span>{" "}
            students who found their perfect match.
          </motion.p>

          {/* Search Box Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="pt-4"
          >
            <SearchBar />
          </motion.div>

          {/* Quick Categories pills */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="pt-2"
          >
            <QuickCategories />
          </motion.div>
        </div>
      </HeroSlider>
    </div>
  );
}
