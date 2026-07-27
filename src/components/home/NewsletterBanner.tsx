"use client";

import * as React from "react";
import { Mail } from "lucide-react";

export function NewsletterBanner() {
  const [email, setEmail] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    alert(`Subscribed! Updates will be sent to ${email}`);
    setEmail("");
  };

  return (
    <section className="py-12 px-6 bg-[#FAF9F5]/40 border-b border-stone-200/40 font-sans">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Text */}
        <div className="space-y-1 text-center md:text-left">
          <h3 className="font-serif text-lg font-bold text-brand-navy flex items-center justify-center md:justify-start gap-2">
            <Mail className="w-4.5 h-4.5 text-indigo-900" />
            <span>Stay Updated on Admissions 2026</span>
          </h3>
          <p className="text-xs text-stone-500">
            Get instant cutoff warnings, application deadline alerts, and counselling guides directly in your inbox.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex items-center bg-white border border-stone-200/80 rounded-xl p-1 w-full md:w-auto max-w-md shadow-sm focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all duration-300">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-transparent px-3 py-2 text-xs outline-none text-stone-900 placeholder-stone-400 min-w-[200px]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
