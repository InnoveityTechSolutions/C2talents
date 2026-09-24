"use client";

import * as React from "react";
import Link from "next/link";
import { Compass, Building2, ArrowRight, MapPin, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const cities = [
  { name: "Chennai", count: "42 Colleges", code: "chennai", image: "/images/chennai-artwork.jpg" },
  { name: "Coimbatore", count: "28 Colleges", code: "coimbatore", image: "/images/coimbatore-artwork.jpg" },
  { name: "Vellore", count: "15 Colleges", code: "vellore", image: "/images/vellore-artwork.jpg" },
  { name: "Bangalore", count: "54 Colleges", code: "bangalore", image: "/images/bangalore-artwork.jpg" },
  { name: "Trichy", count: "18 Colleges", code: "trichy", image: "/images/trichy-artwork.jpg" },
  { name: "Madurai", count: "12 Colleges", code: "madurai", image: "/images/madurai-artwork.jpg" },
];

interface CollegePreview {
  id: string;
  name: string;
  category?: string;
  naacGrade?: string;
  ownership?: string;
}

interface CityTooltipProps {
  city: (typeof cities)[0];
  visible: boolean;
}

function CityTooltip({ city, visible }: CityTooltipProps) {
  const [colleges, setColleges] = React.useState<CollegePreview[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [fetched, setFetched] = React.useState(false);

  React.useEffect(() => {
    if (!visible || fetched) return;
    setLoading(true);
    fetch(`/api/colleges?location=${encodeURIComponent(city.code)}&limit=4`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.results ?? []);
        setColleges(list.slice(0, 4));
        setFetched(true);
      })
      .catch(() => setColleges([]))
      .finally(() => setLoading(false));
  }, [visible, city.code, fetched]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-white rounded-2xl shadow-[0_16px_48px_-8px_rgba(0,0,0,0.22)] border border-stone-100 overflow-hidden z-[9999] pointer-events-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1f0c3d] to-[#3b2075] px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-orange-300 shrink-0" />
              <span className="text-white font-extrabold text-xs uppercase tracking-wider">
                {city.name}
              </span>
            </div>
            <span className="text-orange-300 text-[10px] font-bold">{city.count}</span>
          </div>

          {/* College List */}
          <div className="p-2 space-y-0.5">
            {loading ? (
              <div className="flex items-center justify-center py-5">
                <Loader2 className="w-5 h-5 text-[#3b2075] animate-spin" />
              </div>
            ) : colleges.length === 0 ? (
              <p className="text-center text-xs text-stone-400 py-4 font-medium">No colleges found</p>
            ) : (
              colleges.map((c) => (
                <Link
                  key={c.id}
                  href={`/colleges/${c.id}`}
                  className="flex items-start gap-2.5 px-2.5 py-2 rounded-xl hover:bg-orange-50 transition-colors group"
                >
                  <div className="w-7 h-7 bg-[#f3eeff] rounded-lg flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-orange-100 transition-colors">
                    <Building2 className="w-3.5 h-3.5 text-[#3b2075] group-hover:text-orange-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-stone-800 leading-tight truncate group-hover:text-orange-600 transition-colors">
                      {c.name}
                    </p>
                    <p className="text-[10px] text-stone-400 font-medium mt-0.5 flex items-center gap-1">
                      {c.category && <span>{c.category}</span>}
                      {c.naacGrade && (
                        <>
                          <span className="text-stone-300">·</span>
                          <span className="text-emerald-600 font-bold">NAAC {c.naacGrade}</span>
                        </>
                      )}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer CTA */}
          <div className="border-t border-stone-100 px-3 py-2.5">
            <Link
              href={`/colleges?location=${city.code}`}
              className="flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-[#3b2075] hover:text-orange-600 transition-colors group"
            >
              <span>View all colleges in {city.name}</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Arrow pointer */}
          <div className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-stone-100 rotate-45" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function TopDestinations() {
  const { ref, hasRevealed } = useScrollReveal<HTMLDivElement>();
  const [hoveredCity, setHoveredCity] = React.useState<string | null>(null);

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
            Hover over a city to preview colleges — click to explore all.
          </p>
        </div>

        {/* Floating Rotated Diamond Cards Container */}
        <div className="relative pt-6 pb-10 overflow-x-auto no-scrollbar overflow-y-visible">
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
                className="relative group z-10 hover:z-[100] shrink-0"
                onMouseEnter={() => setHoveredCity(city.code)}
                onMouseLeave={() => setHoveredCity(null)}
                onTouchStart={() =>
                  setHoveredCity(hoveredCity === city.code ? null : city.code)
                }
              >
                {/* Hover Tooltip */}
                <CityTooltip city={city} visible={hoveredCity === city.code} />

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
                      loading="lazy"
                      decoding="async"
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


