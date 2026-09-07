"use client";

import * as React from "react";
import { Landmark, Network, BookOpen, Users } from "lucide-react";
import { motion } from "framer-motion";

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  isTriggered: boolean;
  duration?: number;
}

function AnimatedCounter({ target, suffix = "+", isTriggered, duration = 2000 }: AnimatedCounterProps) {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!isTriggered) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easeOutCubic curve
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easedProgress * target);

      setCount(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isTriggered, target, duration]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const stats = [
  {
    icon: Landmark,
    target: 500,
    suffix: "+",
    label: "Colleges",
  },
  {
    icon: Network,
    target: 111,
    suffix: "+",
    label: "Departments",
  },
  {
    icon: BookOpen,
    target: 300,
    suffix: "+",
    label: "Programs",
  },
  {
    icon: Users,
    target: 25000,
    suffix: "+",
    label: "Students Guided",
  },
];

export function CareerExcellenceBanner() {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = React.useState(false);

  React.useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 px-6 font-sans text-white overflow-hidden"
    >
      {/* Background Image with Intelligent Selective Lighting & Radial Gradient Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="/images/arts-science.jpg"
          alt="Students Learning"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-[center_25%] brightness-[1.12] contrast-[1.08] saturate-[1.18] transition-all duration-700"
        />
        
        {/* Soft Blue Base Tone (Preserves natural skin tones & face clarity) */}
        <div className="absolute inset-0 bg-[#0a2754]/30" />

        {/* Radial Spotlight Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_62%_28%,_transparent_10%,_rgba(10,39,84,0.55)_65%,_rgba(6,29,66,0.85)_100%)]" />

        {/* Vertical Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#061c40]/95 via-[#092857]/45 via-60% to-[#09244d]/50" />
      </div>

      <div className="max-w-6xl mx-auto space-y-10 relative z-10 text-center">
        {/* Main Title */}
        <motion.h2
          initial={{ opacity: 0, y: -16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1.0] }}
          className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight drop-shadow-md"
        >
          Learning for Career Excellence
        </motion.h2>

        {/* 4 Stat Columns with Gold/Orange Icons & Animated Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-end pt-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={{
                  duration: 0.6,
                  delay: 0.15 * index,
                  ease: [0.25, 0.1, 0.25, 1.0],
                }}
                className="space-y-3 flex flex-col items-center group cursor-default"
              >
                {/* Gold/Orange Icon */}
                <div className="w-14 h-14 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:text-amber-300 transition-transform duration-300">
                  <Icon className="w-10 h-10 text-amber-400 drop-shadow" />
                </div>
                {/* Large White Number with Count-Up Animation */}
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md min-h-[3.5rem] flex items-center justify-center font-mono">
                  <AnimatedCounter
                    target={stat.target}
                    suffix={stat.suffix}
                    isTriggered={isInView}
                    duration={2000}
                  />
                </div>
                {/* Label below */}
                <div className="text-xs sm:text-sm text-blue-100 font-semibold tracking-wide uppercase">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Center White Notch Indicator */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[14px] border-t-white z-20" />
    </section>
  );
}
