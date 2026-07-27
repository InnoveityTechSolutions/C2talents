"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, MessageSquare } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function FloatingCounselorButton() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-40 font-sans"
        >
          <Link
            href="/counselor"
            className="flex items-center gap-2 px-5 py-3.5 bg-indigo-900 text-white rounded-full shadow-2xl hover:bg-indigo-950 transition-all hover:scale-105 group border border-indigo-800"
          >
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse shrink-0" />
            <span className="text-xs font-bold tracking-wide">
              Chat with AI Counselor
            </span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping absolute -top-0.5 -right-0.5" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
