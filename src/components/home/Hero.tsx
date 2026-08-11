"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { HeroSlider } from "./HeroSlider";
import { SearchBar } from "./SearchBar";
import { QuickCategories } from "./QuickCategories";

const TYPING_WORDS = [
  "College",
  "Engineering College",
  "Autonomous Campus",
  "University",
  "Degree & Course",
];

function TypewriterHeading() {
  const [wordIndex, setWordIndex] = React.useState(0);
  const [currentText, setCurrentText] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    const targetWord = TYPING_WORDS[wordIndex];
    // Gentle human-like typing speed (150ms per character) and smooth deleting speed (75ms per character)
    const speed = isDeleting ? 75 : 150;

    if (!isDeleting && currentText === targetWord) {
      // Hold full word clearly for 3.2 seconds before deleting
      const pauseTimeout = setTimeout(() => setIsDeleting(true), 3200);
      return () => clearTimeout(pauseTimeout);
    } else if (isDeleting && currentText === "") {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % TYPING_WORDS.length);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentText(
        isDeleting
          ? targetWord.substring(0, currentText.length - 1)
          : targetWord.substring(0, currentText.length + 1)
      );
    }, speed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, wordIndex]);

  return (
    <motion.h1
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="text-4xl sm:text-5xl md:text-6xl font-serif text-white font-bold leading-[1.2] tracking-tight drop-shadow-md min-h-[2.4em] sm:min-h-[2em] flex flex-wrap items-center justify-center gap-x-3"
    >
      <span>Find the Right</span>
      <span className="text-[#C9A227] font-sans font-extrabold border-b-2 border-[#C9A227]/40 pb-0.5 inline-flex items-center">
        {currentText}
        <span className="text-[#C9A227] animate-pulse font-light ml-1 text-4xl sm:text-5xl">|</span>
      </span>
      <span>for Your Future</span>
    </motion.h1>
  );
}

export function Hero() {
  return (
    <div className="relative w-full bg-white pb-0">
      {/* 1. Main Background Slider */}
      <HeroSlider>
        {/* Centered Overlay Content inside the Slider container */}
        <div className="text-center space-y-6 max-w-4xl mx-auto w-full">
          {/* Typing Animated Heading */}
          <div className="animate-load-hero">
            <TypewriterHeading />
          </div>

          {/* Subtitle */}
          <div className="animate-load-left">
            <p className="text-stone-200 font-sans text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-normal">
              Search, compare and discover the best colleges, courses, scholarships and placements across India with AI-powered guidance. Join over{" "}
              <span className="text-[#C9A227] font-bold border-b border-[#C9A227]/30 pb-0.5">
                25,000+
              </span>{" "}
              students who found their perfect match.
            </p>
          </div>

          {/* Search Box Component */}
          <div className="animate-load-search pt-2">
            <SearchBar />
          </div>

          {/* Quick Categories pills */}
          <div className="animate-load-badge pt-2">
            <QuickCategories />
          </div>
        </div>
      </HeroSlider>
    </div>
  );
}
