"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin, Star, Award, Shield, CheckCircle, ArrowRight,
  BookOpen, TrendingUp, Users, Building2, MessageSquare,
  ChevronLeft, CalendarDays, IndianRupee
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/providers/AuthProvider";
import { LoginModal } from "./LoginModal";

interface Props {
  college: any;
}

const TABS = ["Overview", "Courses & Fees", "Placements", "Reviews", "Apply"];

function formatINR(amount: number) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${Math.round(amount / 1000)}K`;
  return `₹${amount}`;
}

export function CollegeDetailClient({ college }: Props) {
  const [activeTab, setActiveTab] = React.useState("Overview");
  const [reviewText, setReviewText] = React.useState("");
  const [reviewRating, setReviewRating] = React.useState(5);
  const [submitting, setSubmitting] = React.useState(false);
  const [reviewSuccess, setReviewSuccess] = React.useState(false);
  const { user } = useAuth();

  const placementChartData = college.placements.map((p: any) => ({
    year: p.year,
    avg: p.averageCtc,
    highest: p.highestCtc,
  }));

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/colleges/${college.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: reviewRating, content: reviewText }),
      });
      if (res.ok) {
        setReviewSuccess(true);
        setReviewText("");
      }
    } catch {}
    finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-xs text-stone-500">
          <Link href="/" className="hover:text-brand-green">Home</Link>
          <span>/</span>
          <Link href="/colleges" className="hover:text-brand-green">Colleges</Link>
          <span>/</span>
          <span className="text-stone-800 font-semibold">{college.name}</span>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-64 md:h-80 bg-stone-200 overflow-hidden">
        <img
          src={college.image}
          alt={college.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/campus-hero.jpg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-3">
              {college.naacGrade && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500 text-white">
                  NAAC {college.naacGrade}
                </span>
              )}
              {college.nirfRank && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-green text-white">
                  NIRF Rank #{college.nirfRank}
                </span>
              )}
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${college.type === "Government" ? "bg-blue-600 text-white" : "bg-stone-700 text-white"}`}>
                {college.type}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{college.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-stone-300 text-sm">
              <MapPin className="w-4 h-4" />
              {college.location}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Sub Nav */}
      <div className="bg-white border-b border-stone-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex overflow-x-auto gap-1 no-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab}
                id={`tab-${tab.toLowerCase().replace(/ /g, "-")}`}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-4 text-[13px] font-semibold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab
                    ? "border-brand-green text-brand-green"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">

            {/* Overview Tab */}
            {activeTab === "Overview" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
                  <h2 className="text-lg font-bold text-stone-900">About {college.name}</h2>
                  <p className="text-sm text-stone-600 leading-relaxed">{college.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-stone-100">
                    {[
                      { label: "Annual Fee", value: formatINR(college.feesPerYear), icon: <IndianRupee className="w-4 h-4 text-brand-green" /> },
                      { label: "Avg Package", value: `${college.avgPackage} LPA`, icon: <TrendingUp className="w-4 h-4 text-blue-500" /> },
                      { label: "Highest CTC", value: `${college.highestPackage} LPA`, icon: <Award className="w-4 h-4 text-amber-500" /> },
                      { label: "Rating", value: college.rating.toFixed(1) + " / 5", icon: <Star className="w-4 h-4 text-amber-500" /> },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-stone-50 rounded-xl p-4 text-center">
                        <div className="flex justify-center mb-2">{stat.icon}</div>
                        <div className="text-lg font-extrabold text-stone-900">{stat.value}</div>
                        <div className="text-[11px] text-stone-500 font-semibold mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Verified Data Notice */}
                <div className="flex items-start gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800">
                  <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Verified Data</strong> — Fees and placement figures sourced from official NIRF disclosures.{" "}
                    <span className="text-emerald-600 text-xs">Last updated: July 2026</span>
                  </span>
                </div>
              </motion.div>
            )}

            {/* Courses & Fees Tab */}
            {activeTab === "Courses & Fees" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h2 className="text-lg font-bold text-stone-900">Courses Offered & Fee Structure</h2>
                <div className="space-y-3">
                  {college.courses.map((c: any) => (
                    <div key={c.id} className="bg-white border border-stone-200 rounded-xl p-5 hover-card-trigger">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="font-bold text-stone-900 text-[15px]">{c.title}</div>
                          <div className="flex items-center gap-3 text-xs text-stone-500">
                            <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{c.duration}</span>
                            <span className={`px-2 py-0.5 rounded-full font-bold ${c.demand === "Exponential" ? "bg-red-100 text-red-700" : c.demand === "Very High" ? "bg-orange-100 text-orange-700" : "bg-yellow-100 text-yellow-700"}`}>
                              {c.demand} Demand
                            </span>
                          </div>
                          <div className="text-xs text-stone-500 mt-1">
                            <span className="font-semibold text-stone-700">Career paths:</span> {c.careerPath}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[11px] text-stone-400 font-semibold uppercase">Annual Fee</div>
                          <div className="text-lg font-extrabold text-stone-900">{formatINR(c.feesPerYear)}</div>
                          <div className="text-[11px] text-stone-500 mt-0.5">Min: {c.minGpa}% in 12th</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Placements Tab */}
            {activeTab === "Placements" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <h2 className="text-lg font-bold text-stone-900">Placement Statistics</h2>
                {college.placements.length > 0 && (
                  <>
                    <div className="bg-white border border-stone-200 rounded-2xl p-5">
                      <div className="text-sm font-bold text-stone-700 mb-4">CTC Trends (LPA)</div>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={placementChartData}>
                          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="avg" name="Avg CTC" fill="#059669" radius={4} />
                          <Bar dataKey="highest" name="Highest CTC" fill="#d97706" radius={4} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    {college.placements.map((p: any) => (
                      <div key={p.id} className="bg-white border border-stone-200 rounded-xl p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: "Year", value: p.year },
                          { label: "Eligible", value: p.eligibleStudents },
                          { label: "Placed", value: `${p.placedStudents} (${Math.round((p.placedStudents / p.eligibleStudents) * 100)}%)` },
                          { label: "Avg CTC", value: `${p.averageCtc} LPA` },
                        ].map((m) => (
                          <div key={m.label}>
                            <div className="text-[10px] font-bold uppercase text-stone-400">{m.label}</div>
                            <div className="text-base font-extrabold text-stone-900 mt-0.5">{m.value}</div>
                          </div>
                        ))}
                        <div className="col-span-full text-xs text-stone-500 pt-2 border-t border-stone-100">
                          <span className="font-semibold text-stone-700">Top Recruiters:</span> {p.topRecruiters}
                        </div>
                      </div>
                    ))}
                    <div className="text-xs text-stone-400 italic">
                      * Placement data sourced from official institutional disclosures. Estimates may vary. Not a guarantee of employment.
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* Reviews Tab */}
            {activeTab === "Reviews" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <h2 className="text-lg font-bold text-stone-900">Student Reviews ({college.reviews.length})</h2>
                {college.reviews.map((r: any) => (
                  <div key={r.id} className="bg-white border border-stone-200 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-4 h-4 ${s <= Math.round(r.rating) ? "fill-amber-500 text-amber-500" : "text-stone-200 fill-stone-200"}`} />
                        ))}
                        <span className="text-sm font-bold ml-1 text-stone-700">{r.rating.toFixed(1)}</span>
                      </div>
                      {r.isVerified && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" /> Verified Student
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed">{r.content}</p>
                    <div className="text-xs text-stone-400 font-semibold">{r.student?.name}</div>
                  </div>
                ))}

                {/* Submit Review */}
                {user?.role === "STUDENT" && !reviewSuccess && (
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-4">
                    <h3 className="font-bold text-stone-900">Write a Review</h3>
                    <form onSubmit={handleSubmitReview} className="space-y-3">
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button type="button" key={s} onClick={() => setReviewRating(s)}>
                            <Star className={`w-6 h-6 cursor-pointer ${s <= reviewRating ? "fill-amber-500 text-amber-500" : "text-stone-300 fill-stone-300"}`} />
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your experience — academics, campus, placements..."
                        rows={3}
                        className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-brand-green bg-white transition-all"
                      />
                      <button
                        type="submit"
                        disabled={submitting || !reviewText.trim()}
                        id="submit-review"
                        className="px-6 py-2.5 bg-brand-green text-white text-xs font-bold rounded-xl hover:bg-emerald-800 transition-all disabled:opacity-50"
                      >
                        {submitting ? "Submitting..." : "Submit Review"}
                      </button>
                    </form>
                  </div>
                )}
                {reviewSuccess && (
                  <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-semibold">
                    <CheckCircle className="w-4 h-4" /> Review submitted successfully!
                  </div>
                )}
              </motion.div>
            )}

            {/* Apply Tab */}
            {activeTab === "Apply" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <h2 className="text-lg font-bold text-stone-900">Start Your Application</h2>
                {!user ? (
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-8 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-brand-green mx-auto flex items-center justify-center">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-stone-800">Login Required</h3>
                    <p className="text-sm text-stone-500">Please create an account or log in to track your application to {college.name}.</p>
                    <LoginModal
                      triggerClassName="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-900 text-white text-sm font-bold rounded-xl hover:bg-indigo-950 transition-all cursor-pointer"
                      triggerText="Login / Register"
                    />
                  </div>
                ) : (
                  <ApplySection college={college} />
                )}
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Stats Card */}
            <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-wider">
                <Building2 className="w-4 h-4" /> Key Facts
              </div>
              {[
                { label: "Ownership", value: college.type },
                { label: "NIRF Rank", value: college.nirfRank ? `#${college.nirfRank}` : "N/A" },
                { label: "NAAC Grade", value: college.naacGrade || "N/A" },
                { label: "Annual Fee", value: formatINR(college.feesPerYear) },
                { label: "Avg Package", value: `${college.avgPackage} LPA` },
                { label: "Highest CTC", value: `${college.highestPackage} LPA` },
                { label: "Total Courses", value: college.courses.length },
              ].map((fact) => (
                <div key={fact.label} className="flex items-center justify-between text-sm">
                  <span className="text-stone-500 font-medium">{fact.label}</span>
                  <span className="font-bold text-stone-900">{fact.value}</span>
                </div>
              ))}
            </div>

            {/* CTA to Counselor */}
            <div className="bg-brand-green rounded-2xl p-5 text-center space-y-3">
              <div className="text-white font-bold text-sm">Not sure if this is the right fit?</div>
              <p className="text-emerald-200 text-xs leading-relaxed">
                Get a complete, AI-scored college shortlist based on your specific profile.
              </p>
              <Link
                href="/counselor"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-brand-green text-xs font-bold rounded-xl hover:bg-emerald-50 transition-all"
              >
                Ask AI Counselor <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Compare CTA */}
            <div className="border border-stone-200 bg-white rounded-2xl p-4 text-center space-y-3">
              <div className="text-sm font-bold text-stone-800">Compare this college</div>
              <Link
                href={`/compare?ids=${college.id}`}
                id="goto-compare"
                className="inline-flex items-center gap-2 text-xs font-bold text-brand-green hover:underline"
              >
                Open Comparison Tool <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApplySection({ college }: { college: any }) {
  const [selectedCourse, setSelectedCourse] = React.useState(college.courses[0]?.id || "");
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleApply = async () => {
    setSubmitting(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ collegeId: college.id, courseId: selectedCourse }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center space-y-4">
        <CheckCircle className="w-12 h-12 text-brand-green mx-auto" />
        <h3 className="font-bold text-stone-800 text-lg">Application Submitted!</h3>
        <p className="text-sm text-stone-500">Track your application status in the Application Tracker.</p>
        <Link href="/tracker" className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-green text-white text-sm font-bold rounded-xl hover:bg-emerald-800 transition-all">
          View Tracker <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-bold text-stone-500 uppercase">Select Course</label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          id="course-select"
          className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-brand-green bg-stone-50 transition-all"
        >
          {college.courses.map((c: any) => (
            <option key={c.id} value={c.id}>{c.title} — {c.duration}</option>
          ))}
        </select>
      </div>
      {error && (
        <div className="text-xs text-red-600 font-semibold px-3 py-2 bg-red-50 border border-red-200 rounded-lg">{error}</div>
      )}
      <button
        onClick={handleApply}
        disabled={submitting || !selectedCourse}
        id="apply-now"
        className="w-full py-3 bg-brand-green text-white text-sm font-bold rounded-xl hover:bg-emerald-800 transition-all disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Application"}
      </button>
      <p className="text-[11px] text-stone-400 text-center">
        Submitting an application does not guarantee admission. Check official admission procedures.
      </p>
    </div>
  );
}
