"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  TrendingUp,
  MapPin,
  Building2,
  BookOpen,
  Navigation,
  Flame,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import { HighlightText } from "@/components/common/HighlightText";

interface SearchOverlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

interface CollegeResult {
  id: string;
  name: string;
  shortName?: string;
  city?: string;
  location: string;
  ownership?: string;
  type?: string;
  naacGrade?: string;
  rating?: number;
  image?: string;
  distanceText?: string | null;
}

export function SearchOverlayModal({ isOpen, onClose, initialQuery = "" }: SearchOverlayModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<CollegeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial query when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen, initialQuery]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch real search results from database API
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    let isCancelled = false;
    async function performSearch() {
      setLoading(true);
      setErrorMessage("");

      try {
        const res = await fetch(`/api/colleges?search=${encodeURIComponent(query.trim())}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Search service error");
        }

        const data = await res.json();
        if (!isCancelled) {
          if (Array.isArray(data)) {
            setResults(data);
          } else if (data.results && Array.isArray(data.results)) {
            setResults(data.results);
          } else {
            setResults([]);
          }
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error("Overlay Search error:", err);
          setErrorMessage("Failed to perform search. Please try again.");
          setResults([]);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    const timer = setTimeout(performSearch, 200);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  if (!isOpen) return null;

  const trendingSearches = [
    { label: "best art and science college near me", category: "Arts & Science" },
    { label: "engineering colleges in Chennai", category: "Engineering" },
    { label: "government engineering colleges near Chennai", category: "Government" },
    { label: "NAAC A++ colleges in Chennai", category: "Accredited" },
    { label: "medical colleges in Tamil Nadu", category: "Medical" },
    { label: "best CSE colleges near Chennai", category: "Computer Science" },
    { label: "colleges within 20 km", category: "Location" },
    { label: "autonomous colleges near me", category: "Autonomous" },
  ];

  const quickFilterPills = [
    { label: "Arts & Science", query: "best art and science college" },
    { label: "Engineering", query: "best engineering colleges" },
    { label: "Medical", query: "medical colleges" },
    { label: "Government", query: "government colleges" },
    { label: "NAAC A++", query: "NAAC A++ colleges" },
    { label: "Near Me", query: "colleges near me" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/colleges?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col bg-stone-950/75 backdrop-blur-md animate-fade-in font-sans">
      {/* Search Container Box */}
      <div className="w-full bg-white border-b border-stone-200 shadow-xl max-h-[90vh] flex flex-col">
        {/* Header Search Input */}
        <div className="max-w-7xl mx-auto w-full px-6 py-5 flex items-center gap-4 border-b border-stone-100">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-3">
            <Search className="w-6 h-6 text-orange-500 shrink-0 stroke-[2.5]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search e.g. best art and science college near me, engineering in Chennai..."
              className="w-full pl-2 pr-12 py-2 text-xl md:text-2xl font-black text-stone-900 placeholder-stone-400 outline-none bg-transparent font-sans tracking-tight"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </form>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-600 hover:text-stone-950 hover:bg-stone-100 rounded-xl transition-all cursor-pointer shrink-0"
            title="Close Search (ESC)"
          >
            <X className="w-8 h-8 stroke-[1.8]" />
          </button>
        </div>

        {/* Panel Body Content */}
        <div className="max-w-7xl mx-auto w-full px-6 py-6 overflow-y-auto flex-1 space-y-6">
          {query.trim() ? (
            /* LIVE DB SEARCH RESULTS */
            <div className="space-y-4">
              <div className="text-xs font-black uppercase tracking-wider text-stone-500 flex items-center justify-between">
                <span>Search Results ({loading ? "Searching database..." : `${results.length} colleges found`})</span>
              </div>

              {errorMessage ? (
                <div className="py-8 text-rose-600 text-sm font-bold bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center">
                  {errorMessage}
                </div>
              ) : results.length === 0 && !loading ? (
                <div className="py-12 px-6 bg-white border border-stone-200 rounded-3xl text-center space-y-3 max-w-lg mx-auto my-6 shadow-xs">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-black text-[#2e266f] tracking-tight uppercase">NO COLLEGES FOUND</h3>
                  <p className="text-xs text-stone-600 font-medium">
                    No colleges matching &quot;<strong>{query}</strong>&quot; were found.
                  </p>
                  <p className="text-[11px] text-stone-500 font-semibold">
                    Try searching for another city or broaden your search terms.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        router.push(`/colleges/${c.id}`);
                        onClose();
                      }}
                      className="flex items-center gap-4 p-3.5 rounded-2xl border border-stone-200 hover:border-indigo-900 hover:bg-purple-50/50 cursor-pointer transition-all group"
                    >
                      <img
                        src={c.image || "/images/campus-hero.jpg"}
                        alt={c.name}
                        className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0 group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/campus-hero.jpg";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-extrabold text-stone-900 group-hover:text-indigo-900 truncate">
                          <HighlightText text={c.name} query={query} />
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 mt-1 font-medium">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-stone-400" />
                            <HighlightText text={c.city || c.location} query={query} />
                          </span>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold">
                            {c.ownership || c.type || "College"}
                          </span>
                          {c.naacGrade && c.naacGrade !== "Not Accredited" && (
                            <>
                              <span>•</span>
                              <span className="text-purple-700 font-bold">NAAC {c.naacGrade}</span>
                            </>
                          )}
                          {c.rating && (
                            <>
                              <span>•</span>
                              <span className="text-amber-600 font-bold">{c.rating.toFixed(1)} ★</span>
                            </>
                          )}
                          {c.distanceText && (
                            <>
                              <span>•</span>
                              <span className="text-orange-600 font-extrabold flex items-center gap-0.5">
                                <Navigation className="w-3 h-3 stroke-[2.5]" />
                                {c.distanceText}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-indigo-900 shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* TRENDING / SMART SEARCH SUGGESTIONS */
            <div className="space-y-4">
              <div className="text-sm font-black text-amber-600 uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>POPULAR NATURAL LANGUAGE SEARCHES</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-8">
                {trendingSearches.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setQuery(item.label)}
                    className="flex items-center gap-3 text-left p-2.5 rounded-xl hover:bg-amber-50/60 transition-all group border border-transparent hover:border-amber-200 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-black text-xs shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-all">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-stone-800 group-hover:text-orange-600 transition-colors truncate">
                        {item.label}
                      </p>
                      <span className="text-[10px] text-stone-400 font-medium">{item.category}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Quick Filter Categories */}
              <div className="pt-4 border-t border-stone-100 space-y-3">
                <div className="text-xs font-black text-stone-500 uppercase tracking-wider">
                  QUICK STREAM & CATEGORY FILTERS
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickFilterPills.map((pill, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQuery(pill.query)}
                      className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-indigo-900 hover:text-white text-stone-700 text-xs font-extrabold transition-all cursor-pointer shadow-2xs border border-stone-200/60"
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Hint Bar */}
        <div className="bg-stone-50 px-6 py-3 border-t border-stone-200 flex flex-wrap items-center justify-end text-xs text-stone-500 gap-2 font-medium">
          <div className="flex items-center gap-4 text-[11px] font-bold">
            <span>Press <kbd className="px-1.5 py-0.5 bg-white border border-stone-300 rounded text-stone-700 font-mono shadow-2xs">ESC</kbd> to exit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
