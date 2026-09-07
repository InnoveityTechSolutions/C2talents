"use client";

import * as React from "react";
import { Search, MapPin, GraduationCap, BookOpen, X, ChevronRight, Navigation, Award, Star, Compass } from "lucide-react";
import { useRouter } from "next/navigation";
import { HighlightText } from "@/components/common/HighlightText";

type SearchType = "college" | "course" | "city";

interface SuggestionCollege {
  id: string;
  name: string;
  shortName?: string;
  location: string;
  city?: string;
  category?: string;
  type?: string;
  ownership?: string;
  naacGrade?: string;
  rating?: number;
  image?: string;
  distance?: number | null;
  distanceText?: string | null;
}

interface SuggestionResponse {
  query: string;
  locations: string[];
  colleges: SuggestionCollege[];
  categories: string[];
}

export function SearchBar() {
  const router = useRouter();
  const [searchType, setSearchType] = React.useState<SearchType>("college");
  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<SuggestionResponse>({
    query: "",
    locations: [],
    colleges: [],
    categories: [],
  });
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(-1);
  const [userCoords, setUserCoords] = React.useState<{ lat: number; lng: number } | null>(null);
  const [locationDeniedMsg, setLocationDeniedMsg] = React.useState<string | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Request Geolocation if user types "near me" or requests distance search
  const requestLocation = React.useCallback(() => {
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationDeniedMsg(null);
        },
        (error) => {
          console.warn("Geolocation permission error:", error.message);
          setLocationDeniedMsg("Location permission is disabled. Search by city name (e.g. 'Colleges in Chennai').");
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setLocationDeniedMsg("Browser geolocation is not supported.");
    }
  }, []);

  // Trigger geolocation request if query includes "near" or "km"
  React.useEffect(() => {
    if (/near|within|km/i.test(query) && !userCoords) {
      requestLocation();
    }
  }, [query, userCoords, requestLocation]);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Live Suggestions Fetcher (250-300ms)
  React.useEffect(() => {
    const q = query.trim();
    if (!q) {
      setSuggestions({ query: "", locations: [], colleges: [], categories: [] });
      setSearchLoading(false);
      setSelectedIndex(-1);
      return;
    }

    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        params.set("q", q);
        if (userCoords) {
          params.set("lat", userCoords.lat.toString());
          params.set("lng", userCoords.lng.toString());
        }

        const res = await fetch(`/api/colleges/suggest?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        } else {
          setSuggestions({ query: q, locations: [], colleges: [], categories: [] });
        }
      } catch (err) {
        setSuggestions({ query: q, locations: [], colleges: [], categories: [] });
      } finally {
        setSearchLoading(false);
        setSelectedIndex(-1);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, userCoords]);

  // Flattened items list for keyboard navigation (ArrowUp, ArrowDown, Enter)
  const allNavigableItems = React.useMemo(() => {
    const items: Array<{ type: "location" | "college" | "category" | "search"; value: string; id?: string }> = [];

    suggestions.locations.forEach((loc) => items.push({ type: "location", value: loc }));
    suggestions.categories.forEach((cat) => items.push({ type: "category", value: cat }));
    suggestions.colleges.forEach((col) => items.push({ type: "college", value: col.name, id: col.id }));
    if (query.trim()) {
      items.push({ type: "search", value: query.trim() });
    }

    return items;
  }, [suggestions, query]);

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setShowDropdown(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!showDropdown) setShowDropdown(true);
      setSelectedIndex((prev) => (prev + 1 < allNavigableItems.length ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allNavigableItems.length - 1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && selectedIndex < allNavigableItems.length) {
        e.preventDefault();
        const selected = allNavigableItems[selectedIndex];
        if (selected.type === "college" && selected.id) {
          router.push(`/colleges/${selected.id}`);
          setShowDropdown(false);
          setQuery("");
        } else if (selected.type === "location") {
          router.push(`/colleges?location=${encodeURIComponent(selected.value)}`);
          setShowDropdown(false);
        } else {
          handleSearchSubmit(undefined, selected.value);
        }
      }
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent, customVal?: string) => {
    if (e) e.preventDefault();
    const finalVal = (customVal !== undefined ? customVal : query).trim();
    if (!finalVal) return;

    setShowDropdown(false);

    const params = new URLSearchParams();
    if (searchType === "city") {
      params.set("location", finalVal);
    } else {
      params.set("search", finalVal);
    }
    if (userCoords) {
      params.set("lat", userCoords.lat.toString());
      params.set("lng", userCoords.lng.toString());
    }

    router.push(`/colleges?${params.toString()}`);
  };

  const getIcon = () => {
    switch (searchType) {
      case "college":
        return <GraduationCap className="w-5 h-5 text-indigo-900" />;
      case "course":
        return <BookOpen className="w-5 h-5 text-indigo-900" />;
      case "city":
        return <MapPin className="w-5 h-5 text-indigo-900" />;
    }
  };

  const getPlaceholder = () => {
    switch (searchType) {
      case "college":
        return "Search e.g. IIT Madras, Anna Univ, Government colleges in Chennai, 150 km near me...";
      case "course":
        return "Search Courses (e.g. MBA, B.Tech, MBBS, Computer Science, Law)...";
      case "city":
        return "Search Cities & Places (e.g. Chennai, Madurai, Trichy, Coimbatore)...";
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto z-50 font-sans">
      {/* Search Type Tabs */}
      <div className="flex gap-2 mb-2 justify-center md:justify-start items-center">
        {(["college", "course", "city"] as SearchType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setSearchType(type);
              setQuery("");
              setSuggestions({ query: "", locations: [], colleges: [], categories: [] });
              setShowDropdown(false);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              searchType === type
                ? "bg-indigo-900 text-white shadow-sm ring-2 ring-indigo-900/20"
                : "bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 border border-stone-200 shadow-2xs"
            }`}
          >
            {type} Search
          </button>
        ))}


      </div>

      {/* Main Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="relative flex items-center bg-white border border-stone-200/90 rounded-2xl p-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-indigo-900/30 focus-within:border-indigo-900 focus-within:ring-4 focus-within:ring-indigo-900/10 transition-all duration-300">
          <div className="pl-3">{getIcon()}</div>
          <input
            ref={inputRef}
            type="text"
            placeholder={getPlaceholder()}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => {
              if (query.trim()) setShowDropdown(true);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent px-3 py-3 text-sm md:text-base outline-none text-stone-900 placeholder-stone-400 font-sans font-medium"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions({ query: "", locations: [], colleges: [], categories: [] });
                setShowDropdown(false);
              }}
              className="p-1.5 mr-1 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="px-6 py-3 bg-indigo-900 hover:bg-indigo-950 text-white font-extrabold rounded-xl text-sm active:scale-95 transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Location Denied Warning Notice */}
      {locationDeniedMsg && (
        <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between">
          <span>{locationDeniedMsg}</span>
          <button onClick={() => setLocationDeniedMsg(null)} className="text-amber-800 font-bold ml-2">Dismiss</button>
        </div>
      )}

      {/* Grouped Autocomplete Suggestions Dropdown */}
      {showDropdown && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-2.5 bg-white border border-stone-200/90 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.25)] overflow-hidden z-[200] divide-y divide-stone-100 font-sans">
          <div className="max-h-96 overflow-y-auto p-2 space-y-3">
            {searchLoading ? (
              <div className="p-5 text-center text-xs text-stone-400 font-medium flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin" />
                <span>Searching database...</span>
              </div>
            ) : suggestions.colleges.length === 0 && suggestions.locations.length === 0 ? (
              <div className="p-5 text-center text-xs text-stone-500 font-medium">
                No colleges found matching &quot;{query}&quot;. Try searching for Chennai, PSG, Engineering, etc.
              </div>
            ) : (
              <>
                {/* LOCATIONS GROUP */}
                {suggestions.locations.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-3 pt-1 text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-orange-500" />
                      <span>LOCATIONS</span>
                    </div>
                    {suggestions.locations.map((loc, idx) => {
                      const itemIdx = suggestions.locations.indexOf(loc);
                      const isSelected = selectedIndex === itemIdx;
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            router.push(`/colleges?location=${encodeURIComponent(loc)}`);
                            setShowDropdown(false);
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-stone-800 hover:bg-orange-50 hover:text-orange-700 cursor-pointer transition-all ${
                            isSelected ? "bg-orange-100 text-orange-800" : ""
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <HighlightText text={loc} query={query} />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* CATEGORIES GROUP */}
                {suggestions.categories.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-3 pt-1 text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1">
                      <Compass className="w-3 h-3 text-indigo-500" />
                      <span>CATEGORIES &amp; INTENT</span>
                    </div>
                    {suggestions.categories.map((cat, idx) => {
                      const itemIdx = suggestions.locations.length + idx;
                      const isSelected = selectedIndex === itemIdx;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSearchSubmit(undefined, cat)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold text-indigo-900 hover:bg-indigo-50 cursor-pointer transition-all ${
                            isSelected ? "bg-indigo-100" : ""
                          }`}
                        >
                          <HighlightText text={cat} query={query} />
                          <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* COLLEGES GROUP */}
                {suggestions.colleges.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-3 pt-1 text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-amber-500" />
                      <span>COLLEGES</span>
                    </div>
                    {suggestions.colleges.map((c, idx) => {
                      const itemIdx = suggestions.locations.length + suggestions.categories.length + idx;
                      const isSelected = selectedIndex === itemIdx;
                      return (
                        <div
                          key={c.id}
                          onClick={() => {
                            router.push(`/colleges/${c.id}`);
                            setShowDropdown(false);
                            setQuery("");
                          }}
                          className={`flex items-center gap-3 p-2.5 rounded-xl hover:bg-purple-50/70 cursor-pointer transition-colors group ${
                            isSelected ? "bg-purple-100/90" : ""
                          }`}
                        >
                          <img
                            src={c.image || "/images/campus-hero.jpg"}
                            alt={c.name}
                            className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0 group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/campus-hero.jpg";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-stone-900 group-hover:text-indigo-900 truncate">
                              <HighlightText text={c.name} query={query} />
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-stone-500 mt-0.5 font-medium">
                              <span>
                                <HighlightText text={c.city || c.location} query={query} />
                              </span>
                              <span>•</span>
                              <span className="text-emerald-700 font-bold">{c.category || c.ownership || "College"}</span>
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
                                    <Navigation className="w-2.5 h-2.5" />
                                    {c.distanceText}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-indigo-900 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* SEARCH ALL MATCHES BUTTON */}
          <button
            type="button"
            onClick={() => handleSearchSubmit()}
            className="w-full p-3 bg-stone-50 hover:bg-indigo-900 hover:text-white text-stone-700 text-xs font-bold transition-colors flex items-center justify-between text-left cursor-pointer"
          >
            <span>Search all matching results for &quot;{query}&quot;</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
}
