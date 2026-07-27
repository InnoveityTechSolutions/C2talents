"use client";

import * as React from "react";
import Link from "next/link";
import { Link2 } from "lucide-react";

const links = [
  { label: "B.Tech Admissions 2026", href: "/colleges?degree=b.tech" },
  { label: "MBA Admissions 2026", href: "/colleges?degree=mba" },
  { label: "MBBS Counselling 2026", href: "/colleges?degree=mbbs" },
  { label: "B.Com Admissions 2026", href: "/colleges?degree=b.com" },
  { label: "Law Cutoffs 2026", href: "/colleges?degree=llb" },
  { label: "TNEA Choice Filling 2026", href: "/exams" },
  { label: "Scholarships Guide 2026", href: "/scholarships" },
];

export function QuickLinks() {
  return (
    <section className="py-12 px-6 bg-[#FAF9F5]/40 border-b border-stone-200/40 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center gap-4">
        {/* Title */}
        <div className="flex items-center gap-2 shrink-0">
          <Link2 className="w-4 h-4 text-indigo-900" />
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Quick Admission Links 2026:
          </span>
        </div>

        {/* Chips cloud */}
        <div className="flex flex-wrap gap-2.5">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs font-semibold text-stone-600 bg-white border border-stone-200/60 hover:border-indigo-200 hover:text-indigo-900 px-3.5 py-1.5 rounded-full transition-all hover:shadow-[0_4px_10px_-2px_rgba(0,0,0,0.02)]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
