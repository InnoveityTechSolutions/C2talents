"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SliderControlsProps {
  currentIndex: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}

export function SliderControls({
  currentIndex,
  totalSlides,
  onPrev,
  onNext,
  onSelect,
}: SliderControlsProps) {
  return (
    <>
      {/* Navigation Arrows */}
      <button
        onClick={onPrev}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 border border-white/10 text-white backdrop-blur-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={onNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-black/30 hover:bg-black/50 border border-white/10 text-white backdrop-blur-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 right-8 flex items-center gap-2.5 z-20 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/5">
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentIndex === idx
                ? "bg-[#C9A227] w-5"
                : "bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </>
  );
}
