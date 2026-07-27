"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function ScrollToTopButton() {
  const [visible, setVisible] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let ticked = false;

    const handleScroll = () => {
      if (!ticked) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

          setProgress(pct);
          setVisible(scrollTop > 300);

          ticked = false;
        });
        ticked = true;
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Circumference of r=18 circle is 2 * pi * 18 = 113.097
  const circumference = 113.097;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 15 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-[88px] right-6 z-40 font-sans"
        >
          <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="relative flex items-center justify-center w-12 h-12 bg-white text-indigo-900 rounded-full shadow-2xl hover:scale-105 transition-transform border border-stone-200/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer group"
          >
            {/* Circular Progress Indicator */}
            <svg viewBox="0 0 48 48" className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="#e7e5e4"
                strokeWidth="3"
                fill="none"
              />
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="#312e81"
                strokeWidth="3"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-[stroke-dashoffset] duration-75"
              />
            </svg>

            {/* Icon */}
            <ArrowUp className="w-5 h-5 relative z-10 transition-transform group-hover:-translate-y-0.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
