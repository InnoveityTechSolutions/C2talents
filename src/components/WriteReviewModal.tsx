"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, X, Star, CheckCircle, Search, Building2, AlertCircle, Camera, Upload } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { LoginModal } from "./LoginModal";

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCollegeId?: string;
  preselectedCollegeName?: string;
}

export function WriteReviewModal({
  isOpen,
  onClose,
  preselectedCollegeId,
  preselectedCollegeName,
}: WriteReviewModalProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [colleges, setColleges] = React.useState<any[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [selectedCollege, setSelectedCollege] = React.useState<{ id: string; name: string } | null>(
    preselectedCollegeId && preselectedCollegeName
      ? { id: preselectedCollegeId, name: preselectedCollegeName }
      : null
  );

  const [rating, setRating] = React.useState(5);
  const [hoverRating, setHoverRating] = React.useState(0);
  const [content, setContent] = React.useState("");
  const [studentNameInput, setStudentNameInput] = React.useState("");
  const [courseInput, setCourseInput] = React.useState("");
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  // Auto-search colleges when query changes
  React.useEffect(() => {
    if (preselectedCollegeId && preselectedCollegeName) {
      setSelectedCollege({ id: preselectedCollegeId, name: preselectedCollegeName });
    }
  }, [preselectedCollegeId, preselectedCollegeName]);

  React.useEffect(() => {
    if (!isOpen) {
      // Reset form state on close
      setSuccess(false);
      setErrorMsg("");
      setSubmitting(false);
      return;
    }

    if (!selectedCollege) {
      // Fetch top colleges by default
      setSearching(true);
      fetch("/api/colleges?limit=10")
        .then((res) => (res.ok && res.headers.get("content-type")?.includes("application/json") ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setColleges(data);
        })
        .catch(() => {})
        .finally(() => setSearching(false));
    }
  }, [isOpen]);

  const handleSearchColleges = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      fetch("/api/colleges?limit=10")
        .then((res) => (res.ok && res.headers.get("content-type")?.includes("application/json") ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setColleges(data);
        })
        .catch(() => {});
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`/api/colleges?search=${encodeURIComponent(q.trim())}`);
      if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        if (Array.isArray(data)) setColleges(data.slice(0, 10));
      } else {
        setColleges([]);
      }
    } catch (err) {
      setColleges([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollege) {
      setErrorMsg("Please select a college to write a review for.");
      return;
    }
    if (!content.trim()) {
      setErrorMsg("Please write your review thoughts.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("c2t_token") : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/colleges/${selectedCollege.id}/reviews`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          rating,
          content,
          studentName: studentNameInput || (user as any)?.name || "Verified Student",
          course: courseInput || "Student Review",
        }),
      });

      if (!res.ok) {
        let errMessage = "Failed to submit review";
        try {
          if (res.headers.get("content-type")?.includes("application/json")) {
            const errData = await res.json();
            errMessage = errData.message || errMessage;
          }
        } catch (_) {}
        throw new Error(errMessage);
      }

      const data = await res.json();

      setSuccess(true);
      setContent("");
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while submitting review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-hidden font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg max-h-[85vh] sm:max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 z-10"
        >
          {/* Header Bar styled like dark pill theme */}
          <div className="bg-[#111827] text-white px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                <Wand2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white leading-tight">Write a Review</h2>
                <p className="text-[11px] text-stone-400 font-medium">Share your campus experience & guide fellow students</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {success ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-stone-900">Review Submitted Successfully!</h3>
                  <p className="text-xs text-stone-600 max-w-sm mx-auto">
                    Thank you for sharing your experience for {selectedCollege?.name}. Your review has been published live.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* College Selection */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                    Select College
                  </label>
                  {selectedCollege ? (
                    <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-800">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-900 shrink-0" />
                        <span className="truncate max-w-[280px]">{selectedCollege.name}</span>
                      </div>
                      {!preselectedCollegeId && (
                        <button
                          type="button"
                          onClick={() => setSelectedCollege(null)}
                          className="text-[11px] text-orange-600 hover:underline font-semibold"
                        >
                          Change
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative flex items-center">
                        <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => handleSearchColleges(e.target.value)}
                          placeholder="Search college by name..."
                          className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium outline-none focus:border-indigo-900 transition-all text-stone-800"
                        />
                      </div>

                      <div className="max-h-40 overflow-y-auto border border-stone-200 rounded-xl divide-y divide-stone-100">
                        {searching ? (
                          <div className="p-3 text-center text-xs text-stone-400">Searching colleges...</div>
                        ) : colleges.length === 0 ? (
                          <div className="p-3 text-center text-xs text-stone-400">No colleges found</div>
                        ) : (
                          colleges.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setSelectedCollege({ id: c.id, name: c.name })}
                              className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-stone-700 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center justify-between"
                            >
                              <span className="truncate">{c.name}</span>
                              <span className="text-[10px] text-stone-400 shrink-0">{c.city || c.location}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Rating Stars */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                    Overall Rating
                  </label>
                  <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 p-3 rounded-xl">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= (hoverRating || rating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-stone-300 fill-stone-200"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="ml-auto text-xs font-black text-stone-700">
                      {hoverRating || rating} / 5
                    </span>
                  </div>
                </div>

                {/* Guest User Fields */}
                {!user && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1 uppercase tracking-wider">
                        Your Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={studentNameInput}
                        onChange={(e) => setStudentNameInput(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 outline-none focus:border-indigo-900 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1 uppercase tracking-wider">
                        Course / Branch (Optional)
                      </label>
                      <input
                        type="text"
                        value={courseInput}
                        onChange={(e) => setCourseInput(e.target.value)}
                        placeholder="e.g. B.Tech CSE (2024)"
                        className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 outline-none focus:border-indigo-900 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Review Message Textarea */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                    Your Review Experience
                  </label>
                  <textarea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe academics, faculty support, campus facilities, placement opportunities, hostel life..."
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 outline-none focus:border-indigo-900 focus:bg-white transition-all resize-none"
                  />
                </div>

                {/* Optional Campus Photo / College ID Upload */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-amber-500" />
                      <span>Attach Campus Photo / ID (Optional)</span>
                    </label>
                    <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      +50 Bonus Points
                    </span>
                  </div>

                  {photoPreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-stone-200 group bg-stone-900 h-32">
                      <img src={photoPreview} alt="Campus Photo Preview" className="w-full h-full object-cover opacity-90" />
                      <div className="absolute inset-0 bg-stone-950/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => {
                            setPhotoPreview(null);
                            setPhotoFile(null);
                          }}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                        >
                          Remove Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 bg-stone-50 hover:bg-amber-50/50 border-2 border-dashed border-stone-200 hover:border-amber-400 rounded-2xl cursor-pointer transition-all text-center group">
                      <Upload className="w-6 h-6 text-stone-400 group-hover:text-amber-500 transition-colors mb-1" />
                      <span className="text-xs font-bold text-stone-700 group-hover:text-amber-700">
                        Click to Upload Campus Photo or Student ID Card
                      </span>
                      <span className="text-[10px] text-stone-400 mt-0.5">JPG, PNG or WEBP up to 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setPhotoFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setPhotoPreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !selectedCollege}
                    className="w-full py-3 bg-[#111827] hover:bg-stone-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Wand2 className="w-4 h-4 text-white" />
                    <span>{submitting ? "Submitting Review..." : "Submit Review"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
