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
    <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto pt-2">
      {categories.map((cat) => {
        const Icon = cat.icon;
        return (
          <Link
            key={cat.name}
            href={cat.href}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-stone-200 hover:border-indigo-900 hover:text-indigo-900 text-stone-700 text-xs font-semibold shadow-[0_2px_4px_rgba(0,0,0,0.02)] transition-all hover:-translate-y-0.5"
          >
            <Icon className="w-3.5 h-3.5 text-stone-500 group-hover:text-indigo-900" />
            <span>{cat.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
