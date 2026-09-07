"use client";

import * as React from "react";
import { Mail, Smartphone, CheckCircle2, Sparkles, Send, BellRing } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function NewsletterBanner() {
  const [email, setEmail] = React.useState("");
  const [mobile, setMobile] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  const [focusedInput, setFocusedInput] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !mobile) return;
    setSubmitted(true);
    setTimeout(() => {
      setEmail("");
      setMobile("");
      setSubmitted(false);
    }, 4500);
  };

  return (
    <section className="relative py-16 px-6 overflow-hidden bg-gradient-to-b from-[#FFFDF9] via-[#FFF5EC] to-[#FFFDF9] font-sans">
      {/* Background Animated Ambient Warm Orange Lights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-80 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.4, 0.65, 0.4],
            x: [0, 15, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-10 left-1/4 w-72 h-72 bg-orange-300/35 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.35, 0.6, 0.35],
            x: [0, -20, 0],
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-10 right-1/4 w-80 h-80 bg-amber-400/30 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-gradient-to-br from-white via-[#FFF8F2] to-[#FFF2E6] backdrop-blur-xl border border-orange-200/80 rounded-3xl p-8 md:p-12 shadow-[0_20px_50px_rgba(234,88,12,0.09),0_1px_3px_rgba(0,0,0,0.03)] space-y-7 text-center overflow-hidden"
        >
          {/* Subtle top border glowing orange accent bar */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#amber-500]" />

          {/* Floating Category Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/90 text-orange-950 border border-orange-200/90 text-[11px] font-extrabold uppercase tracking-wider shadow-2xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ea580c] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ea580c]"></span>
            </span>
            <BellRing className="w-3.5 h-3.5 text-[#ea580c]" />
            <span>Instant Admission Alerts</span>
          </motion.div>

          {/* Header Section */}
          <div className="space-y-3 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#24104F] tracking-tight leading-tight">
              Subscribe for Student Enquiries &{" "}
              <span className="bg-gradient-to-r from-[#ea580c] via-[#f97316] to-[#d97706] bg-clip-text text-transparent drop-shadow-xs">
                Admissions 2026
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 font-sans leading-relaxed">
              Get the latest insights, cutoffs, news & counselling updates directly from C2Talents.
            </p>
          </div>

          {/* Success Alert Banner */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3 rounded-2xl text-xs font-semibold shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 animate-bounce" />
                <span>Thank you! Your enquiry subscription has been registered successfully.</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dual Input Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row items-center justify-center gap-3.5 max-w-2xl mx-auto pt-2"
          >
            {/* Email Input */}
            <motion.div
              animate={{ scale: focusedInput === "email" ? 1.02 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative w-full md:w-1/2"
            >
              <div
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                  focusedInput === "email" ? "text-[#ea580c]" : "text-stone-400"
                }`}
              >
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onFocus={() => setFocusedInput("email")}
                onBlur={() => setFocusedInput(null)}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 bg-white/90 hover:bg-white focus:bg-white border border-orange-200/90 focus:border-[#ea580c] rounded-2xl text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-orange-500/15 transition-all duration-200 shadow-2xs"
              />
            </motion.div>

            {/* Mobile Number Input */}
            <motion.div
              animate={{ scale: focusedInput === "mobile" ? 1.02 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative w-full md:w-1/2"
            >
              <div
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                  focusedInput === "mobile" ? "text-[#ea580c]" : "text-stone-400"
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                placeholder="Enter your mobile number"
                value={mobile}
                onFocus={() => setFocusedInput("mobile")}
                onBlur={() => setFocusedInput(null)}
                onChange={(e) => setMobile(e.target.value)}
                pattern="[0-9]{10}"
                className="w-full pl-11 pr-4 py-3.5 bg-white/90 hover:bg-white focus:bg-white border border-orange-200/90 focus:border-[#ea580c] rounded-2xl text-xs font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-orange-500/15 transition-all duration-200 shadow-2xs"
              />
            </motion.div>

            {/* Subscribe CTA Button */}
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              type="submit"
              className="group relative w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 shrink-0 cursor-pointer overflow-hidden flex items-center justify-center gap-2"
            >
              {/* Shine Sweep Effect */}
              <div className="absolute inset-0 w-1/2 h-full bg-white/25 skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out" />
              
              <span>Subscribe</span>
              <Send className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

