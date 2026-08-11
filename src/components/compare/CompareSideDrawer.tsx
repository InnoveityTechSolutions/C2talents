"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, ArrowRight, Scale, Trash2, ChevronRight, ChevronLeft, MapPin, Star, Building } from "lucide-react";
import { useCompare } from "@/context/CompareContext";

export function CompareSideDrawer() {
  const { selectedColleges, removeCollege, clearCompare, isOpen, setIsOpen } = useCompare();
  const router = useRouter();

  if (selectedColleges.length === 0) {
    return null;
  }

  const compareUrl = `/compare?ids=${selectedColleges.map((c) => c.id).join(",")}`;

  return (
    <>
      {/* Minimized Toggle Button on Right Edge when closed */}
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setIsOpen(true)}
          className="fixed right-0 bottom-24 z-40 flex items-center gap-2 bg-[#2e266f] text-white px-3.5 py-2.5 rounded-l-2xl shadow-2xl hover:bg-indigo-900 transition-all border-l-2 border-amber-400 group cursor-pointer"
        >
          <Scale className="w-4 h-4 text-amber-400 animate-pulse" />
          <div className="flex flex-col items-start leading-none pr-1">
            <span className="text-[10px] font-black tracking-wide uppercase">Compare</span>
            <span className="text-[9px] font-bold text-amber-300 mt-0.5">
              {selectedColleges.length} {selectedColleges.length === 1 ? "Item" : "Items"}
            </span>
          </div>
          <ChevronLeft className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-transform group-hover:-translate-x-0.5" />
        </motion.button>
      )}

      {/* Expanded Right Side Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 360 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 360 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm sm:w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-stone-200/80 font-sans"
          >
            {/* Header */}
            <div className="bg-[#2e266f] text-white p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10 border border-white/10 text-amber-400">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white tracking-tight">Compare Colleges</h3>
                    <span className="text-[10px] font-black bg-amber-400 text-stone-900 px-2 py-0.5 rounded-full">
                      {selectedColleges.length} / 4
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-300 font-medium mt-0.5">
                    Selected for comparison
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Collapse panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* List of Selected Colleges */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF9F5]/60">
              {selectedColleges.map((college) => (
                <motion.div
                  key={college.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative bg-white border border-stone-200/90 rounded-xl p-3 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex gap-3 items-center"
                >
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-100">
                    <img
                      src={college.image || "/images/campus-hero.jpg"}
                      alt={college.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/campus-hero.jpg";
                      }}
                    />
                  </div>

                  {/* College Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-bold text-stone-900 truncate leading-snug group-hover:text-indigo-900 transition-colors">
                      {college.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-stone-500 font-medium">
                      <span className="flex items-center gap-0.5 truncate">
                        <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                        {college.location}
                      </span>
                      <span className="flex items-center gap-0.5 text-amber-600 font-bold shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {college.rating?.toFixed(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-bold text-stone-600">
                      <span>₹{(college.feesPerYear / 100000).toFixed(1)}L/yr</span>
                      <span className="text-stone-300">•</span>
                      <span className="text-emerald-700">{college.avgPackage} LPA</span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeCollege(college.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                    title="Remove from comparison"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}

              {/* Add More Slot / Prompt if under 4 */}
              {selectedColleges.length < 4 && (
                <Link
                  href="/colleges"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-stone-200 hover:border-indigo-400 hover:bg-purple-50/40 text-stone-500 hover:text-indigo-900 transition-all text-xs font-bold group cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-stone-100 group-hover:bg-indigo-100 flex items-center justify-center text-stone-400 group-hover:text-indigo-900 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <span>Add Another College ({4 - selectedColleges.length} remaining)</span>
                </Link>
              )}
            </div>

            {/* Footer Action Bar */}
            <div className="p-4 bg-white border-t border-stone-200 space-y-2.5">
              <button
                onClick={() => {
                  router.push(compareUrl);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#2e266f] hover:bg-indigo-950 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer group"
              >
                <span>Compare {selectedColleges.length} Colleges Now</span>
                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={clearCompare}
                  className="flex items-center gap-1 text-[11px] font-extrabold text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear Selection</span>
                </button>

                <Link
                  href="/colleges"
                  onClick={() => setIsOpen(false)}
                  className="text-[11px] font-bold text-indigo-900 hover:underline"
                >
                  Browse Directory
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
