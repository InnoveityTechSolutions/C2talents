"use client";

import * as React from "react";
import Link from "next/link";
import { Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-indigo-950 text-stone-300 border-t border-indigo-900/30 font-sans overflow-hidden">
      {/* Subtle Dot Grid Background Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(124,58,237,0.05)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

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
                <MapPin className="w-4 h-4 text-indigo-450 shrink-0 mt-0.5" />
                <span>OMR IT Corridor, Chennai, TN - 600096</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-indigo-450 shrink-0" />
                <a href="tel:+914422357007" className="hover:text-white transition-colors">+91 44 2235 7007</a>
              </div>
            </div>
          </div>

          {/* Top Colleges */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-white tracking-wider uppercase">
                Top Colleges
              </h4>
              <div className="w-7 h-[2px] bg-indigo-500 mt-1.5" />
            </div>
            <ul className="flex flex-col text-xs">
              <li className="border-b border-indigo-900/30 py-2.5">
                <Link href="/colleges?stream=engineering" className="hover:text-white transition-colors block w-full">
                  Engineering Colleges
                </Link>
              </li>
              <li className="border-b border-indigo-900/30 py-2.5">
                <Link href="/colleges?stream=management" className="hover:text-white transition-colors block w-full">
                  MBA / Management
                </Link>
              </li>
              <li className="border-b border-indigo-900/30 py-2.5">
                <Link href="/colleges?stream=medical" className="hover:text-white transition-colors block w-full">
                  Medical Institutions
                </Link>
              </li>
              <li className="py-2.5">
                <Link href="/colleges?stream=law" className="hover:text-white transition-colors block w-full">
                  Law Colleges
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
              <div className="w-7 h-[2px] bg-indigo-500 mt-1.5" />
            </div>
            <ul className="flex flex-col text-xs">
              <li className="border-b border-indigo-900/30 py-2.5">
                <Link href="/exams" className="hover:text-white transition-colors block w-full">
                  JEE Mains 2026
                </Link>
              </li>
              <li className="border-b border-indigo-900/30 py-2.5">
                <Link href="/exams" className="hover:text-white transition-colors block w-full">
                  NEET UG Guide
                </Link>
              </li>
              <li className="border-b border-indigo-900/30 py-2.5">
                <Link href="/exams" className="hover:text-white transition-colors block w-full">
                  CAT Predictor
                </Link>
              </li>
              <li className="py-2.5">
                <Link href="/exams" className="hover:text-white transition-colors block w-full">
                  TNEA choice filling
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
              <div className="w-7 h-[2px] bg-indigo-500 mt-1.5" />
            </div>
            <ul className="flex flex-col text-xs">
              <li className="border-b border-indigo-900/30 py-2.5">
                <Link href="/colleges?location=abroad" className="hover:text-white transition-colors block w-full">
                  Study in USA
                </Link>
              </li>
              <li className="border-b border-indigo-900/30 py-2.5">
                <Link href="/colleges?location=abroad" className="hover:text-white transition-colors block w-full">
                  Study in Canada
                </Link>
              </li>
              <li className="border-b border-indigo-900/30 py-2.5">
                <Link href="/colleges?location=abroad" className="hover:text-white transition-colors block w-full">
                  Study in United Kingdom
                </Link>
              </li>
              <li className="py-2.5">
                <Link href="/colleges?location=abroad" className="hover:text-white transition-colors block w-full">
                  Visa Guidance
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
              <div className="w-7 h-[2px] bg-indigo-500 mt-1.5" />
            </div>
            <ul className="flex flex-col text-xs">
              <li className="border-b border-indigo-900/30 py-2.5">
                <Link href="/counselor" className="hover:text-white transition-colors block w-full">
                  AI Chat Counselor
                </Link>
              </li>
              <li className="border-b border-indigo-900/30 py-2.5">
                <Link href="/tracker" className="hover:text-white transition-colors block w-full">
                  Application Tracker
                </Link>
              </li>
              <li className="border-b border-indigo-900/30 py-2.5">
                <Link href="/scholarships" className="hover:text-white transition-colors block w-full">
                  Scholarship Hub
                </Link>
              </li>
              <li className="py-2.5">
                <Link href="/" className="hover:text-white transition-colors block w-full">
                  Ranking Methodology
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom copyright area */}
      <div className="relative z-10 bg-indigo-950 border-t border-indigo-900/20 py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span>© 2026 C2Talents. All rights reserved.</span>
          </div>
          <div className="flex space-x-6 text-[11px] font-semibold text-stone-400">
            <Link href="/" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-white transition-colors">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
