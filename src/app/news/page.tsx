import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { db } from "@/lib/db";
import { Newspaper, Calendar, ArrowRight, Tag, Sparkles, BookOpen, Search, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Latest Education News, Exam Alerts & Admission Updates | C2Talents",
  description: "Stay informed with breaking updates on NIRF rankings, TNEA counselling, JEE Mains, NEET UG cutoffs, and college admissions in India.",
};

export const revalidate = 0;

export default async function PublicNewsPage() {
  const articles = await db.newsArticle.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  const categoryColorMap: Record<string, string> = {
    Admissions: "bg-emerald-50 text-emerald-800 border-emerald-200",
    "Exams & Counselling": "bg-indigo-50 text-indigo-800 border-indigo-200",
    Rankings: "bg-amber-50 text-amber-800 border-amber-200",
    Placements: "bg-purple-50 text-purple-800 border-purple-200",
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Header Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1f0c3d] via-[#2d1659] to-[#3b2075] text-white p-8 sm:p-12 shadow-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Official News & Alerts
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Higher Education News & Admission Alerts
            </h1>
            <p className="text-sm sm:text-base text-purple-200/90 leading-relaxed font-normal">
              Stay ahead with verified notifications on entrance exam cutoffs, TNEA counselling schedules, NIRF rankings, and university admissions.
            </p>
          </div>
        </div>

        {/* Article Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-purple-700" />
              <span>Published Updates ({articles.length})</span>
            </h2>
            <span className="text-xs text-slate-500 font-semibold">Updated in Real-time</span>
          </div>

          {articles.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm space-y-3">
              <Newspaper className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No News Articles Published Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Check back soon or visit our exam portals for the latest cutoff predictions and admission announcements.
              </p>
              <Link
                href="/exams"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 transition-all shadow-md"
              >
                <BookOpen className="w-4 h-4" /> Explore Exam Guide
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => {
                const badgeStyle =
                  categoryColorMap[article.category] || "bg-purple-50 text-purple-800 border-purple-200";

                return (
                  <article
                    key={article.id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between p-6 group hover:-translate-y-1 relative overflow-hidden"
                  >
                    <div className="space-y-4">
                      {/* Category & Date */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${badgeStyle}`}>
                          {article.category}
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(article.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors line-clamp-2 leading-snug">
                        <Link href={`/news/${article.slug}`}>
                          {article.title}
                        </Link>
                      </h3>

                      {/* Content Preview */}
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal">
                        {article.content}
                      </p>
                    </div>

                    {/* Footer / Read More */}
                    <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-semibold">
                        By {article.author || "C2Talents Editorial"}
                      </span>
                      <Link
                        href={`/news/${article.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 group-hover:text-purple-900 group-hover:translate-x-1 transition-all"
                      >
                        <span>Read Full Story</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
