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
      className={`py-16 px-6 bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 text-white relative overflow-hidden scroll-reveal ${
        hasRevealed ? "revealed" : ""
      }`}
    >
      {/* Background Student Photo with Duotone Blend treatment */}
      <div className="absolute inset-0 z-0 pointer-events-none hidden md:block select-none">
        {/* Photo overlay layer positioned right */}
        <img
          src="/images/students.png"
          alt=""
          className="absolute right-0 top-0 h-full w-[55%] object-cover object-right mix-blend-multiply opacity-95 pointer-events-none"
        />
        {/* Fade gradient overlay to blend left side text nicely with right photo */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 via-indigo-950/80 to-transparent z-10" />
      </div>

      {/* Decorative fallback background patterns (reduced opacity to avoid interfering with image) */}
      <div className="absolute inset-0 opacity-5 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-300 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl" />
      </div>

      {/* Content wrapper with left-aligned elements stacked */}
      <div className="relative z-20 max-w-5xl mx-auto flex flex-col justify-between gap-8 md:text-left text-center">
        <div className="space-y-6 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[11px] font-bold tracking-wide uppercase text-amber-300">
            <Sparkles className="w-3.5 h-3.5 fill-amber-350" />
            <span>AI Admission Matcher</span>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold leading-tight">
              Know Your Admission Chances — Start Now
            </h2>
            <p className="text-xs md:text-sm text-indigo-200/90 leading-relaxed font-sans max-w-lg">
              Stop guessing based on outdated cutoff tables. Our AI analyzer compiles hundreds of placement outcomes and historical cutoff curves to estimate your admission likelihood in under 2 minutes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 font-sans pt-2">
            <Link
              href="/counselor"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all group"
            >
              <span>Predict My Colleges</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/tracker"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all"
            >
              Track Applications
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
