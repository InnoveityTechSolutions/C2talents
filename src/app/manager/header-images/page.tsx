"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Image as ImageIcon,
  Upload,
  PlusCircle,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit,
  Eye,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Loader2,
  Sparkles,
  ShieldCheck,
  Globe,
  Sliders,
  Check,
  X,
  Grid,
  List,
  Layers,
  Info,
  Copy,
} from "lucide-react";

import { PopupModal } from "@/components/ui/PopupModal";

// =========================================================
// TYPES & INTERFACES
// =========================================================

interface HeaderImageRecord {
  id: string;
  title: string;
  description: string | null;
  altText: string | null;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function HeaderImagesManagementPage() {
  const [images, setImages] = useState<HeaderImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"GRID" | "TABLE">("GRID");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Stats
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  // Upload / Create Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string>("");
  const [uploadFormData, setUploadFormData] = useState({
    title: "",
    description: "",
    altText: "",
    displayOrder: "",
    isActive: true,
  });

  // Edit Modal State
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    item: HeaderImageRecord | null;
  }>({
    isOpen: false,
    item: null,
  });

  // Preview Modal State
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    item: HeaderImageRecord | null;
  }>({
    isOpen: false,
    item: null,
  });

  // Delete Confirmation Modal
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    ids: string[];
    title: string;
  }>({
    isOpen: false,
    ids: [],
    title: "",
  });

  // Notification Popup Modal
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImages();
  }, [statusFilter]);

  async function fetchImages() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/header-images?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.success) {
        setImages(data.images || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch header images:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    await fetchImages();
    setRefreshing(false);
  }

  // Handle Drag & Drop / File Select
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  }

  function processSelectedFile(file: File) {
    // Validate File Size <= 20MB
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setPopup({
        isOpen: true,
        title: "File Too Large",
        message: `Selected image size is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Maximum allowed upload size is 20MB.`,
        type: "error",
      });
      return;
    }

    // Validate Format
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setPopup({
        isOpen: true,
        title: "Unsupported Format",
        message: "Only JPG, JPEG, PNG, and WEBP image formats are supported.",
        type: "error",
      });
      return;
    }

    setUploadFile(file);
    const objectUrl = URL.createObjectURL(file);
    setUploadPreviewUrl(objectUrl);

    // Auto-fill Title from Filename if empty
    if (!uploadFormData.title) {
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setUploadFormData((prev) => ({
        ...prev,
        title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
        altText: cleanTitle,
      }));
    }
  }

  // Submit Upload Form
  async function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!uploadFile && !uploadFormData.title) {
      setPopup({
        isOpen: true,
        title: "Missing Information",
        message: "Please select an image file and enter an image title.",
        type: "warning",
      });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      if (uploadFile) formData.append("file", uploadFile);
      formData.append("title", uploadFormData.title);
      formData.append("description", uploadFormData.description);
      formData.append("altText", uploadFormData.altText);
      formData.append("displayOrder", uploadFormData.displayOrder);
      formData.append("isActive", String(uploadFormData.isActive));

      const res = await fetch("/api/admin/header-images", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload header image.");
      }

      setPopup({
        isOpen: true,
        title: "Image Uploaded Successfully!",
        message: `Header image "${data.image.title}" has been saved to the database.`,
        type: "success",
      });

      // Reset Form State
      setUploadModalOpen(false);
      setUploadFile(null);
      setUploadPreviewUrl("");
      setUploadFormData({ title: "", description: "", altText: "", displayOrder: "", isActive: true });
      fetchImages();
    } catch (err: any) {
      setPopup({
        isOpen: true,
        title: "Upload Failed",
        message: err.message || "An unexpected error occurred during upload.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Save Edit Details
  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editModal.item) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/header-images/${editModal.item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editModal.item.title,
          description: editModal.item.description,
          altText: editModal.item.altText,
          displayOrder: editModal.item.displayOrder,
          isActive: editModal.item.isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update image details.");
      }

      setPopup({
        isOpen: true,
        title: "Details Updated",
        message: `Header image "${editModal.item.title}" updated successfully.`,
        type: "success",
      });

      setEditModal({ isOpen: false, item: null });
      fetchImages();
    } catch (err: any) {
      setPopup({
        isOpen: true,
        title: "Update Error",
        message: err.message || "Failed to update image details.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Toggle Active Status
  async function handleToggleStatus(item: HeaderImageRecord) {
    try {
      const newStatus = !item.isActive;
      const res = await fetch(`/api/admin/header-images/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setImages((prev) =>
          prev.map((img) => (img.id === item.id ? { ...img, isActive: newStatus } : img))
        );
        fetchImages();
      }
    } catch (err) {
      console.error("Status toggle error:", err);
    }
  }

  // Reorder Position (Move Up / Move Down)
  async function handleMovePosition(item: HeaderImageRecord, direction: "UP" | "DOWN") {
    const sorted = [...filteredImages].sort((a, b) => a.displayOrder - b.displayOrder);
    const currentIndex = sorted.findIndex((i) => i.id === item.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "UP" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const targetItem = sorted[targetIndex];
    const newItems = [
      { id: item.id, displayOrder: targetItem.displayOrder },
      { id: targetItem.id, displayOrder: item.displayOrder },
    ];

    try {
      const res = await fetch("/api/admin/header-images/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: newItems }),
      });

      const data = await res.json();
      if (data.success) {
        fetchImages();
      }
    } catch (err) {
      console.error("Reorder error:", err);
    }
  }

  // Bulk Operations
  async function handleBulkAction(action: "ACTIVATE" | "DEACTIVATE" | "DELETE") {
    if (selectedIds.length === 0) return;

    if (action === "DELETE") {
      setDeleteModal({
        isOpen: true,
        ids: selectedIds,
        title: `Delete ${selectedIds.length} Selected Image(s)`,
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/header-images/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds, action }),
      });

      const data = await res.json();
      if (data.success) {
        setPopup({
          isOpen: true,
          title: "Bulk Action Completed",
          message: data.message,
          type: "success",
        });
        setSelectedIds([]);
        fetchImages();
      }
    } catch (err: any) {
      setPopup({
        isOpen: true,
        title: "Error",
        message: err.message || "Failed to complete bulk action.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  // Delete Modal Card Animation State
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Toast Notification State (Non-blocking tick animation)
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  function triggerToast(message: string, type: "success" | "error" = "success") {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  }

  // Confirm Single or Bulk Delete
  async function executeDelete() {
    if (deleteModal.ids.length === 0) return;

    setSubmitting(true);
    try {
      if (deleteModal.ids.length === 1) {
        const res = await fetch(`/api/admin/header-images/${deleteModal.ids[0]}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
      } else {
        const res = await fetch("/api/admin/header-images/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: deleteModal.ids, action: "DELETE" }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
      }

      // Show green tick animation inside the same modal card!
      setDeleteSuccess(true);
      setSelectedIds([]);
      fetchImages();

      // Automatically close modal after 1.4 seconds
      setTimeout(() => {
        setDeleteModal({ isOpen: false, ids: [], title: "" });
        setDeleteSuccess(false);
      }, 1400);
    } catch (err: any) {
      triggerToast(err.message || "Failed to delete image.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  // Search Filtered Array
  const filteredImages = images.filter((img) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      img.title.toLowerCase().includes(q) ||
      (img.description && img.description.toLowerCase().includes(q)) ||
      (img.altText && img.altText.toLowerCase().includes(q))
    );
  });

  const allSelected = filteredImages.length > 0 && selectedIds.length === filteredImages.length;

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredImages.map((i) => i.id));
    }
  }

  function toggleSelectOne(id: string) {
    if (selectedIds.includes(id)) {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    } else {
      setSelectedIds((prev) => [...prev, id]);
    }
  }

  return (
    <div className="space-y-6 font-sans text-stone-900 p-6 bg-[#FAF9F5] min-h-screen w-full max-w-none">
      {/* 1. HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-purple-100">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#1f0c3d] flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#3b2075] text-amber-300 flex items-center justify-center shadow-2xs">
              <ImageIcon className="w-5 h-5 text-amber-300" />
            </div>
            <span>Header Images Management</span>
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Manage homepage hero banner images dynamically without modifying the code.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-white border border-stone-200 hover:bg-purple-50 text-stone-700 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
            title="Refresh Images"
          >
            <RefreshCw className={`w-4 h-4 text-[#3b2075] ${refreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => {
              setUploadModalOpen(true);
              setUploadFile(null);
              setUploadPreviewUrl("");
              setUploadFormData({ title: "", description: "", altText: "", displayOrder: "", isActive: true });
            }}
            className="flex items-center gap-2 bg-[#3b2075] hover:bg-[#4c1d95] text-amber-300 font-black px-4 py-2.5 rounded-xl text-xs shadow-md transition-all hover:scale-[1.01] cursor-pointer"
          >
            <Upload className="w-4 h-4 text-amber-300" />
            <span>Upload New Image</span>
          </button>
        </div>
      </div>

      {/* 2. 3 VIBRANT GRADIENT METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Images */}
        <div className="bg-gradient-to-br from-[#1f0c3d] via-[#2d1659] to-[#3b2075] rounded-2xl p-5 text-white shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between border border-white/10">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs font-semibold text-white/90 tracking-tight">Total Header Images</div>
              <div className="text-3xl font-extrabold text-white mt-1 tracking-tight">
                {loading ? <span className="animate-pulse">...</span> : stats.total}
              </div>
            </div>
            <ImageIcon className="w-8 h-8 text-amber-300 shrink-0" />
          </div>
          <div className="border-t border-white/20 my-3"></div>
          <div className="flex items-center justify-between text-[11px] text-white/90 font-medium">
            <span>Database Upload Records</span>
            <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">{stats.total}</span>
          </div>
        </div>

        {/* Active Images */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between border border-white/10">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs font-semibold text-white/90 tracking-tight">Active Banner Images</div>
              <div className="text-3xl font-extrabold text-white mt-1 tracking-tight">
                {loading ? <span className="animate-pulse">...</span> : stats.active}
              </div>
            </div>
            <CheckCircle2 className="w-8 h-8 text-white/90 shrink-0" />
          </div>
          <div className="border-t border-white/20 my-3"></div>
          <div className="flex items-center justify-between text-[11px] text-white/90 font-medium">
            <span>Live on Homepage Slider</span>
            <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">{stats.active}</span>
          </div>
        </div>

        {/* Inactive Images */}
        <div className="bg-gradient-to-br from-rose-600 to-red-700 rounded-2xl p-5 text-white shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between border border-white/10">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs font-semibold text-white/90 tracking-tight">Disabled / Inactive</div>
              <div className="text-3xl font-extrabold text-white mt-1 tracking-tight">
                {loading ? <span className="animate-pulse">...</span> : stats.inactive}
              </div>
            </div>
            <XCircle className="w-8 h-8 text-white/90 shrink-0" />
          </div>
          <div className="border-t border-white/20 my-3"></div>
          <div className="flex items-center justify-between text-[11px] text-white/90 font-medium">
            <span>Hidden from Frontend</span>
            <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">{stats.inactive}</span>
          </div>
        </div>
      </div>

      {/* 3. TOOLBAR: FILTER TABS, BULK ACTIONS, VIEW TOGGLE, SEARCH */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 border-b border-purple-100 pb-0.5">
          {(["ALL", "ACTIVE", "INACTIVE"] as const).map((status) => {
            const count = status === "ALL" ? stats.total : status === "ACTIVE" ? stats.active : stats.inactive;
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all duration-150 flex items-center space-x-1.5 cursor-pointer ${
                  isActive
                    ? "border-[#3b2075] text-[#1f0c3d]"
                    : "border-transparent text-stone-500 hover:text-[#3b2075] hover:border-purple-200"
                }`}
              >
                <span>{status === "ALL" ? "All" : status === "ACTIVE" ? "Active" : "Inactive"}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isActive ? "bg-[#3b2075] text-amber-300" : "bg-purple-100/60 text-purple-900"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Controls: Bulk Actions, View Toggle, Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Bulk Action Controls */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs animate-in fade-in">
              <span className="text-stone-700 font-bold px-2 text-[11px]">{selectedIds.length} Selected:</span>
              <button
                onClick={() => handleBulkAction("ACTIVATE")}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
              >
                Enable
              </button>
              <button
                onClick={() => handleBulkAction("DEACTIVATE")}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
              >
                Disable
              </button>
              <button
                onClick={() => handleBulkAction("DELETE")}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white border border-stone-200 p-1 rounded-xl shadow-2xs">
            <button
              onClick={() => setViewMode("GRID")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "GRID" ? "bg-[#3b2075] text-amber-300 shadow-2xs" : "text-stone-400 hover:text-stone-700"
              }`}
              title="Grid View Cards"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("TABLE")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "TABLE" ? "bg-[#3b2075] text-amber-300 shadow-2xs" : "text-stone-400 hover:text-stone-700"
              }`}
              title="Table View List"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search title, description, alt text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#3b2075] focus:ring-2 focus:ring-[#3b2075]/10 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. MAIN CONTENT VIEW (GRID OR TABLE) */}
      {loading ? (
        <div className="p-16 text-center text-stone-500 text-xs flex flex-col items-center gap-3 bg-white rounded-3xl border border-stone-200 shadow-xs">
          <Loader2 className="w-8 h-8 text-[#3b2075] animate-spin" />
          <span className="font-extrabold text-[#1f0c3d] text-sm">Loading homepage header images...</span>
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-16 text-center text-stone-500 text-xs shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#3b2075] flex items-center justify-center mx-auto border border-purple-100">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-[#1f0c3d]">No Header Images Found</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto font-medium">
            {searchQuery
              ? `No records match your search "${searchQuery}".`
              : "No header banner images uploaded yet. Click Upload New Image to add high-resolution hero banners."}
          </p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#3b2075] text-amber-300 font-extrabold rounded-xl text-xs shadow-sm hover:bg-[#4c1d95]"
          >
            <Upload className="w-4 h-4 text-amber-300" /> Upload First Banner Image
          </button>
        </div>
      ) : viewMode === "GRID" ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredImages.map((img, idx) => {
            const isChecked = selectedIds.includes(img.id);
            return (
              <div
                key={img.id}
                className={`bg-white border rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative group ${
                  isChecked ? "border-[#3b2075] ring-2 ring-[#3b2075]/20" : "border-stone-200"
                }`}
              >
                <div>
                  {/* Image Container with Hover Zoom & Badge */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img
                      src={img.imageUrl}
                      alt={img.altText || img.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Checkbox Overlay */}
                    <div className="absolute top-3 left-3 z-10">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelectOne(img.id)}
                        className="w-4 h-4 rounded text-[#3b2075] focus:ring-[#3b2075] cursor-pointer"
                      />
                    </div>

                    {/* Display Position & Status Pill */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-black uppercase tracking-wider border border-white/20">
                        Pos #{img.displayOrder}
                      </span>
                      <button
                        onClick={() => handleToggleStatus(img)}
                        className={`px-2.5 py-0.5 rounded-full backdrop-blur-md text-[10px] font-black uppercase tracking-wider border cursor-pointer ${
                          img.isActive
                            ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                            : "bg-rose-950/80 text-rose-300 border-rose-500/40"
                        }`}
                      >
                        {img.isActive ? "ACTIVE" : "DISABLED"}
                      </button>
                    </div>

                    {/* Zoom / Full Preview Overlay Button */}
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                      <button
                        onClick={() => setPreviewModal({ isOpen: true, item: img })}
                        className="px-3.5 py-2 rounded-xl bg-white text-stone-900 font-extrabold text-xs flex items-center gap-1.5 shadow-lg hover:scale-105 transition-all cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-[#3b2075]" /> Full Preview
                      </button>
                    </div>
                  </div>

                  {/* Card Info Body */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-[#1f0c3d] text-base leading-snug truncate" title={img.title}>
                        {img.title}
                      </h3>
                    </div>

                    {img.description && (
                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed font-medium">
                        {img.description}
                      </p>
                    )}

                    <div className="pt-2 text-[11px] text-stone-400 font-medium flex items-center justify-between">
                      <span>Alt Text: "{img.altText || img.title}"</span>
                      <span>{new Date(img.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMovePosition(img, "UP")}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 disabled:opacity-30 cursor-pointer shadow-2xs"
                      title="Move Position Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMovePosition(img, "DOWN")}
                      disabled={idx === filteredImages.length - 1}
                      className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 disabled:opacity-30 cursor-pointer shadow-2xs"
                      title="Move Position Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditModal({ isOpen: true, item: img })}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#3b2075] border border-purple-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteModal({ isOpen: true, ids: [img.id], title: `Delete "${img.title}"` })}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-purple-50/50 border-b border-purple-100 text-[#1f0c3d] font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded text-[#3b2075] focus:ring-[#3b2075] cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Image Preview</th>
                  <th className="py-3.5 px-5">Image Title & Details</th>
                  <th className="py-3.5 px-4">SEO Alt Text</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {filteredImages.map((img, idx) => {
                  const isChecked = selectedIds.includes(img.id);
                  return (
                    <tr key={img.id} className="hover:bg-purple-50/20 transition-colors group text-stone-800">
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(img.id)}
                          className="w-4 h-4 rounded text-[#3b2075] focus:ring-[#3b2075] cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-[#1f0c3d] px-2 py-0.5 rounded bg-purple-50 border border-purple-200">
                            #{img.displayOrder}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => handleMovePosition(img, "UP")}
                              disabled={idx === 0}
                              className="text-stone-400 hover:text-stone-800 disabled:opacity-20 cursor-pointer"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => handleMovePosition(img, "DOWN")}
                              disabled={idx === filteredImages.length - 1}
                              className="text-stone-400 hover:text-stone-800 disabled:opacity-20 cursor-pointer"
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => setPreviewModal({ isOpen: true, item: img })}
                          className="w-20 h-12 rounded-xl bg-slate-900 overflow-hidden border border-stone-200 cursor-pointer relative group/img shrink-0"
                        >
                          <img src={img.imageUrl} alt={img.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="space-y-0.5 max-w-sm">
                          <div className="font-extrabold text-[#1f0c3d] text-xs">{img.title}</div>
                          {img.description && (
                            <div className="text-[11px] text-stone-500 line-clamp-1">{img.description}</div>
                          )}
                          <div className="text-[10px] font-mono text-stone-400 truncate">{img.imageUrl}</div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-stone-600 text-xs italic">
                        "{img.altText || img.title}"
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(img)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border cursor-pointer ${
                            img.isActive
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-rose-50 text-rose-800 border-rose-200"
                          }`}
                        >
                          {img.isActive ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                          {img.isActive ? "ACTIVE" : "DISABLED"}
                        </button>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditModal({ isOpen: true, item: img })}
                            className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#3b2075] border border-purple-200 font-bold text-xs transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, ids: [img.id], title: `Delete "${img.title}"` })}
                            className="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. UPLOAD NEW IMAGE MODAL */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-black text-[#1f0c3d] flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#3b2075]" />
                <span>Upload New Header Image</span>
              </h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-base cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Drag & Drop Upload Container */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-purple-200 hover:border-[#3b2075] rounded-2xl p-5 text-center bg-purple-50/30 hover:bg-purple-50/60 transition-all cursor-pointer relative overflow-hidden group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {uploadPreviewUrl ? (
                  <div className="relative rounded-xl overflow-hidden shadow-sm max-h-52 bg-slate-950 mx-auto flex items-center justify-center">
                    <img src={uploadPreviewUrl} alt="Preview" loading="lazy" decoding="async" className="w-full h-full max-h-52 object-contain" />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                      Click to Change Image
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#3b2075] flex items-center justify-center mx-auto shadow-2xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#1f0c3d]">Click or Drag & Drop image file here</p>
                      <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                        Supports JPG, JPEG, PNG, WEBP (Max size 20MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-700 mb-1">
                    Image Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modern Campus Infrastructure & Tech Labs"
                    value={uploadFormData.title}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
                    className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#3b2075] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-700 mb-1">
                    Description / Subtitle
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Discover top accredited engineering and autonomous colleges across Tamil Nadu."
                    value={uploadFormData.description}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
                    className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#3b2075] font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-700 mb-1">
                      Alt Text (SEO)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. C2Talents College Campus Banner"
                      value={uploadFormData.altText}
                      onChange={(e) => setUploadFormData({ ...uploadFormData, altText: e.target.value })}
                      className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#3b2075] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-700 mb-1">
                      Display Order Position
                    </label>
                    <input
                      type="number"
                      placeholder="Auto (e.g. 1, 2, 3)"
                      value={uploadFormData.displayOrder}
                      onChange={(e) => setUploadFormData({ ...uploadFormData, displayOrder: e.target.value })}
                      className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#3b2075] font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="uploadIsActive"
                    checked={uploadFormData.isActive}
                    onChange={(e) => setUploadFormData({ ...uploadFormData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-[#3b2075] focus:ring-[#3b2075] cursor-pointer"
                  />
                  <label htmlFor="uploadIsActive" className="text-xs font-bold text-stone-800 cursor-pointer">
                    Enable and display image immediately on Homepage Hero Slider
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-[#3b2075] hover:bg-[#4c1d95] text-amber-300 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin text-amber-300" /> : <Upload className="w-4 h-4 text-amber-300" />} Save Header Image to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. EDIT DETAILS MODAL */}
      {editModal.isOpen && editModal.item && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 sticky top-0 bg-white z-10">
              <h3 className="text-lg font-black text-[#1f0c3d] flex items-center gap-2">
                <Edit className="w-5 h-5 text-[#3b2075]" />
                <span>Edit Header Image Details</span>
              </h3>
              <button
                onClick={() => setEditModal({ isOpen: false, item: null })}
                className="text-stone-400 hover:text-stone-700 font-bold text-base cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-stone-200">
                <img src={editModal.item.imageUrl} alt={editModal.item.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-700 mb-1">
                  Image Title
                </label>
                <input
                  type="text"
                  required
                  value={editModal.item.title}
                  onChange={(e) => setEditModal((prev) => prev.item ? { ...prev, item: { ...prev.item, title: e.target.value } } : prev)}
                  className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#3b2075] font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editModal.item.description || ""}
                  onChange={(e) => setEditModal((prev) => prev.item ? { ...prev, item: { ...prev.item, description: e.target.value } } : prev)}
                  className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#3b2075] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-700 mb-1">
                    Alt Text (SEO)
                  </label>
                  <input
                    type="text"
                    value={editModal.item.altText || ""}
                    onChange={(e) => setEditModal((prev) => prev.item ? { ...prev, item: { ...prev.item, altText: e.target.value } } : prev)}
                    className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#3b2075] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-stone-700 mb-1">
                    Display Position
                  </label>
                  <input
                    type="number"
                    value={editModal.item.displayOrder}
                    onChange={(e) => setEditModal((prev) => prev.item ? { ...prev, item: { ...prev.item, displayOrder: parseInt(e.target.value, 10) || 1 } } : prev)}
                    className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-[#3b2075] font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editModal.item.isActive}
                  onChange={(e) => setEditModal((prev) => prev.item ? { ...prev, item: { ...prev.item, isActive: e.target.checked } } : prev)}
                  className="w-4 h-4 rounded text-[#3b2075] focus:ring-[#3b2075] cursor-pointer"
                />
                <label htmlFor="editIsActive" className="text-xs font-bold text-stone-800 cursor-pointer">
                  Active (Display on Homepage Hero Slider)
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-[#3b2075] hover:bg-[#4c1d95] text-amber-300 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin text-amber-300" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. FULL PREVIEW MODAL */}
      {previewModal.isOpen && previewModal.item && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 text-white animate-in fade-in zoom-in-95 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">{previewModal.item.title}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{previewModal.item.imageUrl}</p>
              </div>
              <button
                onClick={() => setPreviewModal({ isOpen: false, item: null })}
                className="text-slate-400 hover:text-white font-bold text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl bg-black overflow-hidden border border-slate-800 flex items-center justify-center">
              <img src={previewModal.item.imageUrl} alt={previewModal.item.title} loading="lazy" decoding="async" className="w-full h-full object-contain" />
            </div>

            {previewModal.item.description && (
              <p className="text-xs text-slate-300 leading-relaxed font-medium bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                {previewModal.item.description}
              </p>
            )}

            <div className="flex items-center justify-between pt-1 text-xs">
              <span className="text-amber-400 font-bold">Display Order Position #{previewModal.item.displayOrder}</span>
              <button
                onClick={() => setPreviewModal({ isOpen: false, item: null })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. DELETE CONFIRMATION MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`bg-white border rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 text-stone-900 animate-in fade-in zoom-in-95 transition-all duration-300 ${
              deleteSuccess
                ? "border-emerald-500 shadow-[0_15px_50px_rgba(16,185,129,0.4)]"
                : "border-stone-200"
            }`}
          >
            {deleteSuccess ? (
              <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-90 duration-300">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-500 flex items-center justify-center mx-auto shadow-[0_0_35px_rgba(16,185,129,0.45)] animate-bounce">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 drop-shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-black text-[#1f0c3d] flex items-center justify-center gap-2">
                    <span>Deleted Successfully!</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  </h3>
                  <p className="text-xs text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-xl inline-block shadow-2xs">
                    ✓ Image removed from database
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
                    <Trash2 className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#1f0c3d]">{deleteModal.title}</h3>
                    <p className="text-xs text-stone-500 font-medium mt-0.5">This action cannot be undone</p>
                  </div>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed font-medium">
                  Are you sure you want to delete the selected header banner image(s) from the database?
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setDeleteModal({ isOpen: false, ids: [], title: "" })}
                    className="flex-1 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeDelete}
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : "Confirm Delete"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ANIMATED FLOATING TICK TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-[9999] flex items-center gap-3.5 bg-gradient-to-r from-[#190838] to-[#2a1154] text-white border border-emerald-500/50 px-5 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <span>Image Deleted</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </h4>
            <p className="text-[11px] text-purple-200/90 font-medium mt-0.5">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast({ show: false, message: "", type: "success" })}
            className="ml-3 text-purple-300 hover:text-white text-xs font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* POPUP NOTIFICATION MODAL */}
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
