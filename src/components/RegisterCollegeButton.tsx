"use client";

import Link from "next/link";
import { Landmark } from "lucide-react";

interface RegisterCollegeButtonProps {
  className?: string;
  onClick?: () => void;
}

export function RegisterCollegeButton({ className = "", onClick }: RegisterCollegeButtonProps) {
  return (
    <>
      <style>{`
        @keyframes enterpriseShineSweep {
          0% {
            transform: translateX(-160%) rotate(25deg);
          }
          25% {
            transform: translateX(260%) rotate(25deg);
          }
          100% {
            transform: translateX(260%) rotate(25deg);
          }
        }

        .animate-glossy-shine {
          animation: enterpriseShineSweep 4.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          will-change: transform;
        }

        .group:hover .animate-glossy-shine {
          animation-duration: 3.8s;
        }
      `}</style>

      <Link
        href="/register-college"
        onClick={onClick}
        className={`group relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[15px] 
          bg-[#1c0b36] hover:bg-[#2a104e] active:bg-[#16082c]
          border border-amber-500/40 hover:border-amber-400/90
          text-amber-300 hover:text-amber-200 font-extrabold text-xs tracking-wider uppercase
          shadow-[0_4px_14px_rgba(28,11,54,0.5)] hover:shadow-[0_6px_22px_rgba(251,191,36,0.22)]
          transform hover:-translate-y-[2px] active:scale-[0.98] active:translate-y-0
          transition-all duration-150 ease-out
          overflow-hidden select-none cursor-pointer whitespace-nowrap shrink-0
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d041a]
          ${className}`}
        aria-label="Register College - SaaS Onboarding"
      >
        {/* Semi-transparent glossy shine sweeping highlight */}
        <span
          aria-hidden="true"
          className="animate-glossy-shine absolute -top-[50%] -bottom-[50%] w-[60%] 
            bg-gradient-to-r from-transparent via-white/30 to-transparent 
            pointer-events-none"
        />

        {/* Subtle Icon with 1-2px upward lift and micro-glow */}
        <Landmark className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300 transition-all duration-200 ease-out group-hover:-translate-y-[1.5px] group-hover:drop-shadow-[0_0_6px_rgba(251,191,36,0.6)] shrink-0" />

        {/* Text Label */}
        <span className="relative z-10 font-extrabold drop-shadow-xs">Register College</span>
      </Link>
    </>
  );
}
