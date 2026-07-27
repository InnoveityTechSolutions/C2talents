"use client";

import { useEffect, useState } from "react";
import { FolderTree, Plus, RefreshCw } from "lucide-react";
import { PopupModal } from "@/components/ui/PopupModal";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
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

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (e) {}
    setLoading(false);
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return showPopup("Category name is required", "warning", "Validation Error");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (data.category) {
        setName("");
        setDescription("");
        fetchCategories();
        showPopup(`Category "${data.category.name}" added successfully!`, "success", "Category Added");
      } else {
        showPopup(data.error || "Failed to add category", "error", "Operation Failed");
      }
    } catch (e: any) {
      showPopup("Error adding category: " + e.message, "error", "Category Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 animate-slide-up font-sans">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-teal-600" /> Category Management
          </h1>
          <p className="text-xs text-slate-500 font-medium">Add and manage college & course portal categories</p>
        </div>
        <button
          onClick={fetchCategories}
          className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-all shadow-xs"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-teal-600" : ""}`} />
        </button>
      </div>

      <form onSubmit={handleAddCategory} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-teal-600" /> Add New Category
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Category Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Engineering / MBA / Medical"
              required
              className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of category"
              className="w-full bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-slate-900"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-xl text-xs shadow-sm transition-all"
          >
            {saving ? "Saving..." : "Add Category"}
          </button>
        </div>
      </form>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 px-5">Category Name</th>
              <th className="py-3.5 px-4">Slug</th>
              <th className="py-3.5 px-4">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-5 font-bold text-slate-900">{c.name}</td>
                <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{c.slug}</td>
                <td className="py-3.5 px-4 text-slate-600 font-medium">{c.description || "-"}</td>
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
