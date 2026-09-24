"use client";

import * as React from "react";
import Link from "next/link";
import { Home, Search, ArrowRight, Compass } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-80px)] bg-[#090e24] flex items-center justify-center px-6 py-16 font-sans">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16">
          {/* Left: Oops Illustration */}
          <div className="flex-shrink-0">
            <img
              src="/images/no-colleges-found.jpg"
              alt="404 - Page not found"
              className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 object-contain drop-shadow-2xl select-none"
              draggable={false}
            />
          </div>

          {/* Right: Text & Actions */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-5 max-w-lg">
            <p
              className="text-7xl sm:text-8xl md:text-9xl font-black text-white leading-none tracking-tight"
              style={{ fontFamily: "serif" }}
            >
              404
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug">
              Sorry, the page you&apos;re looking for doesn&apos;t exist
            </h1>
            <p className="text-sm sm:text-base text-white/70 font-medium leading-relaxed">
              The link you followed may be broken or the page may have been moved or deleted.
            </p>

            <div className="flex flex-wrap gap-3.5 pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-extrabold border border-white/25 transition-all tracking-wider uppercase cursor-pointer"
              >
                <Home className="w-4 h-4" /> Home
              </Link>
              <Link
                href="/colleges"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-extrabold transition-all tracking-wider uppercase shadow-lg hover:shadow-orange-500/25 cursor-pointer"
              >
                <Compass className="w-4 h-4" /> Explore Colleges <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
