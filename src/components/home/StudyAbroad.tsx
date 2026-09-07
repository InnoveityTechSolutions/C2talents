"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, DollarSign, Landmark, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface CountryItem {
  id?: string;
  name: string;
  code: string;
  slug: string;
  collegesCount?: string;
  universityCount?: string;
  avgCost?: string;
  averageTuition?: string;
  popularDegree?: string;
  popularDegrees?: string;
  flag: string;
  illustration?: string;
  heroImage?: string;
  landmarkAlt?: string;
}

const fallbackCountries: CountryItem[] = [
  {
    name: "United States (USA)",
    code: "USA",
    slug: "usa",
    collegesCount: "800+ Universities",
    avgCost: "₹25L - ₹45L / yr",
    popularDegree: "MS / MBA / BS",
    flag: "🇺🇸",
    illustration: "/images/destinations/us_landmark_sketch.jpg",
    landmarkAlt: "US Landmark - Statue of Liberty & New York Skyline",
  },
  {
    name: "United Kingdom (UK)",
    code: "UK",
    slug: "uk",
    collegesCount: "160+ Universities",
    avgCost: "₹18L - ₹32L / yr",
    popularDegree: "M.Sc / MBA / B.Sc",
    flag: "🇬🇧",
    illustration: "/images/destinations/uk_landmark_sketch.jpg",
    landmarkAlt: "UK Landmark - Big Ben & Westminster Palace",
  },
  {
    name: "Canada",
    code: "CA",
    slug: "canada",
    collegesCount: "220+ Universities",
    avgCost: "₹15L - ₹28L / yr",
    popularDegree: "MS / PG Diploma",
    flag: "🇨🇦",
    illustration: "/images/destinations/ca_landmark_sketch.jpg",
    landmarkAlt: "Canada Landmark - CN Tower & Toronto Skyline",
  },
];

export function StudyAbroad() {
  const router = useRouter();
  const { ref, hasRevealed } = useScrollReveal<HTMLDivElement>();
  const [countries, setCountries] = React.useState<CountryItem[]>(fallbackCountries);

  React.useEffect(() => {
    async function loadCountries() {
      try {
        const res = await fetch("/api/study-abroad/countries");
        if (!res.ok) return;
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.countries) && data.countries.length > 0) {
          setCountries(
            data.countries.map((c: any) => ({
              id: c.id,
              name: c.name,
              code: c.code,
              slug: c.slug,
              collegesCount: c.universityCount || "100+ Universities",
              avgCost: c.averageTuition || "₹15L - ₹35L / yr",
              popularDegree: c.popularDegrees || "MS / MBA",
              flag: c.flag || "🌐",
              illustration: c.heroImage || "/images/destinations/us_landmark_sketch.jpg",
              landmarkAlt: `${c.name} Destination Landmark`
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load dynamic study abroad countries:", err);
      }
    }
    loadCountries();
  }, []);

  function handleCardClick(slug: string) {
    router.push(`/study-abroad/${slug}`);
  }

  return (
    <section
      ref={ref}
      className={`py-20 px-6 bg-[#FAF9F5]/70 border-b border-stone-200/50 font-sans relative overflow-hidden scroll-reveal ${
        hasRevealed ? "revealed" : ""
      }`}
    >
      {/* Background Subtle World Vector Grid & Soft Flight Line Decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg className="w-full h-full stroke-purple-900/10 fill-none" viewBox="0 0 1000 400" preserveAspectRatio="none">
          <path d="M 100 200 Q 300 80 500 200 T 900 200" strokeWidth="1.5" strokeDasharray="6 6" />
          <circle cx="100" cy="200" r="4" fill="#ea580c" className="animate-ping opacity-75" />
          <circle cx="500" cy="200" r="4" fill="#3b2075" />
          <circle cx="900" cy="200" r="4" fill="#ea580c" />
        </svg>
      </div>

      {/* Ambient Soft Radial Glow */}
      <div className="absolute -top-24 left-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center text-center space-y-3 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3b2075]/5 text-[#3b2075] border border-[#3b2075]/15 text-[11px] font-extrabold uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5 text-[#ea580c]" />
            <span>Global Admission Desk</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-serif text-[#1f0c3d] font-bold tracking-tight">
            Study Abroad <span className="bg-gradient-to-r from-[#ea580c] to-[#3b2075] bg-clip-text text-transparent">Opportunities</span>
          </h2>

          <p className="text-sm md:text-base text-stone-500 font-sans leading-relaxed max-w-lg mx-auto">
            Compare premium global study destinations, costs, and placement visa guides.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="pt-1"
          >
            <Link
              href="/study-abroad/usa"
              className="group inline-flex items-center gap-1.5 text-xs font-extrabold text-[#3b2075] hover:text-[#ea580c] uppercase tracking-wider transition-colors py-1"
            >
              <span>Explore All Destinations</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* 3 Premium Destination Showcase Cards - ENTIRE CARD CLICKABLE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {countries.map((country, idx) => {
            const shortCode = country.code.includes("USA") ? "USA" : country.code.includes("UK") ? "UK" : country.code;

            return (
              <motion.div
                key={country.slug || country.code}
                onClick={() => handleCardClick(country.slug)}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{
                  duration: 0.5,
                  delay: idx * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  y: -6,
                  scale: 1.01,
                  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                }}
                className="group bg-white border border-stone-200/80 hover:border-[#3b2075]/40 rounded-[26px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_-8px_rgba(31,12,61,0.12)] transition-all duration-300 flex flex-col justify-between space-y-5 relative overflow-hidden cursor-pointer"
              >
                {/* Subtle Card Accent Highlight */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ea580c] via-purple-600 to-[#3b2075] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="space-y-4">
                  {/* Top Row: Country Code + Visa Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-black text-[#1f0c3d] bg-purple-50 border border-purple-200/80 px-3 py-1 rounded-xl shadow-2xs">
                        {country.code}
                      </span>
                      <span className="text-xl" role="img" aria-label={country.name}>
                        {country.flag}
                      </span>
                    </div>

                    {/* Visa Badge */}
                    <span className="text-[10px] font-extrabold text-[#3b2075] bg-purple-50/80 border border-purple-200/80 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Visa Path Verified</span>
                    </span>
                  </div>

                  {/* Monochrome Architectural Landmark Illustration Container */}
                  <div className="relative w-full h-44 sm:h-48 rounded-2xl bg-stone-50 border border-stone-200/60 overflow-hidden group/img shadow-inner">
                    <motion.img
                      src={country.illustration}
                      alt={country.landmarkAlt || country.name}
                      loading="lazy"
                      decoding="async"
                      whileHover={{ scale: 1.04, y: -2 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full h-full object-cover object-center transition-transform duration-500 filter contrast-[1.05] brightness-[1.02]"
                    />
                    {/* Subtle Hover Gradient Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-end p-3">
                      <span className="text-[11px] font-extrabold text-white bg-[#3b2075]/80 backdrop-blur-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-300" /> Click to explore {country.name}
                      </span>
                    </div>
                  </div>

                  {/* Country Name & Degree Tracks */}
                  <div>
                    <h3 className="font-serif font-bold text-[#1f0c3d] text-xl group-hover:text-[#ea580c] transition-colors leading-tight">
                      {country.name}
                    </h3>
                    <p className="text-xs text-stone-500 font-semibold font-sans mt-0.5">
                      {country.popularDegree} tracks
                    </p>
                  </div>
                </div>

                {/* Statistics (Universities & Avg Cost) */}
                <div className="pt-3.5 border-t border-stone-100 space-y-2 text-xs font-sans">
                  <div className="flex items-center gap-2 text-stone-700 font-semibold">
                    <Landmark className="w-3.5 h-3.5 text-[#3b2075] shrink-0" />
                    <span>{country.collegesCount}</span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-900 font-bold">
                    <DollarSign className="w-3.5 h-3.5 text-[#ea580c] shrink-0" />
                    <span>Avg Cost: {country.avgCost}</span>
                  </div>
                </div>

                {/* PRIMARY CTA: Explore [Country] → */}
                <div className="pt-1">
                  <span className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#3b2075] group-hover:bg-[#ea580c] text-white font-extrabold text-xs rounded-xl transition-all duration-200 shadow-md group-hover:shadow-lg">
                    <span>Explore {shortCode}</span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
