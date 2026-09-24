import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { db } from "@/lib/db";
import {
  Calendar,
  User,
  ArrowLeft,
  Share2,
  Bookmark,
  Sparkles,
  Building2,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface NewsDetailsProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: NewsDetailsProps) {
  const { slug } = await params;
  const article = await db.newsArticle.findFirst({
    where: { slug },
  });

  if (!article) return { title: "Article Not Found | C2Talents" };

  return {
    title: `${article.title} | C2Talents News`,
    description: article.content.substring(0, 160),
  };
}

export const revalidate = 0;

export default async function SingleNewsPage({ params }: NewsDetailsProps) {
  const { slug } = await params;

  const article = await db.newsArticle.findFirst({
    where: { slug },
  });

  if (!article) {
    notFound();
  }

  const relatedArticles = await db.newsArticle.findMany({
    where: {
      id: { not: article.id },
      status: "PUBLISHED",
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  const categoryColorMap: Record<string, string> = {
    Admissions: "bg-emerald-50 text-emerald-800 border-emerald-200",
    "Exams & Counselling": "bg-indigo-50 text-indigo-800 border-indigo-200",
    Rankings: "bg-amber-50 text-amber-800 border-amber-200",
    Placements: "bg-purple-50 text-purple-800 border-purple-200",
  };

  const badgeStyle = categoryColorMap[article.category] || "bg-purple-50 text-purple-800 border-purple-200";

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-sans text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-6">
          <Link href="/" className="hover:text-purple-700 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/news" className="hover:text-purple-700 transition-colors">
            News & Alerts
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-bold truncate max-w-xs sm:max-w-md">
            {article.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Article Content (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            <article className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-6">
              {/* Header Meta */}
              <div className="space-y-3 pb-6 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${badgeStyle}`}>
                    {article.category}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(article.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {article.author || "C2Talents Editorial Desk"}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                  {article.title}
                </h1>
              </div>

              {/* Article Body */}
              <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
                {article.content.split("\n\n").map((para, idx) => (
                  <p key={idx} className="whitespace-pre-line">
                    {para}
                  </p>
                ))}
              </div>

              {/* Verified Platform Note */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-xs text-purple-950 font-medium flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0" />
                <span>
                  This notification has been verified by the C2Talents Admissions & Exam Intelligence desk for accuracy.
                </span>
              </div>

              {/* Back to All News Button */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to All News & Alerts
                </Link>
              </div>
            </article>
          </div>

          {/* Sidebar (4 Cols) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Quick AI Counselor Promo */}
            <div className="bg-gradient-to-br from-[#1f0c3d] via-[#2d1659] to-[#3b2075] text-white p-6 rounded-3xl shadow-md space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-white">Have Admission Questions?</h3>
                <p className="text-xs text-purple-200 leading-relaxed font-normal">
                  Ask India&apos;s first AI Higher Education Counselor for personalized college recommendations and cutoff predictions.
                </p>
              </div>
              <Link
                href="/counselor"
                className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold shadow-sm transition-all"
              >
                Ask AI Counselor ↗
              </Link>
            </div>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                  Recent Announcements
                </h3>
                <div className="space-y-3 divide-y divide-slate-100">
                  {relatedArticles.map((rel) => (
                    <div key={rel.id} className="pt-3 first:pt-0 space-y-1">
                      <span className="text-[10px] font-extrabold text-purple-700 uppercase">
                        {rel.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 hover:text-purple-700 line-clamp-2 transition-colors">
                        <Link href={`/news/${rel.slug}`}>{rel.title}</Link>
                      </h4>
                      <span className="text-[10px] text-slate-400 block font-medium">
                        {new Date(rel.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
