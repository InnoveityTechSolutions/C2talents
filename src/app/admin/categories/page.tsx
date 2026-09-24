"use client";

import { useEffect, useState } from "react";
import {
  FolderTree,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Search,
  Sparkles,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PopupModal } from "@/components/ui/PopupModal";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Add category state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  // Edit category modal state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [updating, setUpdating] = useState(false);

  // Delete modal state
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Feedback popup state
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    type?: "success" | "error" | "info" | "warning";
  }>({ isOpen: false, message: "" });

  function showPopup(
    message: string,
    type: "success" | "error" | "info" | "warning" = "success",
    title?: string
  ) {
    setPopup({ isOpen: true, message, type, title });
  }

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (e) {
      showPopup("Failed to load categories", "error", "Network Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add new category
  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return showPopup("Category name is required", "warning", "Validation Error");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
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

  // Open Edit Modal
  function handleOpenEdit(cat: Category) {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditDescription(cat.description || "");
  }

  // Submit Category Update
  async function handleUpdateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editName.trim()) {
      return showPopup("Category name cannot be empty", "warning", "Validation Error");
    }

    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          slug: editSlug.trim(),
          description: editDescription.trim(),
        }),
      });
      const data = await res.json();

      if (data.success && data.category) {
        setEditingCategory(null);
        fetchCategories();
        showPopup(`Category "${data.category.name}" updated successfully!`, "success", "Changes Saved");
      } else {
        showPopup(data.error || "Failed to update category", "error", "Update Error");
      }
    } catch (e: any) {
      showPopup("Error updating category: " + e.message, "error", "Update Failed");
    } finally {
      setUpdating(false);
    }
  }

  // Submit Category Delete
  async function handleConfirmDelete() {
    if (!deletingCategory) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${deletingCategory.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        showPopup(`Category "${deletingCategory.name}" was permanently deleted.`, "success", "Deleted Successfully");
        setDeletingCategory(null);
        fetchCategories();
      } else {
        showPopup(data.error || "Failed to delete category", "error", "Delete Failed");
      }
    } catch (e: any) {
      showPopup("Error deleting category: " + e.message, "error", "Delete Error");
    } finally {
      setDeleting(false);
    }
  }

  const filteredCategories = categories.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-slide-up font-sans pb-16">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500/15 to-purple-600/15 text-orange-600 border border-orange-500/20 shadow-2xs">
              <FolderTree className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Category Management
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/70">
                  SuperAdmin CMS
                </span>
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Manage high-level streams, academic tracks, and portal search categories
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchCategories}
            title="Refresh list"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-orange-50/50 hover:border-orange-200 text-slate-700 hover:text-orange-600 transition-all shadow-xs text-xs font-bold cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-orange-600" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Add Category Form Card */}
      <form
        onSubmit={handleAddCategory}
        className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-black uppercase tracking-wide text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-orange-600" /> Add New Category
          </h3>
          <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Auto-generates URL Slugs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Engineering, MBA, Medical, Law"
              required
              className="w-full bg-slate-50/70 focus:bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-2xs"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1.5">Category Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Top Engineering & Technology Colleges"
              className="w-full bg-slate-50/70 focus:bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-2xs"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-[11px] text-slate-400 font-medium">
            New categories will immediately appear in college classification and search filters.
          </p>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Add Category
              </>
            )}
          </button>
        </div>
      </form>

      {/* Category List & Actions Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Search & Filter Bar */}
        <div className="p-4 bg-slate-50/60 border-b border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Existing Categories ({filteredCategories.length})
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search category, slug, description..."
              className="w-full bg-white pl-9 pr-8 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-black uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5">Category Name</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <FolderTree className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-slate-600">No categories found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {searchQuery ? "Try clearing your search query" : "Add your first category above"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((c) => (
                  <tr key={c.id} className="hover:bg-orange-50/20 transition-colors group">
                    <td className="py-3.5 px-5 font-black text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                      <span>{c.name}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-purple-700 font-semibold">
                      <span className="bg-purple-50/80 border border-purple-200/60 px-2 py-0.5 rounded-md">
                        {c.slug}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {c.description ? (
                        c.description
                      ) : (
                        <span className="text-slate-300 italic font-normal">No description</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEdit(c)}
                          title="Edit Category"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200/80 hover:border-purple-300 transition-all font-bold text-[11px] cursor-pointer shadow-2xs"
                        >
                          <Pencil className="w-3.5 h-3.5 text-purple-600" />
                          <span>Edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeletingCategory(c)}
                          title="Delete Category"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200/80 hover:border-rose-300 transition-all font-bold text-[11px] cursor-pointer shadow-2xs"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          <span>Delete</span>
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

      {/* ─── EDIT CATEGORY MODAL ─── */}
      <AnimatePresence>
        {editingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/50">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Edit Category</h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Update category title, slug, and descriptions
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleUpdateCategory} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value);
                      // Update slug automatically if user hasn't heavily customized it
                      const autoSlug = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, "");
                      setEditSlug(autoSlug);
                    }}
                    required
                    className="w-full bg-slate-50 focus:bg-white px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Slug (URL identifier) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    required
                    className="w-full bg-slate-50 focus:bg-white px-3 py-2 rounded-xl border border-slate-200 font-mono text-[11px] text-purple-700 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Brief summary of category"
                    className="w-full bg-slate-50 focus:bg-white px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating || !editName.trim()}
                    className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 text-white font-extrabold rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {updating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" /> Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── DELETE CONFIRMATION MODAL ─── */}
      <AnimatePresence>
        {deletingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
            >
              <div className="p-5 flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-black text-slate-900 text-sm">Delete Category?</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Are you sure you want to permanently delete{" "}
                    <span className="font-extrabold text-slate-900">
                      &quot;{deletingCategory.name}&quot;
                    </span>
                    ? This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeletingCategory(null)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {deleting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" /> Delete Category
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
