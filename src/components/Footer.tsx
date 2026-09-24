"use client";

import * as React from "react";
import Link from "next/link";
import { Phone, MapPin, Sparkles } from "lucide-react";

import { useScrollReveal } from "@/hooks/useScrollReveal";

export function Footer() {
  const { ref, hasRevealed } = useScrollReveal<HTMLElement>();

  return (
    <footer ref={ref} className={`relative bg-indigo-950 text-stone-300 border-t border-indigo-900/30 font-sans overflow-hidden scroll-reveal ${hasRevealed ? "revealed" : ""}`}>
      {/* Subtle Dot Grid Background Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(234,88,12,0.08)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
          {/* Brand Summary Column (Spans 2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <Link href="/" className="inline-block group">
                <img
                  src="/logo.png"
                  alt="C2Talents Logo"
                  className="h-12 w-auto brightness-0 invert opacity-90 transition-opacity group-hover:opacity-100"
                />
              </Link>
              <h3 className="text-sm font-semibold text-white leading-snug">
                Empowering every Indian student to find their right-fit college.
              </h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Empowering Indian students and parents with unbiased, data-backed higher education counseling, cutoff predictors, and placement matching.
              </p>
            </div>

            {/* Address & Phone */}
            <div className="space-y-3 text-xs text-stone-400 pt-4 border-t border-indigo-900/30">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <span>OMR IT Corridor, Chennai, TN - 600096</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-orange-500 shrink-0" />
                <a href="tel:+914422357007" className="hover:text-orange-400 transition-colors">+91 44 2235 7007</a>
              </div>
            </div>
          </div>

          {/* Top Colleges */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-1.5">
                <span>Top Colleges</span>
              </h4>
              <div className="w-7 h-[2.5px] bg-orange-500 rounded-full mt-1.5" />
            </div>
            <ul className="flex flex-col text-xs">
              <li className="border-b border-indigo-900/30 py-2.5">
                <Link href="/colleges?stream=engineering" className="hover:text-orange-400 transition-colors flex items-center gap-2 group w-full">
                  <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
                  <span>Engineering Colleges</span>
                </Link>
              </li>
              <li className="border-b border-indigo-900/30 py-2.5">
                <Link href="/colleges?stream=management" className="hover:text-orange-400 transition-colors flex items-center gap-2 group w-full">
                  <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
                  <span>MBA / Management</span>
                </Link>
              </li>
              <li className="border-b border-indigo-900/30 py-2.5">
                <Link href="/colleges?stream=medical" className="hover:text-orange-400 transition-colors flex items-center gap-2 group w-full">
                  <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
                  <span>Medical Institutions</span>
                </Link>
              </li>
              <li className="py-2.5">
                <Link href="/colleges?stream=law" className="hover:text-orange-400 transition-colors flex items-center gap-2 group w-full">
                  <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
                  <span>Law Colleges</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Top Exams */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-white tracking-wider uppercase">
                Top Exams
              </h4>
              <div className="w-7 h-[2.5px] bg-orange-500 rounded-full mt-1.5" />
            </div>
            <ul className="flex flex-col text-xs">
              <li className="border-b border-indigo-900/30 py-2.5">
                <Link href="/exams" className="hover:text-orange-400 transition-colors flex items-center gap-2 group w-full">
                  <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
                  <span>JEE Mains 2026</span>
                </Link>
              </li>
              <li className="border-b border-indigo-900/30 py-2.5">
                <Link href="/exams" className="hover:text-orange-400 transition-colors flex items-center gap-2 group w-full">
                  <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
                  <span>NEET UG Guide</span>
                </Link>
              </li>
              <li className="border-b border-indigo-900/30 py-2.5">
                <Link href="/exams" className="hover:text-orange-400 transition-colors flex items-center gap-2 group w-full">
                  <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
                  <span>CAT Predictor</span>
                </Link>
              </li>
              <li className="py-2.5">
                <Link href="/exams" className="hover:text-orange-400 transition-colors flex items-center gap-2 group w-full">
                  <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
                  <span>TNEA Choice Filling</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Study Abroad */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-white tracking-wider uppercase">
                Study Abroad
              </h4>
              <div className="w-7 h-[2.5px] bg-orange-500 rounded-full mt-1.5" />
            </div>
            <ul className="flex flex-col text-xs">
              <li className="border-b border-indigo-900/30 py-2.5">
                <Link href="/colleges?location=abroad" className="hover:text-orange-400 transition-colors flex items-center gap-2 group w-full">
                  <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
                  <span>Study in USA</span>
                </Link>
              </li>
              <li className="border-b border-indigo-900/30 py-2.5">
                <Link href="/colleges?location=abroad" className="hover:text-orange-400 transition-colors flex items-center gap-2 group w-full">
                  <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
                  <span>Study in Canada</span>
                </Link>
              </li>
              <li className="border-b border-indigo-900/30 py-2.5">
                <Link href="/colleges?location=abroad" className="hover:text-orange-400 transition-colors flex items-center gap-2 group w-full">
                  <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
                  <span>Study in United Kingdom</span>
                </Link>
              </li>
              <li className="py-2.5">
                <Link href="/colleges?location=abroad" className="hover:text-orange-400 transition-colors flex items-center gap-2 group w-full">
                  <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
                  <span>Visa Guidance</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-white tracking-wider uppercase">
                Platform
              </h4>
              <div className="w-7 h-[2.5px] bg-orange-500 rounded-full mt-1.5" />
            </div>
            <ul className="flex flex-col text-xs">
              <li className="border-b border-indigo-900/30 py-2.5">
                <Link href="/counselor" className="hover:text-orange-400 transition-colors flex items-center justify-between group w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
                    <span>AI Chat Counselor</span>
                  </div>
                  <span className="bg-orange-500 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-2xs group-hover:bg-orange-600 transition-colors">
                    <Sparkles className="w-2.5 h-2.5" /> AI
                  </span>
                </Link>
              </li>

              <li className="border-b border-indigo-900/30 py-2.5">
                <Link href="/news" className="hover:text-orange-400 transition-colors flex items-center gap-2 group w-full">
                  <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
                  <span>News & Exam Alerts</span>
                </Link>
              </li>
              <li className="py-2.5">
                <Link href="/" className="hover:text-orange-400 transition-colors flex items-center gap-2 group w-full">
                  <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform">→</span>
                  <span>Ranking Methodology</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom copyright area */}
      <div className="relative z-10 bg-indigo-950 border-t border-indigo-900/20 py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center gap-3 text-center">
          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-semibold text-stone-400">
            <Link href="/" className="hover:text-orange-400 transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-orange-400 transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-orange-400 transition-colors">Disclaimer</Link>
          </div>
          <div>
            <span>© 2026 C2Talents. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
