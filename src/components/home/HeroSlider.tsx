"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SliderControls } from "./SliderControls";

export interface SlideData {
  image: string;
  collegeName: string;
  city: string;
  tagline: string;
  exploreUrl: string;
  applyUrl: string;
}

const DEFAULT_SLIDES: SlideData[] = [
  {
    image: "/images/anna.jpg",
    collegeName: "Anna University",
    city: "Chennai, Tamil Nadu",
    tagline: "Premier public state university known for engineering and technological research.",
    exploreUrl: "/colleges/anna-university",
    applyUrl: "/colleges/anna-university#apply",
  },
  {
    image: "/images/mcc.png",
    collegeName: "Madras Christian College (MCC)",
    city: "Chennai, Tamil Nadu",
    tagline: "A historic institution offering excellence in arts, science, and commerce.",
    exploreUrl: "/colleges/mcc-chennai",
    applyUrl: "/colleges/mcc-chennai#apply",
  },
  {
    image: "/images/srm.png",
    collegeName: "SRM Institute of Science and Technology",
    city: "Kattankulathur, Tamil Nadu",
    tagline: "Top private institution with world-class infrastructure and global placements.",
    exploreUrl: "/colleges/srm-chennai",
    applyUrl: "/colleges/srm-chennai#apply",
  },
  {
    image: "/images/vit.png",
    collegeName: "VIT Vellore",
    city: "Vellore, Tamil Nadu",
    tagline: "Nationally recognized university driving innovation in engineering education.",
    exploreUrl: "/colleges/vit-vellore",
    applyUrl: "/colleges/vit-vellore#apply",
  },
  {
    image: "/images/psg.png",
    collegeName: "PSG College of Technology",
    city: "Coimbatore, Tamil Nadu",
    tagline: "Industry-aligned education with a strong legacy of successful alumni.",
    exploreUrl: "/colleges/psg-tech",
    applyUrl: "/colleges/psg-tech#apply",
  },
  {
    image: "/images/loyola-college.png",
    collegeName: "Loyola College",
    city: "Chennai, Tamil Nadu",
    tagline: "Renowned for Jesuit-guided holistic education, arts, and scientific research.",
    exploreUrl: "/colleges/loyola-chennai",
    applyUrl: "/colleges/loyola-chennai#apply",
  },
  {
    image: "/images/ssn.png",
    collegeName: "SSN College of Engineering",
    city: "Kalavakkam, Tamil Nadu",
    tagline: "State-of-the-art campus fostering merit-driven tech leaders.",
    exploreUrl: "/colleges/ssn-chennai",
    applyUrl: "/colleges/ssn-chennai#apply",
  },
  {
    image: "/images/slider-1.jpg",
    collegeName: "SASTRA University",
    city: "Thanjavur, Tamil Nadu",
    tagline: "Leading research university offering integrated academic programs.",
    exploreUrl: "/colleges/sastra-thanjavur",
    applyUrl: "/colleges/sastra-thanjavur#apply",
  },
];

interface HeroSliderProps {
  slides?: SlideData[];
  children?: React.ReactNode; // For the search overlays and text
}

export function HeroSlider({ slides = DEFAULT_SLIDES, children }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full h-[85vh] overflow-hidden flex items-center bg-stone-950">
      {/* Background Images with Fade & Ken Burns Zoom */}
      <div className="absolute inset-0 z-0 select-none">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1.02 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={currentSlide.image}
              alt={currentSlide.collegeName}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* 55% dark overlay for readability */}
        <div className="absolute inset-0 bg-black/55 z-10" />
      </div>

      {/* Floating Center Search & Main Overlay Content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-center h-full pt-28 pb-16">
        {children}
      </div>

      <SliderControls
        currentIndex={currentIndex}
        totalSlides={slides.length}
        onPrev={handlePrev}
        onNext={handleNext}
        onSelect={setCurrentIndex}
      />
    </div>
  );
}
