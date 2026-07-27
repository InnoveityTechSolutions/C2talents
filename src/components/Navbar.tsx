"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Sparkles, LogOut, User, ChevronDown, Search, GitCompare, Bookmark, 
  Menu, X, Landmark, Compass, CalendarDays, ClipboardList
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/AuthProvider";
import { LoginModal } from "./LoginModal";
import { useRouter } from "next/navigation";

const streams = [
  { name: "Engineering", href: "/colleges?stream=engineering" },
  { name: "Management", href: "/colleges?stream=management" },
  { name: "Medical", href: "/colleges?stream=medical" },
  { name: "Arts", href: "/colleges?stream=arts" },
  { name: "Commerce", href: "/colleges?stream=commerce" },
  { name: "Law", href: "/colleges?stream=law" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [streamDropdownOpen, setStreamDropdownOpen] = React.useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const router = useRouter();
  const { user, logout } = useAuth();

  const profileMenuRef = React.useRef<HTMLDivElement>(null);
  const streamMenuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (streamMenuRef.current && !streamMenuRef.current.contains(event.target as Node)) {
        setStreamDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/colleges?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getDashboardLink = () => {
    if (!user) return "/";
    if (user.role === "STUDENT") return "/tracker";
    return "/";
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 font-sans border-b border-stone-200/40 shadow-sm",
        scrolled
          ? "bg-white/95 backdrop-blur-md"
          : "bg-[#FAF9F5]/95 backdrop-blur-md"
      )}
    >
      {/* ----------------- DESKTOP LAYOUT (2 ROWS) ----------------- */}
      <div className="hidden md:block">
        {/* ROW 1: Search, Logo, Actions */}
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6 relative">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0 group">
            <img
              src="/logo.png"
              alt="C2Talents Logo"
              className="h-15 w-auto transition-transform duration-300 group-hover:scale-[1.03]"
            />
          </Link>

          {/* Center: Search Box */}
          <form onSubmit={handleSearchSubmit} className="absolute left-1/2 -translate-x-1/2 w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search colleges, courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-1.5 text-xs bg-stone-150/80 border border-stone-200 rounded-xl focus:outline-none focus:border-indigo-900 focus:bg-white transition-all text-stone-700 placeholder-stone-400 font-medium h-9"
            />
          </form>

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
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200 hover:border-indigo-900 flex items-center justify-center text-indigo-900 font-bold text-xs uppercase cursor-pointer transition-all shadow-sm"
                  title="Profile Settings"
                >
                  {user.name ? user.name.slice(0, 2) : <User className="w-4 h-4" />}
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2.5 w-56 bg-white border border-stone-250 rounded-2xl shadow-xl py-3 z-50"
                    >
                      <div className="px-4 pb-2.5 mb-2 border-b border-stone-100">
                        <div className="text-xs font-bold text-brand-navy truncate">{user.name}</div>
                        <div className="text-[10px] text-stone-400 mt-0.5 truncate">{user.email}</div>
                      </div>

                      <Link
                        href={getDashboardLink()}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 hover:text-indigo-900 transition-colors"
                      >
                        <ClipboardList className="w-3.5 h-3.5 text-stone-400" />
                        Application Tracker
                      </Link>

                      <Link
                        href="/compare"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 hover:text-indigo-900 transition-colors"
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
        <div className="w-full bg-indigo-900 text-white shadow-inner">
          <div className="max-w-7xl mx-auto px-6 h-11 flex items-center justify-center gap-9">
            {/* Home Link */}
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs font-bold hover:text-indigo-200 transition-colors py-1 uppercase tracking-wider"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>

            {/* Streams Dropdown Link */}
            <div className="relative" ref={streamMenuRef}>
              <button
                onClick={() => setStreamDropdownOpen(!streamDropdownOpen)}
                onMouseEnter={() => setStreamDropdownOpen(true)}
                className="flex items-center gap-1 py-1 text-xs font-bold text-white hover:text-indigo-200 transition-colors cursor-pointer uppercase tracking-wider"
              >
                <span>Explore Streams</span>
                <ChevronDown className="w-3 h-3 text-indigo-200" />
              </button>
              <AnimatePresence>
                {streamDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    onMouseLeave={() => setStreamDropdownOpen(false)}
                    className="absolute left-1/2 -translate-x-1/2 mt-1 w-48 bg-white border border-stone-200 rounded-xl shadow-xl py-1.5 z-50 text-stone-700"
                  >
                    {streams.map((stream) => (
                      <Link
                        key={stream.name}
                        href={stream.href}
                        onClick={() => setStreamDropdownOpen(false)}
                        className="block px-4 py-2 text-xs font-bold text-stone-650 hover:bg-indigo-50 hover:text-indigo-900 transition-all text-left uppercase tracking-wider"
                      >
                        {stream.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/scholarships"
              className="flex items-center gap-1.5 text-xs font-bold hover:text-indigo-200 transition-colors py-1 uppercase tracking-wider"
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Scholarships</span>
            </Link>

            <Link
              href="/exams"
              className="flex items-center gap-1.5 text-xs font-bold hover:text-indigo-200 transition-colors py-1 uppercase tracking-wider"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Exam Corner</span>
            </Link>

            <Link
              href="/tracker"
              className="flex items-center gap-1.5 text-xs font-bold hover:text-indigo-200 transition-colors py-1 uppercase tracking-wider"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Application Tracker</span>
            </Link>

            {/* AI Counselor Premium link */}
            <Link
              href="/counselor"
              className="flex items-center gap-1.5 text-xs font-bold text-amber-305 hover:text-amber-200 transition-colors py-1 uppercase tracking-wider"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Ask AI Counselor</span>
            </Link>
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
            className="md:hidden px-6 py-3 bg-stone-50 border-b border-stone-200"
          >
            <form onSubmit={handleSearchSubmit} className="relative flex items-center bg-white border border-stone-300 rounded-xl p-1">
              <Search className="w-4 h-4 text-stone-400 ml-2" />
              <input
                type="text"
                placeholder="Search colleges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-2 py-1 text-xs outline-none text-stone-800"
              />
            </form>
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
                  {streams.map((stream) => (
                    <Link
                      key={stream.name}
                      href={stream.href}
                      onClick={() => setIsOpen(false)}
                      className="text-xs font-semibold text-stone-600 hover:text-indigo-900 py-1.5 border border-stone-100 rounded-lg px-2 text-center bg-[#FAF9F5]"
                    >
                      {stream.name}
                    </Link>
                  ))}
                </div>
              </div>

              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mt-2 block">
                Quick Navigation
              </span>
              <Link
                href="/scholarships"
                onClick={() => setIsOpen(false)}
                className="text-[13px] font-bold text-stone-700 hover:text-indigo-900 py-2 border-b border-stone-100 transition-colors uppercase tracking-wider block"
              >
                Scholarships
              </Link>
              <Link
                href="/exams"
                onClick={() => setIsOpen(false)}
                className="text-[13px] font-bold text-stone-700 hover:text-indigo-900 py-2 border-b border-stone-100 transition-colors uppercase tracking-wider block"
              >
                Exam Corner
              </Link>
              <Link
                href="/tracker"
                onClick={() => setIsOpen(false)}
                className="text-[13px] font-bold text-stone-700 hover:text-indigo-900 py-2 border-b border-stone-100 transition-colors uppercase tracking-wider block"
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

              {/* Mobile auth buttons */}
              <div className="pt-2 flex flex-col space-y-2">
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
