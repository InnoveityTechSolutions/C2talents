"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Sparkles, LogOut, User, ChevronDown, Search, GitCompare, Bookmark, 
  Menu, X, Landmark, Compass, CalendarDays, ClipboardList,
  Phone, Mail, Shield, Trophy, Building2,
  Cpu, Palette, Briefcase, FlaskConical, Stethoscope, Scale, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";
import { LoginModal } from "./LoginModal";
import { useRouter } from "next/navigation";
import { RegisterCollegeButton } from "./RegisterCollegeButton";

const megaMenuCategories = [
  {
    title: "ENGINEERING & TECH",
    icon: Cpu,
    items: [
      { label: "Computer Science & IT", href: "/colleges?category=Engineering&search=computer" },
      { label: "AI & Data Science", href: "/colleges?category=Engineering&search=artificial" },
      { label: "Electronics & Communication", href: "/colleges?category=Engineering&search=electronics" },
      { label: "Mechanical Engineering", href: "/colleges?category=Engineering&search=mechanical" },
      { label: "Civil & Infrastructure", href: "/colleges?category=Engineering&search=civil" },
    ],
  },
  {
    title: "ARTS & HUMANITIES",
    icon: Palette,
    items: [
      { label: "Visual Communication", href: "/colleges?category=Arts+%26+Science&search=visual" },
      { label: "English Literature", href: "/colleges?category=Arts+%26+Science&search=english" },
      { label: "Psychology & Social Work", href: "/colleges?category=Arts+%26+Science&search=psychology" },
      { label: "Fine Arts & Design", href: "/colleges?category=Arts+%26+Science&search=design" },
    ],
  },
  {
    title: "COMMERCE & MANAGEMENT",
    icon: Briefcase,
    items: [
      { label: "Commerce (B.Com & M.Com)", href: "/colleges?category=Commerce" },
      { label: "BBA (Business Admin)", href: "/colleges?category=Management&search=bba" },
      { label: "MBA (PGDM / Executive)", href: "/colleges?category=Management" },
      { label: "Hotel & Catering Mgmt", href: "/colleges?category=Management&search=hotel" },
    ],
  },
  {
    title: "SCIENCE & LIFE SCIENCES",
    icon: FlaskConical,
    items: [
      { label: "Computer Applications (BCA/MCA)", href: "/colleges?category=Arts+%26+Science&search=bca" },
      { label: "Biotechnology & Bio-Info", href: "/colleges?category=Arts+%26+Science&search=biotech" },
      { label: "Biochemistry & Microbiology", href: "/colleges?category=Arts+%26+Science&search=microbiology" },
      { label: "Mathematics & Statistics", href: "/colleges?category=Arts+%26+Science&search=math" },
    ],
  },
  {
    title: "MEDICAL & HEALTHCARE",
    icon: Stethoscope,
    items: [
      { label: "MBBS & Dental (BDS)", href: "/colleges?category=Medical" },
      { label: "Pharmacy (B.Pharm / M.Pharm)", href: "/colleges?category=Pharmacy" },
      { label: "Nursing & Paramedical", href: "/colleges?category=Nursing" },
      { label: "Allied Health Sciences", href: "/colleges?category=Medical&search=allied" },
    ],
  },
  {
    title: "LAW, POLYTECHNIC & OTHERS",
    icon: Scale,
    items: [
      { label: "Law (LL.B, BA LL.B)", href: "/colleges?category=Law" },
      { label: "Polytechnic & Diploma", href: "/colleges?category=Polytechnic" },
      { label: "Agriculture Sciences", href: "/colleges?category=Agriculture" },
      { label: "Education & B.Ed", href: "/colleges?category=Education" },
    ],
  },
];

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [streamDropdownOpen, setStreamDropdownOpen] = React.useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = React.useState(false);

  const router = useRouter();
  const { user, logout } = useAuth();

  const profileMenuRef = React.useRef<HTMLDivElement>(null);
  const streamMenuRef = React.useRef<HTMLDivElement>(null);
  const searchMenuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (streamMenuRef.current && !streamMenuRef.current.contains(event.target as Node)) {
        setStreamDropdownOpen(false);
      }
      if (searchMenuRef.current && !searchMenuRef.current.contains(event.target as Node)) {
        setSearchDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live Auto-complete Search Debounced Fetcher
  React.useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      setSearchDropdownOpen(false);
      return;
    }

    setSearchLoading(true);
    setSearchDropdownOpen(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/colleges?search=${encodeURIComponent(q)}`);
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data.slice(0, 7) : []);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/colleges?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchDropdownOpen(false);
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    if (user.role === "STUDENT") return "/tracker";
    return "/";
  };

  return (
    <header className="relative z-30 w-full font-sans border-b border-stone-200/40 shadow-2xs bg-[#FAF9F5] md:bg-white overflow-visible animate-load-header">
      {/* ----------------- TOP INFORMATION BAR ----------------- */}
      <div className="w-full h-[34px] md:h-[36px] bg-[#FFFFFF] border-b border-[#E5E7EB] flex items-center justify-between whitespace-nowrap overflow-hidden flex-nowrap relative z-10 px-6 font-sans">
        <div className="flex items-center justify-start gap-6 h-full flex-nowrap">
          {/* LEFT SECTION: Contact Text Display (Top Left Aligned) */}
          <div className="flex items-center gap-4 text-[#2e266f] whitespace-nowrap flex-nowrap text-[12px]">
            <div className="flex items-center gap-1.5 whitespace-nowrap flex-nowrap">
              <Phone className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B] shrink-0" />
              <span className="text-[12px] font-semibold text-[#2e266f] shrink-0">+91 9600097807</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap flex-nowrap">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                <rect width="20" height="15" x="2" y="4.5" rx="3" fill="#F59E0B" />
                <path d="M4 7.5l8 5.5 8-5.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[12px] font-semibold text-[#2e266f] shrink-0">praveen.natarajan.in@gmail.com</span>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Socials */}
        <div className="hidden md:flex items-center gap-3.5 whitespace-nowrap flex-nowrap shrink-0">
          <a href="#" aria-label="Facebook" className="text-[#2e266f] hover:text-[#F59E0B] transition-colors flex items-center shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
          <a href="#" aria-label="YouTube" className="text-[#2e266f] hover:text-[#F59E0B] transition-colors flex items-center shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33zM9.75 15.02V8.48l6.5 3.27-6.5 3.27z"/></svg></a>
          <a href="#" aria-label="Instagram" className="text-[#2e266f] hover:text-[#F59E0B] transition-colors flex items-center shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg></a>
          <a href="#" aria-label="X" className="text-[#2e266f] hover:text-[#F59E0B] transition-colors flex items-center shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z" /><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" /></svg></a>
          <a href="#" aria-label="LinkedIn" className="text-[#2e266f] hover:text-[#F59E0B] transition-colors flex items-center shrink-0"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg></a>
        </div>
      </div>

      {/* ----------------- DESKTOP LAYOUT (2 ROWS) ----------------- */}
      <div className="hidden md:block">
        {/* ROW 1: Search, Logo, Actions */}
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6 relative z-[110]">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0 group">
            <img
              src="/logo.png"
              alt="C2Talents Logo"
              className="h-15 w-auto transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </Link>

          {/* Center: Live Auto-Complete Search Box */}
          <div className="absolute left-1/2 -translate-x-1/2 w-96" ref={searchMenuRef}>
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 z-10" />
              <input
                type="text"
                placeholder="Search colleges, courses, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim()) setSearchDropdownOpen(true);
                }}
                suppressHydrationWarning
                className="w-full pl-10 pr-4 py-1.5 text-xs bg-stone-100 hover:bg-stone-150/90 border border-stone-200 rounded-xl focus:outline-none focus:border-indigo-900 focus:bg-white transition-all text-stone-800 placeholder-stone-400 font-medium h-9.5 shadow-2xs"
              />
            </form>

            {/* Live Autocomplete Dropdown Menu */}
            <AnimatePresence>
              {searchDropdownOpen && searchQuery.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  className="absolute left-0 right-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-stone-100 font-sans"
                >
                  <div className="max-h-80 overflow-y-auto p-1.5 no-scrollbar space-y-1">
                    {searchLoading ? (
                      <div className="p-4 text-center text-xs text-stone-400 font-medium flex items-center justify-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin" />
                        <span>Searching database...</span>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-xs text-stone-500 font-medium">
                        No colleges found matching &quot;{searchQuery}&quot;
                      </div>
                    ) : (
                      searchResults.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            router.push(`/colleges/${c.id}`);
                            setSearchDropdownOpen(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-orange-50 active:bg-orange-100 cursor-pointer transition-colors group"
                        >
                          <img
                            src={c.image || "/images/campus-hero.jpg"}
                            alt={c.name}
                            className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/campus-hero.jpg";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-stone-900 group-hover:text-orange-600 truncate">
                              {c.name}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-0.5">
                              <span>{c.city || c.location}</span>
                              <span>•</span>
                              <span className="text-emerald-700 font-bold">{c.category || "College"}</span>
                              {c.rating && (
                                <>
                                  <span>•</span>
                                  <span className="text-amber-600 font-bold">{c.rating.toFixed(1)} ★</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      router.push(`/colleges?search=${encodeURIComponent(searchQuery.trim())}`);
                      setSearchDropdownOpen(false);
                    }}
                    className="w-full p-2.5 bg-stone-50 hover:bg-indigo-900 hover:text-white text-stone-700 text-xs font-bold transition-colors flex items-center justify-between text-left"
                  >
                    <span>View all matching results for &quot;{searchQuery}&quot;</span>
                    <span>→</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right: Compare, Save, Account */}
          <div className="flex items-center gap-4">
            {/* Compare Colleges */}
            <div className="relative group">
              <Link
                href="/compare"
                className="w-9 h-9 flex items-center justify-center text-stone-500 hover:text-indigo-900 bg-stone-50 hover:bg-indigo-50 rounded-xl border border-stone-200/60 transition-all"
              >
                <GitCompare className="w-4 h-4" />
              </Link>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-stone-900 text-stone-100 text-[10px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-md z-50">
                Compare Colleges
              </div>
            </div>

            {/* Saved Applications */}
            <div className="relative group">
              <Link
                href="/tracker"
                className="w-9 h-9 flex items-center justify-center text-stone-500 hover:text-indigo-900 bg-stone-50 hover:bg-indigo-50 rounded-xl border border-stone-200/60 transition-all"
              >
                <Bookmark className="w-4 h-4" />
              </Link>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2.5 py-1 bg-stone-900 text-stone-100 text-[10px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-md z-50">
                Saved Applications
              </div>
            </div>

            <div className="h-6 w-px bg-stone-200"></div>

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative z-[110]" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="px-3.5 py-1.5 rounded-full bg-purple-50/90 border border-purple-200/90 hover:border-[#3b2075] flex items-center gap-2 text-[#1f0c3d] font-bold text-xs cursor-pointer transition-all shadow-2xs hover:bg-purple-100/70"
                  title="Profile Settings"
                >
                  <div className="w-7 h-7 rounded-full bg-[#3b2075] text-amber-300 flex items-center justify-center font-black text-xs uppercase shadow-2xs shrink-0">
                    {user.name ? user.name.slice(0, 1).toUpperCase() : <User className="w-3.5 h-3.5 text-amber-300" />}
                  </div>
                  <span className="font-extrabold text-[#1f0c3d] text-xs max-w-[130px] truncate">
                    {user.name || user.email?.split("@")[0] || "User Account"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#3b2075] shrink-0" />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2.5 w-56 bg-white border border-stone-250 rounded-2xl shadow-xl py-3 z-[9999]"
                    >
                      <div className="px-4 pb-2.5 mb-2 border-b border-stone-100">
                        <div className="text-xs font-bold text-brand-navy truncate">{user.name}</div>
                        <div className="text-[10px] text-stone-400 mt-0.5 truncate">{user.email}</div>
                      </div>

                      <Link
                        href={getDashboardLink()}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-stone-600 hover:bg-orange-50 hover:text-orange-600 active:bg-orange-100 transition-colors"
                      >
                        <ClipboardList className="w-3.5 h-3.5 text-stone-400" />
                        Application Tracker
                      </Link>

                      <Link
                        href="/compare"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-stone-600 hover:bg-orange-50 hover:text-orange-600 active:bg-orange-100 transition-colors"
                      >
                        <GitCompare className="w-3.5 h-3.5 text-stone-400" />
                        Compare Colleges
                      </Link>

                      <button
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-stone-600 hover:bg-red-50 hover:text-red-650 transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5 text-stone-400" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <LoginModal
                triggerClassName="px-5 py-1.5 text-xs font-bold border border-indigo-900 text-indigo-900 hover:bg-indigo-50 rounded-xl transition-all h-9 inline-flex items-center justify-center cursor-pointer"
                triggerText="Login"
              />
            )}
          </div>
        </div>

        {/* ROW 2: Horizontal Navigation Bar (Theme background: solid dark emerald green / bg-indigo-900) */}
        <div className="w-full bg-indigo-900 text-white shadow-inner relative z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-11 flex items-center justify-start lg:justify-between gap-3 md:gap-4 lg:gap-5 xl:gap-6 whitespace-nowrap overflow-visible">
            {/* Home Link */}
            <Link
              href="/"
              className="flex items-center gap-1.5 text-[11px] lg:text-xs font-extrabold hover:text-orange-400 active:text-orange-400 transition-colors py-1 uppercase tracking-wider whitespace-nowrap shrink-0"
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span>Home</span>
            </Link>

            {/* Colleges Link */}
            <Link
              href="/colleges"
              className="flex items-center gap-1.5 text-[11px] lg:text-xs font-extrabold hover:text-orange-400 active:text-orange-400 transition-colors py-1 uppercase tracking-wider whitespace-nowrap shrink-0"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Colleges</span>
            </Link>

            {/* Streams Vertical Dropdown Menu */}
            <div className="relative shrink-0" ref={streamMenuRef}>
              <button
                onClick={() => setStreamDropdownOpen(!streamDropdownOpen)}
                onMouseEnter={() => setStreamDropdownOpen(true)}
                className="group flex items-center gap-1 py-1 text-[11px] lg:text-xs font-extrabold text-white hover:text-orange-400 active:text-orange-400 transition-colors cursor-pointer uppercase tracking-wider whitespace-nowrap shrink-0"
              >
                <span>Explore Streams</span>
                <ChevronDown className={`w-3 h-3 text-indigo-200 group-hover:text-orange-400 shrink-0 transition-transform duration-200 ${streamDropdownOpen ? "rotate-180 text-orange-400" : ""}`} />
              </button>

              <AnimatePresence>
                {streamDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    onMouseLeave={() => setStreamDropdownOpen(false)}
                    className="absolute left-0 mt-2 w-64 bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden z-[9999] text-stone-800 font-sans divide-y divide-stone-100"
                  >
                    {[
                      { name: "Engineering (B.E / B.Tech)", href: "/colleges?category=Engineering" },
                      { name: "Arts & Science", href: "/colleges?category=Arts+%26+Science" },
                      { name: "Medical (MBBS / BDS)", href: "/colleges?category=Medical" },
                      { name: "Management (MBA / BBA)", href: "/colleges?category=Management" },
                      { name: "Commerce (B.Com)", href: "/colleges?category=Commerce" },
                      { name: "Law (LL.B)", href: "/colleges?category=Law" },
                      { name: "Polytechnic & Diploma", href: "/colleges?category=Polytechnic" },
                      { name: "Pharmacy (B.Pharm)", href: "/colleges?category=Pharmacy" },
                      { name: "Dental Sciences", href: "/colleges?category=Dental" },
                      { name: "Nursing & Paramedical", href: "/colleges?category=Nursing" },
                      { name: "Education & B.Ed", href: "/colleges?category=Education" },
                    ].map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setStreamDropdownOpen(false)}
                        className="group flex items-center justify-between px-4 py-2.5 text-xs font-bold text-stone-700 hover:text-orange-600 hover:bg-orange-50 active:bg-orange-100 active:text-orange-600 focus:bg-orange-50 focus:text-orange-600 transition-all text-left"
                      >
                        <span className="truncate">{item.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-orange-500 group-active:text-orange-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/scholarships"
              className="flex items-center gap-1.5 text-[11px] lg:text-xs font-extrabold hover:text-orange-400 active:text-orange-400 transition-colors py-1 uppercase tracking-wider whitespace-nowrap shrink-0"
            >
              <Landmark className="w-3.5 h-3.5 shrink-0" />
              <span>Scholarships</span>
            </Link>

            <Link
              href="/exams"
              className="flex items-center gap-1.5 text-[11px] lg:text-xs font-extrabold hover:text-orange-400 active:text-orange-400 transition-colors py-1 uppercase tracking-wider whitespace-nowrap shrink-0"
            >
              <CalendarDays className="w-3.5 h-3.5 shrink-0" />
              <span>Exam Corner</span>
            </Link>

            <Link
              href="/tracker"
              className="flex items-center gap-1.5 text-[11px] lg:text-xs font-extrabold hover:text-orange-400 active:text-orange-400 transition-colors py-1 uppercase tracking-wider whitespace-nowrap shrink-0"
            >
              <ClipboardList className="w-3.5 h-3.5 shrink-0" />
              <span>Application Tracker</span>
            </Link>

            {/* AI Counselor Premium link */}
            <Link
              href="/counselor"
              className="flex items-center gap-1.5 text-[11px] lg:text-xs font-black text-orange-400 hover:text-orange-300 transition-colors py-1 uppercase tracking-wider whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-orange-400 shrink-0" />
              <span>Ask AI Counselor</span>
            </Link>

            {/* SaaS Enterprise College Registration Button */}
            <div className="shrink-0">
              <RegisterCollegeButton />
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- MOBILE LAYOUT ----------------- */}
      <div className="md:hidden max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-6">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center space-x-2 shrink-0 group">
          <img
            src="/logo.png"
            alt="C2Talents Logo"
            className="h-12 w-auto transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-stone-700 hover:text-indigo-900 p-2"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-stone-700 hover:text-indigo-900 p-2 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile search bar dropdown */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden px-4 py-3 bg-stone-50 border-b border-stone-200 space-y-2 font-sans"
          >
            <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-white border border-stone-300 rounded-xl p-1 shadow-xs">
              <Search className="w-4 h-4 text-stone-400 ml-2 shrink-0" />
              <input
                type="text"
                placeholder="Search colleges, courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                suppressHydrationWarning
                className="w-full bg-transparent px-2 py-1 text-xs outline-none text-stone-800 font-medium"
              />
            </form>

            {searchQuery.trim() && (
              <div className="bg-white border border-stone-200 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-stone-100 p-1">
                {searchLoading ? (
                  <div className="p-3 text-center text-xs text-stone-400">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="p-3 text-center text-xs text-stone-500">No colleges found</div>
                ) : (
                  searchResults.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        router.push(`/colleges/${c.id}`);
                        setSearchOpen(false);
                        setSearchQuery("");
                      }}
                      className="p-2 flex items-center gap-2 hover:bg-stone-50 rounded-lg text-xs"
                    >
                      <span className="font-bold text-stone-900 truncate">{c.name}</span>
                      <span className="text-[10px] text-stone-500 shrink-0">({c.city || c.location})</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-b border-stone-200 overflow-hidden"
          >
            <div className="px-6 py-6 space-y-4 flex flex-col">
              {/* Mobile streams links */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                  Colleges by Stream
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {megaMenuCategories.map((cat) => (
                    <Link
                      key={cat.title}
                      href={`/colleges?category=${encodeURIComponent(cat.title.split("&")[0].trim())}`}
                      onClick={() => setIsOpen(false)}
                      className="text-xs font-semibold text-stone-700 hover:text-orange-600 hover:bg-orange-50 active:bg-orange-100 active:text-orange-600 py-1.5 border border-stone-200 hover:border-orange-200 rounded-xl px-2.5 text-center bg-[#FAF9F5] shadow-2xs font-sans truncate transition-colors"
                    >
                      {cat.title}
                    </Link>
                  ))}
                </div>
              </div>

              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-2 block">
                Quick Navigation
              </span>
              <Link
                href="/colleges"
                onClick={() => setIsOpen(false)}
                className="text-[13px] font-bold text-stone-800 hover:text-orange-600 active:text-orange-600 py-2 border-b border-stone-100 transition-colors uppercase tracking-wider block flex items-center gap-2"
              >
                <Building2 className="w-4 h-4 text-amber-500" />
                <span>Colleges</span>
              </Link>
              <Link
                href="/scholarships"
                onClick={() => setIsOpen(false)}
                className="text-[13px] font-bold text-stone-700 hover:text-orange-600 active:text-orange-600 py-2 border-b border-stone-100 transition-colors uppercase tracking-wider block"
              >
                Scholarships
              </Link>
              <Link
                href="/exams"
                onClick={() => setIsOpen(false)}
                className="text-[13px] font-bold text-stone-700 hover:text-orange-600 active:text-orange-600 py-2 border-b border-stone-100 transition-colors uppercase tracking-wider block"
              >
                Exam Corner
              </Link>
              <Link
                href="/tracker"
                onClick={() => setIsOpen(false)}
                className="text-[13px] font-bold text-stone-700 hover:text-orange-600 active:text-orange-600 py-2 border-b border-stone-100 transition-colors uppercase tracking-wider block"
              >
                Application Tracker
              </Link>

              {/* Utility shortcuts */}
              <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs font-bold text-stone-500">
                <Link href="/compare" onClick={() => setIsOpen(false)} className="p-2 border border-stone-200 rounded-xl">
                  Compare Colleges
                </Link>
                <Link href="/tracker" onClick={() => setIsOpen(false)} className="p-2 border border-stone-200 rounded-xl">
                  My Applications
                </Link>
              </div>

              {/* Mobile auth & registration buttons */}
              <div className="pt-2 flex flex-col space-y-2">
                <RegisterCollegeButton onClick={() => setIsOpen(false)} className="w-full justify-center py-2.5" />
                <Link
                  href="/counselor"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center bg-indigo-900 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Ask AI Counselor
                </Link>
                {user ? (
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full text-center border border-stone-200 text-stone-600 font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
                  >
                    Logout ({user.name})
                  </button>
                ) : (
                  <div onClick={() => setIsOpen(false)} className="w-full">
                    <LoginModal
                      triggerClassName="w-full text-center border border-stone-200 text-stone-700 font-semibold py-2.5 rounded-xl text-xs block cursor-pointer"
                      triggerText="Login"
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
