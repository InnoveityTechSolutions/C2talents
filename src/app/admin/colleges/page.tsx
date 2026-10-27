"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Building2,
  PlusCircle,
  Search,
  MapPin,
  CheckCircle2,
  Clock,
  Trash2,
  Edit,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Star,
  Award,
  TrendingUp,
} from "lucide-react";
import { matchesCollegeSearch } from "@/lib/search/searchNormalizer";

// Helper function to sanitize any malformed or duplicated title text in stored DB records
function sanitizeCollegeName(rawName: string = ""): string {
  if (!rawName) return "College Profile";
  return rawName
    .replace(/PSG COLLEGE OF COLLEGE OF TECHNOLOGYNYNOLOGY/gi, "PSG College of Technology")
    .replace(/PSG COLLEGE OF TECHNOLOGYNYNOLOGY/gi, "PSG College of Technology")
    .replace(/PSG College of TECHNOLOGYNOLOGY/gi, "PSG College of Technology")
    .replace(/TECHNOLOGYNYNOLOGY/gi, "Technology")
    .replace(/TECHNOLOGYNOLOGY/gi, "Technology")
    .replace(/TECHNOLOGYOLOGY/gi, "Technology")
    .replace(/COLLEGE OF COLLEGE OF/gi, "College of")
    .replace(/\s+/g, " ")
    .trim();
}

export default function AdminAllCollegesPage() {
  const [mounted, setMounted] = useState(false);
  const [colleges, setColleges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: "", name: "" });
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 50;

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const searchParam = urlParams.get("search") || urlParams.get("q") || urlParams.get("query");
      if (searchParam) {
        setSearchQuery(searchParam.trim());
      }
    }
  }, []);

  // Reset to page 1 whenever search query or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  async function fetchColleges() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/colleges", { cache: "no-store" });
      const data = await res.json();
      if (data.success && Array.isArray(data.colleges)) {
        setColleges(data.colleges);
      } else {
        setError(data.error || "Failed to load colleges");
      }
    } catch (err: any) {
      console.error("Colleges fetch error:", err);
      setError(err?.message || "Failed to connect to database");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchColleges();
  }, []);

  async function handleDelete(id: string, name: string) {
    setDeleteModal({ open: true, id, name: sanitizeCollegeName(name) });
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/colleges/${deleteModal.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setColleges((prev) => prev.filter((c) => c.id !== deleteModal.id));
      }
    } catch (err) {
      console.error("Failed to delete college.", err);
    } finally {
      setDeleting(false);
      setDeleteModal({ open: false, id: "", name: "" });
    }
  }

  const handleImageError = (id: string) => {
    setBrokenImages((prev) => ({ ...prev, [id]: true }));
  };

  const filteredColleges = colleges.filter((c) => {
    const matchesSearch = matchesCollegeSearch(c, searchQuery);
    if (!matchesSearch) return false;

    if (statusFilter === "PUBLISHED") return c.status === "PUBLISHED";
    if (statusFilter === "DATA SUBMITTED") return c.status === "DATA_SUBMITTED" || c.status === "SUBMITTED";
    if (statusFilter === "DRAFT") return c.status === "DRAFT";
    if (statusFilter === "FEATURED") return Boolean(c.featured);
    return true;
  });

  const totalPages = Math.ceil(filteredColleges.length / pageSize) || 1;
  const paginatedColleges = filteredColleges.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalCount = colleges.length;
  const publishedCount = colleges.filter((c) => c.status === "PUBLISHED").length;
  const submittedCount = colleges.filter((c) => c.status === "DATA_SUBMITTED" || c.status === "SUBMITTED").length;
  const featuredCount = colleges.filter((c) => c.featured).length;
  const draftCount = colleges.filter((c) => c.status === "DRAFT").length;

  const cardList = [
    {
      title: "Total Colleges",
      count: totalCount,
      sublabel: "Active Directory",
      icon: <Building2 className="w-7 h-7 text-amber-300 shrink-0" />,
      gradient: "from-[#1f0c3d] via-[#2d1659] to-[#3b2075]",
    },
    {
      title: "Published",
      count: publishedCount,
      sublabel: "Live on Site",
      icon: <CheckCircle2 className="w-7 h-7 text-white/90 shrink-0" />,
      gradient: "from-blue-600 to-indigo-700",
    },
    {
      title: "Data Submitted",
      count: submittedCount,
      sublabel: "Updated by Team",
      icon: <CheckCircle2 className="w-7 h-7 text-emerald-300 shrink-0" />,
      gradient: "from-emerald-600 to-teal-700",
    },
    {
      title: "Pending Drafts",
      count: draftCount,
      sublabel: "Review Required",
      icon: <Clock className="w-7 h-7 text-white/90 shrink-0" />,
      gradient: "from-rose-600 to-red-700",
    },
  ];

  return (
    <div className="space-y-6 font-sans text-stone-900 p-6 bg-[#FAF9F5] min-h-screen w-full max-w-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-purple-100">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#1f0c3d] flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#3b2075] text-amber-300 flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5 text-amber-300" />
            </div>
            <span>College Directory</span>
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Manage all portal college listings, AI metadata, & publication status across C2Talents.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchColleges}
            className="p-2.5 rounded-xl bg-white border border-stone-200 hover:bg-purple-50 text-stone-700 transition-all shadow-2xs cursor-pointer"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-4 h-4 text-[#3b2075] ${loading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/manager/colleges/new"
            className="flex items-center gap-2 bg-[#3b2075] hover:bg-[#4c1d95] text-white font-extrabold px-4 py-2 rounded-xl text-xs shadow-md transition-all hover:scale-[1.01]"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>Add New College</span>
            <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded text-[9px] font-extrabold flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> AI
            </span>
          </Link>
        </div>
      </div>

      {/* 4 COLORFUL VIBRANT GRADIENT STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardList.map((card, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-5 text-white shadow-md hover:shadow-lg transition-all duration-200 flex flex-col justify-between border border-white/10`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-white/90 tracking-tight">{card.title}</div>
                <div className="text-3xl font-extrabold text-white mt-1 tracking-tight">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : error ? (
                    <span className="text-xl font-bold opacity-75">--</span>
                  ) : (
                    card.count
                  )}
                </div>
              </div>
              {card.icon}
            </div>

            <div className="border-t border-white/20 my-3"></div>

            <div className="flex items-center justify-between text-[11px] text-white/90 font-medium">
              <span>{card.sublabel}</span>
              <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-md">
                {loading ? "..." : error ? "--" : card.count}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 border-b border-purple-100 pb-0.5">
          {["ALL", "PUBLISHED", "DATA SUBMITTED", "DRAFT", "FEATURED"].map((status) => {
            const count =
              status === "ALL"
                ? totalCount
                : status === "PUBLISHED"
                ? publishedCount
                : status === "DATA SUBMITTED"
                ? submittedCount
                : status === "FEATURED"
                ? featuredCount
                : draftCount;
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
                <span>{status === "ALL" ? "All" : status}</span>
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

        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search college name, city, short code..."
            className="w-full bg-white pl-10 pr-8 py-2 rounded-xl text-xs border border-stone-200 focus:outline-none focus:border-[#3b2075] focus:ring-2 focus:ring-[#3b2075]/10 text-stone-900 placeholder:text-stone-400 font-medium shadow-2xs"
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

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500 text-xs font-bold flex flex-col items-center gap-2">
            <RefreshCw className="w-7 h-7 animate-spin text-[#3b2075]" />
            <span>Loading college directory...</span>
          </div>
        ) : filteredColleges.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Building2 className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="text-base font-extrabold text-[#1f0c3d]">
              {searchQuery ? "College not found in database." : "No Colleges Found"}
            </p>
            <p className="text-xs text-stone-500">
              {searchQuery ? `No colleges matching "${searchQuery}" exist in the database.` : "Try adjusting your search query or add a new college profile."}
            </p>
            <Link
              href="/manager/colleges/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#3b2075] text-amber-300 font-extrabold rounded-xl text-xs shadow-sm hover:bg-[#4c1d95]"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" /> Add College Profile
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-purple-50/50 border-b border-purple-100 text-[#1f0c3d] font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5 whitespace-nowrap">College Info</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Location</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Type & NAAC</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-center">NIRF</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-right">Highest Package</th>
                  <th className="py-3.5 px-4 whitespace-nowrap text-center">Status</th>
                  <th className="py-3.5 px-5 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {paginatedColleges.map((college) => {
                  const cleanName = sanitizeCollegeName(college.name);
                  const hasValidLogo =
                    !brokenImages[college.id] && (college.logo || college.image);

                  return (
                    <tr
                      key={college.id}
                      className="hover:bg-purple-50/20 transition-colors group text-stone-800"
                    >
                      {/* College Info */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-3 max-w-sm">
                          <div className="w-9 h-9 rounded-xl bg-[#3b2075] text-amber-300 overflow-hidden shrink-0 flex items-center justify-center font-extrabold text-xs shadow-2xs border border-purple-800/20 group-hover:scale-105 transition-transform duration-200">
                            {hasValidLogo ? (
                              <img
                                src={college.logo || college.image}
                                alt={cleanName}
                                onError={() => handleImageError(college.id)}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (college.shortName || cleanName || "C").charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="font-extrabold text-[#1f0c3d] truncate max-w-[220px] group-hover:text-[#4c1d95] transition-colors"
                                title={cleanName}
                              >
                                {cleanName}
                              </span>
                              {college.featured && (
                                <span title="Featured College">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-stone-400 font-medium truncate max-w-[180px]">
                              {college.shortName || college.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-stone-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{college.city || college.location}</span>
                        </div>
                      </td>

                      {/* Type & NAAC */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-stone-800">{college.type || "Autonomous"}</span>
                          {college.naacGrade && (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[9px] font-black">
                              {college.naacGrade}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* NIRF */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        {college.nirfRank ? (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-900 text-[10px] font-extrabold border border-indigo-200">
                            #{college.nirfRank}
                          </span>
                        ) : (
                          <span className="text-stone-300 font-bold">-</span>
                        )}
                      </td>

                      {/* Highest Package */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-extrabold text-[#3b2075]">
                        ₹{college.highestPackage || "12.5"} LPA
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            college.status === "PUBLISHED"
                              ? "bg-purple-50 text-[#3b2075] border border-purple-200"
                              : college.status === "DATA_SUBMITTED" || college.status === "SUBMITTED"
                              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                              : "bg-amber-50 text-amber-900 border border-amber-200"
                          }`}
                        >
                          {college.status === "PUBLISHED" ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#3b2075]" />
                          ) : college.status === "DATA_SUBMITTED" || college.status === "SUBMITTED" ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                          )}
                          {college.status === "DATA_SUBMITTED" ? "SUBMITTED" : college.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 whitespace-nowrap text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <Link
                            href={`/colleges/${college.id}`}
                            target="_blank"
                            className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            href={`/manager/colleges/${college.id}/edit`}
                            className="p-1.5 rounded-xl bg-[#3b2075] hover:bg-[#4c1d95] text-white transition-colors"
                            title="Edit College"
                          >
                            <Edit className="w-3.5 h-3.5 text-amber-300" />
                          </Link>

                          <button
                            onClick={() => handleDelete(college.id, college.name)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                            title="Delete College"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredColleges.length > 0 && (
              <div className="px-5 py-3.5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600 font-medium">
                <div>
                  Showing{" "}
                  <span className="font-extrabold text-[#1f0c3d]">
                    {(currentPage - 1) * pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-extrabold text-[#1f0c3d]">
                    {Math.min(currentPage * pageSize, filteredColleges.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-extrabold text-[#1f0c3d]">
                    {filteredColleges.length}
                  </span>{" "}
                  colleges
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      Previous
                    </button>
                    <span className="px-2 text-stone-500 font-bold">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white font-bold text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {mounted && deleteModal.open && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 font-sans">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => !deleting && setDeleteModal({ open: false, id: "", name: "" })}
          />
          {/* Modal Card */}
          <div className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-md mx-auto overflow-hidden animate-slide-up border border-stone-200 space-y-4 p-6">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#1f0c3d]">Delete College</h2>
                <p className="text-xs text-stone-500 font-medium mt-0.5">This action cannot be undone</p>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-stone-700 leading-relaxed">
                Are you sure you want to permanently delete{" "}
                <span className="font-extrabold text-[#1f0c3d]">&ldquo;{deleteModal.name}&rdquo;</span>?
              </p>
              <p className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-center gap-2">
                <span className="shrink-0 font-black text-rose-600">⚠</span>
                <span>All courses, placements, gallery images, and SEO data for this college will be removed.</span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModal({ open: false, id: "", name: "" })}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                {deleting ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" /> Deleting...</>
                ) : (
                  <><Trash2 className="w-4 h-4" /> Delete</>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
