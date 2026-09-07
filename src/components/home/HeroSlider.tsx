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

export function HeroSlider({ slides: initialSlides, children }: HeroSliderProps) {
  const [activeSlides, setActiveSlides] = React.useState<SlideData[]>(
    initialSlides && initialSlides.length > 0 ? initialSlides : DEFAULT_SLIDES
  );
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Dynamic Fetching from Database (/api/header-images)
  React.useEffect(() => {
    if (initialSlides && initialSlides.length > 0) return;

    let isMounted = true;
    async function loadDynamicHeaderImages() {
      try {
        const res = await fetch("/api/header-images");
        if (!res.ok) return;
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.images) && data.images.length > 0) {
          const dbSlides: SlideData[] = data.images.map((img: any) => ({
            image: img.imageUrl,
            collegeName: img.title || "C2Talents Hero Banner",
            city: "Tamil Nadu, India",
            tagline: img.description || "Discover premier colleges, courses, and scholarships.",
            exploreUrl: "/colleges",
            applyUrl: "/register-college",
          }));
          if (isMounted) {
            setActiveSlides(dbSlides);
            setCurrentIndex(0);
          }
        }
      } catch (err) {
        console.error("Failed to load dynamic header images:", err);
      }
    }

    loadDynamicHeaderImages();

    return () => {
      isMounted = false;
    };
  }, [initialSlides]);

  React.useEffect(() => {
    if (activeSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const handlePrev = () => {
    if (activeSlides.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleNext = () => {
    if (activeSlides.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const currentSlide = activeSlides[currentIndex] || DEFAULT_SLIDES[0];

  return (
    <div className="relative w-full h-[460px] sm:h-[480px] md:h-[470px] lg:h-[490px] min-h-[420px] max-h-[520px] overflow-visible flex items-center bg-stone-950">
      {/* Edge-to-Edge Full-Width Hero Background Image with Color & Vibrancy Enhancement */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden bg-stone-900 rounded-b-3xl">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Color & Clarity Enhanced Campus Photography */}
            <img
              src={currentSlide.image}
              alt={currentSlide.collegeName}
              loading="eager"
              // @ts-ignore
              fetchPriority="high"
              className="w-full h-full object-cover object-center filter brightness-[1.05] contrast-[1.08] saturate-[1.20] transition-all duration-700"
            />
          </motion.div>
        </AnimatePresence>

        {/* Balanced Professional Gradient Scrim (Vibrant image + clear text readability) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0722]/85 via-[#190c38]/35 to-black/40 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(26,12,58,0.45)_0%,rgba(15,8,38,0.15)_60%,transparent_100%)] pointer-events-none z-10" />
      </div>

      {/* Floating Center Search & Main Overlay Content */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 flex flex-col justify-center items-center h-full py-6 md:py-8">
        {children}
      </div>

      <SliderControls
        currentIndex={currentIndex}
        totalSlides={activeSlides.length}
        onPrev={handlePrev}
        onNext={handleNext}
        onSelect={setCurrentIndex}
      />
    </div>
  );
}
