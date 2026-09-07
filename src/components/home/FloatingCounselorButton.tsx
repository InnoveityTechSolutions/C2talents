"use client";

import * as React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { usePathname } from "next/navigation";

export function FloatingCounselorButton() {
  const pathname = usePathname();
  const [showTooltip, setShowTooltip] = React.useState(true);

  // Hide AI Counselor widget on Admin, Manager, and Counselor pages
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/manager") || pathname === "/counselor") {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans flex items-center gap-2.5 animate-slide-up select-none">
      {/* White Speech Bubble Tooltip */}
      {showTooltip && (
        <Link
          href="/counselor"
          className="relative bg-white text-stone-800 px-3.5 py-2 rounded-xl shadow-md border border-stone-200/90 cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-x-0.5 group after:content-[''] after:absolute after:-right-2 after:top-1/2 after:-translate-y-1/2 after:w-0 after:h-0 after:border-t-6 after:border-t-transparent after:border-b-6 after:border-b-transparent after:border-l-8 after:border-l-white block"
        >
          {/* Red Circular Close Badge */}
          <button
            type="button"
            suppressHydrationWarning
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="absolute -top-1.5 -left-1.5 w-4.5 h-4.5 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center font-bold text-[10px] shadow-xs transition-transform hover:scale-110 cursor-pointer z-10"
            title="Dismiss message"
          >
            <X className="w-2.5 h-2.5 stroke-[2.5]" />
          </button>

          <div className="space-y-0.5 font-sans">
            <p className="font-medium text-stone-800 text-xs leading-snug tracking-tight">
              Hello, I am Leo Bot, your
            </p>
            <p className="font-semibold text-stone-900 text-xs leading-snug tracking-tight">
              Admission Assistant.
            </p>
          </div>
        </Link>
      )}

      {/* Leo Bot Mascot Compact Circular Avatar (48px) */}
      <Link
        href="/counselor"
        className="w-12 h-12 rounded-full bg-[#1e2329] p-0.5 shadow-lg flex items-center justify-center cursor-pointer hover:scale-105 transition-all duration-200 shrink-0 relative group block"
        title="Open Leo Bot Assistant"
      >
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden border border-stone-200">
          <img
            src="/images/leo-mascot.png"
            alt="Leo Bot"
            className="w-full h-full object-contain p-0.5"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>
        {/* Live Green Online Status Badge */}
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white absolute top-0 right-0 shadow-2xs" />
      </Link>
    </div>
  );
}
