"use client";

import * as React from "react";
import { Search, MapPin, GraduationCap, BookOpen, X } from "lucide-react";
import { collegesData } from "@/data/colleges";
import { useRouter } from "next/navigation";

type SearchType = "college" | "course" | "city";

export function SearchBar() {
  const router = useRouter();
  const [searchType, setSearchType] = React.useState<SearchType>("college");
  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Extract unique courses and cities from collegesData
  const allColleges = React.useMemo(() => collegesData.map(c => c.name), []);
  const allCities = React.useMemo(() => {
    const locations = collegesData.map(c => c.location.split(",")[0].trim());
    return Array.from(new Set(locations));
  }, []);
  const allCourses = React.useMemo(() => [
    "Computer Science Engineering",
    "Information Technology",
    "Electronics & Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical & Electronics Engineering",
    "MBA (Finance)",
    "MBA (Marketing)",
    "MBA (Human Resource)",
    "MBBS",
    "MD General Medicine",
    "MS General Surgery",
    "B.Com General",
    "B.Com Professional",
    "BA English Literature",
    "BA Economics",
    "LLB (Hons)",
    "BA LLB"
  ], []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    let filtered: string[] = [];

    if (searchType === "college") {
      filtered = allColleges.filter(name => name.toLowerCase().includes(lowerQuery));
    } else if (searchType === "city") {
      filtered = allCities.filter(city => city.toLowerCase().includes(lowerQuery));
    } else if (searchType === "course") {
      filtered = allCourses.filter(course => course.toLowerCase().includes(lowerQuery));
    }

    setSuggestions(filtered.slice(0, 6)); // Limit to top 6 suggestions
  }, [query, searchType, allColleges, allCities, allCourses]);

  const handleSearch = (searchVal = query) => {
    if (!searchVal.trim()) return;
    setShowDropdown(false);

    if (searchType === "college") {
      router.push(`/colleges?search=${encodeURIComponent(searchVal)}`);
    } else if (searchType === "city") {
      router.push(`/colleges?location=${encodeURIComponent(searchVal)}`);
    } else if (searchType === "course") {
      router.push(`/colleges?stream=${encodeURIComponent(searchVal)}`);
    }
  };

  const getIcon = () => {
    switch (searchType) {
      case "college":
        return <GraduationCap className="w-5 h-5 text-stone-400" />;
      case "course":
        return <BookOpen className="w-5 h-5 text-stone-400" />;
      case "city":
        return <MapPin className="w-5 h-5 text-stone-400" />;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl mx-auto z-30">
      {/* Tabs */}
      <div className="flex gap-2 mb-2 justify-center md:justify-start">
        {(["college", "course", "city"] as SearchType[]).map((type) => (
          <button
            key={type}
            onClick={() => {
              setSearchType(type);
              setQuery("");
              setSuggestions([]);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              searchType === type
                ? "bg-indigo-900 text-white shadow-sm"
                : "bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 border border-stone-200"
            }`}
          >
            {type} Search
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="relative flex items-center bg-white border border-stone-200 rounded-2xl p-2 shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-indigo-900/30 focus-within:border-indigo-900 focus-within:ring-4 focus-within:ring-indigo-900/10 transition-all duration-300">
        <div className="pl-3">{getIcon()}</div>
        <input
          type="text"
          placeholder={
            searchType === "college"
              ? "Search Colleges, Universities..."
              : searchType === "course"
              ? "Search Courses (e.g. MBA, B.Tech, MBBS)..."
              : "Search Cities (e.g. Chennai, Vellore, Coimbatore)..."
          }
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
          className="w-full bg-transparent px-3 py-3 text-sm md:text-base outline-none text-stone-900 placeholder-stone-400 font-sans"
        />

        {query && (
          <button
            onClick={() => {
              setQuery("");
              setSuggestions([]);
            }}
            className="p-1 mr-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => handleSearch()}
          className="px-6 py-3 bg-indigo-900 text-white font-semibold rounded-xl text-sm hover:bg-indigo-950 active:scale-95 transition-all shadow-md cursor-pointer flex items-center gap-1.5"
        >
          <Search className="w-4 h-4" />
          <span>Search</span>
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] overflow-hidden z-40 divide-y divide-stone-50">
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(item);
                handleSearch(item);
              }}
              className="w-full text-left px-5 py-3.5 hover:bg-stone-50 text-stone-850 font-sans text-sm md:text-[15px] flex items-center gap-3 transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4 text-stone-450 flex-shrink-0" />
              <span>{item}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
