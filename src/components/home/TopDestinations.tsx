"use client";

import * as React from "react";
import Link from "next/link";
import { Landmark, Compass } from "lucide-react";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const cities = [
  { name: "Chennai", count: "42 Colleges", code: "chennai", image: "/images/chennai-artwork.jpg" },
  { name: "Coimbatore", count: "28 Colleges", code: "coimbatore", image: "/images/coimbatore-artwork.jpg" },
  { name: "Vellore", count: "15 Colleges", code: "vellore", image: "/images/vellore-artwork.jpg" },
  { name: "Bangalore", count: "54 Colleges", code: "bangalore", image: "/images/bangalore-artwork.jpg" },
  { name: "Trichy", count: "18 Colleges", code: "trichy", image: "/images/trichy-artwork.jpg" },
  { name: "Madurai", count: "12 Colleges", code: "madurai", image: "/images/madurai-artwork.jpg" },
];

export function TopDestinations() {
  const { ref, hasRevealed } = useScrollReveal<HTMLDivElement>();

  return (
    <section
      ref={ref}
      className={`py-20 px-6 bg-white border-b border-stone-200/40 font-sans scroll-reveal ${
        hasRevealed ? "revealed" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="space-y-1.5 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-serif text-[#1f0c3d] font-bold flex items-center justify-center md:justify-start gap-2.5">
            <Compass className="w-6 h-6 text-[#3b2075]" />
            <span>Top Study Destinations</span>
          </h2>
          <p className="text-xs md:text-sm text-stone-500 max-w-xl font-sans leading-relaxed">
            Explore colleges based in top educational clusters with strong job recruitment networks.
          </p>
        </div>

        {/* Floating Rotated Diamond Cards Container */}
        <div className="relative pt-6 pb-10 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-start md:justify-center -space-x-3 sm:-space-x-2 md:space-x-1 lg:space-x-3 min-w-max md:min-w-0 px-8 py-8">
            {cities.map((city, idx) => (
              <motion.div
                key={city.name}
                initial={{ opacity: 0, y: 35 }}
                animate={hasRevealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 35 }}
                transition={{
                  duration: 0.8,
                  delay: idx * 0.11,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative group z-10 hover:z-30 shrink-0"
              >
                <Link
                  href={`/colleges?location=${city.code}`}
                  aria-label={`View colleges in ${city.name}`}
                  className="block relative w-32 h-32 sm:w-36 sm:h-36 md:w-36 md:h-36 lg:w-40 lg:h-40 bg-white border-2 border-orange-400/80 rounded-[28px] shadow-[0_12px_30px_-6px_rgba(0,0,0,0.08)] group-hover:shadow-[0_20px_45px_-8px_rgba(234,88,12,0.25)] group-hover:border-[#ea580c] cursor-pointer overflow-hidden origin-center transition-all duration-450 ease-[cubic-bezier(0.16,1,0.3,1)] rotate-45 group-hover:rotate-0 group-hover:scale-[1.02] active:rotate-0 active:scale-[1.02] will-change-transform subpixel-antialiased"
                >
                  {/* Card Artwork / Background Layer */}
                  {city.image ? (
                    <img
                      src={city.image}
                      alt={city.name}
                      className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[1.02] contrast-[1.05]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-stone-50/50 to-stone-100/40 pointer-events-none flex items-center justify-center">
                      <div className="-rotate-45 group-hover:rotate-0 transition-transform duration-450 text-[#3b2075] font-bold text-xs">
                        {city.name}
                      </div>
                    </div>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

