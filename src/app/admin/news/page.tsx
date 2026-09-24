"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Newspaper,
  Plus,
  RefreshCw,
  ExternalLink,
  Trash2,
  Globe,
  Calendar,
  Sparkles,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { PopupModal } from "@/components/ui/PopupModal";

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Admissions");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type?: "success" | "error" | "info" | "warning";
  }>({ isOpen: false, message: "" });

  function showPopup(message: string, type: "success" | "error" | "info" | "warning" = "success", title?: string) {
    setPopup({ isOpen: true, message, type, title });
  }

  async function fetchNews() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/news");
      const data = await res.json();
      if (data.articles) setArticles(data.articles);
    } catch (e) {}
    setLoading(false);
  }

  useEffect(() => {
    fetchNews();
  }, []);

  async function handleAddArticle(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !content) return showPopup("Title and content are required", "warning", "Validation Error");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category }),
      });
      const data = await res.json();
      if (data.article) {
        setTitle("");
        setContent("");
        fetchNews();
        showPopup("News article published successfully to live website!", "success", "Article Published");
      } else {
        showPopup(data.error || "Failed to publish article", "error", "Publish Error");
      }
    } catch (e: any) {
      showPopup("Error: " + e.message, "error", "News Error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteArticle(id: string, articleTitle: string) {
    if (!confirm(`Are you sure you want to delete "${articleTitle}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setArticles((prev) => prev.filter((a) => a.id !== id));
        showPopup("Article deleted successfully", "success", "Deleted");
      } else {
        showPopup(data.error || "Failed to delete article", "error");
      }
    } catch (err: any) {
      showPopup(err.message, "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6 animate-slide-up font-sans text-slate-900">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-purple-100">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#3b2075] text-amber-300 flex items-center justify-center shadow-xs">
              <Newspaper className="w-5 h-5 text-amber-300" />
            </div>
            <span>News & Articles Management</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Publish and manage exam alerts, counselling news, and college updates visible on the public frontend.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Direct Link to Public News Hub */}
          <Link
            href="/news"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#3b2075] font-extrabold text-xs border border-purple-200 shadow-2xs transition-all"
            title="Open Live Public News Hub"
          >
            <Globe className="w-3.5 h-3.5 text-purple-700" />
            <span>View Public News Hub</span>
            <ExternalLink className="w-3 h-3" />
          </Link>

          <button
            onClick={fetchNews}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-purple-50 text-slate-700 transition-all shadow-2xs cursor-pointer"
            title="Refresh News"
          >
            <RefreshCw className={`w-4 h-4 text-[#3b2075] ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. Publish Form */}
      <form onSubmit={handleAddArticle} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#3b2075]" /> Publish New Article
          </h3>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Instantly visible on /news
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="sm:col-span-2">
            <label className="font-bold text-slate-700 block mb-1">Article Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. TNEA 2026 Counselling Dates Announced for Engineering Admissions"
              required
              className="w-full bg-slate-50/80 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-[#3b2075] focus:ring-2 focus:ring-[#3b2075]/10"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50/80 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-[#3b2075]"
            >
              <option value="Admissions">Admissions</option>
              <option value="Exams & Counselling">Exams & Counselling</option>
              <option value="Rankings">Rankings</option>
              <option value="Placements">Placements</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="font-bold text-slate-700 block mb-1">Article Content *</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write full article description and information here..."
              required
              className="w-full bg-slate-50/80 px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium leading-relaxed focus:outline-none focus:border-[#3b2075] focus:ring-2 focus:ring-[#3b2075]/10"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-[#3b2075] hover:bg-[#4c1d95] text-white font-extrabold rounded-xl text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{saving ? "Publishing to Website..." : "Publish Article Now"}</span>
          </button>
        </div>
      </form>

      {/* 3. Published Articles Table with Direct Frontend Action Buttons */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-purple-700" />
            <span>Live Articles Directory ({articles.length})</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Click &ldquo;View in Frontend ↗&rdquo; to see the published public page
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-6 min-w-[320px]">Title & Public URL</th>
                <th className="py-3.5 px-4 min-w-[130px]">Category</th>
                <th className="py-3.5 px-4 min-w-[120px]">Published Date</th>
                <th className="py-3.5 px-6 min-w-[200px] text-right">Frontend Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-medium">
                    No articles published yet. Use the form above to publish your first article.
                  </td>
                </tr>
              ) : (
                articles.map((a) => (
                  <tr key={a.id} className="hover:bg-purple-50/20 transition-colors group">
                    {/* Title & Slug */}
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="font-extrabold text-slate-900 text-xs leading-snug group-hover:text-purple-900 transition-colors">
                          {a.title}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-mono text-purple-700">
                          <span className="bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200/60 truncate max-w-[280px]">
                            /news/{a.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-purple-50 text-[#3b2075] font-black text-[10px] border border-purple-200">
                        {a.category}
                      </span>
                    </td>

                    {/* Published Date */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-500 font-medium text-xs">
                      {new Date(a.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Action Buttons: View in Frontend + Delete */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {/* 1. DIRECT VIEW IN FRONTEND BUTTON */}
                        <Link
                          href={`/news/${a.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3b2075] hover:bg-[#4c1d95] text-amber-300 hover:text-white font-extrabold text-xs shadow-xs transition-all hover:scale-[1.02]"
                          title="View Live Published Article in Frontend"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View in Frontend</span>
                          <ExternalLink className="w-3 h-3 text-amber-300" />
                        </Link>

                        {/* 2. Delete Button */}
                        <button
                          onClick={() => handleDeleteArticle(a.id, a.title)}
                          disabled={deletingId === a.id}
                          className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                          title="Delete Article"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PopupModal
        isOpen={popup.isOpen}
        onClose={() => setPopup((prev) => ({ ...prev, isOpen: false }))}
        title={popup.title}
        message={popup.message}
        type={popup.type}
      />
    </div>
  );
}
