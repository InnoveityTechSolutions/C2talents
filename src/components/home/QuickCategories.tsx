"use client";

import * as React from "react";
import Link from "next/link";
import { GraduationCap, BookOpen, HeartPulse, Briefcase, Paintbrush, Scale, Landmark, Globe } from "lucide-react";

interface Category {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const categories: Category[] = [
  { name: "Top Colleges", href: "/colleges", icon: GraduationCap },
  { name: "Engineering", href: "/colleges?stream=engineering", icon: BookOpen },
  { name: "Medical", href: "/colleges?stream=medical", icon: HeartPulse },
  { name: "MBA", href: "/colleges?stream=management", icon: Briefcase },
  { name: "Arts", href: "/colleges?stream=arts", icon: Paintbrush },
  { name: "Law", href: "/colleges?stream=law", icon: Scale },
  { name: "Scholarships", href: "/scholarships", icon: Landmark },
  { name: "Study Abroad", href: "/colleges?location=abroad", icon: Globe },
];

export function QuickCategories() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto pt-1 pb-1 relative z-10">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <Link
            key={cat.name}
            href={cat.href}
            className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-xs border border-stone-200/90 text-stone-800 hover:bg-[#ea580c] hover:border-[#ea580c] hover:text-white active:bg-[#ea580c] active:border-[#ea580c] active:text-white focus:bg-[#ea580c] focus:border-[#ea580c] focus:text-white text-xs font-bold shadow-xs transition-all hover:-translate-y-0.5 active:scale-[0.97] cursor-pointer whitespace-nowrap shrink-0"
          >
            <Icon className="w-3.5 h-3.5 text-stone-600 group-hover:text-white group-active:text-white group-focus:text-white transition-colors" />
            <span>{cat.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
