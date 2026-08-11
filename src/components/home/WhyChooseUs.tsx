"use client";

import * as React from "react";
import { Award, Building2, ShieldCheck, GraduationCap, Sparkles } from "lucide-react";
import { motion, useAnimationControls } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const whyFeatures = [
  {
    category: "Academic",
    title: "Colleges",
    icon: Building2,
    bgColor: "bg-[#4D150B]", // Dark Crimson/Brown matching design palette
    stat: "500+ INSTITUTIONS",
    description: "Verified database of top NIRF, NAAC & TNEA accredited campuses",
  },
  {
    category: "AI Guidance",
    title: "Predictor",
    icon: Sparkles,
    bgColor: "bg-[#0B4344]", // Deep Teal / Dark Cyan matching design palette
    stat: "CUTOFF ANALYTICS",
    description: "Instant admission chance estimates tailored to your entrance scores",
  },
  {
    category: "Career",
    title: "Placements",
    icon: ShieldCheck,
    bgColor: "bg-[#0A0A0A]", // Solid Pitch Black matching design palette
    stat: "REAL CTC & ROI",
    description: "Transparent salary statistics, median packages, and top recruiters",
  },
  {
    category: "Student",
    title: "Scholarships",
    icon: GraduationCap,
    bgColor: "bg-[#EBA314]", // Golden Amber matching design palette
    stat: "26+ REAL SCHEMES",
    description: "Direct matching with government & corporate financial aid programs",
  },
];

function FeatureCard({ item }: { item: (typeof whyFeatures)[0] }) {
  const controls = useAnimationControls();
  const Icon = item.icon;
  const isAnimating = React.useRef(false);

  const triggerTapShake = async () => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    await controls.start({
      x: [0, -6, 6, -4, 4, -2, 2, 0],
      rotate: [0, -1.5, 1.5, -1, 1, 0],
      scale: [0.97, 1],
      transition: { duration: 0.4, ease: "easeInOut" },
    });
    isAnimating.current = false;
  };

  return (
    <motion.div
      key={item.title}
      animate={controls}
      whileHover={{
        y: -4,
        scale: 1.02,
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.97 }}
      onClick={triggerTapShake}
      onTap={triggerTapShake}
      className={`${item.bgColor} rounded-[28px] p-6 text-white flex flex-col justify-between min-h-[340px] shadow-lg transition-shadow duration-300 hover:shadow-2xl relative overflow-hidden cursor-pointer select-none`}
    >
      {/* Top Header & Icon */}
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <span className="text-sm font-bold text-white/90 block font-sans">
            {item.category}
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {item.title}
          </h3>
        </div>

        {/* Top-Right Outline Icon */}
        <motion.div
          whileHover={{ rotate: 12, scale: 1.1 }}
          className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20"
        >
          <Icon className="w-7 h-7 text-white" />
        </motion.div>
      </div>

      {/* Bottom Nested White Card */}
      <div className="bg-white text-stone-900 rounded-[22px] p-5 space-y-2 shadow-md mt-8">
        <div className="text-xs font-black tracking-wider uppercase text-stone-950">
          {item.stat}
        </div>
        <p className="text-xs text-stone-600 leading-relaxed font-medium">
          {item.description}
        </p>
      </div>
    </motion.div>
  );
}

export function WhyChooseUs() {
  const { ref, hasRevealed } = useScrollReveal<HTMLDivElement>();

  return (
    <section
      ref={ref}
      className={`py-20 px-6 bg-white border-b border-stone-200/40 font-sans scroll-reveal ${
        hasRevealed ? "revealed" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Centered Heading */}
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
            Why C2Talents?
          </h2>
        </div>

        {/* 4 Feature Cards with tap shake animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyFeatures.map((item) => (
            <FeatureCard key={item.title} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}


