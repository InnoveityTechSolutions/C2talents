"use client";

import * as React from "react";
import { Mail, Smartphone, CheckCircle2 } from "lucide-react";

export function NewsletterBanner() {
  const [email, setEmail] = React.useState("");
  const [mobile, setMobile] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !mobile) return;
    setSubmitted(true);
    setTimeout(() => {
      setEmail("");
      setMobile("");
      setSubmitted(false);
    }, 4000);
  };

  return (
    <section className="py-14 px-6 bg-[#FAF9F5]/60 border-b border-stone-200/40 font-sans">
      <div className="max-w-4xl mx-auto bg-white border border-stone-200/80 rounded-2xl p-8 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6 text-center">
        {/* Header Section */}
        <div className="space-y-2 max-w-xl mx-auto">
          <h3 className="text-xl md:text-2xl font-serif font-bold text-[#1f0c3d] tracking-tight">
            Subscribe for Student Enquiries & Admissions 2026
          </h3>
          <p className="text-xs md:text-sm text-stone-500 font-sans">
            Get the latest insights, cutoffs, news & counselling updates from C2Talents.
          </p>
        </div>

        {/* Success Alert Banner */}
        {submitted && (
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Thank you! Your enquiry subscription has been registered.</span>
          </div>
        )}

        {/* Dual Input Form matching Image 2 reference layout */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row items-center justify-center gap-3 max-w-2xl mx-auto pt-2"
        >
          {/* Email Input */}
          <div className="relative w-full md:w-1/2">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200/90 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#3b2075] focus:ring-2 focus:ring-purple-100 transition-all shadow-2xs"
            />
          </div>

          {/* Mobile Number Input */}
          <div className="relative w-full md:w-1/2">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              placeholder="Enter your mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              pattern="[0-9]{10}"
              className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200/90 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#3b2075] focus:ring-2 focus:ring-purple-100 transition-all shadow-2xs"
            />
          </div>

          {/* Subscribe CTA Button */}
          <button
            type="submit"
            className="w-full md:w-auto px-7 py-3 bg-[#3b2075] hover:bg-[#2d1659] active:bg-[#1f0c3d] text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md transition-all duration-200 shrink-0 cursor-pointer"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
