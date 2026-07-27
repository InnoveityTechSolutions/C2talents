"use client";

import { useEffect, useState } from "react";
import { Newspaper, Plus, RefreshCw } from "lucide-react";
import { PopupModal } from "@/components/ui/PopupModal";

export default function AdminNewsPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Admissions");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

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
        showPopup("News article published successfully!", "success", "Article Published");
      } else {
        showPopup(data.error || "Failed to publish article", "error", "Publish Error");
      }
    } catch (e: any) {
      showPopup("Error: " + e.message, "error", "News Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 animate-slide-up font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-rose-600" /> News & Articles Management
          </h1>
          <p className="text-xs text-slate-500 font-medium">Publish exam alerts, counselling news, and college updates</p>
        </div>
        <button
          onClick={fetchNews}
          className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-rose-600" : ""}`} />
        </button>
      </div>

      <form onSubmit={handleAddArticle} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-rose-600" /> Publish News Article
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="sm:col-span-2">
            <label className="font-semibold text-slate-700 block mb-1">Article Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. TNEA 2026 Counselling Dates Announced"
              required
              className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-bold"
            >
              <option value="Admissions">Admissions</option>
              <option value="Exams & Counselling">Exams & Counselling</option>
              <option value="Rankings">Rankings</option>
              <option value="Placements">Placements</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="font-semibold text-slate-700 block mb-1">Article Content *</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write full article description here..."
              required
              className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-sm transition-all"
          >
            {saving ? "Publishing..." : "Publish Article"}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 px-5">Title</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Published Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {articles.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-5 font-bold text-slate-900">{a.title}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-extrabold text-[10px]">
                    {a.category}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-500 font-medium">{new Date(a.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
