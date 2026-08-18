"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function AdmissionBanner() {
  const { ref, hasRevealed } = useScrollReveal<HTMLDivElement>();

  return (
    <section
      ref={ref}
      className={`py-12 px-6 font-sans scroll-reveal ${
        hasRevealed ? "revealed" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto bg-[#130726] rounded-[32px] p-8 sm:p-12 lg:p-14 relative overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Text & Action Buttons */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 border border-white/20 rounded-full text-[11px] font-extrabold tracking-wider uppercase text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI ADMISSION MATCHER</span>
            </div>

            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight">
                Know Your Admission Chances — Start Now
              </h2>
              <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed max-w-xl font-normal">
                Stop guessing based on outdated cutoff tables. Our AI analyzer compiles hundreds of placement outcomes and historical cutoff curves to estimate your admission likelihood in under 2 minutes.
              </p>
            </div>

            {/* Action Buttons matching screenshot */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/counselor"
                className="px-7 py-3.5 rounded-full bg-[#ff6c0f] hover:bg-[#e05b05] text-white text-xs font-black shadow-lg hover:shadow-orange-500/20 transition-all inline-flex items-center gap-2.5 cursor-pointer"
              >
                <span>Predict My Colleges</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/counselor"
                className="px-7 py-3.5 rounded-full border border-white/25 hover:bg-white/10 text-white text-xs font-extrabold transition-all cursor-pointer"
              >
                Track Applications
              </Link>
            </div>
          </div>

          {/* Right Image Container Card matching screenshot */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="bg-white rounded-[24px] overflow-hidden p-0 shadow-2xl aspect-[4/3] flex items-center justify-center">
              <img
                src="/images/students.png"
                alt="College Students"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


